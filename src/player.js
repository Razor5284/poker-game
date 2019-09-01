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
    if (this.chips < amount + this.game.previousRaiseAmount) {
      return false;
    } else {
      this.bet += amount + this.game.previousRaiseAmount;

      let firstTimeAfterCreation = false
      if (this.game.didSomeoneAllIn) {
        let otherPlayer = this.game.playerList.filter(player => player.ID !== this.ID && player.status !== "folded").sort((a, b) => b - a)[0]
        otherPlayer && amount <= otherPlayer.chips ? this.game.createSidePot() : false
        this.game.playerFirstSidepot = this.ID
        this.game.previousRaiseAmount = this.game.raiseAmount
        this.game.raiseAmount = Math.abs(amount - this.game.previousRaiseAmount)
        firstTimeAfterCreation = true
        this.game.pot[this.game.activePot] += this.game.raiseAmount
      }

      this.game.pot[this.game.activePot] += amount
      if ((this.game.playerFirstSidepot !== -1 && this.game.playerFirstSidepot !== this.ID) || firstTimeAfterCreation === true) this.game.pot[this.game.previousPot] += this.game.previousRaiseAmount

      this.removeChips(amount);
      if (this.bettingPot.indexOf(this.game.activePot) === -1) this.bettingPot.push(this.game.activePot)
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
      let firstTimeAfterCreation = false

      console.log('Player', this.ID + ':chips < betDifference')
      if (!this.game.debtPotCreated || this.game.debtPotCreated != (otherPlayersBet - this.chips)) {
        console.log('NO debt')
        this.game.addToPot(this.chips)
        console.log(this.chips, 'added to the main pot')
        this.game.pot[this.game.activePot] -= Math.abs(otherPlayersBet - this.chips)
        console.log((otherPlayersBet - this.chips), 'substracted from the main pot')
        this.game.createSidePot()
        firstTimeAfterCreation = true
        this.game.addToPot(Math.abs(otherPlayersBet - this.chips))

        this.game.playerFirstSidepot = this.ID
        this.game.raiseAmount = Math.abs(otherPlayersBet - this.chips)
        this.game.previousRaiseAmount = this.chips
        this.game.debtPotCreated = otherPlayersBet - this.chips
      } else {
        console.log('Debt')
        this.game.pot[this.game.activePot - 1] += this.chips
        console.log(this.chips, 'added to the main pot')
      }

      if ((this.game.playerFirstSidepot !== -1 && this.game.playerFirstSidepot !== this.ID) || firstTimeAfterCreation === true) this.game.pot[this.game.previousPot] += this.game.previousRaiseAmount
      console.log((otherPlayersBet - this.chips), 'added to the side pot')
      this.removeChips(this.chips)
      this.game.advanceTurn();
      return true;
    } else {
      this.bet += betDifference;
      this.removeChips(betDifference);

      this.game.addToPot(Math.abs(betDifference - this.game.previousRaiseAmount));
      if (this.game.playerFirstSidepot !== -1 && this.game.playerFirstSidepot !== this.ID) this.game.pot[this.game.previousPot] += this.game.previousRaiseAmount
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
