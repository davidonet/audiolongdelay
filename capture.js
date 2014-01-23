var alsa = require('alsa'), mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost/audiobuffer", {
	safe : false
});

var winston = require('winston');
var Graylog2 = require('winston-graylog2').Graylog2;

winston.add(Graylog2, {
	graylogHost : "log.bype.org"
});

device = 'default', // ALSA default device
channels = 2, // Stereo
rate = 48000, // Sample rate
format = alsa.FORMAT_S16_LE, // PCM format (signed 16 bit LE int)
access = alsa.ACCESS_RW_INTERLEAVED, // Access mode
latency = 500;

db.bind('audiosample');
db.audiosample.ensureIndex({
	t : 1
});
var capture = new alsa.Capture(device, channels, rate, format, access, latency);
var sum = 0;
var now = new Date();
capture.on('data', function(buffer) {
	var aDate = new Date();
	db.audiosample.insert({
		t : aDate,
		b : buffer
	}, function(err, data) {
		if (err)
			console.log(err);
		sum += buffer.length;
		var current = new Date();
		if (5000 < (current - now)) {

			winston.log("info", "recording", {
				date : aDate,
				size : sum
			});
			sum = 0;
			now = current;
		}

	});
});
var df = require('df');
setInterval(function() {
	df(function(err, table) {
		winston.log("info", "disk usage", table[0]);
	});
}, 10000);

