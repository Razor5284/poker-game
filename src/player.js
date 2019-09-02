export default class Player {
  /**
   * constructor - for the Player class.
   *
   * @param  {number} ID    numerical ID of the player
   * @param  {string} name  string name for the player
   * @param  {number} chips amount of chips the player has
   * @param  {object} game  the game that the player belongs to.
   * @return {void}
   */
  constructor(ID, name, chips, game) {
    this.ID = ID;
    this.name = name;
    this.chips = chips;
    this.cards = [];
    this.game = game;
    this.status = "active";
    this.isHuman = false;
    this.bet = [0];
    this.cardRank;
    this.cardEval;
    this.bettingPot = [];
    this.forcedFold = false
  }

  /**
   * addChips - Adds new chips to players total chip count
   *
   * @param  {number} value amount to add to the chip count
   * @return {void}
   */
  addChips(value) {
    this.chips += value;
  }

  /**
   * removeChips - Removes chips from players total chip count
   *
   * @param  {number} value amount to remove from the chip count
   * @return {void}
   */
  removeChips(value) {
    this.chips -= value;
  }

  /**
   * addCard - adds a card to the player's hand
   *
   * @param  {object} card the card to add to the player's hand
   * @return {void}
   */
  addCard(card) {
    this.cards.push(card);
  }

  /**
   * Check - functionality for a player to check.
   *
   * @return {void}
   */
  Check() {
    this.status = "checked";
    this.game.advanceTurn();
  }



   get betCount() {
     return !this.bet[this.game.activePot] ? 0 : this.bet[this.game.activePot]
   }

   /**
    * Raise - functionality for a player to raise.
    *
    * @param  {number} amount amount for the player to raise.
    * @return {boolean} false if a player is unable to raise.
    */
  Raise(amount) {
    if (this.chips < amount) {
      return false;
    } else {
      this.bet[this.game.activePot] = !this.bet[this.game.activePot] ? 0 : this.bet[this.game.activePot]
      this.bet[this.game.activePot] += amount
      if (this.game.didSomeoneAllIn) {
        let otherPlayer = this.game.playerList.filter(player => player.ID !== this.ID && player.status !== "folded").sort((a, b) => b - a)[0] // Get every player that has not yet folded and is not the current player
        if (otherPlayer && amount <= otherPlayer.chips) {
          if (this.game.pot.length > 2 ) {
            this.bet[this.game.activePot] -= amount
            return false
          } // Create sidepot if there is at least 1 player with more chips than current player and set its values
          this.game.createSidePot()
          this.game.raiseAmounts[this.game.activePot] = {pot: this.game.activePot, raiseAmount: Math.abs(amount - (this.game.raiseAmounts[this.game.activePot-1].raiseAmount - this.bet[this.game.activePot-1])), debtamount: -1}
        }
      }
      if (this.bettingPot.indexOf(this.game.activePot) === -1) this.bettingPot.push(this.game.activePot) // Add player to pot if they aren't yet
      this.game.pot[this.game.activePot] += amount
      this.removeChips(amount)
      if (this.chips === 0) {
        this.status = "All-In"
        this.didRaiseAllIn = true
        this.game.didSomeoneAllIn = true
      } else this.status = "raised"
      this.game.subRoundStatus = "raised";
      this.game.advanceTurn();
      return true;
    }

  }

  /**
   * Call - functionality for a player to call.
   *
   * @param  {number} otherPlayersBet the value of the highest previous raise.
   * @param  {array} list  Array of the raise amounts in each pot along with the player that started it and its ID
   * @return {boolean} true/false if the player is able to call anothers' bet.
   */
  Call(otherPlayersBet, raising, list) {
    let highest = false
    highest = list ? false : true
    list = !list ? this.game.raiseAmounts.filter(o => o !== undefined && (this.bettingPot.indexOf(o.pot) > -1 || o.pot === this.game.activePot)).sort((a, b) => b.pot - a.pot) : list // Gets all pots where a player is involved in and the current one
    if (list.length === 0) {
      return false
    }
    let value = list[0]
    list.shift()
    let success = this.Call(otherPlayersBet, raising, list) // Call functions recursively and start at the lowest pot

    if (this.forcedFold) return false

    if (this.chips == 0 && !success) {
      this.bettingPot = this.bettingPot.filter(p => p != value.pot) // If player wasn't able to complete a turn, filter him out of the active pots
      this.game.advanceTurn()
      if (this.status !== "All-In" || raising) return false
      return true
    }
    this.bet[value.pot] = !this.bet[value.pot] ? 0 : this.bet[value.pot]
    let betDifference = value.raiseAmount - this.bet[value.pot];
    if (betDifference == 0) return true
    if (this.chips === 0) return false
    if (raising && this.chips <= betDifference) return false
    if (this.chips >= betDifference) {
      this.bet[value.pot] += betDifference
      this.game.pot[value.pot] += betDifference
      this.removeChips(betDifference)
      if (this.bettingPot.indexOf(value.pot) === -1) this.bettingPot.push(value.pot) // Add player to pot if they aren't yet
    } else {
      if (value.debtamount != betDifference - this.chips) {
        this.game.pot[value.pot] += this.chips
        this.game.pot[value.pot] -= (betDifference - this.chips)

        let added = this.bettingPot.indexOf(value.pot) === -1 ? true : false
        if (this.bettingPot.indexOf(value.pot) === -1) this.bettingPot.push(value.pot) // Add player to pot if they aren't yet

        if (this.game.pot.length > 2) { // Undo changes and remove player from the pot if they were just added
          this.game.pot[value.pot] -= this.chips
          this.game.pot[value.pot] += (betDifference - this.chips)
          this.forcedFold = true
          if (added) {
            let index = this.bettingPot.indexOf(value.pot)
            this.bettingPot.splice(index, 1)
          }

          return false
        }

        this.game.createSidePot() // Create new sidepot and set its values
        this.game.raiseAmounts[this.game.activePot] = {pot: this.game.activePot, raiseAmount: (betDifference - this.chips), debtamount: (betDifference - this.chips)}
        this.game.pot[this.game.activePot] += (betDifference - this.chips)
        this.removeChips(this.chips)
      } else {
        this.game.pot[value.pot] += this.chips
        if (this.bettingPot.indexOf(value.pot) === -1) this.bettingPot.push(value.pot) // Add player to pot if they aren't yet
        this.removeChips(this.chips)
      }
    }
    if (this.chips < 1) {
      this.status = "All-In"
      if (value.pot == this.game.activePot) this.game.didSomeoneAllIn = true
    } else {
      this.status = "called"
    }
    if (highest) {
      this.game.advanceTurn()
    }
    return true
  }

  /**
   * Fold - functionality for a player to fold.
   *
   * @return {void}
   */
  Fold() {
    // Changes the player's status to folded.
    this.status = "folded";
    this.game.advanceTurn();
  }
}
