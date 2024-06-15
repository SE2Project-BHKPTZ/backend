const {
  createGame,
  getGame,
  getRounds,
  getPlayers,
  getIdxOfPlayer,
  getNextPlayer,
  addPrediction,
  addSubround,
  addCardPlayed,
  setStichPlayer,
  setNextPlayer,
  addRound,
  getRoundTricks,
  getCurrentRoundTricks,
  getPlayersScores,
  getPlayerScore,
  getPlayerScoreForRound,
  setPlayerScore,
  setRoundScores,
  calculateScoreForRound, getCurrentRound, addCardsToRound,
} = require('./gamestate.service');
const Card = require('../utils/card.model');

describe('Game Functions', () => {
  let gameId;
  let player1;
  let player2;

  beforeEach(() => {
    gameId = 'lobby1';
    player1 = { uuid: 'player1' };
    player2 = { uuid: 'player2' };
    createGame(gameId, [player1, player2]);
  });

  test('Creates a game correctly', () => {
    expect(getGame(gameId)).toEqual({
      players: {
        player1: { cards: [], points: 0 },
        player2: { cards: [], points: 0 },
      },
      rounds: [{
        predictions: {}, subrounds: [], scores: [], deck: {},
      }],
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
    addSubround(gameId);
    setStichPlayer(gameId, { uuid: 'player1' });
    const { subrounds } = getRounds(gameId)[0];
    expect(subrounds[subrounds.length - 1].stichPlayer).toBe('player1');
  });

  test('Adds a card played to a subround', () => {
    addSubround(gameId);
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

  test('Get index of player', () => {
    const playerIdx = getIdxOfPlayer(gameId, 'player1');
    expect(playerIdx).toBe(0);
  });

  test('Get round tricks', () => {
    addSubround(gameId);
    setStichPlayer(gameId, { uuid: 'player1' });
    const tricks = getRoundTricks(gameId, 1);
    expect(tricks).toEqual({ player1: 1 });
  });

  test('Get current round tricks', () => {
    addSubround(gameId);
    setStichPlayer(gameId, { uuid: 'player1' });
    const tricks = getCurrentRoundTricks(gameId);
    expect(tricks).toEqual({ player1: 1 });
  });

  test('Get player score', () => {
    setPlayerScore(gameId, 'player1', 10);
    const score = getPlayerScore(gameId, 'player1');
    expect(score).toBe(10);
  });

  test('Get players scores', () => {
    setPlayerScore(gameId, 'player1', 10);
    const scores = getPlayersScores(gameId);
    expect(scores).toEqual({
      player1: { score: 10, index: 0 },
      player2: { score: 0, index: 1 },
    });
  });

  test('Get player score for round', () => {
    setPlayerScore(gameId, 'player1', 10);
    const score = getPlayerScoreForRound(gameId, 'player1', 1);
    expect(score).toBe(10);
  });

  test('Set player score', () => {
    addRound(gameId);
    setPlayerScore(gameId, 'player1', 20);
    const score = getPlayerScoreForRound(gameId, 'player1', 2);
    expect(score).toBe(20);
  });

  test('Set round scores', () => {
    addRound(gameId);
    setRoundScores(gameId, { player1: 30, player2: 15 });
    const score1 = getPlayerScoreForRound(gameId, 'player1', 2);
    const score2 = getPlayerScoreForRound(gameId, 'player2', 2);
    expect(score1).toBe(30);
    expect(score2).toBe(15);
  });

  test('Calculate score for round', () => {
    addPrediction(gameId, 'player1', 1);
    addPrediction(gameId, 'player2', 1);
    addSubround(gameId);
    setStichPlayer(gameId, { uuid: 'player1' });
    calculateScoreForRound(gameId);
    const scores = getPlayersScores(gameId);
    expect(scores.player1.score).toBe(30);
    expect(scores.player2.score).toBe(-10);
  });

  test('Add cards to round', () => {
    const deck = {
      hands: [[new Card('Hearts', 10)]],
      trump: new Card('Hearts', 4),
    };

    addCardsToRound(gameId, deck);
    const round = getCurrentRound(gameId);

    expect(round.deck).toEqual(deck);
  });
});
