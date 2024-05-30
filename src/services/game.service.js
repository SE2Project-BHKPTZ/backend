const Deck = require('../utils/deck.model');

const isLastRound = (round, maxRounds) => round === maxRounds;

exports.startRound = (round, playerCount, maxRounds) => {
  if (round < 1 || round > 20) { throw new Error('the count of rounds must be from 1 to 20'); }

  if (playerCount < 3 || playerCount > 6) { throw new Error('the player count must be from 3 to 6'); }

  const deck = new Deck();
  deck.shuffle();
  return {
    hands: deck.deal(round, playerCount),
    trump: isLastRound(round, maxRounds) ? null : deck.drawCard(),
  };
};

exports.getWinningCard = (cards, trump) => {
  let winningCard = cards[0];
  if (winningCard.isWizard()) { return winningCard; }

  for (let i = 1; i < cards.length; i += 1) {
    if (cards[i].isWizard()) { return cards[i]; }

    if (!cards[i].isJester()
      && (winningCard.isJester()
        || (cards[i].isTrump(trump) && !winningCard.isTrump(trump))
        || (cards[i].suit === winningCard.suit
          && parseInt(cards[i].value, 10) > parseInt(winningCard.value, 10)))) {
      winningCard = cards[i];
    }
  }
  return winningCard;
};

exports.exportedForTesting = {
  isLastRound,
};
