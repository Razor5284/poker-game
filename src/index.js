import $ from "jquery";
import "./styles.css";
import Player from './player';
import HumanPlayer from './humanplayer'

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
    this.subRound = 1;
    this.subRoundStatus = "active";
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

  // Remove player from the game
  /*removePlayer(playerID) {
        if (playerID > -1) {
            this.playerList.splice(playerID, 1);
        }
    }*/

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
      $("#board").children(".tablecard:nth-of-type("+[i+1]+")").children("img").attr("src", theGame.cards[i].address).attr("alt", theGame.cards[i].card).css("visibility", "visible");
      await timeout(500)
    }
  }

  dealTurnCard() {
    this.dealCardToTable(this.cardList, this.cards);
    $("#board").children(".tablecard:nth-of-type(4)").children("img").attr("src", theGame.cards[3].address).attr("alt", theGame.cards[3].card).css("visibility", "visible");
  }

  dealRiverCard() {
    this.dealCardToTable(this.cardList, this.cards);
    $("#board").children(".tablecard:nth-of-type(5)").children("img").attr("src", theGame.cards[4].address).attr("alt", theGame.cards[4].card).css("visibility", "visible");
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
    var tempList = [];
    // COPY CARD LIST FOR POSSIBLE CARDS
    for (var i = 0; i < this.cardList.length; i++) {
      tempList[i] = this.cardList[i];
    }

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
      "10",
      "J",
      "Q",
      "K"
    ];
    let suitSymbols = ["C", "D", "H", "S"];
    this.cardList = [];
    for (let suit = 0; suit < 4; suit++) {
      for (let value = 0; value < 13; value++) {
        let tempCard = cardSymbols[value] + suitSymbols[suit];
        this.cardList.push({
          card: tempCard,
          address: "/cards/" + tempCard + ".png"
        });
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
      // NEed to fix this because this will return the alert and advance the turn, not giving chance to take another turn
    }
    theGame.advanceTurn();
  }

  playerCheck() {
    this.humanPlayer.Check();
    theGame.advanceTurn();
  }
}

