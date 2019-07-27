import Player from './player'

export default class HumanPlayer extends Player {
    constructor(ID, name, chips, game) {
      super(ID, name, chips, game);
      this.isHuman = true;
    }
  }
