import $ from "jquery";
import "./styles.css";
import Player from './player';
import HumanPlayer from './humanplayer';
const { rankBoard, rankDescription, rankCards, evaluateCards} = require('phe')

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
  }

  // Returns player count
  get PlayerCount() {
    return this.playerCount;
  }

  // Returns player list
  get Players() {
    return this.playerList;
  }

  // Add player to the game
  addPlayer(player) {
    this.playerList.push(player);
  }

  // Returns initial chip count
  get InitialChips() {
    return this.initialChips;
  }

  // Returns round number
  get Round() {
    return this.round;
  }

  // Increments round by one if less than 5th (final) round
  incrementRound() {
    if (this.round < 5) {
      this.round++;
      this.resetTurn();
    } else {
      //Check for win condition.
    }
  }

  // Returns whos turn it is
  get Turn() {
    return this.turn;
  }

  // Advances turn count
  // bot-> advanceTurn(false);
  // player-> advanceTurn(true);
  advanceTurn(playerType) {
    if (this.turn < this.playerCount) { // need to change because players can have more than one turn in each round
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
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < this.playerList.length; j++) {
        this.dealCardToPlayer(this.playerList[j]);
      }
    }
  }

  async dealFlopCards() {
    for (let i = 0; i < 3; i++) {
      this.dealCardToTable(this.cardList, this.cards);
      $("#board").children(".tablecard:nth-of-type("+[i+1]+")").children("img").attr("src", "/cards/" + this.cards[i].toUpperCase() + ".png").attr("alt", theGame.cards[i]).css("visibility", "visible");
      await timeout(500)
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
    var tempList = this.cardList;
    // COPY CARD LIST FOR POSSIBLE CARDS
    // for (var i = 0; i < this.cardList.length; i++) {
    //   tempList[i] = this.cardList[i];
    // }

    for (var j = 0; j < this.cardList.length; j++) {
      var index = Math.floor(Math.random() * tempList.length);
      this.cardList[j] = tempList[index];
      // REMOVE ALREADY USED CARDS
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

  playerCall() {
    if (!this.humanPlayer.Call(theGame.raiseAmount)) {
      return alert("You cannot call this bet, you need more chips.")
    }
    theGame.advanceTurn();
  }

  playerFold() {
    this.humanPlayer.Fold();
    theGame.advanceTurn();
  }

  playerRaise(amount) {
    let newAmount = amount + theGame.raiseAmount;
    // console.log(theGame.raiseAmount)
    theGame.raiseAmount = newAmount
    // console.log(theGame.raiseAmount)
    if (!this.humanPlayer.Raise(newAmount)) {
      return alert("You cannot raise now, you need more chips.")
    } else {
      theGame.advanceTurn();
    }
  }

  playerCheck() {
    this.humanPlayer.Check();
    theGame.advanceTurn();
  }
}

var theGame;
async function newGame(playerCount, initialChips, playerName) {
  let game = new Game(playerCount, initialChips);
  for (var i = 0; i < playerCount; i++) {
    if (i === 2) {
      game.addPlayer(game.humanPlayer = new HumanPlayer(i, playerName, initialChips, game));
    } else {
      game.addPlayer(new Player(i, "Player " + i, initialChips, game));
    }
  }
  theGame = game;


  // while (!checkFinalWinner()) {
    theGame.dealCards();
    for (let player of theGame.playerList) {
      updateDisplay(player);
      if (player.isHuman) {
        spawnCards(player.cards, "seat" + (player.IDNumber).toString(), "card");
      }
    }

    simulateRounds();
    playerDisplay();
    // await timeout(5000);
    console.log("done")
  // }

}

// Use muted Code for training round to show all cards
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
    // $(str).css('background-image', "url(" + node.src + ")");
    $("#" + idString).children(className).children("img").attr("src", node.src).attr("alt", node.alt);
    //code for adding controls to the local player - adapt it for chips for everyone
    // $("#" + idString).children(".playerinfo").append(" <div id='controls-container'> <div id='controls'><div><button id='Check'>Check</button></div><div><button id='Call'>Call</button></div><div>Amount: <input id='RaiseAmount' type='number' name='amount' max='' min='10' step='5' value='10'><br> <!-- Max = value of chips --><button id='Raise' value='Raise'></div><div><button id='Fold'>Fold</button></div>Controls / Bid / Pass / Add Money</div></div> ");
  }
}

