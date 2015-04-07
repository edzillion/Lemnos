Lemnos.Stats = {};

Lemnos.Stats.all = ["hp", "maxhp", "speed", "sight", "attack", "defense"];
Lemnos.Stats.avail = ["maxhp", "speed", "sight", "attack", "defense"];

Lemnos.Stats.maxhp = {
  def: 2, /* shall be no more than ~55 in order to fit a 100-width */
  short: "HP",
  label: "Vitality",
  random: [1, [2, 3], [3, 4], [4, 5]]
}

Lemnos.Stats.hp = {
  def: Lemnos.Stats.maxhp.def,
  label: "HP"
}

Lemnos.Stats.speed = {
  def: 10,
  label: "Speed",
  short: "SPD",
  random: [1, [2, 3], [3, 4], [4, 5]]
}

Lemnos.Stats.sight = {
  def: 7,
  label: "Sight",
  short: "SEE",
  random: [1, 2, 3, 4]
}

Lemnos.Stats.attack = {
  def: 10,
  label: "Attack",
  short: "ATK",
  random: [1, [2, 3], [3, 4], [4, 5]]
}

Lemnos.Stats.defense = {
  def: 10,
  label: "Defense",
  short: "DEF",
  random: Lemnos.Stats.attack.random
}
