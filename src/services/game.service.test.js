const {
  startRound,
  getWinningCard,
  exportedForTesting,
} = require('./game.service');

const Card = require('../models/card.model');

const { isLastRound } = exportedForTesting;

describe('Function isLastRound', () => {
  it('should return true (3 players)', async () => {
    const result = isLastRound(20, 3);
    expect(result).toBe(true);
    expect(typeof result).toBe('boolean');
  });

  it('should return true (4 players)', async () => {
    const result = isLastRound(15, 4);
    expect(result).toBe(true);
    expect(typeof result).toBe('boolean');
  });

  it('should return true (5 players)', async () => {
    const result = isLastRound(12, 5);
    expect(result).toBe(true);
    expect(typeof result).toBe('boolean');
  });

  it('should return true (6 players)', async () => {
    const result = isLastRound(10, 6);
    expect(result).toBe(true);
    expect(typeof result).toBe('boolean');
  });

  it('should return false (3 players)', async () => {
    const result = isLastRound(2, 3);
    expect(result).toBe(false);
    expect(typeof result).toBe('boolean');
  });

  it('should return false (4 players)', async () => {
    const result = isLastRound(2, 4);
    expect(result).toBe(false);
    expect(typeof result).toBe('boolean');
  });

  it('should return false (5 players)', async () => {
    const result = isLastRound(2, 5);
    expect(result).toBe(false);
    expect(typeof result).toBe('boolean');
  });

  it('should return false (6 players)', async () => {
    const result = isLastRound(2, 6);
    expect(result).toBe(false);
    expect(typeof result).toBe('boolean');
  });
});

describe('startRound', () => {
  test('should throw error if round is less than 1', () => {
    expect(() => {
      startRound(0, 3);
    }).toThrow('the count of rounds must be from 1 to 20');
  });

  test('should throw error if round is greater than 20', () => {
    expect(() => {
      startRound(21, 3);
    }).toThrow('the count of rounds must be from 1 to 20');
  });

  test('should throw error if playerCount is less than 3', () => {
    expect(() => {
      startRound(5, 2);
    }).toThrow('the player count must be from 3 to 6');
  });

  test('should throw error if playerCount is greater than 6', () => {
    expect(() => {
      startRound(5, 7);
    }).toThrow('the player count must be from 3 to 6');
  });

  test('should return an object with hands and trump', () => {
    const round = 5;
    const playerCount = 4;
    const result = startRound(round, playerCount);
    expect(result).toHaveProperty('hands');
    expect(result).toHaveProperty('trump');
  });

  test('should return an object with hands and without trump', () => {
    const round = 20;
    const playerCount = 3;
    const result = startRound(round, playerCount);
    expect(result).toHaveProperty('hands');
    expect(result).toHaveProperty('trump');
    expect(result.trump).toEqual(null);
  });
});

describe('getWinningCard', () => {
  test('should return wizard card at the 1st position', () => {
    const cards = []
    cards.push(new Card("Hearts", 14))
    const trump = 'Hearts';
    expect(getWinningCard(cards, trump)).toEqual(cards[0]);
  });

  test('should return wizard card at the 2nd position', () => {
    const cards = []
    cards.push(new Card("Hearts", 7))
    cards.push(new Card("Hearts", 14))
    cards.push(new Card("Hearts", 10))

    const trump = 'Hearts';
    expect(getWinningCard(cards, trump)).toEqual(cards[1]);
  });

  test('should return highest trump card, single suit', () => {
    const cards = []
    cards.push(new Card("Hearts", 7))
    cards.push(new Card("Hearts", 10))
    cards.push(new Card("Hearts", 9))

    const trump = 'Hearts';
    expect(getWinningCard(cards, trump)).toEqual(cards[1]);
  });

  test('should return highest trump card, multiple suits', () => {
    const cards = []
    cards.push(new Card("Diamonds", 7))
    cards.push(new Card("Hearts", 10))
    cards.push(new Card("Hearts", 9))

    const trump = 'Hearts';
    expect(getWinningCard(cards, trump)).toEqual(cards[1]);
  });

  test('should return highest non-trump card if no trump cards present', () => {
    const cards = []
    cards.push(new Card("Hearts", 7))
    cards.push(new Card("Hearts", 10))
    cards.push(new Card("Hearts", 9))

    const trump = 'Diamonds';
    expect(getWinningCard(cards, trump)).toEqual(cards[1]);
  });
});