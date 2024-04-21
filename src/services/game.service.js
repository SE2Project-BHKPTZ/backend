const Deck = require('../models/deck.model');

const isLastRound = (round, playerCount) => {
  switch (playerCount) {
    case 3:
      return round == 20
    case 4:
      return round == 15
    case 5:
      return round == 12
    case 6:
      return round == 10
  }
}

exports.startRound = (round, playerCount) => {
  if (round < 1 || round > 20)
    throw new Error("the count of rounds must be from 1 to 20")

  if (playerCount < 3 || playerCount > 6)
    throw new Error("the player count must be from 3 to 6")

  let deck = new Deck()
  deck.shuffle();
  let result = {
    'hands': deck.deal(round, playerCount),
    'trump': isLastRound(round, playerCount) ? null : deck.drawCard()
  }

  return result
}

exports.getWinningCard = (cards, trump) => {
  let winningCard = cards[0];
  if (winningCard.isWizard())
    return winningCard

  for (let i = 1; i < cards.length; i++) {
    if (cards[i].isWizard())
      return cards[i]

    if (cards[i].isTrump(trump) && !winningCard.isTrump(trump)) {
      winningCard = cards[i];
    } else if (
      cards[i].suit === winningCard.suit &&
      cards[i].value > winningCard.value
    ) {
      winningCard = cards[i];
    }
  }
  return winningCard;
}

exports.exportedForTesting = {
  isLastRound,
};