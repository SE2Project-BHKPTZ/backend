const games = {};

function createPlayerFields(players) {
  const playerFields = {};
  for (let i = 0; i < players.length; i += 1) {
    playerFields[players[i].uuid] = {
      cards: [],
      points: 0,
    };
  }
  return playerFields;
}

function createRound() {
  return {
    predictions: [],
    subrounds: [],
    scores: [],
    deck: {},
  };
}

exports.createGame = (lobbyId, players) => {
  games[lobbyId] = {
    players: createPlayerFields(players),
    rounds: [],
    nextPlayer: players[0].uuid,
  };
  games[lobbyId].rounds.push(createRound());
  return games[lobbyId];
};

exports.getGame = (lobbyId) => games[lobbyId];

const getRounds = exports.getRounds = (lobbyId) => games[lobbyId].rounds;

exports.getPlayers = (lobbyId) => games[lobbyId].players;

exports.getNextPlayer = (lobbyId) => games[lobbyId].nextPlayer;

// eslint-disable-next-line max-len
const getIdxOfPlayer = exports.getIdxOfPlayer = (lobbyId, uuid) => Object.keys(games[lobbyId].players).indexOf(uuid);

const getCurrentRoundCount = exports.getCurrentRoundCount = (lobbyId) => getRounds(lobbyId).length;

// eslint-disable-next-line max-len
const getPredictionsForRound = exports.getPredictionsForRound = (lobbyId, round) => games[lobbyId].rounds[round - 1].predictions;

// eslint-disable-next-line max-len
const getPredictionsForCurrentRound = exports.getPredictionsForCurrentRound = (lobbyId) => getPredictionsForRound(lobbyId, getCurrentRoundCount(lobbyId));

exports.getPredictionCount = (predictions) => Object.keys(predictions).length;

exports.getCurrentRound = (lobbyId) => getRounds(lobbyId)[getCurrentRoundCount(lobbyId) - 1];

exports.addPrediction = (lobbyId, player, prediction) => {
  games[lobbyId].rounds[games[lobbyId].rounds.length - 1].predictions[player] = prediction;
};

exports.addSubround = (lobbyId) => {
  games[lobbyId].rounds[games[lobbyId].rounds.length - 1].subrounds.push({ cardsPlayed: [], stichPlayer: '' });
};

exports.addCardPlayed = (lobbyId, player, card) => {
  games[lobbyId].rounds[games[lobbyId].rounds.length - 1]
    .subrounds[games[lobbyId]
      .rounds[games[lobbyId].rounds.length - 1]
      .subrounds.length - 1].cardsPlayed.push({ player, card });
};

exports.setStichPlayer = (lobbyId, player) => {
  games[lobbyId].rounds[games[lobbyId].rounds.length - 1].subrounds[games[lobbyId]
    .rounds[games[lobbyId].rounds.length - 1]
    .subrounds.length - 1].stichPlayer = player.uuid;
};

exports.setNextPlayer = (lobbyId, player) => {
  games[lobbyId].nextPlayer = player;
};

exports.getNextPlayer = (lobbyId) => games[lobbyId].nextPlayer;

exports.addRound = (lobbyId) => {
  games[lobbyId].rounds.push(createRound());
};

const getRoundTricks = exports.getRoundTricks = (lobbyId, round) => {
  const tricks = {};
  const roundIndex = round - 1;

  games[lobbyId].rounds[roundIndex].subrounds.forEach((subround) => {
    const trickPlayer = subround.stichPlayer;
    tricks[trickPlayer] = (tricks[trickPlayer] || 0) + 1;
  });

  return tricks;
};

// eslint-disable-next-line max-len
const getCurrentRoundTricks = exports.getCurrentRoundTricks = (lobbyId) => getRoundTricks(lobbyId, getCurrentRoundCount(lobbyId));

const getPlayerScore = exports.getPlayerScore = (lobbyId, player) => {
  let totalScore = 0;
  games[lobbyId].rounds.forEach((round) => {
    const playerScore = round.scores.find((score) => score.player === player);
    if (playerScore) {
      totalScore += playerScore.score;
    }
  });
  return totalScore;
};

exports.getPlayersScores = (lobbyId) => {
  const { players } = games[lobbyId];
  const scores = {};

  Object.keys(players).forEach((player) => {
    // eslint-disable-next-line max-len
    scores[player] = { score: getPlayerScore(lobbyId, player), index: getIdxOfPlayer(lobbyId, player) };
  });

  return scores;
};

exports.getPlayerScoreForRound = (lobbyId, player, round) => {
  const roundIndex = round - 1;
  const roundData = games[lobbyId].rounds[roundIndex];
  const playerScore = roundData.scores.find((score) => score.player === player);
  return playerScore ? playerScore.score : 0;
};

const setPlayerScore = exports.setPlayerScore = (lobbyId, player, score) => {
  games[lobbyId].rounds[getCurrentRoundCount(lobbyId) - 1].scores.push({ player, score });
};

const setRoundScores = exports.setRoundScores = (lobbyId, scores) => {
  Object.entries(scores).forEach(([userId, score]) => {
    setPlayerScore(lobbyId, userId, score);
  });
};

exports.calculateScoreForRound = (lobbyId) => {
  const predictions = getPredictionsForCurrentRound(lobbyId);
  const tricks = getCurrentRoundTricks(lobbyId);

  const points = {};
  Object.entries(predictions).forEach(([userId, prediction]) => {
    const trickCount = tricks[userId] || 0;
    if (prediction === trickCount) {
      points[userId] = 20 + (trickCount * 10);
    } else {
      points[userId] = Math.abs(prediction - trickCount) * -10;
    }
  });

  setRoundScores(lobbyId, points);
};

exports.addCardsToRound = (lobbyId, deck) => {
  games[lobbyId].rounds[getCurrentRoundCount(lobbyId) - 1].deck = deck;
  console.log(games[lobbyId]);
};
