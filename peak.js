var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost/audiobuffer", {
	safe : false
});

var winston = require('winston');
var Graylog2 = require('winston-graylog2').Graylog2;

winston.add(Graylog2, {
	graylogHost : "log.bype.org"
});

db.bind('audiosample');

setInterval(function() {
	db.audiosample.find({}).sort({
		t : -1
	}).limit(1).toArray(function(err, doc) {
		var chunk = doc[0].b;
		var peak = 0;
		for (var i = 0; i < chunk.length(); i += 16) {
			l16 = chunk.buffer.readInt16LE(i);
			r16 = chunk.buffer.readInt16LE(i + 2);
			var level = (l16 + r16) / 65536;
			peak = (peak < level ? level : peak);
		}
		winston.log("info", "peak", {
			date : doc[0].t,
			peak : peak
		});
	});
}, 1000);
