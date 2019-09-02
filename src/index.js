import $ from "jquery";
import "./styles.css";
import Player from './player';
import HumanPlayer from './humanplayer';
import { setInterval } from "timers";
import { isArray } from "util";
const { rankBoard, rankDescription, rankCards, evaluateCards } = require('phe') // Imports PHE (poker hand evaluator)

class Game {
  /**
   * constructor - constructor for the Game class.
   *
   * @param  {number} playerCount  number of players to add to the game.
   * @param  {number} initialChips number of chips for each player to start with.
   * @return {void}
   */
  constructor(playerCount, initialChips) {
    this.playerCount = playerCount;
    this.playerList = [];
    this.initialChips = initialChips;
    this.round = 0;
    this.turn = 0;
    this.pot = [0];
    this.activePot = 0;
    this.didSomeoneAllIn = false;
    this.cards = [];
    this.createCardList();
    this.humanPlayer;
    this.playerTurn = [];
    this.subRound = 0;
    this.subRoundStatus = "active";
    this.winner = 0;
    this.didSomeoneRaise = false;
    this.running = false;
    this.shouldStopRunning = false;
    this.debtPotCreated = 0;
    this.playerFirstSidepot = -1;
    this.raiseAmounts = [{pot: 0, raiseAmount: 0, debtamount: -1}]
  }

  /**
   * get Players - getter function for a list of players.
   *
   * @return {array}  returns array of players.
   */
  get Players() {
    return this.playerList;
  }

  /**
   * addPlayer - adds a player into the game.
   *
   * @param  {Player} player Player containing all constructors of a player.
   * @return {void}
   */
  addPlayer(player) {
    this.playerList.push(player);
  }

  /**
   * getPlayerById - returns a player by ID.
   *
   * @param  {number} id   ID of the player to return.
   * @return {Player|boolean}   Returns player object if true, or false if not.
   */
  getPlayerById(id) {
    for (const player of this.playerList) {
      if (player.ID == id) {
        return player;
      }
    }
    return false;
  }

  /**
   * InitialChips - returns the amount of chips each user started with.
   *
   * @return {number}  returns initialChips.
   */
  InitialChips() {
    return this.initialChips;
  }

  /**
   * get Round - returns the current round number.
   *
   * @return {number}  current round number.
   */
  get Round() {
    return this.round;
  }

  /**
   * incrementRound - increments the round by 1.
   *
   * @return {void}
   */
  incrementRound() {
    this.round++;
    this.resetTurn();
  }

  /**
   * get Turn - returns who's turn it is.
   *
   * @return {number}  the number position of the person whose turn it is.
   */
  get Turn() {
    return this.turn;
  }

  /**
   * advanceTurn - advances turn count by 1.
   *
   * @return {void}
   */
  advanceTurn() {
    if (this.turn < this.playerCount) {
      this.turn++
    } else {
      this.turn = 0
    }
  }

  /**
   * resetTurn - resets the turn count.
   *
   * @return {void}
   */
  resetTurn() {
    this.turn = 0
  }

  /**
   * get Pot - Returns the total pot value.
   *
   * @return {number}  Returns the current active pot value.
   */
  get Pot() {
    return this.pot[this.activePot]
  }

  /**
   * addToPot - Adds a value to the current active pot.
   *
   * @param  {number} value Value to add to the current active pot.
   * @return {void}
   */
  addToPot(value) {
    this.pot[this.activePot] += value
  }

  /**
   * resetPot - Removes all other pots and sets the main pot to 0.
   *
   * @return {void}
   */
  resetPot() {
    this.pot = [0]
  }

  /**
   * createSidePot - creates a new sidepot with default value of 0 and makes it the active pot.
   *
   * @return {void}
   */
  createSidePot() {
    if (this.debtPotCreated) this.debtPotCreated = 0
    this.activePot ++
    this.pot.push(0)
    this.didSomeoneAllIn = false
  }

  /**
   * resetCards - resets all players' cards to an empty array.
   *
   * @return {void}
   */
  resetCards() {
    this.cards = [];
  }