async function simulateRounds() {
  for (let i = 0; i < 2; i++) {
    if (theGame.subRound == 0 || (theGame.subRound == 1 && theGame.didSomeoneRaise == true)) {
      for (let player of theGame.playerList) {
        if (!player.isHuman && player.status != "folded") {
          player.isTurn = true; //check if there's any use in this
          $("#seat" + player.ID).toggleClass("active");
          await timeout(getRandomInt(500, 500)) // change this back to 5000 or 8000 (ms)
          simulateBetting(player);
          updateDisplay(player);
          player.isTurn = false;
          $("#seat" + player.ID).toggleClass("active");
        }
        else if (player.isHuman && player.status != "folded") {
          player.isTurn = true;
          $("#seat" + player.ID).toggleClass("active");
          $("#controls").children(".control-button").toggleClass("inactive");
          theGame.humanPlayer = player;
          await playerFinished();
          updateDisplay(player);
          player.isTurn = false;
          $("#seat" + player.ID).toggleClass("active");
          $("#controls").children(".control-button").toggleClass("inactive");
        }
      }
      theGame.subRound ++;
      console.log("     theGame.subround: ============" + theGame.subRound);
    } else {
      theGame.subRound = 0;
      theGame.didSomeoneRaise = false;
      resetRaises();
      theGame.raiseAmount = 0;
      theGame.subRoundStatus = "active"
    }
  }
  theGame.subRoundStatus = "active"
  theGame.incrementRound();
  console.log("     Round =============================" + theGame.round)

  if (theGame.round == 1) {
    theGame.dealFlopCards()
    console.log(theGame)
    await timeout(2000)
    simulateRounds()
    evaluatePlayerCards()
  } else if (theGame.round == 2) {
    theGame.dealTurnCard()
    console.log(theGame)
    await timeout(1000)
    simulateRounds()
    evaluatePlayerCards()
  } else if (theGame.round == 3) {
    theGame.dealRiverCard()
    console.log(theGame)
    await timeout(1000)
    simulateRounds()
    evaluatePlayerCards()
  } else if (theGame.round == 4) {
    evaluateWinner()
  }
}

function simulateBetting(player) {
  if (player.chips > 0 && player.status != "folded") {
    // Let Players Raise/Match/Fold
    simulatePlayer(player);
    switch (player.status) {
      case "matched":
      break;
      case "raised":
        theGame.didSomeoneRaise = true;
      break;
    }
  }
  return theGame.didSomeoneRaise;
}