var theGame;
function newGame(playerCount, initialChips, playerName) {
  let game = new Game(playerCount, initialChips);
  for (var i = 0; i < playerCount; i++) {
    if (i === 2) {
      game.addPlayer(game.humanPlayer = new HumanPlayer(i, playerName, initialChips, game));
    } else {
      game.addPlayer(new Player(i, "Player " + i, initialChips, game));
    }
  }
  game.dealCards();
  for (let player of game.playerList) {
    if (player.isHuman) {
      spawnCards(player.cards,
        "seat" + (player.IDNumber).toString(),
        "card"
      );
    }
  }
  theGame = game;

  simulateRounds();
  playerDisplay();

  // Code for a training / open cards on the table game mode
  // for (var i = 0; i < game.playerList.length; i++) {
  //     spawnCards(game.playerList[i].cards, 'seat' + (i + 1).toString(), 'card');
  //     //spawnCards(newGame.cards,'board','table-card:nth-of-type('[i]'n)');
  // }
  // spawnCards(game.playerList[0].cards, 'seat1', 'usercard');

  // Start betting + 1 if raised again

  // Increment Round

  // Deal river

  // second betting Round + 1 if raised again

  // Increment Round

  // deal flop

  // third betting Round +1 if raised again

  // Increment Round

  // deal Turn

  // final betting Round + 1 if raised again

  // Finish - evaluate winner

  // theGame.advanceTurn(); // Can be done when check is called OR matched with other players' raises, OR if folded.
  // theGame.incrementRound(); // Can be done when each player has matched all other players' raises.
  // // Flop has already been set, spawn cards only needed


  // theGame.dealCardToTable(theGame.cardList, theGame.cards);
  // spawnCards(theGame.cards[0],'board','tablecard:nth-of-type(4)');
  // theGame.advanceTurn(); // Can be done when check is called OR matched with other players' raises, OR if folded.
  // theGame.incrementRound(); // Can be done when each player has matched all other players' raises.

  // theGame.dealCardToTable(theGame.cardList, theGame.cards);
  // console.log(theGame.cards[0].length)
  // spawnCards(theGame.cards,'board','tablecard:nth-of-type(1)'); //come back to this - need i to increment along with round
  // theGame.advanceTurn(); // Can be done when check is called OR matched with other players' raises, OR if folded.
  // theGame.incrementRound(); // Can be done when each player has matched all other players' raises.
  // // evaluateWinner()
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function doRandomPlayerAction(player, otherPlayer){
  switch (getRandomInt(0, 6)) {
    case 0:
      //fold
      return player.Fold();
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
      let newRaise = getRandomInt(Math.round(player.chips * 0.25), (player.chips - oldRaise))
      // newRaise += oldRaise
      theGame.raiseAmount = newRaise
      if ( !player.Raise (theGame.raiseAmount)
      ) {
        return doRandomPlayerAction(player, otherPlayer);
      }
    break;
  }
}

function doSubRoundPlayerAction(player, otherPlayer) {
  if (otherPlayer != false && otherPlayer.bet != player.bet) {
    switch (getRandomInt(0, 6)) {
      case 0:
        //fold
        return player.Fold();
      case 1:
      case 2:
      case 3:
        //check or fold if not able to call
        // console.log("!otherplayer" + !otherPlayer)
        if (!otherPlayer) {
          return player.Check();
        } else if (!player.Call((theGame.raiseAmount - player.bet))) {
          return player.Fold();
        }
        break;
      case 4:
      case 5:
        //raise
        let oldRaise = theGame.raiseAmount;
        let newRaise = getRandomInt(Math.round(player.chips * 0.05), (player.chips - oldRaise))
        // newRaise += oldRaise
        // console.log("in case raise " + newRaise + " += " + oldRaise)
        theGame.raiseAmount = newRaise
        // console.log("raiseAmount " + theGame.raiseAmount)
        if ( !player.Raise (theGame.raiseAmount)
        ) {
          return doSubRoundPlayerAction(player, otherPlayer);
        }
      break;
    }
  } else {
    switch (getRandomInt(0, 6)) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
        // Check when no-one else has raised
        return player.Check();
      case 5:
        // Small chance of a re-raise
        let oldRaise = theGame.raiseAmount;
        let newRaise = getRandomInt(Math.round(player.chips * 0.05), (player.chips - oldRaise))
        // newRaise += oldRaise
        // console.log("in case raise " + newRaise + " += " + oldRaise)
        theGame.raiseAmount = newRaise
        // console.log("raiseAmount " + theGame.raiseAmount)
        if ( !player.Raise (theGame.raiseAmount)
        ) {
          return doSubRoundPlayerAction(player, otherPlayer);
        }
      break;
    }
  }
}

