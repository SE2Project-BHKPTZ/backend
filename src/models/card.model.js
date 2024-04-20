class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    // Method to get the card's name
    getName() {
        let valueName = this.value;
        if (this.value === 0) {
            valueName = "Jack";
        } else if (this.value === 14) {
            valueName = "Ace";
        }
        return `${valueName} of ${this.suit}`;
    }
}