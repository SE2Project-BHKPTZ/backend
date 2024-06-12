const socketio = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const { setWebsocket } = require('../services/user.service');
const { startGame, cardPlayed, trickPrediction } = require('./gameHandler');
const { getCurrentLobby } = require('../services/lobby.service');
const socketService = require('../services/socket.service');
const { getCurrentRound } = require('../services/gamestate.service');

let io;

const sendRecovery = async (socket) => {
  const { _query: { uuid } } = socket.request;

  if (uuid === '') return;

  try {
    const lobby = await getCurrentLobby(uuid);
    await socketService.joinRoomWithSocket(lobby.lobbyid, socket, uuid);

    // TODO: Send lobby or game data to player
    if (lobby.status === 'CREATED') {
      console.log('Sending lobby recovery data');
      socket.emit('recovery', { status: 'JOIN_LOBBY', state: lobby });
    } else if (lobby.status === 'RUNNING') {
      console.log('Sending game recovery data');
      const { players, maxRounds } = lobby;
      const round = getCurrentRound(lobby.lobbyid);

      // TODO: Also send cards and currentPlayer
      socket.emit('recovery', { status: 'PLAYING', state: { players, maxRounds, round } });
    }
  } catch (e) {
    console.log(e);
  }
};

const handleSocketEvents = (socket) => {
  if (socket.recovered) {
    // TODO: Recover the session (Send lobby infos, etc.)
    console.log('Recovered socket');
  }

  console.log(`connection: ${socket.id}`);
  socket.on('startGame', (payload) => startGame(socket, io, payload));
  socket.on('cardPlayed', (payload) => cardPlayed(socket, io, payload));
  socket.on('trickPrediction', (payload) => trickPrediction(socket, io, payload));

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

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
    pingInterval: 4000,
    pingTimeout: 2000,
    connectionStateRecovery: {
      // the backup duration of the sessions and the packets
      maxDisconnectionDuration: 50 * 60 * 1000,
      // whether to skip middlewares upon successful recovery
      skipMiddlewares: false,
    },
  });

  io.use(attachWebsocketMiddleware);
  io.on('connection', handleSocketEvents);

  setupAdminUI();
};

exports.io = () => io;
