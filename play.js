var alsa = require('alsa'), mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost/audiobuffer", {
	safe : false
});

device = 'default', // ALSA default device
channels = 2, // Stereo
rate = 48000, // Sample rate
format = alsa.FORMAT_S16_LE, // PCM format (signed 16 bit LE int)
access = alsa.ACCESS_RW_INTERLEAVED, // Access mode
latency = 1000;

db.bind('audiosample');

var playback = new alsa.Playback(device, channels, rate, format, access, latency);
var startDate = new Date();
startDate.setSeconds(startDate.getSeconds() - 10);
console.log('playing from ',startDate);
var cursor = db.audiosample.find({
	t : {
		$gt : startDate
	}
});
cursor.nextObject(function(err, doc) {
	if (err) {
		console.log(err);
	} else {
		if (doc) {
			playback.write(doc.b.buffer);
			console.log("playing @ ", doc.t);
		} else {
			console.log("no data");
		}
	}
});
playback.on('drain', function() {
	cursor.nextObject(function(err, doc) {
		if (err) {
			console.log(err);
		} else {
			if (doc) {
				playback.write(doc.b.buffer);
				console.log("playing @ ", doc.t);
			} else {
				console.log("no data");

			}
		}
	});
});