// IF SOMEONE RAISES, everyone has to do playeraction again
function simulatePlayer(player) {
  let raisedSomeoneElsesBet = false;
  let someoneRaised = false;

  if (theGame.subRound == 1) {
    for (let otherPlayer of theGame.playerList) {
      if (otherPlayer.status == "raised" && otherPlayer != player) {
        someoneRaised = otherPlayer;
        break;
      }
    }
    doRandomPlayerAction(player, someoneRaised);
  } else {
    for (let otherPlayer of theGame.playerList) {
      if (otherPlayer.status == "raised" && otherPlayer != player) {
        someoneRaised = otherPlayer;
        break;
      } else if (otherPlayer.status != "raised" && otherPlayer != player) {
        someoneRaised = false;
      }
    }
    doSubRoundPlayerAction(player, someoneRaised);
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

function simulateBetting(player) {
  let didSomeoneRaise = false;
  if (player.chips > 0 && player.status != "folded") {
    // Let Players Raise/Match/Fold
    simulatePlayer(player);
    switch (player.status) {
      case "matched":
      break;
      case "raised":
        didSomeoneRaise = true;
      break;
    }
  }
  return didSomeoneRaise;
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

// function whichPlayersTurn() {
//   this.playerTurn = theGame.playerList
//   playerTurn.pop()
// }

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

async function simulateRounds() {
  // async function waits for response from user to continue (doesn't yet)
  for (let i = 0; i < 2; i++) {
    if (theGame.subRound == 1 || (theGame.subRound < 3 && didSomeoneRaise == true)) {
      for (let player of theGame.playerList) {
        if (!player.isHuman && player.status != "folded") {
          player.isTurn = true;
          await timeout(getRandomInt(500, 500)) // change this back to 5000 or 8000 (ms)
          simulateBetting(player);
          updateDisplay(player);
          player.isTurn = false;
        }
        else if (player.isHuman && player.status != "folded") {
          player.isTurn = true;
          theGame.humanPlayer = player;
          await playerFinished();
          updateDisplay(player);
          player.isTurn = false;
        }
      }
    } else {
      didSomeoneRaise = false;
      resetRaises();
      theGame.raiseAmount = 0;
      theGame.subRoundStatus = "active"
      theGame.incrementRound();
    }
  }
  theGame.subRoundStatus = "active"
  theGame.incrementRound();
  console.log("round" + theGame.round)

  if (theGame.round == 1) {
    theGame.dealFlopCards()
    await timeout(2000)
    simulateRounds()
  } else if (theGame.round == 2) {
    theGame.dealTurnCard()
    await timeout(1000)
    simulateRounds()
  } else if (theGame.round == 3) {
    theGame.dealRiverCard()
    await timeout(1000)
    simulateRounds()
  }
}

// Use muted Code for training round to show all cards
function spawnCards(tempList, idString, classString) {
  for (let i = 0; i < tempList.length; i++) {
    let node = document.createElement("img");
    node.src = tempList[i].address;
    node.alt = tempList[i].card;
    let className;

    if (idString.includes("seat2")) {
      className = "." + classString + (i + 1).toString();
    }
    else {
      className = "." + classString;
    }
    // $(str).css('background-image', "url(" + node.src + ")");
    $("#" + idString).children(className).children("img").attr("src", node.src).attr("alt", node.alt).css("visibility", "visible");
    //code for adding controls to the local player - adapt it for chips for everyone
    // $("#" + idString).children(".playerinfo").append(" <div id='controls-container'> <div id='controls'><div><button id='Check'>Check</button></div><div><button id='Call'>Call</button></div><div>Amount: <input id='RaiseAmount' type='number' name='amount' max='' min='10' step='5' value='10'><br> <!-- Max = value of chips --><button id='Raise' value='Raise'></div><div><button id='Fold'>Fold</button></div>Controls / Bid / Pass / Add Money</div></div> ");
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

    if (player.status == "folded") {
      $(idString  + player.ID).addClass("folded");
      $(idString  + player.ID).children(".card1").children("img").attr("src", "/cards/gray_back.png");
      $(idString + player.ID).children(".card2").children("img").attr("src", "/cards/gray_back.png");
    }
  } else if (info == 'table' ) {
    console.log(info)
  }
}

// Runs when the page has finished loading.
$(document).ready(function() {
  $("#playnewgame").click(_ => {
    newGame(
      $("#playerCount").val(),
      $("#initialChips").val(),
      $("#playerName").val(),
    );
  });

  $(".button-copy").click(_ => {
      $(".menu-button").addClass('open');
      $(".button-copy").css('display', 'none');
  });

  $(".submit-button").click(_ => {
      $(".menu-button").removeClass('open');
      $(".button-copy").css('display', 'initial');
  });

  $(".cancel").click(_ => {
    $(".menu-button").removeClass('open');
    $(".button-copy").css('display', 'initial');
});


  newGame(8, 100, "ryan");
  // for (var i = 0; i < theGame.playerList.length; i++) {
  //   spawnCards(
  //     theGame.playerList[i].cards,
  //     "seat" + (i + 1).toString(),
  //     "opponentcard"
  //   );
  //   //spawnCards(theGame.cards,'board','table-card:nth-of-type('[i]'n)');
  // }
  // spawnCards(theGame.playerList[2].cards, "seat3", "usercard");



  console.log(theGame)
});
