var nodeREST = require('node-rest-client');

var client = new nodeREST.Client();
let MongoClient = require('mongodb').MongoClient;
const connectionString = 'mongodb://127.0.0.1:27017';


function doPull() {
    client.get("https://rt.ambientweather.net/v1/devices?applicationKey=5c383532f7034cf69d80786d912cb1ecfcd5f6e13b3e4f3f90ae0a824ef40761&apiKey=aaa8e1e41dd548dba37f85aea67a1567bca1c92e329b4b83a980b8860a7f82d6", function (data, response) {
        (async function() {
           // console.log("Im am here");
           // console.log(data);
            let client = await MongoClient.connect(connectionString,
              {  });
            let db = client.db('sensorData');
            try {
              if(data.length && data.length > 0) {
                for(let i = 0; i < data.length; i++) {
                  //console.log("===== "+ data[i].mac);
                  //console.log(data[i]);
                  let collection = db.collection("ambientWeather");
                  data[i].pullTime = new Date().getTime();
                  await collection.insertOne(data[i]);
                }
              }
              else {
                let collection = db.collection("ambientWeather");
                data.pullTime = new Date().getTime();
                await collection.insertOne(data);
              }
            }
            finally {
              client.close();
            }
              
          })().catch(err => console.error(err));
    });
}

setInterval(doPull, 1000 * 60);
doPull();