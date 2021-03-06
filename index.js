'use strict';

// Imports dependencies and set up http server
const 
  express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  fs = require('file-system'),
  FB = require('fb'),
  app = express().use(bodyParser.json()), // creates express http server
  FB_PAGE_ID = 'BCITSA', //BCITSA
  FB_EVENT_LIST = 'eventlist.json',
  PAGE_ACCESS_TOKEN = "EAAV68YNS1E0BAAZC9ZCi3zXGdFNFhi22wbUz8SaTRznaEWE8n70I8IaGZADdXmhRy0rutJTdAmyyyY91DnjSpZAJrLZCE7v7d7QcJkBGUItZBrZBZALwRw4rMKswrgFNFZC6tpmb1vXC7axZBNj4Of4ZChoaEQ6v3LZBkBj7LZCZCnXzB80nOhyTJRWn7N";

  let eventList;

// Sets server port and logs message on success//
app.listen(process.env.PORT || 12345, () => console.log('webhook is listening'));
/*
// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      let sender_psid = webhook_event.sender.id;
      console.log('Sender  PSID: ' + sender_psid);
      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
         handleMessage(sender_psid, webhook_event.message);        
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "9mSvHeBKKcZjttAFKfsG"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});
*/ 

app.get('/getEvents', function (req, output) {
  console.log("Reading FB");
  FB.setAccessToken(PAGE_ACCESS_TOKEN);
  FB.api(FB_PAGE_ID + '/events?limit=100&time_filter=upcoming', 'get', function (res) {
    if(!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
    }
    
    let response = JSON.stringify(res.data);

    response = JSON.parse(response);
    //let eventJSON = response;
    let outputJSON = [];

    for(var i=0; i < response.length; i++){
      var outputEvent = {};
      outputEvent.description = "" + response[i].description;
      outputEvent.end_time = "" + response[i].end_time;
      outputEvent.name = "" + response[i].name;
      outputEvent.pname = "" + response[i].place.name;
      outputEvent.city = "" + response[i].place.location.city;
      outputEvent.country = "" + response[i].place.location.country;
      outputEvent.latitude = "" + response[i].place.location.latitude;
      outputEvent.longitude = "" + response[i].place.location.longitude;
      outputEvent.state = "" + response[i].place.location.state;
      outputEvent.street = "" + response[i].place.location.street;
      outputEvent.zip = "" + response[i].place.location.zip;
      outputEvent.start_time = "" + response[i].start_time;
      outputEvent.id = "" + response[i].id;
      outputJSON.push(outputEvent);
    }

    //updateFile(JSON.stringify(outputJSON));
    console.log(JSON.stringify(outputJSON));
    output.send(JSON.stringify(outputJSON));
  });
});

initialize(); 


function initialize() {
  //getEvents();
}

//This function runs when the request for events has been received.
function updateFile(events) {

    fs.writeFile('./data/' + FB_EVENT_LIST, events, function(err) {
      if(err) {
        return console.log(err);
      }
    });
    fs.readFile('./data/' + FB_EVENT_LIST, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
    });
}


function getEvent(sender_psid, key, val) {

  FB.setAccessToken(PAGE_ACCESS_TOKEN);
  FB.api(FB_PAGE_ID + '/events', 'get', function (res) {
    if(!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      let response = {
       "text": "Error getting Events"
      }

      return;
    }
    eventList = res.data;

    let event = getObjects(eventList, key, val);

    let response = {
      "text": JSON.stringify(event)
    }

  });
}
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}



