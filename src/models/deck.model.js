class Deck {
    constructor(suits) {
        //const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
        if(suits.length != 4)
            throw new Error('Count of suits must be 4')

        for (let suit of suits) {
            for (let value = 0; value <= 14; value++) {
                cards.push(new Card(suit, value));
            }
        }
    }


    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal(round, playerNumber) {
        const hands = [];

        if(round < 1 || rount > 20)
            throw new Error("the count of rounds must be between 1 and 20")

        for (let i = 0; i < playerNumber; i++) {
            hands.push([]); 
            for (let i = 1; i <= round; i++) {
                hands[j].push(this.drawCard());
            }
        }

        return hands;
    }

    drawCard() {
        if (this.cards.length === 0)
            throw new Error("No cards left in the deck");
        
        return this.cards.pop();
    }
}