  /**
   * dealCards - removes all old player cards, shuffles a set of cards and deals 2 cards to each player.
   *
   * @return {void}
   */
  dealCards() {
    this.removeAllPlayerCards();
    this.shuffleCardList();
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < this.playerList.length; j++) {
        this.dealCardToPlayer(this.playerList[j]);
      }
    }
  }

  /**
   * async dealFlopCards - Manages dealing flop cards to the table and updating the frontend via JQuery.
   * Deals from the game cards (this.cards) to the table's cards (this.cardList) and
   * uses async (500ms) in order to simulate dealing cards in a timely fashion, as opposed to all at once,
   * uses JQuery to update the frontend.
   *
   * @return {void}
   */
  async dealFlopCards() {
    for (let i = 0; i < 3; i++) {
      this.dealCardToTable(this.cardList, this.cards);
      $("#board").children(".tablecard:nth-of-type(" + [i + 1] + ")").children("img").attr("src", "/cards/" + this.cards[i].toUpperCase() + ".png").attr("alt", theGame.cards[i]).css("visibility", "visible");
      await this.timeout(500)
    }
  }

  /**
   * dealTurnCard - see above description for dealFlopCards, however, only deals the turn card.
   *
   * @return {void}
   */
  dealTurnCard() {
    this.dealCardToTable(this.cardList, this.cards);
    $("#board").children(".tablecard:nth-of-type(4)").children("img").attr("src", "/cards/" + this.cards[3].toUpperCase() + ".png").attr("alt", theGame.cards[3]).css("visibility", "visible");
  }

  /**
   * dealRiverCard - see above description for dealFlopCards, however, only deals the river card.
   *
   * @return {void}
   */
  dealRiverCard() {
    this.dealCardToTable(this.cardList, this.cards);
    $("#board").children(".tablecard:nth-of-type(5)").children("img").attr("src", "/cards/" + this.cards[4].toUpperCase() + ".png").attr("alt", theGame.cards[4]).css("visibility", "visible");
  }

  /**
   * removeAllPlayerCards - Resets all players' cards to an empty array.
   *
   * @return {void}
   */
  removeAllPlayerCards() {
    for (let player of this.playerList) {
      player.cards = [];
      this.updateDisplay(player);
    }
  }

  /**
   * dealCardToTable - Deals the top card from the cardList to the table by moving it to this.cards.
   * Shifts the array afterwards.
   *
   * @return {void}
   */
  dealCardToTable() {
    this.cards.push(this.cardList[0]);
    this.cardList.shift();
  }

  /**
   * dealCardToPlayer - Deals cards from cardList to players cards.
   * Shifts the array afterwards.
   *
   * @param  {Player} player which player receives the cards.
   * @return {void}
   */
  dealCardToPlayer(player) {
    player.cards.push(this.cardList[0]);
    this.cardList.shift();
  }

  /**
   * shuffleCardList - Shuffles this.cardList.
   *
   * @return {void}
   */
  shuffleCardList() {
    let tempList = this.cardList;
    for (let j = 0; j < this.cardList.length; j++) {
      let index = Math.floor(Math.random() * tempList.length);
      this.cardList[j] = tempList[index];
      if (index > -1) {
        tempList.splice(index, 1);
      }
    }
  }

  /**
   * createCardList - Creates the list of cards and saves to this.cardList.
   *
   * @return {void}
   */
  createCardList() {
    let cardSymbols = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "T",
      "J",
      "Q",
      "K"
    ];
    let suitSymbols = ["c", "d", "h", "s"];
    this.cardList = [];
    for (let suit = 0; suit < 4; suit++) {
      for (let value = 0; value < 13; value++) {
        let tempCard = cardSymbols[value] + suitSymbols[suit];
        this.cardList.push(tempCard);
      }
    }
  }

  /**
   * getHumanPlayer - assigns humanPlayer variable to the human player.
   *
   * @return {void}
   */
  getHumanPlayer() {
    for (player of playerlist) {
      if (this.player.isHuman) {
        this.humanPlayer = this.player;
      }
    }
  }

  /**
   * playerCheck - Provides functionality for the human player to check.
   * Checks to see if someone raised and if the user has already called.
   * Passes through to check function in player.js, advances turn following.
   *
   * @return {void}
   */
  playerCheck() {
    if (!this.didSomeoneRaise && this.humanPlayer.betCount == this.raiseAmounts[this.activePot].raiseAmount) {
      this.humanPlayer.Check();
      this.advanceTurn();
    }
  }

  /**
   * playerCall - Provides functionality for the human player to call.
   * First checks to see if the player can call the raise, returns false
   * if not, returns true if possible.
   * Passes through to call function in player.js, advances turn following.
   *
   * @return {boolean} true or false
   */
  playerCall(raising = false) {
    if (!this.humanPlayer.Call(this.raiseAmounts[this.activePot].raiseAmount, raising)) {
      alert("You cannot call this bet, you need more chips.")
      return false;
    }
    else {
      this.advanceTurn();
      return true;
    }
  }

  /**
   * playerFold - Provides functionality for the human player to fold.
   * Passes through to fold function in player.js, advances turn following.
   *
   * @return {void}
   */
  playerFold() {
    this.humanPlayer.Fold();
    this.advanceTurn();
  }


  /**
   * playerRaise - Provides functionality for human player to raise.
   *
   * @param  {number} amount amount of chips the user wishes to raise.
   * @return {boolean}  true or false.
   */
  playerRaise(amount) {
    if (this.humanPlayer.betCount != this.raiseAmounts[this.activePot].raiseAmount) { // First checks to see if their bet is equal to the raiseAmount, if so, makes them call first, if not, lets them raise.
      if (!this.playerCall(amount, true)) {
        alert("You cannot raise now, you need more chips.")
        return false;
      } // If users input amount isn't larger than their chip count, allows the raise, changes the raiseAmount and passes through to the raise function.
      let oldRaise = this.raiseAmounts[this.activePot].raiseAmount;
      let newRaise = amount + this.raiseAmounts[this.activePot].raiseAmount;
      this.raiseAmounts[this.activePot].raiseAmount = newRaise
      if (this.humanPlayer.Raise(amount)) {
        this.didSomeoneRaise = this.humanPlayer;
        return true;
      } else { // If failed on the call, returns false.
        this.raiseAmounts[this.activePot].raiseAmount = oldRaise;
        alert("You cannot raise now, you need more chips.")
        return false;
      }
    }
    else { // If they're allowed to raise, allows for an input of amount.
      let oldRaise = this.raiseAmounts[this.activePot].raiseAmount;
      let newRaise = amount + this.raiseAmounts[this.activePot].raiseAmount;
      this.raiseAmounts[this.activePot].raiseAmount = newRaise
      if (this.humanPlayer.Raise(amount)) {
        this.didSomeoneRaise = this.humanPlayer;
        return true;
      } else { // If input amount is too large, returns false and a warning.
        this.raiseAmounts[this.activePot].raiseAmount = oldRaise;
        alert("You cannot raise now, you need more chips.")
        return false;
      }
    }
  }

  /**
   * async simulateRounds - Simulates a round of the game, i.e. four main rounds and subrounds of betting, all table cards dealt.
   *
   * @return {boolean} true or false, loops the game until true (when a player has won).
   */
  async simulateRounds() {
    for (let i = 0; i < 2; i++) { // Two sub-rounds of betting
      if (this.subRound == 0 || (this.subRound == 1 && this.didSomeoneRaise) || this.subRound == 2) { // If it's a subround, or if someone raised, continue to allow calling, checking etc.
        for (let player of this.playerList) {
          if (this.playerList.filter((a) => { return (a.status == "folded" || a.status == "out") && a != player }).length == (this.playerList.length - 1)) {
            // Completes a check to see if all-but-one players have folded or are out and completes the final winner functionality if so.
              this.winner = player
              if (this.winner == this.humanPlayer) {
                let roundsWon = (JSON.parse(window.localStorage.getItem('roundsWon')) + 1)
                window.localStorage.setItem('roundsWon', roundsWon);
                alert("Don't cheat.")
              }
              this.winner.addChips(this.Pot);
              this.resetPot();
              $("#seat" + this.winner.ID).addClass("winner");
              $("#right-sidebar").children("h3").text("Winner");
              $("#card-evaluation").children("p").text("The winner is " + this.winner.name + ", who won because everyone else folded");
              this.updateDisplay(this.winner);
              return this.checkFinalWinner();

          } else if (!player.isHuman && player.status != "folded" && player.status != "out" && player.status != "All-In") {
            // If player is simulated (not human), not folded, etc., allows them to perform checkStatus, then updates display.
            $("#seat" + player.ID).addClass("active");
            await this.timeout(getRandomInt(500, 4000))
            this.checkStatus(player);
            this.updateDisplay(player);
            $("#seat" + player.ID).removeClass("active");
          }

          else if (player.isHuman && player.status != "folded" && player.status != "out" && player.status != "All-In") {
            // If player is human, not folded etc., allows them to perform actions.
            if (this.didSomeoneRaise && this.didSomeoneRaise != this.humanPlayer) {
              // controls visibility of check and call buttons based on if someone raised.
              $('.control-button:nth-of-type(1)').css("visibility", "hidden");
              $('.control-button:nth-of-type(2)').css("visibility", "visible");
            } else {
              $('.control-button:nth-of-type(1)').css("visibility", "visible");
              $('.control-button:nth-of-type(2)').css("visibility", "hidden");
            }
            if (this.subRound != 0 || player.chips == 0) {
              // Controls visibility of raise button.
              $('.control-button:nth-of-type(3)').css("visibility", "hidden");
            } else {
              $('.control-button:nth-of-type(3)').css("visibility", "visible");
            }
            $("#seat" + player.ID).addClass("active");
            $("#controls").children(".control-button").removeClass("inactive");
            this.humanPlayer = player;
            await this.playerFinished(); // awaits user input via button press on frontend.
            this.updateDisplay(player);
            $("#seat" + player.ID).removeClass("active");
            $("#controls").children(".control-button").addClass("inactive");
          }
        }
        this.subRound++;
      }
       else {
        this.subRound = 0;
        this.didSomeoneRaise = false;
        this.resetRaises();
        this.subRoundStatus = "active"
      }
    }
    this.resetRaises();
    this.subRound = 0;
    this.subRoundStatus = "active"
    this.didSomeoneRaise = false;
    this.incrementRound();

    if (this.round == 1) {
      this.dealFlopCards()
      await this.timeout(3000)
      this.evaluatePlayerCards()
    } else if (this.round == 2) {
      this.dealTurnCard()
      await this.timeout(2000)
      this.evaluatePlayerCards()
    } else if (this.round == 3) {
      this.dealRiverCard()
      await this.timeout(2000)
      this.evaluatePlayerCards()
    } else if (this.round == 4) {
      this.evaluateWinner()
      return true;
    }
    return false; // Game loop hasn't finished
  }

  /**
   * checkStatus - checks the player's status and updates variables accordingly.
   *
   * @param  {Player} player which player to perform the action on.
   * @return {Player | boolean}        returns value of if someone raised, which can be false, or the player which raised.
   */
  checkStatus(player) {
    if (player.chips >= 0 && player.status != "folded") {
      // Let Players Raise/Call/Fold
      this.simulatePlayer(player);
      switch (player.status) {
        case "All-In":
          player.didRaiseAllIn ? this.didSomeoneRaise = true : false
          break;
        case "called":
          break;
        case "raised":
          this.didSomeoneRaise = player;
          break;
      }
    }
    return this.didSomeoneRaise;
  }

  /**
   * simulatePlayer - checks if a player has raised and passes through to doRandomPlayerAction and doSubRoundPlayerAction.
   *
   * @param  {Player} player the player to perform actions on.
   * @return {void}
   */
  simulatePlayer(player) {
    if (this.playerFirstSidepot !== -1 && this.playerFirstSidepot === player.ID) this.playerFirstSidepot = -1;
    let someoneRaised = false;
    let otherPlayer = this.didSomeoneRaise;
    if (this.subRound == 0) {
      if (otherPlayer) {
        if (otherPlayer.status === "raised" && otherPlayer.ID != player.ID) {
          // if otherPlayer = true, makes sure the person who raised isn't the current player.
          someoneRaised = otherPlayer;
        }
      }
      this.doRandomPlayerAction(player, someoneRaised); //passes through the player to perform the action on and the person who raised, if it's set.
    } else {
      if (otherPlayer) {
        if (otherPlayer.status === "raised" && otherPlayer.ID != player.ID) {
          // ensures the player who raised isn't the current player.
          someoneRaised = otherPlayer;
        } else if (otherPlayer.status != "raised" && otherPlayer != player) {
          someoneRaised = false;
        }
      }
      this.doSubRoundPlayerAction(player, someoneRaised); //passes through the player to perform the action on and the person who raised, if it's set.
    }
  }

  /**
   * doRandomPlayerAction - randomly chooses the action/s to perform, i.e. raise, call, check or fold.
   *
   * @param  {Player} player        the player to perform the actions on.
   * @param  {Player} someoneRaised the player that previously raised, if required.
   * @return {void}
   */
  doRandomPlayerAction(player, someoneRaised) {
    if (this.playerList.filter((a) => { return (a.status == "folded" || a.status == "out") && a != player }).length === (this.playerList.length - 1)) {
      // if all other players have folded, returns check instead of folding or other actions.
      return player.Check();
    }
    switch (getRandomInt(0, 6)) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
        if (!someoneRaised && player.betCount == this.raiseAmounts[this.activePot].raiseAmount) {
          return player.Check(); // can check if no-one raised.
        } else if (!player.Call(this.raiseAmounts[this.activePot].raiseAmount)) {
          // fold if unable to call due to insufficient chips
          return player.Fold();
        }
        break;
      case 5:
      case 6: //raise
        if (someoneRaised && player.betCount != this.raiseAmounts[this.activePot].raiseAmount && !player.isHuman) {
          let oldRaise = this.raiseAmounts[this.activePot].raiseAmount;
          let newRaise = getRandomInt(Math.round(1), (player.betCount == oldRaise ? player.chips : player.betCount < oldRaise ? ((player.chips - (oldRaise - player.betCount) <= 0 ? false : player.chips - (oldRaise - player.betCount))) : (player.betCount - oldRaise) )) // Random integer between 1 and a maximum, maximum is based off of the current chip count, raise amount and player's bet.
          if (!player.Call(oldRaise, true)) {return this.doRandomPlayerAction(player, someoneRaised)} // if the player can't call, try to doRandomPlayerAction again
          this.raiseAmounts[this.activePot].raiseAmount = newRaise + oldRaise
          if (isNaN(newRaise)) debugger
          if (!player.Raise(newRaise)) {
            this.raiseAmounts[this.activePot].raiseAmount = oldRaise;
            return this.doRandomPlayerAction(player, someoneRaised); // if the player can't raise the amount, try to doRandomPlayerAction again
          }
          break;
        }
        else {
          let oldRaise = this.raiseAmounts[this.activePot].raiseAmount;
          let newRaise = getRandomInt(Math.round(1), (player.betCount == oldRaise ? player.chips : player.betCount < oldRaise ? ((player.chips - (oldRaise - player.betCount) <= 0 ? false : player.chips - (oldRaise - player.betCount))) : (player.betCount - oldRaise) )) // Random integer between 1 and a maximum, maximum is based off of the current chip count, raise amount and player's bet.
          if (newRaise == 0) {return this.doRandomPlayerAction(player, someoneRaised)} // Precaution to ensure that no-one raises a value of 0.
          this.raiseAmounts[this.activePot].raiseAmount = newRaise + oldRaise
          if (!player.Raise(newRaise)) {
            this.raiseAmounts[this.activePot].raiseAmount = oldRaise;
            return this.doRandomPlayerAction(player, someoneRaised); // if the player can't raise the amount, try to doRandomPlayerAction again
          }
          break;
        }
    }
  }


  /**
   * doSubRoundPlayerAction - randomly chooses the action/s to perform, i.e. call, check or fold, but not raise.
   *
   * @param  {Player} player        description
   * @param  {Player} someoneRaised description
   * @return {void}
   */
  doSubRoundPlayerAction(player, someoneRaised) {
    // Force check when everyone else folded
    if (this.playerList.filter((a) => { return (a.status == "folded" || a.status == "out") && a != player }).length === (this.playerList.length - 1)) {
      return player.Check();
    }
    if (someoneRaised.bet != player.betCount) {
      switch (getRandomInt(0, 6)) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
          if (!someoneRaised && player.betCount == this.raiseAmounts[this.activePot].raiseAmount) {
            return player.Check();
          } else if (!player.Call(this.raiseAmounts[this.activePot].raiseAmount)) {
            return player.Fold();
          }
          break;
        case 5:
        case 6:
          player.Fold();
          break;
      }
    }
  }

  /**
   * playerDisplay - Re-enables visibility of each player's display when called, with their name, new chip amount etc.
   *
   * @return {void}
   */
  playerDisplay() {
    let idString = "#seat"
    for (let player of this.playerList) {
      $(idString + player.ID).css('visibility', 'visible');
      $(idString + player.ID).children(".playerinfo").children(".name").text("Name: " + player.name);
      $(idString + player.ID).children(".playerinfo").children(".chips").children("p").text("Chips: " + player.chips);
    }
  }

  /**
   * updateDisplay - Updates the display based on input.
   *
   * @param  {Player | string} info Can be Player or string, function performs different actions based on input.
   * @return {void}
   */
  updateDisplay(info) {
    if (info instanceof Player) {
      let idString = "#seat"
      let player = info
      $(idString + player.ID).children(".playerinfo").children(".chips").text("Chips: " + player.chips);
      $(idString + player.ID).children(".playerinfo").children(".status").text(player.status)
      $("#main-pot").text("Main pot: " + this.pot[0]);
      $("#side-pot").text("");
      if (this.pot.length > 1) {
        for (let i = 1; i < this.pot.length; i++) {
          $("#side-pot").append("Side pot " + i + ": " + this.pot[i] + "<br>");
        }
      }
      if (player.status == "active" && player.isHuman) {
        $(idString + player.ID).removeClass("folded");
      }

      if (player.isHuman) {
        let numOfGames = JSON.parse(window.localStorage.getItem('numOfGames'))
        let numOfRounds = JSON.parse(window.localStorage.getItem('numOfRounds'))
        let numOfWins = JSON.parse(window.localStorage.getItem('numOfWins'))
        let winRate = Math.round((numOfWins / numOfGames) * 100)
        Number.isNaN(winRate) ? winRate = 0 : false
        $("#left-sidebar").children(".player-record").children("#games-played").text("Games played: " + numOfGames);
        $("#left-sidebar").children(".player-record").children("#rounds-played").text("Rounds played: " + numOfRounds);
        $("#left-sidebar").children(".player-record").children("#rounds-won").text("Rounds Won: " + JSON.parse(window.localStorage.getItem('roundsWon')));
        $("#left-sidebar").children(".player-record").children("#games-won").text("Number of Wins: " + numOfWins);
        $("#left-sidebar").children(".player-record").children("#profit").text("Total Profit: " + JSON.parse(window.localStorage.getItem('profitAmount')));
        $("#left-sidebar").children(".player-record").children("#win-rate").text("Win Rate: " + winRate + "%");
      }

      if (player.status == "folded") {
        $(idString + player.ID).addClass("folded");
        $(idString + player.ID).children(".card1").children("img").attr("src", "/cards/gray_back.png");
        $(idString + player.ID).children(".card2").children("img").attr("src", "/cards/gray_back.png");
      } else if (player.status == "active" && !player.isHuman) {
        $(idString + player.ID).removeClass("folded");
        $(idString + player.ID).children(".card1").children("img").attr("src", "/cards/purple_back.png");
        $(idString + player.ID).children(".card2").children("img").attr("src", "/cards/purple_back.png");
      }
    }
    if (info == "reset") {
      $("#board").children(".tablecard").children("img").css("visibility", "hidden");
      $("#pot").css("visibility", "hidden");
      $(".player").css("visibility", "hidden");
      $("#card-evaluation").children("p").text("");
      $('#Call').text("Call");
      $(".player").removeClass("active");
      $(".winner").removeClass("winner");
      $("control-button").css("visibility", "visible");
    }
  }

  /**
   * resetRaises - resets status of all players who raised.
   *
   * @return {void}
   */
  resetRaises() {
    for (let player of this.playerList) {
      if (
        player.chips > 0 &&
        (player.status == "raised" ||
          player.status == "matched" ||
          player.status == "checked")
      ) {
        player.status = "active";
      }
    }
  }

  /**
   * playerFinished - awaits user input via button press on frontend.
   *
   * @return {void}
   */
  playerFinished() {
    return new Promise(resolve => { // awaits promise resolve
      if (this.humanPlayer.betCount != this.raiseAmounts[this.activePot].raiseAmount) { // sets the maximum the user can raise to, in the raise input box
        $('#RaiseAmount').attr("max", Math.abs(this.raiseAmounts[this.activePot].raiseAmount - this.humanPlayer.chips));
      } else {
        $('#RaiseAmount').attr("max", this.humanPlayer.chips);
      }
      $('#Call').text("Call " + (this.raiseAmounts[this.activePot].raiseAmount - this.humanPlayer.betCount)); // Adds the call amount to the button text
      $("#Check").unbind(); // unbinds in case of a previous button press
      $("#Call").unbind();
      $("#Raise").unbind();
      $("#Fold").unbind();
      $("#Check").click(() => { // if clicked, perform this.playerCheck()
        this.playerCheck();
        resolve(); // resolves the promise when finished
      });
      $("#Call").click(() => {
        if (this.playerCall()) {
          resolve();
        }
      });
      $("#Raise").click(() => {
        if (this.playerRaise(parseInt($('#RaiseAmount').val()))) {
          resolve();
        }
      });
      $("#Fold").click(() => {
        this.playerFold();
        resolve();
      });
    });
  }

  /**
   * timeout - performs a timeout of a number of ms.
   *
   * @param  {number} ms amount of milliseconds to pause for.
   * @return {void}
   */
  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * evaluatePlayerCards - evaluates the user's cards and outputs text (including advice) into the right sidebar.
   * Also updates the strength meter based on which cards the user has.
   *
   * @return {void}
   */
  evaluatePlayerCards() {
    const board = this.cards.join(" ") + " " + this.humanPlayer.cards[0] + " " + this.humanPlayer.cards[1]
    const rank = rankBoard(board)
    const name = rankDescription[rank]
    if (this.humanPlayer.status != "folded" && this.humanPlayer.status != "out") {
      $("#card-evaluation").children("p").text("Combined with the cards on the table, you have " + name + ". ");
      if (name == 'A Pair') {
        $("#card-evaluation").children("p").append("<p>With a pair, there is a low chance of you having a winning hand. The higher the pair is, the stronger the chance of winning (e.g. a pair of Jacks vs a pair of 2s).</p><p>If you have a pair with the table, and someone else also has this pair, whoever has the highest other card in their hand wins (e.g. both players have a pair of Kings, one has a 3, and the other has a 5, the player with a 5 wins), otherwise the pot is split between the winners.</p>");
        $("#strength-meter-container").children("#strength-meter").children("#background").css("clip-path", "inset(0 85% 0 0)");
      } else if (name == 'Two Pairs') {
        $("#card-evaluation").children("p").append("<p>With two pairs, you have a higher chance of winning than a single pair, but is still a very low chance. Like a pair, the higher each pair is, the stronger the chance of winning (e.g. a pair of Jacks vs a pair of 2s).</p><p>If in the small chance someone else also has two pairs, the player with the highest cards wins, or if both pairs are the same, the winners split the pot.</p>");
        $("#strength-meter-container").children("#strength-meter").children("#background").css("clip-path", "inset(0 75% 0 0)");
      } else if (name == 'Three of a Kind') {
        $("#card-evaluation").children("p").append("<p>You have a moderate hand. A three of a kind is stronger than a pair.</p><p>It is worth noting that the higher your three-of-a-kind hand is, the more likely you are to win.</p><p>If there is a pair on the table, bear in mind someone else could have a three of a kind too, and whoever has the highest other card in their hand will win the pot.</p>");
        $("#strength-meter-container").children("#strength-meter").children("#background").css("clip-path", "inset(0 60% 0 0)");
      } else if (name == 'Four of a Kind') {
        $("#card-evaluation").children("p").append("<p>You have a very strong hand, which you are very likely to win with.</p><p>A four of a kind is the third strongest hand. Another player can only beat your hand if they also have a four of a kind (with other, higher cards), if they have a straight flush, or a royal flush.</p><p>Based off other player's actions, you could raise here to yeild more of a winning, or you could check/call dependant on how confident you are you have the winning hand.</p>");
        $("#strength-meter-container").children("#strength-meter").children("#background").css("clip-path", "inset(0 15% 0 0)");
      } else if (name == 'A Straight') {
        $("#card-evaluation").children("p").append("<p>You have an OK hand. A straight is when all cards follow on numerically from each other, e.g. 4, 5, 6, 7, 8, or 9, 10, J, Q, K.</p><p>A straight is stronger than three of a kind and two pair, but bear in mind, others can also have a straight.</p>");
        $("#strength-meter-container").children("#strength-meter").children("#background").css("clip-path", "inset(0 50% 0 0)");
      } else if (name == 'A High Card') {
        $("#card-evaluation").children("p").append("<p>You have the worst hand possible. You should not raise or call others' raises unless you are planning on bluffing.</p><p>If someone else calls your bluff, and also has only a high card, whoever has the highest cards wins, the highest single card being an Ace.</p>");
        $("#strength-meter-container").children("#strength-meter").children("#background").css("clip-path", "inset(0 95% 0 0)");
      } else if (name == 'A Flush') {
        $("#card-evaluation").children("p").append("<p>You have a good hand. A flush is stronger than a straight.</p><p>A flush is where all cards are the same suit.</p><p>Another player can also have a flush, and whoever has the highest cards in their hand to make up the flush wins.</p>");
        $("#strength-meter-container").children("#strength-meter").children("#background").css("clip-path", "inset(0 40% 0 0)");
      } else if (name == 'A Full House') {
        $("#card-evaluation").children("p").append("<p>You have a great hand. A full house is stronger than a flush.</p><p>A full house is a combination of three of a kind and a pair. E.g. Three Aces and Two Sixes.</p><p>If there is a three of a kind on the table, it is possible another player could have a pair, which could be stronger than yours.</p>");
        $("#strength-meter-container").children("#strength-meter").children("#background").css("clip-path", "inset(0 25% 0 0)");
      } else if (name == 'A Straight Flush' && !(board.includes('A') && board.includes('J') && board.includes('Q') && board.includes('K') && board.includes('T'))) {
        $("#card-evaluation").children("p").append("<p>You have an extremely strong hand. A straight flush is the second strongest hand in the game.</p><p>You could raise in this situation to increase your potential profit.</p>");
        $("#strength-meter-container").children("#strength-meter").children("#background").css("clip-path", "inset(0 5% 0 0)");
      } else if (name == 'A Straight Flush' && (board.includes('A') && board.includes('J') && board.includes('Q') && board.includes('K') && board.includes('T'))) {
        $("#card-evaluation").children("p").text("With the cards on the table, you have a Royal Flush!");
        $("#card-evaluation").children("p").append("<p>You have the strongest hand in the game, play as you please!</p><p>You should probably raise to increase your possible winnings.</p><p>Bear in mind, playing too aggressively may cause other players to fold too early.</p>");
        $("#strength-meter-container").children("#strength-meter").children("#background").css("clip-path", "inset(0 100% 0 0)");
      }
    } else if (this.humanPlayer.status != "out") { // Changes to past tense and what the user could've done or won, had they not folded.
      $("#card-evaluation").children("p").text("Combined with the cards on the table, you had " + name + ". ");
      if (name == 'A Pair') {
        $("#card-evaluation").children("p").append("<p>With a pair, there is a low chance of you having a winning hand. You probably made a good call by folding here, as it's quite possible other players have a stronger hand.</p>");
      } else if (name == 'Two Pairs') {
        $("#card-evaluation").children("p").append("<p>With two pairs, you had a higher chance of winning than a single pair, but is still a very low chance. This, however, dependant upon the rest of the table cards, could have been a winning hand. If you had a two pair, where one of the pairs is on the table, and yours is a low valued pair, you probably made the right decision here.</p>");
      } else if (name == 'A Three of a Kind') {
        $("#card-evaluation").children("p").append("<p>You had a moderate hand. A three of a kind is much stronger than a pair.</p><p>It's possible you made a bad call, but sometimes bluffing is also a good idea, so don't let it discourage you!</p>");
      } else if (name == 'A Four of a Kind') {
        $("#card-evaluation").children("p").append("<p>You had a very strong hand, which you were very likely to win with.</p><p>If someone else raised and you got scared, sometimes it's best to call their bets, and sometimes fold if you are not confident. Try to vary your playstyle.</p>");
      } else if (name == 'A Straight') {
        $("#card-evaluation").children("p").append("<p>You had an OK hand.</p><p>You may have not realised you could have a straight, sometimes it's best to be patient, and maybe call a raise dependant on how big it is and your current chip count.</p><p>It's possible you made a bad call, but sometimes bluffing is also a good idea, so don't let it discourage you!</p>");
      } else if (name == 'A High Card') {
        $("#card-evaluation").children("p").append("<p>You had the worst hand possible. Folding here was probably a great idea. But don't forget, you can bluff every now and then too and win with a high card!</p><p>The less amount of opponents you have in the game, the more likelihood you will win with a high card!</p>");
      } else if (name == 'A Flush') {
        $("#card-evaluation").children("p").append("<p>You had a good hand. A flush is stronger than a straight.</p><p>Sometimes it's best to be patient, and maybe call a raise dependant on how big it is and your current chip count.</p><p>It's possible you made a bad call, but sometimes bluffing is also a good idea, so don't let it discourage you!</p>");
      } else if (name == 'A Full House') {
        $("#card-evaluation").children("p").append("<p>You had a great hand. A full house is stronger than a flush.</p><p>Sometimes it's best to be patient, and maybe call a raise dependant on how big it is and your current chip count.</p><p>It's possible you made a bad call, but sometimes bluffing is also a good idea, so don't let it discourage you!</p>");
      } else if (name == 'A Straight Flush' && !(board.includes('A') && board.includes('J') && board.includes('Q') && board.includes('K') && board.includes('T'))) {
        $("#card-evaluation").children("p").append("<p>You had an extremely strong hand. A straight flush is the second strongest hand in the game. It's extremely likely you would have won this hand.</p><p>Sometimes it's best to be patient, and maybe call a raise dependant on how big it is and your current chip count.</p><p>It's possible you made a bad call, but sometimes bluffing is also a good idea, so don't let it discourage you!</p>");
      } else if (name == 'A Straight Flush' && (board.includes('A') && board.includes('J') && board.includes('Q') && board.includes('K') && board.includes('T'))) {
        $("#card-evaluation").children("p").text("With the cards on the table, you had a Royal Flush!");
        $("#card-evaluation").children("p").append("<p>You had the strongest hand in the game. Sorry to tell you, but you would have won this hand with 100% certainty.</p><p>Watch out for this combination or a similar one in future! (check the poker hands button below)</p>");
      }
    }
  }

  /**
   * evaluateWinner - Evaluates the winner.
   *    Uses imported PHE for evaluation.
   *
   * @return {void}
   */
  evaluateWinner() {
    let ranks = []
    for (let player of this.playerList) {
      if (player.status != "folded") {
        spawnCards(player.cards, "seat" + (player.ID).toString(), "card");
        let boards = this.cards
        let newboards = boards.concat(player.cards)
        let rank = evaluateCards(newboards)
        let rankNumber = rankCards(newboards)
        let name = rankDescription[rankNumber]
        player.cardRank = rank
        player.cardEval = name
        player.bettingPot.forEach(potID => ranks.push([player.ID, player.cardRank, player.cardEval, potID]))
      }
    }
    let winner = []
    ranks = ranks.sort((a, b) => a[1] - b[1])
    ranks.forEach(a => {
      if (!winner[a[3]]) {
        winner[a[3]] = []
      }
      winner[a[3]].push(a)
    })
    winner = winner.map(array => array.filter(a => array[0][1] === a[1]))

    if (winner.filter(a => a && a.length > 0).reduce((previous, next) => {
      if (previous.length === 0) return next
      return previous.concat(next)
    }).length === 1) {
      let tempPot = winner[0][0][3]
      winner = this.getPlayerById(winner[0][0][0]);
      if (winner == this.humanPlayer) {
        let roundsWon = (JSON.parse(window.localStorage.getItem('roundsWon')) + 1)
        window.localStorage.setItem('roundsWon', roundsWon);
      }
      $("#seat" + winner.ID).addClass("winner");
      $("#right-sidebar").children("h3").text("Winner");
      $("#card-evaluation").children("p").text("The winner is " + winner.name + ", who won with " + winner.cardEval);
      winner.addChips(this.pot[tempPot])
      this.winner = winner
      this.resetPot();
      this.updateDisplay(winner);
    } else {
      // If there are multiple winners
      $("#right-sidebar").children("h3").text("Winners")
      $("#card-evaluation").children("p").text("The winners are ");
      for (let i = 0; i < winner.length; i++) {
        let winners = winner[i]
        let potSize = Math.floor(this.pot[i] / winners.length)
        for (let j = 0; j < winners.length; j++) {
          let winnersInfo = this.getPlayerById(winners[j][0])
          if (winnersInfo == this.humanPlayer) {
            let roundsWon = (JSON.parse(window.localStorage.getItem('roundsWon')) + 1)
            window.localStorage.setItem('roundsWon', roundsWon);
          }
          $("#seat" + winnersInfo.ID).addClass("winner");
          winnersInfo.addChips(potSize);
          $("#card-evaluation").children("p").append(winnersInfo.name + " who won " + potSize + ", with ", winnersInfo.cardEval, " and ");
          this.updateDisplay(winnersInfo);
        }
      }
      $("#card-evaluation").children("p").append(".");
      this.resetPot();
    }
    this.checkFinalWinner();
  }

  /**
   * async checkFinalWinner - Checks to see if there is one final winner to end the game.
   *
   * @return {Promise <boolean>}  Returns true if there is a final winner, false otherwise, then the game continues to run.
   */
  async checkFinalWinner() {
    theGame.playerList = theGame.playerList.filter(player => {
      if (player.isHuman && player.status !== "out" && player.status !== "folded") {
        let roundsPlayed = (JSON.parse(window.localStorage.getItem('numOfRounds')) + 1)
        window.localStorage.setItem('numOfRounds', roundsPlayed);
      }
      if (player.chips <= 0 && player != this.winner) {
        player.status = "out"
        if (player.isHuman) {
          let gamesPlayed = (JSON.parse(window.localStorage.getItem('numOfGames')) + 1)
          window.localStorage.setItem('numOfGames', gamesPlayed);
          this.updateDisplay(this.humanPlayer)
        }
        return false;
      }
      player.status = 'active';
      return true;
    })
    if (this.playerList.length === 1) {
      $("#right-sidebar").children("h3").text("Final Winner")
      $('#card-evaluation').children('p').text('The final winner is ' + this.winner.name + '!')
      if (this.winner === this.humanPlayer) { // Saves the player's profit and total number of games & wins to localstorage
        let gamesPlayed = (JSON.parse(window.localStorage.getItem('numOfGames')) + 1)
        window.localStorage.setItem('numOfGames', gamesPlayed);
        this.humanPlayer.wins ++
        let profit = (JSON.parse(window.localStorage.getItem('profitAmount')) + this.humanPlayer.chips)
        window.localStorage.setItem('profitAmount', profit);
        let wins = (JSON.parse(window.localStorage.getItem('numOfWins')) + 1)
        window.localStorage.setItem('numOfWins', wins);
      }
      this.updateDisplay(this.humanPlayer)
      this.stopGame()
      return
    }
    await this.timeout(5000);
    this.freshGame();
    return new Promise(resolve => resolve(false));
  }

  /**
   * freshGame - creates a new game for all remaining players with new cards etc., but keeps their remaining chips.
   *
   * @return {void}
   */
  freshGame() {
    this.round = 0;
    this.turn = 0;
    this.pot = [0];
    this.activePot = 0;
    this.didSomeoneAllIn = false;
    this.cards = [];
    this.createCardList();
    this.playerTurn = [];
    this.subRound = 0;
    this.subRoundStatus = "active";
    this.winner = 0;
    this.didSomeoneRaise = false;
    this.running = false;
    this.shouldStopRunning = false;
    this.shouldStartRunning = false;
    this.playerFirstSidepot = -1;
    this.raiseAmounts = [{pot: 0, raiseAmount: 0, debtamount: -1}]
    this.resetRaises();
    this.dealCards();
    this.updateDisplay("reset");
    $(".player").removeClass("active");
    $(".winner").removeClass("winner");
    $("#strength-meter-container").children("#strength-meter").children("#background").css("clip-path", "inset(0 100% 0 0)");
    $("#right-sidebar").children("h3").text("Card Ranking");
    $("#card-evaluation").children("p").text("");
    $("#controls").children(".control-button").addClass("inactive");
    $("#pot").css("visibility", "visible");
    $(".button-copy").css("display", "block");
    const initializeGame = () => {
      for (let player of this.playerList) {
        player.bet = [0]
        player.didRaiseAllIn = false
        player.bettingPot = []
        player.status = "active"
        this.updateDisplay(player)
        if (player.isHuman) {
          spawnCards(player.cards, "seat" + (player.ID).toString(), "card");
        }
      }
      this.playerDisplay()
    }

    initializeGame()
    this.startGame()
  }

  /**
   * startGame - runs the game on a loop until set to false.
   *
   * @return {void}
   */
  startGame() {
    if (this.running) {
      this.stopGame()
    }
    this.shouldStartRunning = true;
    let gameLoopReadyToStart = setInterval(async () => {
      if (!this.running && this.shouldStartRunning) {
        clearInterval(gameLoopReadyToStart);
        await this.gameLoop();
      }
      if (!this.shouldStartRunning) {
        clearInterval(gameLoopReadyToStart);
      }
    }, 500)
  }

  /**
   * stopGame - stops the game if called.
   *
   * @return {void}
   */
  stopGame() {
    this.shouldStopRunning = true;
    this.shouldStartRunning = false;
  }

  /**
   * async gameLoop - Loops the game whilst true, awaits until next loop before continuing.
   *
   * @return {Promise <boolean>}  return true or a function to run the game loop again if false.
   */
  async gameLoop() {
    this.running = true;
    if (this.shouldStopRunning) {
      this.running = false;
      this.shouldStopRunning = false;
      return;
    }
    if (await this.simulateRounds()) {
      return true;
    } else {
      return await this.gameLoop(); // Loops the game again if false
    }
  }
}

