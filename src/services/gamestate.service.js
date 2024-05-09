const games = {
  lobbyid: {
    players: {
      '29e315f2-beb1-403b-a3e1-1a452cf76e5b': {
        cards: [
          'Diamonds-0', 'Hearts-3', 'Clubs-10', 'Spades-6',
        ],
        points: 100,
      },
      '3434a03a-c9f0-4bd8-9925-91bf61d36e76': {},
      '9d93ce7a-c893-4f17-ad88-bf5f0ae09493': {},
    },
    rounds: [
      {
        predictions: {
          'f3d4e005-2960-4513-ac7c-ee60e1e88209': 1,
          '2b921e33-74e6-4e6a-a46a-c6f5f125ac7b': 5,
          'b2291922-d9c1-4c1b-a583-bbe707f9c413': 5,
        },
        subrounds: [
          {
            cardsPlayed: [
              { player: 'f3d4e005-2960-4513-ac7c-ee60e1e88209', card: 'Diamonds-0' },
              { player: 'f3d4e005-2960-4513-ac7c-ee60e1e88209', card: 'Diamonds-1' },
              { player: 'f3d4e005-2960-4513-ac7c-ee60e1e88209', card: 'Diamonds-2' },
            ],
            stichPlayer: '9aee6f84-89f2-44d5-9170-1e9d756c1fc2',
          },
        ],
      },
    ],
    nextPlayer: 'fe442c0d-f2fd-4dd1-a54f-ebad839c8a35',
  },
};

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
