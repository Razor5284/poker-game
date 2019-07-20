
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
        this.cards = [];
        this.createCardList();
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

    dealCards() {
        this.removeAllPlayerCards();
        this.shuffleCardList();
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < this.playerList.length; j++) {
                this.dealCardToPlayer(this.playerList[j])
            }
        }
        // Only for testing purposes rn
        for (var i = 0; i < 3; i++) {
            this.dealCardToTable(this.cardList, this.cards)
        }
    }

    removeAllPlayerCards() {
        for (let player of this.playerList) {
            player.cards = [];
        }
    }

    // Removes a single card from an array and pushes to another
    shiftArray(senderArray,recieverArray) {
      recieverArray.push(senderArray[0])
      senderArray.shift()
    }

    dealCardToTable() {
        this.cards.push(this.cardList[0]);
        this.cardList.shift()
    }

    // Function to deal cards from cardList to players
    dealCardToPlayer(player) {
        player.cards.push(this.cardList[0])
        this.cardList.shift()
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

        let cardSymbols = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        let suitSymbols = ["C", "D", "H", "S"];
        this.cardList = [];
        for (let suit = 0; suit < 4; suit++) {
            for (let value = 0; value < 13; value++) {
                let tempCard = cardSymbols[value] + suitSymbols[suit];
                this.cardList.push({
                    card: tempCard,
                    address: "/public/images/cards/" + tempCard + ".png"
                });
            }
        }
    }
}


/*
 *
 *
 *
 */
class Player {
    constructor(ID, name, chips, game) {
        this.ID = ID;
        this.name = name;
        this.chips = chips;
        this.cards = [];
        this.game = theGame;
        this.status = 'active';
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


    // removeCards() {
          // Removes all cards from players hand
    //   this.cards = [];
    // }

    Bet(amount) {

    }

    Raise(amount) {
        //pass
    }

    Call() {
        //pass
    }

    Fold() {
        // Changes the player's status to folded.
        this.status = 'folded';
    }
}














const rootElement = document.getElementById('root');

/*
 *  Everything below here is made for testing purposes
 *
 *
 */
// var theGame = new Game(8, 100, shuffledList)
//
// var player1 = new Player(0, 'Ryan Lea-Noon', 100)
// var player2 = new Player(1, 'Neeft2', 100)
// var player3 = new Player(2, 'Vlad', 100)
// var player4 = new Player(3, 'Coj', 100)
// var player5 = new Player(4, 'Sam', 100)
// var player6 = new Player(5, 'Bloodrhen', 100)
// var player7 = new Player(6, 'Tom', 100)
// var player8 = new Player(7, 'Waddy', 100)
// createCardList()
// // shuffle(cardList)
// theGame.addPlayer(player1)
// theGame.addPlayer(player2)
// theGame.addPlayer(player3)
// theGame.addPlayer(player4)
// theGame.addPlayer(player5)
// theGame.addPlayer(player6)
// theGame.addPlayer(player7)
// theGame.addPlayer(player8)
// dealCards(theGame, cardList)

var theGame;
function newGame(playerCount, initialChips, playerName, playerChips) {

    let game = new Game(playerCount, initialChips);
    game.addPlayer(new Player(0, playerName, playerChips, game));
    for (var i = 1; i < playerCount; i++) {
        game.addPlayer(new Player(i, 'Player ' + i, playerChips, game));
    }
    game.dealCards();


    for (var i = 0; i < game.playerList.length; i++) {
        spawnCards(game.playerList[i].cards, 'seat' + (i + 1).toString(), 'opponentcard');
        //spawnCards(newGame.cards,'board','table-card:nth-of-type('[i]'n)');
    }
    spawnCards(game.playerList[0].cards, 'seat1', 'usercard');
    theGame = game;

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
}

function simulateRound(amount) {
  for (let i = 0; i < theGame.playerList.length; i++) {
    if (theGame.playerList[i].chips != 0 || theGame.playerList[i].status != 'folded') {




    }
  }

  // call(); bet(amount); raise(amount); or fold();
    theGame.addToPot(amount)
    theGame.playerList[0].removeChips(amount)
  theGame.advanceTurn()
  theGame.incrementRound()
  // Flop has already been set, spawn cards only needed
  // spawnCards(theGame.cards[i], 'flop' + (i + 1).toString(),, 'tablecard') // Remember to increment i for flop cards


  // call(); bet(amount); raise(amount); or fold();
  theGame.dealCardToTable(theGame.cardList, theGame.cards)
  spawnCards(theGame.cards[0], 'turn', 'tablecard')
    theGame.addToPot(amount)
    theGame.playerList[0].removeChips()
  theGame.advanceTurn()
  theGame.incrementRound()


  // call(); bet(amount); raise(amount); or fold();
  theGame.dealCardToTable(theGame.cardList, theGame.cards)
  spawnCards(theGame.cards[0], 'river', 'tablecard')
    theGame.addToPot(amount)
    theGame.playerList[0].removeChips()
  theGame.advanceTurn()
  theGame.incrementRound()
  // evaluateWinner()
}

// TEST code
function spawnCards(tempList, idString, classString) {
    for (let i = 0; i < tempList.length; i++) {
        let node = document.createElement('img');
        node.src = tempList[i].address;
        node.alt = tempList[i].card;
        let str = '#' + idString + " ." + classString + (i + 1).toString();
        $(str).css('background-image', "url(" + node.src + ")");
        // $('#seat1 .opponentcard1')[0].appendChild(node); // Only needs to be run once for the local player
    }
}
