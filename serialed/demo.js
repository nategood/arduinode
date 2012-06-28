var firmata = require('firmata'),
    redis = require('redis');

var dev = '/dev/cu.usbserial-A6008jCB';

// Establish Redis Connection (Default Host, Port, etc.)
var client = redis.createClient();

client.on('error', function(err) {
    console.error('Oh nose: ' + err);
});

// Connect to the Arduino Running Firmata 2.2
var board = new firmata.Board(dev, function(){

    var draw = function(n, timeout) {
        var to;

        // Represent our number as "bits" for with LEDs
        n = (n % 8);
        board.digitalWrite(11, n & 1 ? board.HIGH : board.LOW);
        board.digitalWrite(12, n & 2 ? board.HIGH : board.LOW);
        board.digitalWrite(13, n & 4 ? board.HIGH : board.LOW);

        if (timeout && timeout > 0) {
            to = setTimeout(function() {
                draw(0);
            }, timeout);
        }
    };

    // Message Handler
    client.on('message', function(channel, payload) {
        console.log(payload);
        var bitset = parseInt(payload) || 0;
        draw(bitset, 100);
    });

    client.subscribe('light');
});