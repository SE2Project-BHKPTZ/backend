const { startRound } = require('../services/game.service');
const { createGame } = require('../services/gamestate.service');
const { getByLobbyID } = require('../services/lobby.service');

const startGame = async function (socket, io, payload) {
  const room = Array.from(socket.rooms).pop();
  const lobby = await getByLobbyID(room);

  createGame(room, lobby.players);

  const gameData = startRound(1, 3);
  io.to(room).emit('startGame', gameData);
};

const cardPlayed = function (socket, io, payload) {
  console.log('Card played: ', payload);

  // TODO: Play a card

  // TODO: If all cards are played calculate outcome

  // TODO: If it is the last subround -> start trick prediction
};

const trickPrediction = function (socket, io, payload) {
  // TODO: Add a trick prediction to the game

  // TODO: If all predictions are made -> send play event
};

module.exports = {
  startGame,
  cardPlayed,
  trickPrediction,
};
