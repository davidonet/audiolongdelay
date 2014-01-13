var alsa = require('alsa'), mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost/dangraham", {
	safe : false
});

device = 'default', // ALSA default device
channels = 2, // Stereo
rate = 48000, // Sample rate
format = alsa.FORMAT_S16_LE, // PCM format (signed 16 bit LE int)
access = alsa.ACCESS_RW_INTERLEAVED, // Access mode
latency = 1000;

db.bind('audiosample');

var capture = new alsa.Capture(device, channels, rate, format, access, latency);
capture.on('data', function(buffer) {
	var aDate = new Date();
	db.audiosample.insert({
		t : aDate,
		b : buffer
	}, function(err, data) {
		if (err)
			console.log(err);
	});
});

