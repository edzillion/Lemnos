var XY = function(xArrayOrString, y) {

  if (typeof xArrayOrString === "object" && xArrayOrString.length !== undefined) {
    this.x = xArrayOrString[0];
    this.y = xArrayOrString[1];
  }
  else if (typeof xArrayOrString === "number") {
    this.x = xArrayOrString || 0;
    this.y = y || 0;
  }
  else if (typeof xArrayOrString === "string") {
    var parts = xArrayOrString.split(",");
    this.x = parseInt(parts[0]);
    this.y = parseInt(parts[1]);
  }
}

XY.fromString = function(str) {
  var parts = str.split(",");
  return new this(Number(parts[0]), Number(parts[1]));
}

XY.prototype.toString = function() {
  return this.x+","+this.y;
}

XY.prototype.is = function(xy) {
  return (this.x==xy.x && this.y==xy.y);
}

XY.prototype.dist8 = function(xy) {
  var dx = xy.x-this.x;
  var dy = xy.y-this.y;
  return Math.max(Math.abs(dx), Math.abs(dy));
}

XY.prototype.dist4 = function(xy) {
  var dx = xy.x-this.x;
  var dy = xy.y-this.y;
  return Math.abs(dx) + Math.abs(dy);
}

XY.prototype.dist = function(xy) {
  var dx = xy.x-this.x;
  var dy = xy.y-this.y;
  return Math.sqrt(dx*dx+dy*dy);
}

XY.prototype.plus = function(xy) {
  return new XY(this.x+xy.x, this.y+xy.y);
}

XY.prototype.minus = function(xy) {
  return new XY(this.x-xy.x, this.y-xy.y);
}
