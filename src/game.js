

var playerCount, cardImage = [], chips, cardList = [], shuffledList = [], cardListAddress = [];
var cardSymbols = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
var suitSymbols = ["C", "D", "H", "S"];

/*
 *
 *
 *
 */
class Game {
  constructor(playerCount, initialChips, arrayOfCards = []) {
    this.playerCount = playerCount;
    this.playerList = [];
    this.initialChips = initialChips;
    this.round = 0;
    this.turn = 0;
    this.pot = 0;
    this.cardList = arrayOfCards;
    this.cards = [];
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
    } else {
      //Check for win condition.
    }
  }

  // Returns whos turn it is
  get Turn() {
    return this.turn;
  }

  // Advances turn count
  advanceTurn() {
    if (this.turn < this.playerCount) {
      this.turn++;
    } else {
      this.turn = 0;
    }
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
}


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



function createCardList() {
  var a = 0;
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 13; j++) {
      var tempCard = cardSymbols[j] + suitSymbols[i];
      cardList[a] = {
        card: tempCard,
        address: "/public/images/cards/" + tempCard + ".png"
      }
      a += 1;
    }
  }
}


// Shuffles an array, which is then assigned to shuffledList
function shuffle(array) {
  var tempList = [];
  for (var i = 0; i < cardList.length; i++) {
    tempList[i] = cardList[i];
  }
  for (var j = 0; j < array.length; j++) {
    var index = Math.floor(Math.random() * tempList.length);
    shuffledList[j] = tempList[index];
    if (index > -1) {
      tempList.splice(index, 1);
    }
  }
}

function removeAllCards(gameObject) {
  // gameObject.resetCards();
  for (var i = 0; i < gameObject.playerList.length; i++) {
    gameObject.playerList[i].cards = [];
  }
}

// Removes a single card from an array and pushes to another
function dealCard(senderArray,recieverArray) {
  recieverArray.push(senderArray[0]);
  senderArray.shift()
}

// Function to deal cards from cardList to players/table
function dealCards(gameObject, cardList) {
  removeAllCards(gameObject);
  shuffle(cardList);
  for (var i = 0; i < 2; i++){
    for (var j = 0; j < gameObject.playerList.length; j++){
      dealCard(gameObject.cardList, gameObject.playerList[j].cards)
    }
  }
  // Only for testing purposes rn
  for (var i = 0; i < 3; i++) {
    dealCard(gameObject.cardList, gameObject.cards)
  }
}

const rootElement = document.getElementById('root');


/*
 *  Everything below here is made for testing purposes
 *
 *
 */
var theGame = new Game(8,100,shuffledList)

var player1 = new Player(0, 'Ryan Lea-Noon', 100)
var player2 = new Player(1, 'Neeft2', 100)
var player3 = new Player(2, 'Vlad', 100)
var player4 = new Player(3, 'Coj', 100)
var player5 = new Player(4, 'Sam', 100)
var player6 = new Player(5, 'Bloodrhen', 100)
var player7 = new Player(6, 'Tom', 100)
var player8 = new Player(7, 'Waddy', 100)
createCardList()
// shuffle(cardList)
theGame.addPlayer(player1)
theGame.addPlayer(player2)
theGame.addPlayer(player3)
theGame.addPlayer(player4)
theGame.addPlayer(player5)
theGame.addPlayer(player6)
theGame.addPlayer(player7)
theGame.addPlayer(player8)
dealCards(theGame, cardList)

// TEST code
function spawnCards(tempList, idString, classString) {
   for (let i = 0; i < tempList.length; i++){
     let node = document.createElement('img');
     node.src = tempList[i].address;
     node.alt = tempList[i].card;
     let str = '#' + idString + " ." + classString + (i+1).toString();
     $(str).css('background-image',"url(" + node.src + ")");
     // $('#seat1 .opponentcard1')[0].appendChild(node); // Only needs to be run once for the local player
   }
}
