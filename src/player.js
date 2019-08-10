
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
    this.isTurn = false;
    this.cardRank;
    this.cardEval;
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
    if (!this.game.didSomeoneRaise && this.bet == this.game.raiseAmount) {
      this.status = "checked";
      this.game.advanceTurn();
    }
  }

  Raise(amount) {
    if (this.chips < amount) {
      return false;
    } else {
       console.log("In Raise: player"+this.ID+" amount " + amount + " this.bet " + this.bet)
      this.bet = this.game.raiseAmount;
       console.log("new this.bet "+ this.bet + "--------------")
      this.removeChips(amount);
      this.game.addToPot(amount);
      this.status = "raised";
      this.game.subRoundStatus = "raised"
      this.game.advanceTurn();
      return true;
    }
  }

  Call(otherPlayersBet) {
     console.log("In call: player" + this.ID)
     console.log("Value supposed to be passed through: " + (this.game.raiseAmount))
    let betDifference = Math.abs(otherPlayersBet - this.bet);
     console.log(" betDifference= " + betDifference + " otherPlayersBet("+otherPlayersBet+") - " + "this.bet("+this.bet+")")
    if (this.chips < betDifference) {
      return false;
    } else {
      this.bet += betDifference;
       console.log("new this.bet " + this.bet + "--------")
      this.removeChips(betDifference);
      this.game.addToPot(betDifference);
      this.status = "called";
      this.game.advanceTurn();
      return true;
    }
  }

  Fold() {
    // Changes the player's status to folded.
    this.status = "folded";
    this.game.advanceTurn();
    //in jquery, change graphics of cards to folded
    //add chips to pot
  }
}
