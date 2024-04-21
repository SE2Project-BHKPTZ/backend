const Card = require('./card.model');

class Deck {
  constructor() {
    let suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
    this.cards = []
    for (let suit of suits) {
      for (let value = 0; value <= 14; value++) {
        this.cards.push(new Card(suit, value))
      }
    }
  }

  shuffle() {
    let currentIndex = this.cards.length;

    while (currentIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [this.cards[currentIndex], this.cards[randomIndex]] = [
        this.cards[randomIndex], this.cards[currentIndex]];
    }
  }

  deal(round, playerNumber) {
    const hands = [];
    for (let i = 0; i < playerNumber; i++) {
      hands.push([])
      for (let j = 1; j <= round; j++) {
        hands[i].push(this.drawCard())
      }
    }

    return hands;
  }

  drawCard() {
    if (this.cards.length === 0)
      throw new Error("No cards left in the deck")

    return this.cards.pop()
  }
}

module.exports = Deck;
