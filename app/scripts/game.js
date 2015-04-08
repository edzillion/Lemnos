Lemnos.Game = function() {
  // blank all state vars
  window.clearSubscribers();
  this.worldMapCells = [];
  this.worldXY = new XY(0,0);
  this.curMap = null;
  this.engine = null;
  this.player = null;
  this._scheduler = null;
  this.statusMsg = '';

};


Lemnos.Game.prototype = {
  start: function() {
    this._scheduler = new ROT.Scheduler.Speed();
    this.engine = new ROT.Engine(this._scheduler);

    //test world map
/*    this.worldMapCells['0,1'] = 1;
    this.worldMapCells['0,2'] = 1;
    this.worldMapCells['0,3'] = 1;*/

    this.enterMap();

    this.engine.start();
  },

  _generateMap: function(newWorldXY) {
    var lastMapWorldXY = this.worldXY.toString();

    if (this.curMap) {
      this.worldMapCells[lastMapWorldXY] = this.curMap;
    }
    this.curMap = new Lemnos.Map();
    this.curMap.seenMapCells = [];
    this.curMap.fovMapCells = [];
  },

  enterMap: function(worldXY, dirXY) {

    var targetWorldXY = worldXY || this.worldXY;

    window.clearSubscribers();
    if (this.engine) {
      this.engine.lock();
    }

    this._scheduler.clear();

    // increment depth
    //this.depth += 1;

    if (!this.worldMapCells[targetWorldXY.toString()]) {
      // create new map
      this._generateMap(targetWorldXY);
    }
    else {
      //reload old map
      this.curMap = this.worldMapCells[targetWorldXY.toString()];
    }

    // place player
    if (!this.player) {
      this.player = this.spawnAndPlaceBeing(Lemnos.Player, this.curMap.freeCells);
    } else {
        this.player.subscribeToMessages();
        var index = Math.floor(ROT.RNG.getUniform() * this.curMap.freeCells.length);
        var xy = new XY(this.curMap.freeCells.splice(index, 1)[0]);
        this.player.relocate(xy);
        this.player.addToPlaceableList();
    }

    var wxy = new XY(Lemnos.DIR_W);
    if(dirXY && dirXY.is(wxy)) {
      this.player.relocate(this.curMap.exit);
    }
    else {
      this.player.relocate(this.curMap.entrance);
    }


    this._scheduler.add(this.player, true);


    this.worldXY = targetWorldXY;

    // start it back up
    if (this.engine) {
        this.engine.start();
    }
  },

/*  transitionMap: function() {
    window.clearSubscribers();
    if (this.engine) {
      this.engine.lock();
    }*/



  spawnAndPlaceBeing: function(being, freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var xy = new XY(freeCells.splice(index, 1)[0]);
    return new being(xy);
  },

  drawVisibleMap: function() {
    Lemnos.display.clear();
    for (var key in this.curMap.seenMapCells) {
      if (key == 'random' || key == 'randomize') continue;
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        var fgcolor = "#fff";
        var bgcolor = (this.curMap.seenMapCells[key] == '' ? Lemnos.settings.mapWallColorHidden : Lemnos.settings.mapFloorColorHidden);
        Lemnos.display.draw(x, y, this.curMap.seenMapCells[key], fgcolor, bgcolor);
    }
    for (var key in this.curMap.fovMapCells) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        var fgcolor = "#fff";
        var bgcolor = (this.curMap.fovMapCells[key] == '' ? Lemnos.settings.mapWallColor : Lemnos.settings.mapFloorColors.random());
        Lemnos.display.draw(x, y, this.curMap.fovMapCells[key], fgcolor, bgcolor);

        // objects on it?
        if (this.curMap.placeableCells[key]) {
            var placeable = this.curMap.placeableCells[key][0]; // draw the first one on the list
            placeable._draw();
        }
    }
  },

  /* Get what would be the result of a move of 'placeable' into coordinate 'xy'
    Returns object that has property 'isOpen' (Boolean) and an optional 'bumpedEntity' */
    getMoveResult: function(placeable, xy) {
        var newKey = xy.toString();
        var e_array = this.curMap.placeableCells[newKey];
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

        if (!(newKey in this.curMap.cells)) {
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
