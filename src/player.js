
/*
 *
 *
 *
 */
class Player {
  constructor(ID, name, chips) {
    this.ID = ID;
    this.name = name;
    this.chips = chips;
    this.cards = [];
  }

  // Gets ID number of player
  get IDNumber() {
    return this.ID;
  }

  // Gets player name
  get Name() {
    return this.name;
  }

  // Gets players total chip count
  get Chips() {
    return this.chips;
  }

  // Adds new chips to players total chip count
  addChips(value) {
    this.chips += value;
  }

  // Removes chips from players total chip count
  removeChips(value) {
    this.chips -= value;
  }

  // Gets players current hand
  get Cards() {
    return this.cards;
  }

  // Adds a new card to the players hand
  addCard(card) {
    this.cards.push(card);
  }

  // Removes all cards from players hand
  // removeCards() {
  //   this.cards = [];
  // }

  Bet() {
    //pass
  }

  Raise() {
    //pass
  }

  Call() {
    //pass
  }

  Fold() {
    //pass
  }
}
