var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost/audiobuffer", {
	safe : false
});
var winston = require('winston');
var Graylog2 = require('winston-graylog2').Graylog2;

winston.add(Graylog2, {
	graylogHost : "cloud.david-o.net"
});
var now = new Date();
var lastDate = new Date(now.setDate(now.getDate() - 8));
winston.log("info", "purging", {
	date : now,
	from : lastDate
});
db.bind('audiosample');
db.audiosample.remove({
	t : {
		$lt : lastDate
	}
}, function(err, data) {
	winston.log("info", "purge done", {
		date : now,
		from : lastDate,
		err : err
	});
	
});

