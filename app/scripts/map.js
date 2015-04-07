/* Map  */
Lemnos.Map = function() {
  this.cells = [];
  this.freeCells = [];
  this.placeableCells = [];
  this.placeableList = [];
  this.placeableCounter = 0;
  this.digger;

  this.entrance = '';
  this.exit = '';

  this._generateCells();
  this._generateExits();
}

Lemnos.Map.prototype = {
  _generateCells : function() {
    this.digger = new ROT.Map.Digger();
    this.digger.create(this._digCallback.bind(this));
  },

  _generateExits : function() {
    var exitCorridors = this.digger.getExitCorridors();
    for (var i=0;i<exitCorridors.length;i++) {
      var exit = exitCorridors[i];
      if(!exit._endX) { //if x=0 then entrance
        this.entrance = new XY(exit._endX, exit._endY);
      }
      else if (exit._endX == 79) { //TODO: harcoded / need to store map w and h
        this.exit = new XY(exit._endX, exit._endY);
      }
    }
  },

  _digCallback : function (x, y, value) {
    if (value) { return; }
    var key = x+","+y;
    this.freeCells.push(key);
    this.cells[key] = ".";
  },

  updateObjectMap: function() {
    this.placeableCells = {};
    for (var i = 0; i < this.placeableList.length; i++) {
      var placeable = this.placeableList[i];
      var pkey = placeable._xy.toString();
      this.placeableCells[pkey] = this.placeableCells[pkey] || [];
      this.placeableCells[pkey].push(placeable);
    }
  },

  getObjectById: function(id) {
    for (var i=0; i<this.placeableList.length; i++) {
      if (this.placeableList[i].objectId == id) {
        return this.placeableList[i];
      }
    }
    return undefined;
  },

  /**
  * getObjectsAtLoc
  * ... specifically excluding (optionally) certain obj
  */
  getObjectsAtLoc: function(x,y,exclude_po) {
    var pobjs = [];
    var xy = x+","+y;
    if (this.pobjCells && this.pobjCells[xy]) {
      var len = this.pobjCells[xy].length;
      if (exclude_po) {
        for (var i = 0; i < len; i++) {
          if (this.pobjCells[xy][i] != exclude_po) {
                      pobjs.push(this.pobjCells[xy][i]); // TODO put Beings on top, or sort by 'zlayer' of some kind
                    }
                  }
                } else {
                  pobjs = this.pobjCells[xy];
                }
              }
              return pobjs;
            },

            getPath: function(fx,fy,tx,ty,topo,ignoreIsPassable) {
      topo = (topo) ? topo : 8; // default to 8

      var passableCallback = function(x,y) {
        var xy_key = x+","+y;
        var map = Lemnos.curGame.map;
          var canPass = (xy_key in map.cells); // is an actual map location

          if (canPass == true && map.pobjCells && map.pobjCells[xy_key]) { // can pass over all objects in that space
            for(var i in map.pobjCells[xy_key]) {
              var testpobj = map.pobjCells[xy_key][i];
              if (ignoreIsPassable != true) {
                if (testpobj.isPassable == false && (xy_key != fx +","+fy)) {
                  canPass = false;
                  break;
                }
              }
            }
          }
          return canPass;
        }

        var astar = new ROT.Path.AStar(tx,ty,passableCallback,{topology:topo});
        path = [];
        var pathCallback = function(x,y) {
          path.push([x,y]);
        }
        astar.compute(fx,fy,pathCallback);
      path.shift(); // remove starting point
      return path;
    },

  /**
  * showLineofSite
  * fxy - From X,Y [x,y]
  * txy - To X,Y [x,y]
  */
  showLineOfSight: function(fxy,txy,range) {
    var range = range || 12;
    var isInFov = false;

      // check if in FOV
      this.fovMapCells = [];
      var lightPasses = function(x, y) {
        var key = x+","+y;
          if (key in Lemnos.curGame.map.cells) { // is part of the map
            return (Lemnos.curGame.map.cells[key].length > 0);
          }
          return false;
        }
        var fov = new ROT.FOV.RecursiveShadowcasting(lightPasses);
        var fov_cells = {};
        fov.compute(fxy[0], fxy[1], range, function(x, y, r, visibility) {
          var key = x+","+y;
          fov_cells[key] = Lemnos.curGame.map.cells[key];
          if (key == txy) {
            isInFov = true;
          }
        });

      // create path
      if (isInFov == true) {
        var path = this.getPath(fxy[0],fxy[1],txy[0],txy[1],8,true);
        var len = path.length;
        for (var i = 0; i < len; i++) {
          var pxy = path[i][0] + "," + path[i][1];
          var glyph = ".";
          if (this.pobjCells && this.pobjCells[pxy]) {
            glyph = (this.pobjCells[pxy][0]._glyph || "*");
          }
          Lemnos.display.draw(path[i][0], path[i][1], glyph, '#ff0', '#000');
        }
      }
    }
}
