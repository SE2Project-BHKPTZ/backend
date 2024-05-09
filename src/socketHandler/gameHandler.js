const { startRound } = require('../services/game.service');

const startGame = function () {
  const socket = this;
  const room = Array.from(socket.rooms).pop();

  // TODO: Add a new game entry

  // TODO: send cards
  const gameData = startRound(1, 3);
  socket.emit('startGame', gameData);
  socket.to(room).emit('startGame', gameData);

  // TODO: Start trick prediction
};

const cardPlayed = function (payload) {
  console.log('Card played: ', payload);

  // TODO: Play a card

  // TODO: If all cards are played calculate outcome

  // TODO: If it is the last subround -> start trick prediction
};

const trickPrediction = function () {
  // TODO: Add a trick prediction to the game

  // TODO: If all predictions are made -> send play event
};

module.exports = {
  startGame,
  cardPlayed,
  trickPrediction,
};