/**
 * playerNewOrOld - Handles JQuery and local storage for if a player is new or old.
 *
 * @return {Promise} awaits promise resolve.
 */
function playerNewOrOld() {
  return new Promise(resolve => {
      $("#new-player").click(_ => {
        $(".modal-popup").css('visibility', 'hidden');
        window.localStorage.clear();
        window.localStorage.setItem('numOfGames', 0);
        window.localStorage.setItem('numOfRounds', 0);
        window.localStorage.setItem('roundsWon', 0)
        window.localStorage.setItem('profitAmount', 0);
        window.localStorage.setItem('numOfWins', 0);
        $("#left-sidebar").children(".player-record").children("#games-played").text("Games played: 0");
        $("#left-sidebar").children(".player-record").children("#rounds-played").text("Rounds played: 0");
        $("#left-sidebar").children(".player-record").children("#rounds-won").text("Rounds Won: 0");
        $("#left-sidebar").children(".player-record").children("#games-won").text("Number of Wins: 0");
        $("#left-sidebar").children(".player-record").children("#profit").text("Total Profit: 0");
        $("#left-sidebar").children(".player-record").children("#win-rate").text("Win Rate: 0%");
        resolve()
      });

      $("#returning-player").click(_ => {
        $(".modal-popup").css('visibility', 'hidden');
        resolve()
      });

  });
}

