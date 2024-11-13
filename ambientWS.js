var dbURL = 'mongodb://127.0.0.1:27017/test';


let MongoClient = require('mongodb').MongoClient;
const connectionString = 'mongodb://127.0.0.1:27017';



const AmbientWeatherApi = require('ambient-weather-api')
function getName (device) {
 return device.info.name
}
const apiKey = 'aaa8e1e41dd548dba37f85aea67a1567bca1c92e329b4b83a980b8860a7f82d6'
const api = new AmbientWeatherApi({
 apiKey,
 applicationKey: '5c383532f7034cf69d80786d912cb1ecfcd5f6e13b3e4f3f90ae0a824ef40761'
})
api.connect()
api.on('connect', () => console.log('Connected to Ambient Weather Realtime API!'))

api.on('subscribed', data => {
 console.log('Subscribed to ' + data.devices.length + ' device(s): ')
 //console.log(data.devices);
})
api.on('data', data => {
 data.mac = data.macAddress;
 data.time = data.dateutc;
 data.pullTime = new Date(data.dateutc);
 (async function() {
   console.log("Im am here");
   console.log(data);
   let client = await MongoClient.connect(connectionString,
     {  });
   let db = client.db('sensorData');
   try {
     if(data.length && data.length > 0) {
       for(let i = 0; i < data.length; i++) {
         console.log("===== "+ data[i].mac);
         console.log(data[i]);
         let collection = db.collection("ambientWeather");
         await collection.insertOne(data[i]);
       }
     }
     else {
       let collection = db.collection("ambientWeather");
       await collection.insertOne(data);
     }
   }
   finally {
     client.close();
   }
     
 })().catch(err => console.error(err));
});

api.subscribe(apiKey)

// restart the connection every 30 minutes
setInterval(() => {
 api.connect()
}, 30 * 60 * 1000);

api.on('error', process.exit);
