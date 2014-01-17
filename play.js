var alsa = require('alsa'), mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost/audiobuffer", {
	safe : false
});

device = 'default', // ALSA default device
channels = 2, // Stereo
rate = 48000, // Sample rate
format = alsa.FORMAT_S16_LE, // PCM format (signed 16 bit LE int)
access = alsa.ACCESS_RW_INTERLEAVED, // Access mode
latency = 500;

db.bind('audiosample');

var playback = new alsa.Playback(device, channels, rate, format, access, latency);
var now=new Date()
var startDate=new Date(now.setDate(now.getDate()-1));
console.log('playing from ', startDate);
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
var CurDate = startDate;
playback.on('drain', function() {
	cursor.nextObject(function(err, doc) {
		if (err) {
			console.log(err);
		} else {
			if (doc) {
				playback.write(doc.b.buffer);
				curDate = doc.t;
				console.log("playing @ ", doc.t);
			} else {
				cursor = db.audiosample.find({
					t : {
						$gte : curDate
					}
				});
				cursor.nextObject(function(err, doc) {
					playback.write(doc.b.buffer);
					console.log("buffer under run @ ", doc.t);
				});
			}
		}
	});
});
