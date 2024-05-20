const {
  createGame,
  getRounds,
  addCardPlayed,
  setStichPlayer,
  setNextPlayer,
  addRound,
  addSubround,
  getPlayers,
  getIdxOfPlayer,
  addPrediction,
  getPredictionsForCurrentRound, getPredictionCount,
  getNextPlayer,
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

    const players = Object.keys(getPlayers(lobbyId));
    const idxPlayer = getIdxOfPlayer(lobbyId, player.uuid);

    addCardPlayed(lobbyId, player, card);

    const cardPlayedPayload = payload;
    delete cardPlayedPayload.trump;
    cardPlayedPayload.playerIdx = idxPlayer;
    io.to(lobbyId).emit('cardPlayed', cardPlayedPayload);

    // If all cards are played calculate outcome
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
      const idxNextPlayer = idxPlayer + 1 === players.length ? 0 : idxPlayer + 1;
      setNextPlayer(lobbyId, players[idxNextPlayer]);
      io.to(lobbyId).emit('nextPlayer', idxNextPlayer);
      return;
    }

    // Calculate points for the round (if any)
    // TODO: calculate & save points

    // are there subrounds left
    const currentRound = getRounds(lobbyId).length;
    if (getRounds(lobbyId)[getRounds(lobbyId).length - 1].subrounds.length < currentRound) {
      addSubround(lobbyId);
      setNextPlayer(lobbyId, winner.player.uuid);
      io.to(lobbyId).emit('nextSubround', getIdxOfPlayer(lobbyId, winner.player.uuid));
      return;
    }

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

const trickPrediction = async function (socket, io, payload) {
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
