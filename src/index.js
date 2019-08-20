import $ from "jquery";
import "./styles.css";
import Player from './player';
import HumanPlayer from './humanplayer';
import { setInterval } from "timers";
const { rankBoard, rankDescription, rankCards, evaluateCards } = require('phe')

/*
 *
 *
 *
 */
class Game {
  constructor(playerCount, initialChips) {
    this.playerCount = playerCount;
    this.playerList = [];
    this.initialChips = initialChips;
    this.round = 0;
    this.turn = 0;
    this.pot = 0;
    this.cards = [];
    this.createCardList();
    this.humanPlayer;
    this.playerTurn = [];
    this.raiseAmount = 0;
    this.subRound = 0;
    this.subRoundStatus = "active";
    this.winner = 0;
    this.didSomeoneRaise = false;
    this.running = false;
    this.shouldStopRunning = false;
  }

  // Returns player list
  get Players() {
    return this.playerList;
  }

  // Add player to the game
  addPlayer(player) {
    this.playerList.push(player);
  }

  getPlayerById(id) {
    for (const player of this.playerList) {
      if (player.ID == id) {
        return player;
      }
    }
    return false;
  }

  // Returns initial chip count
  InitialChips() {
    return this.initialChips;
  }

  // Returns round number
  get Round() {
    return this.round;
  }

  // Increments round by one if less than 5th (final) round
  incrementRound() {
    this.round++;
    this.resetTurn();
  }

  // Returns whos turn it is
  get Turn() {
    return this.turn;
  }

  // Advances turn count
  // bot -> advanceTurn(false);
  // player -> advanceTurn(true);
  advanceTurn(playerType) {
    if (this.turn < this.playerCount) {
      this.turn++;
    } else {
      this.turn = 0;
    }
  }

  resetTurn() {
    this.turn = 0;
  }

  // Returns the total pot value
  get Pot() {
    return this.pot;
  }

  // Adds a value to the total pot
  addToPot(value) {
    this.pot = this.pot + value;
  }

  // Resets the pot to 0
  resetPot() {
    this.pot = 0;
  }

  resetCards() {
    this.cards = [];
  }

