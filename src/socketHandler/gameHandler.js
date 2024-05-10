const {
  startRound,
  getWinningCard,
  addCardPlayed,
  setStichPlayer,
  setNextPlayer,
  addRound,
  addSubround,
  getPlayers,
} = require('../services/game.service');

const { startRound, isLastRound } = require('../services/game.service');


const startGame = function (socket, io, payload) {
  const room = Array.from(socket.rooms).pop();

  // TODO: Add a new game entry

  // TODO: send cards
  const gameData = startRound(1, 3);
  io.to(room).emit('startGame', gameData);
};

const cardPlayed = function (socket, io, payload) {
  console.log('Card played: ', payload);

  const { player, card } = payload;

  // TODO: Play a card
  addCardPlayed(lobbyId, player, card);

  const room = Array.from(socket.rooms).pop();
  io.to(room).emit('cardPlayed', payload);

  // If all cards are played calculate outcome
  const players = Object.keys(getPlayers(lobbyId));
  const subround = getRounds(lobbyId)[getRounds(lobbyId).length - 1].subrounds[
    getRounds(lobbyId)[getRounds(lobbyId).length - 1].subrounds.length - 1
  ];

  // Calculate winner
  const cards = subround.cardsPlayed.map((play) => play.card);
  const winningCard = getWinningCard(cards, null); // Pass trump as null for now // TODO: set correct trump
  const winner = subround.cardsPlayed.find((play) => play.card === winningCard);
  setStichPlayer(lobbyId, winner.player);

  // players still left to play this subround
  if (subround.cardsPlayed.length < players.length) {
    const nextPlayer = players.findIndex(player)++ == players.length ? players[0] : players[players.findIndex(player)++]
    setNextPlayer(lobbyId, nextPlayer);
    io.to(room).emit('nextPlayer', nextPlayer);
    return
  }


  // Calculate points for the round (if any)
  // TODO: save points

  // are there subrounds left
  if (players.find[player].hands.length !== 0) {
    addSubround(lobbyId);

    const newSubroundStartPlayer = (players.findIndex(player)++) == players.length ? players[0] : players[players.findIndex(player)++]
    setNextPlayer(lobbyId, newSubroundStartPlayer);
    io.to(room).emit('nextSubround', newSubroundStartPlayer);
    return
  } 

  // If it is, start a new round
  addRound(lobbyId);
  const nextRound = getRounds(lobbyId).length;
  const gameData = startRound(nextRound, players.length);
  io.to(room).emit('startGame', gameData);
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
