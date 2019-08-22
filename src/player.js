/*
 *
 *
 *
 */
export default class Player {
  constructor(ID, name, chips, game) {
    this.ID = ID;
    this.name = name;
    this.chips = chips;
    this.cards = [];
    this.game = game;
    this.status = "active";
    this.isHuman = false;
    this.bet = 0;
    this.cardRank;
    this.cardEval;
    this.bettingPot = [];
  }

  // Adds new chips to players total chip count
  addChips(value) {
    this.chips += value;
  }

  // Removes chips from players total chip count
  removeChips(value) {
    this.chips -= value;
  }

  // Adds a new card to the players hand
  addCard(card) {
    this.cards.push(card);
  }

  Check() {
    this.status = "checked";
    this.game.advanceTurn();
  }

  Raise(amount) {
    if (this.chips < amount) {
      return false;
    } else {
      this.bet += amount;
      this.game.didSomeoneAllIn ? this.game.createSidePot() : false
      this.removeChips(amount);
      this.game.addToPot(amount);
      if (this.bettingPot.indexOf(this.game.activePot) === - 1) this.bettingPot.push(this.game.activePot)
      if (this.chips === 0) {
        this.status = "All-In"
        this.didRaiseAllIn = true
        this.game.didSomeoneAllIn = true
      }
      else this.status = "raised"
      this.game.subRoundStatus = "raised";
      this.game.advanceTurn();
      return true;
    }
  }

  Call(otherPlayersBet) {
    let betDifference = Math.abs(this.bet < otherPlayersBet ? otherPlayersBet - this.bet : this.bet - otherPlayersBet);
    if (this.bettingPot.indexOf(this.game.activePot) === - 1) this.bettingPot.push(this.game.activePot)
    if (this.chips < betDifference) {
      this.status = "All-In"
      this.game.didSomeoneAllIn = true
      this.game.addToPot(this.chips)
      this.game.pot[this.game.activePot] -= (otherPlayersBet - this.chips)
      this.game.createSidePot()
      this.game.addToPot(otherPlayersBet - this.chips)
      this.removeChips(this.chips)
      this.game.advanceTurn();
      return true;
    } else {
      this.bet += betDifference;
      this.removeChips(betDifference);
      this.game.addToPot(betDifference);
      if (this.chips === 0) {
        this.status = "All-In"
        this.game.didSomeoneAllIn = true
      }
      else this.status = "called"
      this.game.advanceTurn();
      return true;
    }
  }

  Fold() {
    // Changes the player's status to folded.
    this.status = "folded";
    this.game.advanceTurn();
  }
}
