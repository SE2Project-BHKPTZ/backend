const { startRound } = require('../services/game.service');
const { createGame } = require('../services/gamestate.service');
const { getCurrentLobby } = require('../services/lobby.service');
const { getByWebsocket } = require('../services/user.service');

const startGame = async function (socket, io) {
  const user = await getByWebsocket(socket.id);
  const lobby = await getCurrentLobby(user.uuid);

  createGame(lobby.lobbyid, lobby.players);

  const gameData = startRound(1, 3);
  io.to(lobby.lobbyid).emit('startGame', gameData);
};

const cardPlayed = function (socket, io, payload) {
  console.log('Card played: ', payload);

  // TODO: Play a card

  // TODO: If all cards are played calculate outcome

  // TODO: If it is the last subround -> start trick prediction
};

const trickPrediction = function (socket, io, payload) {
  console.log('Trick prediction: ', payload);

  // TODO: Add a trick prediction to the game

  // TODO: If all predictions are made -> send play event
};

module.exports = {
  startGame,
  cardPlayed,
  trickPrediction,
};
