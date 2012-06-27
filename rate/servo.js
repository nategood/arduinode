var firmata = require('firmata'),
    redis = require('redis'),
    _ = require('underscore')._;

// Establish Redis Connection (Default Host, Port, etc.)
var client = redis.createClient();
client.on('error', function(err) {
    console.error('Oh nose: ' + err);
});

console.log('Initializing...');

// var dev = '/dev/cu.usbserial-A6008jCB',
var dev     = '/dev/tty.usbmodem641',
    pin     = 3,
    ttl     = 300, // five minutes
    votes   = [{expires:99999999999, degrees: 90}];

// Connect to the Arduino Running Firmata 2.2
var board = new firmata.Board(dev, function(){

    // Rotate the servo accordingly
    var updateServo = function() {
        mean = _.reduce(votes, function(memo, vote) {
            return memo + vote.degrees;
        }, 0) / votes.length;

        console.log('Mean: ' + mean);
        board.servoWrite(pin, mean);
    };

    // Message Handler
    client.on('message', function(channel, payload) {
        payload = parseInt(payload);
        if (payload === NaN)
            return;

        console.log('Received payload: ' + payload);

        votes.push({
            expires: ((new Date()).getTime() / 1000) + ttl,
            degrees: payload
        });

        updateServo();
    });

    // Initialization
    board.pinMode(pin, board.MODES.SERVO);
    client.subscribe('vote');

    // Garbage collection
    setInterval(function() {
        var now = (new Date()).getTime() / 1000;
        var before = votes.length;
        votes = _.filter(votes, function(vote) {
            return  vote.expires > now;
        });
        console.log("Garbage collection removed " + (before - votes.length));
        updateServo();
    }, ttl * 250);

    console.log('Ready');
});