class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }

  isTrump(trump) {
    return this.suit === trump
  }

  isWizard() {
    return this.value === 14
  }

  isJester() {
    return this.value === 0
  }
}

module.exports = Card;