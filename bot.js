const tmi = require("tmi.js");
const https = require("https");
const moment = require("moment");

let votesArr = [];
let assetsArr = [];

// setTimeout to start POST cycle on :00
setTimeout(() => {
  // setInterval to POST votes to /votes endpoint
  setInterval(() => {
    // stringify votesArr
    if(votesArr.length > 0){
      
      const data = JSON.stringify(votesArr);
      
      const options = {
        hostname: 'twitch-plugin-singularity.herokuapp.com',
        port: 443,
        path: '/votes',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      }

      // HTTPS POST request
      const req = https.request(options, res => {
        console.log(`Sing POST statusCode: ${res.statusCode}`)

        res.on('data', d => {
          process.stdout.write(d)
        })
        
        votesArr.length = 0;
      })

      req.on('error', error => {
        console.error(error)
      })

      req.write(data)
      req.end()
    }
  }, 3000) // repeat every 3000 ms
}, (Math.ceil(moment().valueOf()/1000)*1000)-moment().valueOf()) // delay until :00

// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: [process.env.CHANNEL_NAME]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  if (self) {
    return;
  } // Ignore messages from the bot

  // remove whitespace, remove !, remove $, make uppercase
  const ticker = msg
    .trim()
    .replace("!", "")
    .replace("$", "")
    .toUpperCase();

  // if valid ticker, push vote data into votesArr
  if (validTickerCheck(ticker)) {
    votesArr.push({
      "user_id": context["user-id"],
      "username": context.username,
      "ticker": ticker,
      "timestamp": parseInt(context["tmi-sent-ts"])
    });
  }
}

// check validity of ticker
function validTickerCheck(ticker) {
  if (assetsArr.some(e => e.symbol.toUpperCase() == ticker)) {
    return true;
  } else {
    return false;
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);

  const options = {
  hostname: 'paper-api.alpaca.markets',
  port: 443,
  path: '/v2/assets',
  method: 'GET',
  headers: {
     'APCA-API-KEY-ID': 'PKGLQ4SYQXLP6BM3Y2PS',
     'APCA-API-SECRET-KEY': '2c8du8tHVybW2m7qCYc8ffF5ZCZz7cnKgtyI35v0'
    }
  };
  
  // GET list of assets from Alpaca for checking ticker validity
  https.get(options, (res) => {
    let data = '';

    console.log('Alpaca GET statusCode:', res.statusCode);

    res.on('data', (d) => {
      data += d;
    });

    res.on('end', function () {
      assetsArr = JSON.parse(data);

    });

  }).on('error', (e) => {
    console.error(e);
  });
}