var theGame;
var lastGame;

/**
 * newGame - Creates a new game, adds players, deals cards and starts/stops the game.
 *
 * @param  {number} playerCount   amount of players to be added to the game.
 * @param  {number} initialChips  amount of chips given to each player to start with.
 * @param  {string} playerName    name of the human player.
 * @param  {boolean} continuedGame true/false depending on if game is continued from before or a new game.
 * @return {void}
 */
async function newGame(playerCount, initialChips, playerName, continuedGame) {
  if (!continuedGame) {
    await playerNewOrOld() // awaits input from user via modal popup box
  } else {
    $("#controls").children(".control-button").addClass("inactive");
    $(".menu-button").removeClass("open");
    $(".button-copy").css("display", "block");
    $("#pot").css("visibility", "visible");
  }

  let game = new Game(playerCount, initialChips);
  for (let i = 0; i < playerCount; i++) {
    if (i === 2) {
      game.addPlayer(game.humanPlayer = new HumanPlayer(i, playerName, initialChips, game));
    } else {
      game.addPlayer(new Player(i, "Player " + i, initialChips, game));
    }
  }
  if (theGame) {
    lastGame = theGame;
    lastGame.stopGame();
  }
  theGame = game;
  theGame.dealCards();
  theGame.updateDisplay("reset");
  theGame.freshGame();
  const initializeGame = function () {
    for (let player of theGame.playerList) {
      theGame.updateDisplay(player);
      if (player.isHuman) {
        spawnCards(player.cards, "seat" + (player.ID).toString(), "card"); // makes the user's cards visible
      }
    }
    theGame.playerDisplay();
  }

  initializeGame();
  theGame.startGame();
}

