/* Blackfeather, a roguelike created initially for the 7DRL 2015
  Originally created by Ed Stastny (github.com/starstew)
  Requires: rot.js, jquery
*/
var Lemnos = Lemnos || {
    settings: {
        mapElement: "#map_display",
        mapFloorColor: "#aa7",
        mapFloorColors: ["#aa7", "#a1a171", "#999969"],
        mapWallColor: "#553",
        mapFloorColorHidden: "#222",
        mapWallColorHidden: "#111",
        fovBase: 8
    },

    //constants
    DIR_N: ROT.DIRS[4][0],
    DIR_E: ROT.DIRS[4][1],
    DIR_S: ROT.DIRS[4][2],
    DIR_W: ROT.DIRS[4][3],

    // vars
    game: null, // "Game" currently in progress
    display: {}, // ROT.Display for game

    // functions
    init: function() {
        // set up the display
        this.display = new ROT.Display();
        this.display.setOptions({
            fontSize: 16,
            forceSquareRatio: true
        });
        $(this.settings.mapElement).empty();
        $(this.settings.mapElement).append(this.display.getContainer());

        this.startNewGame();
    },

    handleMessage: function(message, publisher, data) {
        switch (message) {
            case "log_message":
                this.curGame.addLogMessage(data);
                break;
            default:
                break;
        }
    },

    startNewGame: function() {
        this.curGame = new Lemnos.Game;
        this.curGame.start();
        //Lemnos.gui.showAlert("So begins your quest for the Black Feather...");
    }

};

/***
 * Add ons
 */

// pub-sub
;
(function() {
    var _subscribers = {};

    window.publish = function(message, publisher, data) {
            var subscribers = _subscribers[message] || [];
            subscribers.forEach(function(subscriber) {
                subscriber.handleMessage(message, publisher, data);
            });
        },

        window.subscribe = function(message, subscriber) {
            if (!(message in _subscribers)) {
                _subscribers[message] = [];
            }
            _subscribers[message].push(subscriber);
        },

        window.unsubscribe = function(message, subscriber) {
            var index = _subscribers[message].indexOf(subscriber);
            _subscribers[message].splice(index, 1);
        },

        window.removeSubscriber = function(subscriber) {
            var tempsubs = jQuery.extend(true, {}, _subscribers);
            for (var msg in tempsubs) {
                var len = tempsubs[msg].length;
                for (var s = 0; s < len; s++) {
                    var sub = tempsubs[msg][s];
                    if (sub == subscriber) {
                        window.unsubscribe(msg, sub);
                    }
                }
            }
        },
        window.clearSubscribers = function() {
            _subscribers = {};
        },
        window.showSubscribers = function() {
            console.log(_subscribers);
        }
})();
