const {
  createGame,
  getGame,
  getRounds,
  getPlayers,
  getNextPlayer,
  addPrediction,
  addSubround,
  addCardPlayed,
  setStichPlayer,
  setNextPlayer,
  addRound,
} = require('./gamestate.service');

describe('Game Functions', () => {
  const gameId = 'lobby1';

  beforeAll(() => {
    // Create a game before each test
    const player1 = {};
    player1.uuid = 'player1';
    const player2 = {};
    player2.uuid = 'player2';
    createGame('lobby1', [player1, player2]);
  });

  test('Creates a game correctly', () => {
    expect(getGame(gameId)).toEqual({
      players: {
        player1: { cards: [], points: 0 },
        player2: { cards: [], points: 0 },
      },
      rounds: [{ predictions: [], subrounds: [] }],
      nextPlayer: 'player1',
    });
  });

  test('Adds a prediction to a round', () => {
    addPrediction(gameId, 'player1', 5);
    const rounds = getRounds(gameId);
    expect(rounds[0].predictions.player1).toBe(5);
  });

  test('Adds a subround to a round', () => {
    addSubround(gameId);
    const rounds = getRounds(gameId);
    expect(rounds[0].subrounds.length).toBe(1);
  });

  test('Sets stich player for a subround', () => {
    setStichPlayer(gameId, 'player1');
    const { subrounds } = getRounds(gameId)[0];
    expect(subrounds[subrounds.length - 1].stichPlayer).toBe('player1');
  });

  test('Adds a card played to a subround', () => {
    addCardPlayed(gameId, 'player1', 'Ace of Spades');
    const rounds = getRounds(gameId);
    const latestSubround = rounds[0].subrounds[rounds[0].subrounds.length - 1];
    expect(latestSubround.cardsPlayed).toEqual([{ player: 'player1', card: 'Ace of Spades' }]);
  });

  test('Sets next player', () => {
    setNextPlayer(gameId, 'player2');
    expect(getNextPlayer(gameId)).toBe('player2');
  });

  test('Adds a new round', () => {
    addRound(gameId);
    const rounds = getRounds(gameId);
    expect(rounds.length).toBe(2);
  });

  test('Gets players from a game', () => {
    const players = getPlayers(gameId);
    expect(players).toEqual({
      player1: { cards: [], points: 0 },
      player2: { cards: [], points: 0 },
    });
  });
});
