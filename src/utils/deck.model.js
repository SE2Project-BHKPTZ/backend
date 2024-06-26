const crypto = require('crypto');
const Card = require('./card.model');

class Deck {
  constructor() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    this.cards = [];
    suits.forEach((suit) => {
      for (let value = 0; value < 15; value += 1) {
        this.cards.push(new Card(suit, value));
      }
    });
  }

  shuffle() {
    let currentIndex = this.cards.length;

    while (currentIndex !== 0) {
      const randomBuffer = new Uint32Array(1);
      crypto.getRandomValues(randomBuffer);
      const randomNumber = randomBuffer[0] / (0xffffffff + 1);
      const randomIndex = Math.floor(randomNumber * (60));
      currentIndex -= 1;

      [this.cards[currentIndex], this.cards[randomIndex]] = [
        this.cards[randomIndex], this.cards[currentIndex]];
    }
  }

  deal(round, playerNumber) {
    const hands = [];
    for (let i = 0; i < playerNumber; i += 1) {
      hands.push([]);
      for (let j = 1; j <= round; j += 1) { // NOSONAR not used in secure contexts
        hands[i].push(this.drawCard());
      }
    }
    return hands;
  }

  drawCard() {
    if (this.cards.length === 0) throw new Error('No cards left in the deck');

    return this.cards.pop();
  }
}

module.exports = Deck;
