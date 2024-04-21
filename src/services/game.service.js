const Deck = require('../utils/deck.model');

const isLastRound = (round, playerCount) => {
  switch (playerCount) {
    case 3:
      return round === 20;
    case 4:
      return round === 15;
    case 5:
      return round === 12;
    case 6:
      return round === 10;
    default:
      return false;
  }
};

exports.startRound = (round, playerCount) => {
  if (round < 1 || round > 20) { throw new Error('the count of rounds must be from 1 to 20'); }

  if (playerCount < 3 || playerCount > 6) { throw new Error('the player count must be from 3 to 6'); }

  const deck = new Deck();
  deck.shuffle();
  const result = {
    hands: deck.deal(round, playerCount),
    trump: isLastRound(round, playerCount) ? null : deck.drawCard(),
  };

  return result;
};

exports.getWinningCard = (cards, trump) => {
  let winningCard = cards[0];
  if (winningCard.isWizard()) { return winningCard; }

  for (let i = 1; i < cards.length; i += 1) {
    if (cards[i].isWizard()) { return cards[i]; }

    if ((cards[i].isTrump(trump) && !winningCard.isTrump(trump))
      || (cards[i].suit === winningCard.suit
        && cards[i].value > winningCard.value)) {
      winningCard = cards[i];
    }
  }
  return winningCard;
};

exports.exportedForTesting = {
  isLastRound,
};
