// Firmata example that will detect when something
// is "swiped" above it (relying on a dip in the analog signal
// from a photoresistor).  Fire "callback" method when a swipe occurs.
// We sleep after noticing a dip in the analog signal so that we
// only fire once per "swipe".  This was going to be used to advance slides
// in the presentation but I ran out of time.

var Board = require('firmata').Board,
    tty = "/dev/tty.usbserial-A6008jCB";

console.log("Initializing...");

var callback = function() {
    console.log("SWIPE");
};

var board = new Board(tty, function() {
    console.log("Ready");

    var analogPin   = 5,
        directionPin= 10, // use toggle switch to change direction, digital
        ledPin      = 13,
        threshold   = 50,
        delay       = 2000;

    board.pinMode(analogPin, board.MODES.ANALOG);

    // We use locked so that we can pause after the first dip
    // in the photoresistor
    var last, locked = false;
    board.on('analog-read-' + analogPin, function(val) {
        if (locked)
            return;

        if (last === undefined)
            last = val;

        if (last - val <= threshold)
            return;

        callback();

        last = val;
        locked = true;
        setTimeout(function() {
            locked = false;
        }, delay);
    });
});