/**
 * spawnCards - spawns cards to make them visible either to the table or player/s
 *
 * @param  {array} tempList    list of the cards to display
 * @param  {string} idString   seat id's of the players of which to display cards
 * @param  {type} classString class string of the players of which to display cards
 * @return {void}
 */
function spawnCards(tempList, idString, classString) {
  for (let i = 0; i < tempList.length; i++) {
    let node = document.createElement("img");
    node.src = "/cards/" + tempList[i].toUpperCase() + ".png";
    node.alt = tempList[i].toUpperCase();
    let className;

    if (idString.includes("seat")) {
      className = "." + classString + (i + 1).toString();
    } else {
      className = "." + classString;
    }
    $("#" + idString).children(className).children("img").attr("src", node.src).attr("alt", node.alt);
  }
}

/**
 * getRandomInt - gets a random number between minimum and maximum
 *
 * @param  {number} min minimum number to create from
 * @param  {number} max maximum number to create to
 * @return {number}     returns the random number
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}


/**
 * JQuery function - JQuery scripts for buttons on menu
 *
 * @return {void}
 */
$(document).ready(function () {
  $("#playnewgame").click(_ => { // starts a new game if clicked
    let continuedGame = true;
    newGame(
      Number($("#playerCount").val()),
      Number($("#initialChips").val()),
      $("#playerName").val(),
      continuedGame)
  });

  $(".button-copy").click(_ => { // opens the play menu
    $(".menu-button").addClass('open');
    $(".button-copy").css('display', 'none');
  });

  $(".submit-button").click(_ => { // closes the play menu
    $(".menu-button").removeClass('open');
    $(".button-copy").css('display', 'block');
  });

  $(".cancel").click(_ => { // closes the play menu
    $(".menu-button").removeClass('open');
    $(".button-copy").css('display', 'block');
  });

  $("#endgame").click(_ => { // ends the game and removes all visible elements of the game
    theGame.updateDisplay("reset");
    theGame = 0;
    this.playerList = [];
    this.round = 0;
    this.turn = 0;
    this.pot = [0];
    this.activePot = 0;
    this.didSomeoneAllIn = false;
    this.cards = [];
    this.humanPlayer;
    this.playerTurn = [];
    this.subRound = 0;
    this.subRoundStatus = "active";
    this.playerFirstSidepot = -1;
    this.raiseAmounts = [{pot: 0, raiseAmount: 0, debtamount: -1}]
  });

  $("#clear").click(_ => { // clears the stored user data
    window.localStorage.clear();
    window.localStorage.setItem('numOfGames', 0);
    window.localStorage.setItem('numOfRounds', 0);
    window.localStorage.setItem('roundsWon', 0);
    window.localStorage.setItem('profitAmount', 0);
    window.localStorage.setItem('numOfWins', 0);
    $("#left-sidebar").children(".player-record").children("#games-played").text("Games played: 0");
    $("#left-sidebar").children(".player-record").children("#rounds-played").text("Rounds played: 0");
    $("#left-sidebar").children(".player-record").children("#rounds-won").text("Rounds Won: 0");
    $("#left-sidebar").children(".player-record").children("#games-won").text("Number of Wins: 0");
    $("#left-sidebar").children(".player-record").children("#profit").text("Total Profit: 0");
    $("#left-sidebar").children(".player-record").children("#win-rate").text("Win Rate: 0%");
  });

  // Script for poker hands popup and close buttons
  let modal = document.getElementById("modal-popup");
  $("#poker-hands-button").click(function () {
    $('#modal-popup').toggle();
  });
  let span = document.getElementsByClassName("close")[0];
  span.onclick = function () {
    modal.style.display = "none";
  }
  newGame(8, 1000, "player");
});
