// Recreates the wiring example from the presentation
// using firmata + node.js

var Board = require('firmata').Board,
    tty = "/dev/tty.usbserial-A6008jCB";

console.log("Initializing...");
var board = new Board(tty, function() {
    console.log("Ready");

    var analogPin   = 3,
        ledPin      = 13,
        on          = false;

    board.pinMode(analogPin, board.MODES.ANALOG);

    var readAndSleep = function() {
        board.analogRead(analogPin, function(sleep) {
            var mode = on ? board.HIGH : board.LOW;

            // Switch the state of the LED
            board.digitalWrite(ledPin, mode);
            on = !on;

            // Pause according to our analog read value
            setTimeout(readAndSleep, sleep);
        });
    };

    readAndSleep();
});