  dealCards() {
    this.removeAllPlayerCards();
    this.shuffleCardList();
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < this.playerList.length; j++) {
        this.dealCardToPlayer(this.playerList[j]);
      }
    }
  }

  async dealFlopCards() {
    for (let i = 0; i < 3; i++) {
      this.dealCardToTable(this.cardList, this.cards);
      $("#board").children(".tablecard:nth-of-type(" + [i + 1] + ")").children("img").attr("src", "/cards/" + this.cards[i].toUpperCase() + ".png").attr("alt", theGame.cards[i]).css("visibility", "visible");
      await this.timeout(500)
    }
  }

  dealTurnCard() {
    this.dealCardToTable(this.cardList, this.cards);
    $("#board").children(".tablecard:nth-of-type(4)").children("img").attr("src", "/cards/" + this.cards[3].toUpperCase() + ".png").attr("alt", theGame.cards[3]).css("visibility", "visible");
  }

  dealRiverCard() {
    this.dealCardToTable(this.cardList, this.cards);
    $("#board").children(".tablecard:nth-of-type(5)").children("img").attr("src", "/cards/" + this.cards[4].toUpperCase() + ".png").attr("alt", theGame.cards[4]).css("visibility", "visible");
  }

  removeAllPlayerCards() {
    for (let player of this.playerList) {
      player.cards = [];
      this.updateDisplay(player);
    }
  }

  // Removes a single card from an array and pushes to another
  shiftArray(senderArray, recieverArray) {
    recieverArray.push(senderArray[0]);
    senderArray.shift();
  }

  dealCardToTable() {
    this.cards.push(this.cardList[0]);
    this.cardList.shift();
  }

  // Function to deal cards from cardList to players
  dealCardToPlayer(player) {
    player.cards.push(this.cardList[0]);
    this.cardList.shift();
  }

  // Shuffles an array, which is then assigned to shuffledList
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

  getHumanPlayer() {
    for (player of playerlist) {
      if (this.player.isHuman) {
        this.humanPlayer = this.player;
      }
    }
  }

  playerCheck() {
    if (!this.didSomeoneRaise && this.humanPlayer.bet == this.raiseAmount) {
      this.humanPlayer.Check();
      this.advanceTurn();
    }
  }

  playerCall() {
    if (!this.humanPlayer.Call(this.raiseAmount)) {
      alert("You cannot call this bet, you need more chips.")
      return false;
    }
    else {
      this.advanceTurn();
      return true;
    }
  }

  playerFold() {
    this.humanPlayer.Fold();
    this.advanceTurn();
  }

  playerRaise(amount) {
    console.log("Raising ----------------------------------------------------------")
    if (this.humanPlayer.bet != this.raiseAmount) {
      if (!this.playerCall(amount)) {
        alert("You cannot raise now, you need more chips.")
        return false;
      }
      console.log("called")
      let oldRaise = this.raiseAmount;
      let newRaise = amount + this.raiseAmount;
      console.log(this.raiseAmount)
      this.raiseAmount = newRaise
      console.log("New raiseamount " + this.raiseAmount)
      console.log(this.humanPlayer)

      if (this.humanPlayer.Raise(amount)) {
        this.didSomeoneRaise = this.humanPlayer;
        return true;
      } else {
        this.raiseAmount = oldRaise;
        alert("You cannot raise now, you need more chips.")
        return false;
      }
    }
    else {
      let oldRaise = this.raiseAmount;
      let newRaise = amount + this.raiseAmount;
      console.log(this.raiseAmount)
      this.raiseAmount = newRaise
      console.log("New raiseamount " + this.raiseAmount)

      if (this.humanPlayer.Raise(amount)) {
        this.didSomeoneRaise = this.humanPlayer;
        console.log(this.didSomeoneRaise)
        return true;
      } else {
        this.raiseAmount = oldRaise;
        alert("You cannot raise now, you need more chips.")
        return false;
      }
    }
  }

  async  simulateRounds() {
    for (let i = 0; i < 2; i++) {
      if (this.subRound == 0 || (this.subRound == 1 && this.didSomeoneRaise) || this.subRound == 2) {
        for (let player of this.playerList) {
          if (this.playerList.filter((a) => { return (a.status == "folded" || a.status == "out") && a != player }).length == (this.playerList.length - 1)) {
              this.winner = player
              if (this.winner == this.humanPlayer) {
                let roundsWon = (JSON.parse(window.localStorage.getItem('roundsWon')) + 1)
                window.localStorage.setItem('roundsWon', roundsWon);
                alert("Don't cheat.")
              }
              this.winner.addChips(this.pot);
              this.resetPot();
              $("#seat" + this.winner.ID).addClass("winner");
              $("#right-sidebar").children("h3").text("Winner");
              $("#card-evaluation").children("p").text("The winner is " + this.winner.name + ", who won because everyone else folded");
              this.updateDisplay(this.winner);
              return this.checkFinalWinner();

          } else if (!player.isHuman && player.status != "folded" && player.status != "out") {
            $("#seat" + player.ID).addClass("active");
            await this.timeout(getRandomInt(500, 500))
            this.simulateBetting(player);
            this.updateDisplay(player);
            $("#seat" + player.ID).removeClass("active");
          }

          else if (player.isHuman && player.status != "folded" && player.status != "out") {
            if (this.didSomeoneRaise && this.didSomeoneRaise != this.humanPlayer) {
              $('.control-button:nth-of-type(1)').css("visibility", "hidden");
              $('.control-button:nth-of-type(2)').css("visibility", "visible");
            } else {
              $('.control-button:nth-of-type(1)').css("visibility", "visible");
              $('.control-button:nth-of-type(2)').css("visibility", "hidden");
            }
            if (this.subRound != 0 || player.chips == 0) {
              $('.control-button:nth-of-type(3)').css("visibility", "hidden");
            } else {
              $('.control-button:nth-of-type(3)').css("visibility", "visible");
            }
            $("#seat" + player.ID).addClass("active");
            $("#controls").children(".control-button").removeClass("inactive");
            this.humanPlayer = player;
            await this.playerFinished();
            this.updateDisplay(player);
            $("#seat" + player.ID).removeClass("active");
            $("#controls").children(".control-button").addClass("inactive");
          }
        }
        this.subRound++;
        console.log(`%c============ Subround %s ============`, "color: blue; font-size: 15px", this.subRound);
      }
       else {
        this.subRound = 0;
        console.log("%cSubround %s", "color: blue; font-size: 15px", this.subround)
        this.didSomeoneRaise = false;
        this.resetRaises();
        this.subRoundStatus = "active"
      }
    }
    this.resetRaises();
    this.subRoundStatus = "active"
    this.didSomeoneRaise = false;
    this.incrementRound();
    console.log("%c============================= Round %s =============================", "color: blue; font-size: 17px", this.round)

    if (this.round == 1) {
      this.dealFlopCards()
      console.log(this)
      await this.timeout(3000)
      this.evaluatePlayerCards()
    } else if (this.round == 2) {
      this.dealTurnCard()
      console.log(this)
      await this.timeout(2000)
      this.evaluatePlayerCards()
    } else if (this.round == 3) {
      this.dealRiverCard()
      console.log(this)
      await this.timeout(2000)
      this.evaluatePlayerCards()
    } else if (this.round == 4) {
      this.evaluateWinner()
      console.log('Returning resolve of round')
      return true;
    }
    return false; // Loop hasn't finished
  }

  simulateBetting(player) {
    if (player.chips >= 0 && player.status != "folded") {
      // Let Players Raise/Call/Fold
      this.simulatePlayer(player);
      switch (player.status) {
        case "called":
          break;
        case "raised":
          this.didSomeoneRaise = player;
          console.log(this.didSomeoneRaise)
          break;
      }
    }
    return this.didSomeoneRaise;
  }

  simulatePlayer(player) {
    let someoneRaised = false;
    let otherPlayer = this.didSomeoneRaise;
    if (this.subRound == 0) {
      if (otherPlayer) {
        if (otherPlayer.status === "raised" && otherPlayer.ID != player.ID) {
          someoneRaised = otherPlayer;
        }
      }
      this.doRandomPlayerAction(player, someoneRaised);
    } else {
      if (otherPlayer) {
        if (otherPlayer.status === "raised" && otherPlayer.ID != player.ID) {
          someoneRaised = otherPlayer;
        } else if (otherPlayer.status != "raised" && otherPlayer != player) {
          someoneRaised = false;
        }
      }
      this.doSubRoundPlayerAction(player, someoneRaised);
    }
  }

  doRandomPlayerAction(player, someoneRaised) {
    if (this.playerList.filter((a) => { return (a.status == "folded" || a.status == "out") && a != player }).length === (this.playerList.length - 1)) {
      return player.Check();
    }
    switch (getRandomInt(0, 6)) {
      case 0:
      case 1:
      case 2:
      case 3: //check or fold if not able to call
        if (!someoneRaised && player.bet == this.raiseAmount) {
          return player.Check();
        } else if (!player.Call(this.raiseAmount)) {
          return player.Fold();
        }
        break;
      case 4:
      case 5:
      case 6: //raise
        if (someoneRaised && player.bet != this.raiseAmount && !player.isHuman) {
          console.log("In Raise: player" + player.ID)
          let oldRaise = this.raiseAmount;
          console.log("player chips", player.chips)
          console.log("In normal: oldraise: " + oldRaise)
          let newRaise = getRandomInt(Math.round(1), (player.bet == oldRaise ? player.chips : player.bet < oldRaise ? ((player.chips - (oldRaise - player.bet) <= 0 ? false : player.chips - (oldRaise - player.bet))) : (player.bet - oldRaise) )) //getRandomInt(Math.round(min, max)
          console.log("newraise: " + newRaise)

          if (!player.Call(oldRaise)) {
            return this.doRandomPlayerAction(player, someoneRaised);
          }
          this.raiseAmount = newRaise + oldRaise
          if (!player.Raise(newRaise)) {
            this.raiseAmount = oldRaise;
            return this.doRandomPlayerAction(player, someoneRaised);
          }
          break;
        }
        else {
          console.log("In Raise: player" + player.ID)
          let oldRaise = this.raiseAmount;
          console.log("player chips", player.chips)
          console.log("In normal: oldraise: " + oldRaise)
          let newRaise = getRandomInt(Math.round(1), (player.bet == oldRaise ? player.chips : player.bet < oldRaise ? ((player.chips - (oldRaise - player.bet) <= 0 ? false : player.chips - (oldRaise - player.bet))) : (player.bet - oldRaise) )) //getRandomInt(Math.round(min, max)
          console.log("newraise: " + newRaise)
          if (newRaise == 0) {return this.doRandomPlayerAction(player, someoneRaised)}
          this.raiseAmount = newRaise + oldRaise
          if (!player.Raise(newRaise)) {
            this.raiseAmount = oldRaise;
            return this.doRandomPlayerAction(player, someoneRaised);
          }
          break;
        }
    }
  }


  doSubRoundPlayerAction(player, someoneRaised) {
    //Force check when everyone else folded
    if (this.playerList.filter((a) => { return (a.status == "folded" || a.status == "out") && a != player }).length === (this.playerList.length - 1)) {
      return player.Check();
    }
    if (someoneRaised.bet != player.bet) {
      switch (getRandomInt(0, 6)) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
          //check or fold if not able to call
          if (!someoneRaised && player.bet == this.raiseAmount) {
            return player.Check();
          } else if (!player.Call(this.raiseAmount)) {
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

  playerDisplay() {
    let idString = "#seat"
    for (let player of this.playerList) {
      $(idString + player.ID).css('visibility', 'visible');
      $(idString + player.ID).children(".playerinfo").children(".name").text("Name: " + player.name);
      $(idString + player.ID).children(".playerinfo").children(".chips").children("p").text("Chips: " + player.chips);
    }
  }

  updateDisplay(info) {
    if (info instanceof Player) {
      let idString = "#seat"
      let player = info
      $(idString + player.ID).children(".playerinfo").children(".chips").text("Chips: " + player.chips);
      $(idString + player.ID).children(".playerinfo").children(".status").text(player.status)
      $("#total-pot").text("Total pot: " + this.Pot);

      if (player.status == "active" && player.isHuman) {
        $(idString + player.ID).removeClass("folded");
      }

      if (player.isHuman) {
        let numOfGames = JSON.parse(window.localStorage.getItem('numOfGames'))
        let numOfRounds = JSON.parse(window.localStorage.getItem('numOfRounds'))
        let numOfWins = JSON.parse(window.localStorage.getItem('numOfWins'))
        let winRate = Math.round((numOfWins / numOfGames) * 100) / 100
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

  playerFinished() {
    return new Promise(resolve => {
      if (this.humanPlayer.bet != this.raiseAmount) {
        $('#RaiseAmount').attr("max", Math.abs(this.raiseAmount - this.humanPlayer.chips));
      } else {
        $('#RaiseAmount').attr("max", this.humanPlayer.chips);
      }
      $('#Call').text("Call " + (this.raiseAmount - this.humanPlayer.bet));
      $("#Check").unbind();
      $("#Call").unbind();
      $("#Raise").unbind();
      $("#Fold").unbind();
      $("#Check").click(() => {
        this.playerCheck();
        resolve();
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

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  evaluatePlayerCards() {
    const board = this.cards.join(" ") + " " + this.humanPlayer.cards[0] + " " + this.humanPlayer.cards[1] // GIVES ERRORS IF THERES ONLY 2 PLAYERS
    const rank = rankBoard(board)
    const name = rankDescription[rank]
    if (this.humanPlayer.status != "folded") {
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
    } else {
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
        ranks.push([player.ID, player.cardRank, player.cardEval]);
      }
    }
    let winner = []
    if (!ranks) {
      return false;
    } else {
      ranks = ranks.sort((a, b) => a[1] - b[1])
      winner = ranks.filter(a => ranks[0][1] === a[1])
      console.log(winner)
    }
    if (winner.length === 1) {
      this.winner = this.getPlayerById(winner[0][0]);
      if (this.winner == this.humanPlayer) {
        let roundsWon = (JSON.parse(window.localStorage.getItem('roundsWon')) + 1)
        window.localStorage.setItem('roundsWon', roundsWon);
      }
      $("#seat" + winner[0][0]).addClass("winner");
      $("#right-sidebar").children("h3").text("Winner");
      $("#card-evaluation").children("p").text("The winner is " + this.winner.name + ", who won with " + winner[0][2] + " and a score of " + winner[0][1]);
      this.winner.addChips(this.pot);
      this.resetPot();
      this.updateDisplay(this.winner);
    } else {
      // If there are multiple winners
      $("#right-sidebar").children("h3").text("Winners")
      $("#card-evaluation").children("p").text("The winners are ");
      let potSize = Math.floor(this.pot / winner.length)
      for (let i = 0; i < winner.length; i++) {
        let winnerInfo = this.playerList[winner[i][0]]
        if (winnerInfo.humanPlayer) {
          let roundsWon = (JSON.parse(window.localStorage.getItem('roundsWon')) + 1)
          window.localStorage.setItem('roundsWon', roundsWon);
        }
        $("#seat" + winnerInfo.ID).addClass("winner");
        winnerInfo.addChips(potSize);
        $("#card-evaluation").children("p").append(winnerInfo.name + " and ");
        this.updateDisplay(winnerInfo);
      }
      $("#card-evaluation").children("p").append("who won with ", winner[0][2], " and a score of ", winner[0][1], ". Each will get a winning of ", potSize, ".");
      this.resetPot();
    }
    this.checkFinalWinner();
  }

  async checkFinalWinner() {
    theGame.playerList = theGame.playerList.filter(player => {
      if (player.isHuman && player.status !== "out" && player.status !== "folded") {
        let roundsPlayed = (JSON.parse(window.localStorage.getItem('numOfRounds')) + 1)
        window.localStorage.setItem('numOfRounds', roundsPlayed);
      }
      if (player.chips <= 0 && player != theGame.winner) {
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
    if (theGame.playerList.length === 1) {
      $("#right-sidebar").children("h3").text("Final Winner")
      $('#card-evaluation').children('p').text('The final winner is ' + theGame.winner.name + '!')
      if (theGame.winner === theGame.humanPlayer) { // Saves the player's profit and total number of wins to localstorage
        let gamesPlayed = (JSON.parse(window.localStorage.getItem('numOfGames')) + 1)
        window.localStorage.setItem('numOfGames', gamesPlayed);
        theGame.humanPlayer.wins ++
        let profit = (JSON.parse(window.localStorage.getItem('profitAmount')) + theGame.humanPlayer.chips)
        window.localStorage.setItem('profitAmount', profit);
        let wins = (JSON.parse(window.localStorage.getItem('numOfWins')) + 1)
        window.localStorage.setItem('numOfWins', wins);
      }
      this.updateDisplay(this.humanPlayer)
      this.stopGame()
      return
    }
    await this.timeout(5000);
    theGame.freshGame();
    return new Promise(resolve => resolve(false));
  }

  freshGame() {
    this.round = 0;
    this.turn = 0;
    this.pot = 0;
    this.cards = [];
    this.createCardList();
    this.playerTurn = [];
    this.raiseAmount = 0;
    this.subRound = 0;
    this.subRoundStatus = "active";
    this.winner = 0;
    this.didSomeoneRaise = false;
    this.running = false;
    this.shouldStopRunning = false;
    this.shouldStartRunning = false;
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
        player.bet = 0; // Resets all player's bets
        this.status = "active";
        this.updateDisplay(player);
        if (player.isHuman) {
          spawnCards(player.cards, "seat" + (player.ID).toString(), "card");
        }
      }
      this.playerDisplay();
    }

    initializeGame();
    console.log(this);
    this.startGame();
  }

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

  stopGame() {
    this.shouldStopRunning = true;
    this.shouldStartRunning = false;
  }

  async gameLoop() {
    this.running = true;
    if (this.shouldStopRunning) {
      this.running = false;
      this.shouldStopRunning = false;
      return;
    }
    console.log('%c RUNNING GAME LOOP', 'font-weight: bold; font-size: 28px;')
    if (await this.simulateRounds()) {
      console.log('%c ENDING GAME LOOP', 'font-weight: bold; font-size: 28px;')
      return true;
    } else {
      return await this.gameLoop(); // Loops the game again
    }
  }
}

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
async function newGame(playerCount, initialChips, playerName, continuedGame) {
  if (!continuedGame) {
    await playerNewOrOld()
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
        spawnCards(player.cards, "seat" + (player.ID).toString(), "card");
      }
    }
    theGame.playerDisplay();
  }

  initializeGame();
  theGame.startGame();
}

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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

$(document).ready(function () {
  // JQuery scripts for buttons on menu
  $("#playnewgame").click(_ => {
    let continuedGame = true;
    console.log('%c NEW GAME', 'font-weight: bold; font-size: 28px;')
    newGame(
      Number($("#playerCount").val()),
      Number($("#initialChips").val()),
      $("#playerName").val(),
      continuedGame)
    console.log(theGame)
  });

  $(".button-copy").click(_ => {
    $(".menu-button").addClass('open');
    $(".button-copy").css('display', 'none');
  });

  $(".submit-button").click(_ => {
    $(".menu-button").removeClass('open');
    $(".button-copy").css('display', 'block');
  });

  $(".cancel").click(_ => {
    $(".menu-button").removeClass('open');
    $(".button-copy").css('display', 'block');
  });

  $("#endgame").click(_ => {
    theGame.updateDisplay("reset");
    theGame = 0;
    this.playerList = [];
    this.round = 0;
    this.turn = 0;
    this.pot = 0;
    this.cards = [];
    this.humanPlayer;
    this.playerTurn = [];
    this.raiseAmount = 0;
    this.subRound = 0;
    this.subRoundStatus = "active";
  });

  $("#clear").click(_ => {
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

  // Script for modal popup and close buttons
  let modal = document.getElementById("modal-popup");
  $("#poker-hands-button").click(function () {
    $('#modal-popup').toggle();
  });
  let span = document.getElementsByClassName("close")[0];
  span.onclick = function () {
    modal.style.display = "none";
  }

  newGame(8, 1000, "ryan");
  console.log(theGame)

});


/* //TODO:
* - Add a scale to show users what their score means.
* - Add chips (visual aid) to center pot w/ animation
* - Sidepot functionality
*/
