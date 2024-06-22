const socketio = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const { setWebsocket } = require('../services/user.service');
const { startGame, cardPlayed, trickPrediction } = require('./gameHandler');
const { getCurrentLobby, delete: deleteLobby, leave } = require('../services/lobby.service');
const socketService = require('../services/socket.service');
const {
  getCurrentRound, getPlayersScores, getNextPlayer, getCurrentRoundCount,
} = require('../services/gamestate.service');

let io;
const disconnectionTimers = {};

const sendRecovery = async (socket) => {
  const { _query: { uuid } } = socket.request;

  if (uuid === '') return;

  try {
    const lobby = await getCurrentLobby(uuid);
    await socketService.joinRoomWithSocket(lobby.lobbyid, socket, uuid);

    if (lobby.status === 'RUNNING') {
      console.log('Sending game recovery data');
      const { players, maxRounds } = lobby;
      const nextPlayer = getNextPlayer(lobby.lobbyid);
      const round = getCurrentRound(lobby.lobbyid);
      const playerScore = getPlayersScores(lobby.lobbyid);
      const currentRound = getCurrentRoundCount(lobby.lobbyid);

      socket.emit('recovery', {
        status: 'PLAYING',
        state: {
          players, maxRounds, round, playerScore, nextPlayer, currentRound,
        },
      });
    }
    io.to(lobby.lobbyid).emit('lobby:reconnect', 'User reconnected');
  } catch (e) { /* empty */ }
};

const sendDisconnectMessage = async (socket) => {
  const { _query: { uuid } } = socket.request;

  if (uuid === '') return;

  try {
    const lobby = await getCurrentLobby(uuid);
    io.to(lobby.lobbyid).emit('lobby:disconnect', { playerUUID: uuid });
  } catch (e) { /* empty */ }
};

const startDisconnectTimer = async (uuid, lobby) => {
  try {
    disconnectionTimers[uuid] = setTimeout(async () => {
      console.log(`User ${uuid} did not reconnect within the grace period. Closing lobby.`);
      try {
        if (lobby) {
          await deleteLobby(lobby.uuid);
          io.to(lobby.lobbyid).emit('lobby:closed', 'Reconnect timeout has been reached. Closing lobby!');
        }
        delete disconnectionTimers[uuid];
      } catch (e) {
        console.log(e);
      }
    }, 2 * 60 * 1000);
  } catch (e) { /* empty */ }
};

const handleDisconnect = async (socket) => {
  const { _query: { uuid } } = socket.request;

  if (uuid === '') return;

  try {
    const lobby = await getCurrentLobby(uuid);

    if (lobby.status === 'RUNNING') {
      await startDisconnectTimer(uuid, lobby);
    } else if (lobby.status === 'CREATED') {
      await leave(uuid);
      socket.leave(lobby.lobbyid);
    }
  } catch (e) { /* empty */ }
};

const cancelDisconnectTimer = (socket) => {
  const { _query: { uuid } } = socket.request;

  if (uuid === '') return;

  if (disconnectionTimers[uuid]) {
    clearTimeout(disconnectionTimers[uuid]);
    delete disconnectionTimers[uuid];
  }
};

const handleSocketEvents = (socket) => {
  console.log(`connection: ${socket.id}`);
  socket.on('startGame', (payload) => startGame(socket, io, payload));
  socket.on('cardPlayed', (payload) => cardPlayed(socket, io, payload));
  socket.on('trickPrediction', (payload) => trickPrediction(socket, io, payload));

  socket.on('disconnect', async () => {
    console.log('Client disconnected');
    await sendDisconnectMessage(socket);
    await handleDisconnect(socket);
  });

  cancelDisconnectTimer(socket);
  sendRecovery(socket);
};

const attachWebsocketMiddleware = (socket, next) => {
  const { _query: { uuid } } = socket.request;
  setWebsocket(uuid, socket.id);
  next();
};

const setupAdminUI = () => {
  if (process.env.SIO_ADMINUI_USERNAME && process.env.SIO_ADMINUI_PASSWORD) {
    instrument(io, {
      auth: {
        type: 'basic',
        username: process.env.SIO_ADMINUI_USERNAME,
        password: process.env.SIO_ADMINUI_PASSWORD,
      },
      mode: 'development',
    });
  }
};

exports.createIO = (server) => {
  io = socketio(server, {
    cors: { origin: '*' },
    pingInterval: 2000,
    pingTimeout: 1000,
  });

  io.use(attachWebsocketMiddleware);
  io.on('connection', handleSocketEvents);

  setupAdminUI();
};

exports.io = () => io;
