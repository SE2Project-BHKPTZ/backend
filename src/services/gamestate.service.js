const games = {};

function createPlayerFields(players) {
  const playerFields = {};
  for (let i = 0; i < players.length; i += 1) {
    playerFields[players[i]] = {
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
  };
}

exports.createGame = (lobbyId, players) => {
  games[lobbyId] = {
    players: createPlayerFields(players),
    rounds: [],
    nextPlayer: players[0],
  };
  games[lobbyId].rounds.push(createRound());
  return games[lobbyId];
};

exports.getGame = (lobbyId) => games[lobbyId];

exports.getRounds = (lobbyId) => games[lobbyId].rounds;

exports.getPlayers = (lobbyId) => games[lobbyId].players;

exports.getNextPlayer = (lobbyId) => games[lobbyId].nextPlayer;

exports.addPrediction = (lobbyId, player, prediction) => {
  games[lobbyId].rounds[games[lobbyId].rounds.length - 1].predictions[player] = prediction;
};

exports.addSubround = (lobbyId) => {
  games[lobbyId].rounds[games[lobbyId].rounds.length - 1].subrounds.push({ cardsPlayed: [], stichPlayer: '' });
};

exports.addCardPlayed = (lobbyId, player, card) => {
  games[lobbyId].rounds[games[lobbyId].rounds.length - 1].subrounds[games[lobbyId]
    .rounds[games[lobbyId].rounds.length - 1]
    .subrounds.length - 1].cardsPlayed.push({ player, card });
};

exports.setStichPlayer = (lobbyId, player) => {
  games[lobbyId].rounds[games[lobbyId].rounds.length - 1].subrounds[games[lobbyId]
    .rounds[games[lobbyId].rounds.length - 1]
    .subrounds.length - 1].stichPlayer = player;
};

exports.setNextPlayer = (lobbyId, player) => {
  games[lobbyId].nextPlayer = player;
};

exports.addRound = (lobbyId) => {
  games[lobbyId].rounds.push(createRound());
};