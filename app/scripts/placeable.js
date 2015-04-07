/* Placeable
  A "placeable" object. */

Lemnos.Placeable = function(xy) {
  this._xy = xy;
  this._game = Lemnos.curGame;

  if (this.addToPlaceableList) {
    this.addToPlaceableList();
  }
};


Lemnos.Placeable.prototype._draw = function() {
  Lemnos.display.draw(this._xy.x, this._xy.y, this._glyph, this._glyphColor, Lemnos.settings.mapFloorColor);
};

Lemnos.Placeable.prototype.getXY = function() {
  return this._xy;
};

Lemnos.Placeable.prototype.setPosition = function(xy) {
  var fxy = this.getXY(); //store from location
  this._xy = xy;
};

Lemnos.Placeable.prototype.relocate = function(txy) {
  var fxy = this.getXY(); //store from location
  this._xy = txy;
};

Lemnos.Placeable.prototype.addToPlaceableList = function() {
  this._game.map.placeableList.push(this);
  this.objectId = 'placeable_' + this._game.map.placeableCounter++;
};
