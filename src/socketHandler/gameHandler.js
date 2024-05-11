const {
  createGame,
  getRounds,
  addCardPlayed,
  setStichPlayer,
  setNextPlayer,
  addRound,
  addSubround,
  getPlayers,
} = require('../services/gamestate.service');
const { startRound, getWinningCard } = require('../services/game.service');
const { getCurrentLobby } = require('../services/lobby.service');
const { getByWebsocket } = require('../services/user.service');
const Card = require('../utils/card.model');

const startGame = async function (socket, io) {
  const user = await getByWebsocket(socket.id);
  const lobby = await getCurrentLobby(user.uuid);

  createGame(lobby.lobbyid, lobby.players);

  addSubround(lobby.lobbyid);

  const gameData = startRound(1, 3);
  io.to(lobby.lobbyid).emit('startGame', gameData);
};

const cardPlayed = async function (socket, io, payload) {
  console.log('Card played: ', payload);

  const player = await getByWebsocket(socket.id);
  const lobby = await getCurrentLobby(player.uuid);
  const lobbyId = lobby.lobbyid;

  try {
    const { value, suit, trump } = payload;
    const card = new Card(suit, value);

    addCardPlayed(lobbyId, player, card);
    payload.player = player.username;
    io.to(lobbyId).emit('cardPlayed', payload);

    // If all cards are played calculate outcome
    const players = Object.keys(getPlayers(lobbyId));
    const subround = getRounds(lobbyId)[getRounds(lobbyId).length - 1].subrounds[
      getRounds(lobbyId)[getRounds(lobbyId).length - 1].subrounds.length - 1
    ];

    // Calculate winner
    const cards = subround.cardsPlayed.map((play) => play.card);
    const winningCard = getWinningCard(cards, trump);
    const winner = subround.cardsPlayed.find((play) => play.card === winningCard);
    setStichPlayer(lobbyId, winner.player);

    // players still left to play this subround
    if (subround.cardsPlayed.length < players.length) {
      const idxPlayer = players.indexOf(player.uuid);
      const nextPlayer = idxPlayer + 1 === players.length ? players[0] : players[idxPlayer + 1];
      setNextPlayer(lobbyId, nextPlayer);
      io.to(lobbyId).emit('nextPlayer', nextPlayer);
      return;
    }

    // Calculate points for the round (if any)
    // TODO: calculate & save points

    // are there subrounds left
    const idxPlayer = players.indexOf(player.uuid);
    const newSRoundPlayer = idxPlayer + 1 === players.length ? players[0] : players[idxPlayer + 1];

    const currentRound = getRounds(lobbyId).length;
    if (getRounds(lobbyId)[getRounds(lobbyId).length - 1].subrounds.length < currentRound) {
      addSubround(lobbyId);
      setNextPlayer(lobbyId, newSRoundPlayer);
      io.to(lobbyId).emit('nextSubround', newSRoundPlayer);
      return;
    }

    // If it is, start a new round
    addRound(lobbyId);
    addSubround(lobbyId);
    const nextRound = getRounds(lobbyId).length;
    const gameData = startRound(nextRound, players.length);
    io.to(lobbyId).emit('startGame', gameData);
  } catch (err) {
    console.log(err.message);
  }
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
