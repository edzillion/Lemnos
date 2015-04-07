Lemnos.Game = function() {
  // blank all state vars
  window.clearSubscribers();
  this.fovMapCells = [];
  this.seenMapCells = [];
  this.map = {};
  this.engine = null;
  this.player = null;
  this._scheduler = null;
  this.statusMsg = '';

};


Lemnos.Game.prototype = {
  start: function() {
    this._scheduler = new ROT.Scheduler.Speed();
    this.engine = new ROT.Engine(this._scheduler);

    this.enterRoom();

    this.engine.start();
  },

  _generateMap: function() {
    this.map = new Lemnos.Map();
    //this.map._addEntranceAndExit();
  },

  enterRoom: function() {
    window.clearSubscribers();
    if (this.engine) {
      this.engine.lock();
    }

    this._scheduler.clear();

    // increment depth
    //this.depth += 1;

    // create new map
    this._generateMap();


    // place player
    if (!this.player) {
      this.player = this.spawnAndPlaceBeing(Lemnos.Player, this.map.freeCells);
    } else {
        this.player.subscribeToMessages();
        var index = Math.floor(ROT.RNG.getUniform() * this.map.freeCells.length);
        var xy = new XY(this.map.freeCells.splice(index, 1)[0]);
        this.player.relocate(xy);
        this.player.addToPlaceableList();
    }

    this.player.relocate(this.map.entrance);
    this._scheduler.add(this.player, true);


    // start it back up
    if (this.engine) {
        this.engine.start();
    }
  },

  spawnAndPlaceBeing: function(being, freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var xy = new XY(freeCells.splice(index, 1)[0]);
    return new being(xy);
  },

  drawVisibleMap: function() {
    Lemnos.display.clear();
    for (var key in this.seenMapCells) {
      if (key == 'random' || key == 'randomize') continue;
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        var fgcolor = "#fff";
        var bgcolor = (this.seenMapCells[key] == '' ? Lemnos.settings.mapWallColorHidden : Lemnos.settings.mapFloorColorHidden);
        Lemnos.display.draw(x, y, this.seenMapCells[key], fgcolor, bgcolor);
    }
    for (var key in this.fovMapCells) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        var fgcolor = "#fff";
        var bgcolor = (this.fovMapCells[key] == '' ? Lemnos.settings.mapWallColor : Lemnos.settings.mapFloorColors.random());
        Lemnos.display.draw(x, y, this.fovMapCells[key], fgcolor, bgcolor);

        // objects on it?
        if (this.map.placeableCells[key]) {
            var placeable = this.map.placeableCells[key][0]; // draw the first one on the list
            placeable._draw();
        }
    }
  },

  /* Get what would be the result of a move of 'placeable' into coordinate 'xy'
    Returns object that has property 'isOpen' (Boolean) and an optional 'bumpedEntity' */
    getMoveResult: function(placeable, xy) {
        var newKey = xy.toString();
        var e_array = this.map.placeableCells[newKey];
        var ae = undefined;
        if (e_array && e_array.length > 0) {
            var len = e_array.length;
            for (var i = len - 1; i >= 0; i--) { // go in reverse to get "top" entity
                if (e_array[i].isPassable == false) {
                    ae = e_array[i];
                    break;
                }
            }
        }

        if (ae) {
            return ({
                isOpen: false,
                bumpedEntity: ae
            });
        }

        if (!(newKey in this.map.cells)) {
            return ({
                isOpen: false,
                bumpedEntity: null
            });
        }; // can't move to that coord

        return ({
            isOpen: true
        });
    }


};
