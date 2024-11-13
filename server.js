var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var hostname = process.env.HOSTNAME || 'localhost';
var port = 8080;
var VALUEt = 0;
var VALUEh = 0;
var VALUEtime = 0;

let MongoClient = require('mongodb').MongoClient;
var connectionString = 'mongodb://localhost:27017';

if(process.argv.length > 2 && process.argv[2] == "dev"){
  connectionString = 'mongodb://35.171.163.195:27017';
}


app.get("/", function (req, res) {
    res.redirect("/index.html");
});

app.get("/getAverage", function (req, res) {
  var from = parseInt(req.query.from);
  var to = parseInt(req.query.to);
  db.collection("ambientWeather").find({time:{$gt:from, $lt:to}}).toArray(function(err, result){
  	console.log(err);
  	console.log(result);
  	var tempSum = 0;
  	var humSum = 0;
  	for(var i=0; i< result.length; i++){
  		tempSum += result[i].t || 0;
  		humSum += result[i].t || 0;
  	}
  	var tAvg = tempSum/result.length;
  	var hAvg = humSum/result.length;
  	res.send(tAvg + " "+  hAvg);
  });
});

app.get("/getLatest", function (req, res) {
  var mac = req.query.id || "ambientWeather";
  (async function() {
    let client = await MongoClient.connect(connectionString,
      { useNewUrlParser: true });
    let db = client.db('sensorData');
    try {
      let result = await db.collection("ambientWeather").find({macAddress:mac}).limit(10).toArray();
      res.send(JSON.stringify(result));
    }
    finally {
      client.close();
    }
  })().catch(err => console.error(err));
});

app.get("/getLatestOne", function (req, res) {
  var mac = req.query.id || "ambientWeather";
  (async function() {
    let client = await MongoClient.connect(connectionString,
      { useNewUrlParser: true });
    let db = client.db('sensorData');
    try {
      let result = await db.collection("ambientWeather").find({macAddress:mac}).limit(1).toArray();
      res.send(JSON.stringify(result));
    }
    finally {
      client.close();
    }
  })().catch(err => console.error(err));
});


app.get("/getData", function (req, res) {
  var from = parseInt(req.query.from);
  var to = parseInt(req.query.to);
 // get values from database, where time is between from and to abd return it as JSON
});


app.get("/getValue", function (req, res) {
  //res.writeHead(200, {'Content-Type': 'text/plain'});
  res.send(VALUEt.toString() + " " + VALUEh + " " + VALUEtime + "\r");
});

app.get("/setValue", function (req, res) {
  VALUEt = parseFloat(req.query.t);
  VALUEh = parseFloat(req.query.h);
  VALUEtime = new Date().getTime();
	var dataObj = {
		t: VALUEt,
		h: VALUEh,
		time: VALUEtime
	}
  res.send(VALUEtime.toString());
  (async function() {
    let client = await MongoClient.connect(connectionString,
      { useNewUrlParser: true });
    let db = client.db('sensorData');
    try {
      result = await db.collection("data").insertOne(dataObj);
      if(result.insertedId) {
        result = result.insertedId.toString();
        console.log(result);
      }
    }
    finally {
      client.close();
    }
  })().catch(err => console.error(err));
});


app.use(methodOverride());
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler());

console.log("Simple static server listening at http://" + hostname + ":" + port);
app.listen(port);
