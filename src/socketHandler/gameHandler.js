const {
  createGame,
  getRounds,
  addCardPlayed,
  setStichPlayer,
  setNextPlayer,
  addRound,
  addSubround,
  getPlayers,
  addPrediction,
  getPredictionsForCurrentRound, getPredictionCount,
  getNextPlayer,
  getPlayersScores,
  getRoundTricks,
  getCurrentRoundTricks,
  setRoundScores,
  getPlayerScoreForRound,
} = require('../services/gamestate.service');
const { startRound, getWinningCard } = require('../services/game.service');
const { getCurrentLobby } = require('../services/lobby.service');
const { getByWebsocket } = require('../services/user.service');
const Card = require('../utils/card.model');

const startGame = async function(socket, io) {
  const user = await getByWebsocket(socket.id);
  const lobby = await getCurrentLobby(user.uuid);

  createGame(lobby.lobbyid, lobby.players);

  addSubround(lobby.lobbyid);

  const gameData = startRound(1, 3);
  io.to(lobby.lobbyid).emit('startGame', gameData);
};

const cardPlayed = async function(socket, io, payload) {
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

    const idxPlayer = players.indexOf(player.uuid);
    const idxNextPlayer = idxPlayer + 1 === players.length ? 0 : idxPlayer + 1;

    // players still left to play this subround
    if (subround.cardsPlayed.length < players.length) {
      setNextPlayer(lobbyId, players[idxNextPlayer]);
      io.to(lobbyId).emit('nextPlayer', idxNextPlayer);
      return;
    }

    // Calculate winner
    const cards = subround.cardsPlayed.map((play) => play.card);
    const winningCard = getWinningCard(cards, trump);
    const winner = subround.cardsPlayed.find((play) => play.card === winningCard);
    setStichPlayer(lobbyId, winner.player);

    // are there subrounds left
    const currentRound = getRounds(lobbyId).length;
    if (getRounds(lobbyId)[getRounds(lobbyId).length - 1].subrounds.length < currentRound) {
      addSubround(lobbyId);
      setNextPlayer(lobbyId, players[idxNextPlayer]);
      io.to(lobbyId).emit('nextSubround', idxNextPlayer);
      return;
    }

    // Calculate points for the round
    calculateScoreForRound(lobbyId)

    // If it is, start a new round
    addRound(lobbyId);
    addSubround(lobbyId);
    const nextRound = getRounds(lobbyId).length;
    const gameData = startRound(nextRound, players.length);
    io.to(lobbyId).emit('startRound', gameData);
  } catch (err) {
    console.log(err.message);
  }
};

const calculateScoreForRound = (lobbyId) => {
  const predictions = getPredictionsForCurrentRound(lobbyId);

  const tricks = getCurrentRoundTricks(lobbyId);

  const points = {}
  Object.entries(predictions).forEach(([userId, prediction]) => {
    const trickCount = tricks[userId] || 0;
    if (prediction === trickCount) {
      points[userId] = 20 + (trickCount * 10);
    } else {
      points[userId] = prediction * -10;
    }
  });

  setRoundScores(lobbyId, points);
};

const trickPrediction = async function(socket, io, payload) {
  console.log('Trick prediction: ', payload);

  const player = await getByWebsocket(socket.id);
  const lobby = await getCurrentLobby(player.uuid);
  const lobbyId = lobby.lobbyid;
  const playerSize = lobby.players.length;

  addPrediction(lobbyId, player.uuid, payload);

  const predictions = getPredictionsForCurrentRound(lobbyId);
  if (getPredictionCount(predictions) === playerSize) {
    const players = Object.keys(getPlayers(lobbyId));
    io.to(lobbyId).emit('nextPlayer', players.indexOf(getNextPlayer(lobbyId)));
  }
};

module.exports = {
  startGame,
  cardPlayed,
  trickPrediction,
};