function simulatePlayer(player) {
  let raisedSomeoneElsesBet = false;
  let someoneRaised = false;

  if (theGame.subRound == 0) {
    for (let otherPlayer of theGame.playerList) {
      if (otherPlayer.status == "raised" && otherPlayer != player) {
          someoneRaised = otherPlayer;
          break;
      }
    } doRandomPlayerAction(player, someoneRaised);
  } else {
    for (let otherPlayer of theGame.playerList) {
      if (otherPlayer.status == "raised" && otherPlayer != player) {
        someoneRaised = otherPlayer;
        break;
      } else if (otherPlayer.status != "raised" && otherPlayer != player) {
        someoneRaised = false;
      }
    } doSubRoundPlayerAction(player, someoneRaised);
  }

  // for (let otherPlayer of theGame.playerList) {
  //     if(otherPlayer != player && otherPlayer.status == 'raised') {

  //         doRandomPlayerAction(player, otherPlayer);
  //         if(player.status === 'raised') {
  //           raisedSomeoneElsesBet = true;
  //         }

  //       //Only Raise once
  //       break;
  //     }
  //   }
  //   if(!raisedSomeoneElsesBet && player.status !== 'folded') {
  //     doRandomPlayerAction(player);
  //   }
  // A person can raise in each Round. This can happen twice in the same round by any person.
  // but then the other people left in the game have to either match the amount of money the person raised,
  // or they have to fold. They can also re-raise which makes peopel have to match it again.

  // This happens each round until all 5 cards are out, after which another two rounds of betting are done and cards must
  //be released afterwards.

  // each person who raised changes status to raised
  // but then after everyone else has matched that bet (raise) their status needs to be set back to active (normal)
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function doRandomPlayerAction(player, otherPlayer) {
  switch (getRandomInt(0, 6)) {
    case 0:
    case 1:
    case 2:
    case 3:
      //check or fold if not able to call
      if (!otherPlayer) {
        return player.Check();
      } else if (!player.Call(theGame.raiseAmount)) {
        return player.Fold();
      }
      break;
    case 4:
    case 5:
      //raise
      let oldRaise = theGame.raiseAmount;
      // console.log("In normal: oldraise: "+ oldRaise)
      let newRaise = getRandomInt(Math.round(player.chips * 0.02), (theGame.initialChips - oldRaise - 1))
      // console.log("newraise: " + newRaise)
      newRaise += oldRaise
      // console.log("thegame.raise: "+ newRaise)
      theGame.raiseAmount = newRaise
      if ( !player.Raise (theGame.raiseAmount)
      ) {
        return doRandomPlayerAction(player, otherPlayer);
      }
    break;
  }
}

function doSubRoundPlayerAction(player, otherPlayer) {
  if (otherPlayer.bet != player.bet) {
    switch (getRandomInt(0, 6)) {
      case 0:
      case 1:
      case 2:
      case 3:
        //check or fold if not able to call
        if (!otherPlayer) {
          return player.Check();
        } else if (!player.Call(theGame.raiseAmount)) {
          return player.Fold();
        }
        break;
      case 4:
      case 5:
        //raise
        let oldRaise = theGame.raiseAmount; // player1 has raised 50 & player2 called. means 50 left.
        let newRaise = getRandomInt(Math.round(player.chips * 0.05), (theGame.initialChips - oldRaise)) // 0
        newRaise += oldRaise
         // console.log("in case raise " + newRaise + " += " + oldRaise)
        theGame.raiseAmount = newRaise
         // console.log("case raiseAmount " + theGame.raiseAmount)
        if ( !player.Raise (theGame.raiseAmount)
        ) {
          return doSubRoundPlayerAction(player, otherPlayer);
        }
      break;
    }
  }
}

function playerDisplay() {
  let idString = "#seat"
  for (let player of theGame.playerList) {
    $(idString + player.ID).css('visibility', 'visible');
    $(idString + player.ID).children(".playerinfo").children(".name").text("Name: " + player.name);
    $(idString + player.ID).children(".playerinfo").children(".chips").children("p").text("Chips: " + player.chips);
  }
}

function updateDisplay(info) {
  if (info instanceof Player) {
    let idString = "#seat"
    let player = info
    $(idString + player.ID).children(".playerinfo").children(".chips").text("Chips: " + player.chips);
    $(idString + player.ID).children(".playerinfo").children(".status").text(player.status)
    $("#total-pot").text("Total pot: " + theGame.Pot);

    if (player.status == "active" && player.isHuman) {
      $(idString  + player.ID).removeClass("folded");
    }

    if (player.status == "folded") {
      $(idString  + player.ID).addClass("folded");
      $(idString  + player.ID).children(".card1").children("img").attr("src", "/cards/gray_back.png");
      $(idString + player.ID).children(".card2").children("img").attr("src", "/cards/gray_back.png");
    } else if (player.status == "active" && !player.isHuman) {
      $(idString  + player.ID).removeClass("folded");
      $(idString  + player.ID).children(".card1").children("img").attr("src", "/cards/purple_back.png");
      $(idString + player.ID).children(".card2").children("img").attr("src", "/cards/purple_back.png");
    }
  }
  if (info == "reset") {
    $("#board").children(".tablecard").children("img").css("visibility", "hidden");
    $("#pot").css("visibility", "hidden");
    $(".player").css("visibility", "hidden");
    $("#seat2").children(".card1").children("img").css("visibility", "hidden");
    $("#seat2").children(".card2").children("img").css("visibility", "hidden");
    $("#card-evaluation").children("p").text("");
  }
}

function resetRaises() {
  for (let player of theGame.playerList) {
    if (
      player.chips > 0 &&
      (player.status == "raised" ||
      player.status == "matched" ||
      player.status == "checked")
    ) {
      player.status = "active";
    }
    // This needs to be considered when users go "all in", but can't be placed in resetRaises()
    // else if (
    //   player.chips > 0 && player.status != "folded"
    // ) {
    //   player.status = "split"
    //   }
  }
}

function playerFinished() {
  return new Promise(resolve => {
    $("#Check").click(function() {
      theGame.playerCheck();
      resolve();
    });
    $("#Call").click(function() {
      theGame.playerCall();
      resolve();
    });
    $("#Raise").click(function() {
      theGame.playerRaise(parseInt($('#RaiseAmount').val()));
      resolve();
    });
    $("#Fold").click(function() {
      theGame.playerFold();
      resolve();
    });
  });
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function evaluatePlayerCards() {
  console.log(theGame.cards.join(" ").toString() +" "+ theGame.humanPlayer.cards[0] +" "+ theGame.humanPlayer.cards[1])
  const board = theGame.cards.join(" ") +" "+ theGame.humanPlayer.cards[0] +" "+ theGame.humanPlayer.cards[1]
  const rank = rankBoard(board)
  const name = rankDescription[rank]
  if (theGame.humanPlayer.status != "folded") {
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

function evaluateWinner() { // don't forget about the royal flush if someone has a straight
  var ranks = []
  for (let player of theGame.playerList) {
    if (player.status != "folded") {
      spawnCards(player.cards, "seat" + (player.IDNumber).toString(), "card");
      let boards = theGame.cards
      let newboards = boards.concat(player.cards)
      let rank = evaluateCards(newboards)
      let rankNumber = rankCards(newboards)
      let name = rankDescription[rankNumber]
      player.cardRank = rank
      player.cardEval = name
      ranks.push([player.ID, player.cardRank, player.cardEval]);
    }
  }
  console.log(ranks)
  var winner = []
  winner.push(ranks.reduce((lowest, current) => current[1] < lowest[1] ? current : lowest));
  console.log(winner)
  if (winner.length == 1) {
    let winnerName = theGame.playerList[winner[0][0]].name
    theGame.winner = theGame.playerList[winner[0][0]]
    $("#seat" + winner[0][0]).toggleClass("winner");
    $("#right-sidebar").children("a").text("Winner");
    $("#card-evaluation").text("The winner is " + theGame.winner.name + ", who won with " + winner[0][2] + " and a score of " + winner[0][1]);
    theGame.winner.addChips(theGame.pot);
    theGame.resetPot();
    console.log(theGame)
    updateDisplay(theGame.winner);
  } else {
    // If there are multiple winners
    $("#right-sidebar").children("a").text("Winner")
    $("#card-evaluation").text("The winners are ");
    for (let i = 0; i < winner.length; i++) {
      let winnerName = theGame.playerList[winner[i][0]].name
      $("#card-evaluation").append(winnerName + ", ");
    }
    $("#card-evaluation").append("who won with " + winner[0][2] + " and a score of " + winner[0][1]);
    //split pot between equally
    theGame.resetPot();
    updateDisplay(theGame.winner);
  }
  checkFinalWinner(theGame.winner);
  // JS user storage to increase win count, win %, games played, overall profit etc
}

function checkFinalWinner() {
  for (let player of theGame.playerList) {
    if (player.chips = 0 && player != theGame.winner) {
      return true
    }
    else {
      return false
    }
  }
}


$(document).ready(function() {
  // JQuery scripts for buttons on menu popup
  $("#playnewgame").click(_ => {
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
    updateDisplay("reset");
    newGame(
      Number($("#playerCount").val()),
      Number($("#initialChips").val()),
      $("#playerName").val())
    $("#seat2").children("[class^=card]").children("img").css("visibility", "visible");
    $("#seat2").children("[class^=card]").children("img").css("visibility", "visible");
    $("#controls").children(".control-button").addClass("inactive");
    $(".menu-button").toggleClass("open");
    $(".button-copy").css("display", "block");
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
    theGame = 0;
    updateDisplay("reset");
  });

  // Script for modal popup and close buttons
  var modal = document.getElementById("modal-popup");
  var btn = document.getElementById("poker-hands-button");
  var modalImg = document.getElementById("poker-hands-image");
  var captionText = document.getElementById("caption");
  $("#poker-hands-button").click(function() {
    $('#modal-popup').toggle();
  });
  var span = document.getElementsByClassName("close")[0];
  span.onclick = function() {
    modal.style.display = "none";
  }

  newGame(8, 100, "ryan");
  console.log(theGame)



});

// let board = theGame.cards.join(" ") +" "+ player.cards[0] +" "+ player.cards[1]
