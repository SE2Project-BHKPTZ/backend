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
  calculateScoreForRound,
  getPlayersScores,
} = require('../services/gamestate.service');
const { startRound, getWinningCard } = require('../services/game.service');
const { getCurrentLobby, updateLobbyStatus } = require('../services/lobby.service');
const { getByWebsocket } = require('../services/user.service');
const Card = require('../utils/card.model');

const startGame = async function (socket, io) {
  const user = await getByWebsocket(socket.id);
  const lobby = await getCurrentLobby(user.uuid);

  try {
    await updateLobbyStatus(lobby.lobbyid, 'RUNNING');
  } catch (e) {
    console.log(`Error while updating lobby status: ${e}`);
  }

  createGame(lobby.lobbyid, lobby.players);

  addSubround(lobby.lobbyid);

  const players = Object.keys(getPlayers(lobby.lobbyid));
  // TODO: Add try catch since startRound can throw an error
  const gameData = startRound(1, players.length, lobby.maxRounds);
  io.to(lobby.lobbyid).emit('startGame', gameData);
};

const cardPlayed = async function (socket, io, payload) {
  console.log(`Card played: ${JSON.stringify(payload)}`);

  const player = await getByWebsocket(socket.id);
  const lobby = await getCurrentLobby(player.uuid);
  const lobbyId = lobby.lobbyid;

  try {
    const { value, suit, trump } = payload;
    const card = new Card(suit, parseInt(value, 10));

    const players = Object.keys(getPlayers(lobbyId));
    const idxPlayer = getIdxOfPlayer(lobbyId, player.uuid);

    addCardPlayed(lobbyId, player, card);

    // If all cards are played calculate outcome
    const subround = getRounds(lobbyId)[getRounds(lobbyId).length - 1].subrounds[
      getRounds(lobbyId)[getRounds(lobbyId).length - 1].subrounds.length - 1
    ];

    // Calculate winner
    const cards = subround.cardsPlayed.map((play) => play.card);
    const winningCard = getWinningCard(cards, trump);
    const winner = subround.cardsPlayed.find((play) => play.card === winningCard);
    const winnerIdx = getIdxOfPlayer(lobbyId, winner.player.uuid);
    setStichPlayer(lobbyId, winner.player);

    const cardPlayedPayload = payload;
    delete cardPlayedPayload.trump;
    cardPlayedPayload.playerIdx = idxPlayer;
    cardPlayedPayload.winnerIdx = winnerIdx;
    io.to(lobbyId).emit('cardPlayed', cardPlayedPayload);

    // players still left to play this subround
    if (subround.cardsPlayed.length < players.length) {
      const idxNextPlayer = idxPlayer + 1 === players.length ? 0 : idxPlayer + 1;
      setNextPlayer(lobbyId, players[idxNextPlayer]);
      io.to(lobbyId).emit('nextPlayer', idxNextPlayer);
      return;
    }

    // are there subrounds left
    const currentRound = getRounds(lobbyId).length;
    if (getRounds(lobbyId)[getRounds(lobbyId).length - 1].subrounds.length < currentRound) {
      addSubround(lobbyId);
      setNextPlayer(lobbyId, winner.player.uuid);
      io.to(lobbyId).emit('nextSubround', winnerIdx);
      return;
    }

    // Calculate points for the round
    calculateScoreForRound(lobbyId);
    io.to(lobbyId).emit('score', getPlayersScores(lobbyId));

    // If it is, start a new round
    if (getRounds(lobbyId).length + 1 < lobby.maxRounds) {
      addRound(lobbyId);
      addSubround(lobbyId);
      const nextRound = getRounds(lobbyId).length;
      const gameData = startRound(nextRound, players.length, lobby.maxRounds);
      io.to(lobbyId).emit('startRound', gameData);
      return;
    }

    io.to(lobbyId).emit('endGame', getPlayersScores(lobbyId));
  } catch (err) {
    console.log(err.message);
  }
};

const trickPrediction = async function (socket, io, payload) {
  console.log(`Trick prediction: ${payload}, ${socket.id}`);

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
