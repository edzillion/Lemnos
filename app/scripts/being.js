Lemnos.Being = function(xy) {
  Lemnos.Placeable.call(this, xy);

  this.fovMapCells = [];
  this.fovPlaceables = [];

/*    this.pathTo = [];
  this.locMemory = [];
  this.disposition = DISP_NEUTRAL;*/

  this._stats = {};
  var def = this.definition; // definition from prototype

  this._glyph = def.glyph;
  this._glyphColor = def.glyphColor;
  this.fovRange = def.fovFactor * Lemnos.settings.fovBase;

  Lemnos.Stats.all.forEach(function(name) {
    this._stats[name] = Lemnos.Stats[name].def;
  }, this);

  this.subscribeToMessages();
}
Lemnos.Being.extend(Lemnos.Placeable);

Lemnos.Being.prototype.subscribeToMessages = function() {
  window.subscribe('dmg_'+this.objectId, this);
}

Lemnos.Being.prototype.getStat = function(name) {
  return this._stats[name];
}

Lemnos.Being.prototype.setStat = function(name, value) {
  this._stats[name] = value;
  return this;
}

Lemnos.Being.prototype.adjustStat = function(name, diff) {
  /* cannot use this.getStat(), might be modified by items */
  this.setStat(name, this._stats[name] + diff);
  return this;
}

/**
 * Called by the Scheduler
 */
Lemnos.Being.prototype.getSpeed = function() {
  return this.getStat("speed");
}

Lemnos.Being.prototype.damage = function(damage) {
  this.adjustStat("hp", -damage);
  if (this.getStat("hp") <= 0) { this.die(); }
}

/**
 * Called by the Engine
 */
Lemnos.Being.prototype.act = function() {
  if (this._hitpoints <= 0) {
    this.resolveDeath();
  }
  this.scanFov();
  this.doTurn();
}

Lemnos.Being.prototype.die = function() {
  //this._level.setLemnos.Being(null, this._xy);
  Game.scheduler.remove(this);
}

Lemnos.Being.prototype.setPosition = function(xy) {
  /* came to a currently active level; add self to the scheduler */
  if (level != this._level && level == Game.level) {
    Game.scheduler.add(this, true);
  }

  return Lemnos.Being.prototype.setPosition.call(this, xy);
}

Lemnos.Being.prototype._idle = function() {
  var xy = this._getAvailableNeighbors().random();
  if (xy) { this._level.setLemnos.Being(this, xy); }
}

Lemnos.Being.prototype._getAvailableNeighbors = function() {
  var result = [];
  ROT.DIRS[8].forEach(function(dir) {
    var xy = new XY(this._xy.x + dir[0], this._xy.y + dir[1]);
    if (this._level.blocks(xy) || this._level.getLemnos.BeingAt(xy)) { return; }
    result.push(xy);
  }, this);
  return result;
}

Lemnos.Being.prototype.scanFov = function() {
  this.fovMapCells = [];

  var lightPasses = function(x, y) {
    var key = x+","+y;
    if (key in Lemnos.curGame.map.cells) { // is part of the map
      return (Lemnos.curGame.map.cells[key].length > 0);
    }
    return false;
  }

  var fov = new ROT.FOV.RecursiveShadowcasting(lightPasses);
  var tbfov = this.fovMapCells;
  fov.compute(this._xy.x, this._xy.y, this.fovRange, function(x, y, r, visibility) {
    if (x < 0 || y < 0 || x > 79 || y > 79) return;
    var key = x+","+y;
    tbfov[key] = Lemnos.curGame.map.cells[key];
  });
};

Lemnos.Being.prototype.updatefovPlaceables = function() {
  this.fovPlaceables = [];
  // loop through map's pobjs, compare to fov map points
  var len = this._game.map.placeableList.length;
  for (var i = 0; i < len; i++) {
    var pl = this._game.map.placeableList[i];
    var key = pl.getXY().toString();
    if(this.fovMapCells[key] && !this.fovPlaceables[key] && this != pl) {
      this.fovPlaceables.push(pl);
    }
  }
}


Lemnos.Being.prototype.doTurn = function() {
  // check view object for "aggressionTarget"
  this.updatefovPlaceables();
  for (var i = 0; i < this.fovPlaceables.length; i++) {
    var fovobj = this.fovPlaceables[i];
    if (fovobj == this.aggressionTarget) {
      var xy = [fovobj.getX(),fovobj.getY()];
      this.locMemory[fovobj.objectId] = [fovobj,xy];
      break;
    }
  }
  // go toward last known position of player (if ever seen)
  var gpid = this.aggressionTarget.objectId;
  if (this.locMemory[gpid]) {
    var xy = this.locMemory[gpid][1];
    this.pathTo = [xy[0],xy[1]];
    this.moveToward();
  }
}
