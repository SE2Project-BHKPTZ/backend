const {
  getRounds,
  addCardPlayed,
  setStichPlayer,
  getNextPlayer,
  setNextPlayer,
  addRound,
  addSubround,
  getPlayers,
} = require('../services/gamestate.service');
const { startRound, getWinningCard } = require('../services/game.service');

const Card = require('../utils/card.model');

const startGame = function (socket, io, payload) {
  const room = Array.from(socket.rooms).pop();

  // TODO: Add a new game entry

  // TODO: send cards
  const gameData = startRound(1, 3);
  io.to(room).emit('startGame', gameData);
};

const cardPlayed = function (socket, io, payload) {
  console.log('Card played: ', payload);

  try {
    const { player, value, suit } = payload;
    const card = new Card(suit, value)

    const lobbyId = Array.from(socket.rooms).pop();
    addCardPlayed(lobbyId, player, card);
    io.to(lobbyId).emit('cardPlayed', payload);

    // If all cards are played calculate outcome
    const players = Object.keys(getPlayers(lobbyId));
    const subround = getRounds(lobbyId)[getRounds(lobbyId).length - 1].subrounds[
      getRounds(lobbyId)[getRounds(lobbyId).length - 1].subrounds.length - 1
    ];

    // Calculate winner
    const cards = subround.cardsPlayed.map((play) => play.card);
    // TODO: set the trump
    const winningCard = getWinningCard(cards, null); // Pass trump as null for now 
    const winner = subround.cardsPlayed.find((play) => play.card === winningCard);
    setStichPlayer(lobbyId, winner.player);

    // players still left to play this subround
    if (subround.cardsPlayed.length < players.length) {
      const idxPlayer = players.findIndex(getNextPlayer(lobbyId));
      const nextPlayer = idxPlayer + 1 === players.length ? players[0] : players[idxPlayer + 1]
      setNextPlayer(lobbyId, nextPlayer);
      io.to(lobbyId).emit('nextPlayer', nextPlayer);
      return
    }


    // Calculate points for the round (if any)
    // TODO: save points

    // are there subrounds left
    if (players.find[player].hands.length !== 0) {
      addSubround(lobbyId);
      const idxPlayer = players.findIndex(getNextPlayer(lobbyId));
      const newSRoundPlayer = idxPlayer + 1 === players.length ? players[0] : players[idxPlayer + 1];
      setNextPlayer(lobbyId, newSRoundPlayer);
      io.to(lobbyId).emit('nextSubround', newSRoundPlayer);
      return
    }

    // If it is, start a new round
    addRound(lobbyId);
    const nextRound = getRounds(lobbyId).length;
    const gameData = startRound(nextRound, players.length);
    io.to(lobbyId).emit('startGame', gameData);
  }catch(err){
    console.log(err.message);
  }
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
