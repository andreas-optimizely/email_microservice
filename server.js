'use strict';

require('dotenv').config();

const express = require('express'),
      mg = require('mailgun-js'),
      optly = require('optimizely-server-sdk'),
      request = require('request'),
      AWS = require('aws-sdk'),
      defaultErrorHandler = require('optimizely-server-sdk/lib/plugins/error_handler'),
      defaultLogger = require('optimizely-server-sdk/lib/plugins/logger'),
      path = require('path');

/**
  Initialize Keys and useful strings;
*/
const api_key = process.env.MAILGUN_API_KEY,
      domain = process.env.MAILGUN_DOMAIN,
      PROJECT_ID = process.env.OPTLY_PROJECT_ID,
      AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY,
      DATAFILE_URL = `https://cdn.optimizely.com/json/${PROJECT_ID}.json`,
      emails = path.join(__dirname, "emails");


/**
  Helper function to asynchronously pull down datafile from CDN
*/
function getDatafile(URL){
  return new Promise((resolve, reject) => {
    request({url:DATAFILE_URL, json:true}, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body);
      }
      else {
        reject('Rejected');
      }
    });
  })
}

/**
  Initialize Optimizely on Server start
*/
let optimizely;
getDatafile().then((data) => {
  console.log('Defining Optimmizely ', data);
  data.dimensions = [];
  return optimizely = optly.createInstance({
            datafile: data,
            errorHandler: defaultErrorHandler,
            logger: defaultLogger.createLogger(),
          });
});

/**
  Setup Mailer and Express App
*/
const mailer = mg({apiKey: api_key, domain: domain}),
      app = express();


AWS.config.update({accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY});
AWS.config.region = 'us-west-2';

function getCategory(userid){
  let docClient = new AWS.DynamoDB.DocumentClient(),
      tableName = 'optimizely-profiles',
      property = 'favorite_category',
      params = {
        TableName: tableName,
        Key:{
          "userid": userid,
          "property": property
        }
      };

  return new Promise((reject, resolve) => {
    docClient.get(params, function(err, data) {
      if (err) {
        return reject(console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2)));
      } else {
        console.log('Favorite category', data.Item.value);
        console.log('Length ', data.Item.value.length);
        resolve(data.Item.value);
      }
    });
  });
}

/***********
  ROUTES
***********/

app.get('/' , (req,res) => {
  res.send('Hello World');
});

/**
  Endpoint to send email for Optimizely booth demo
*/
app.get('/send-booth-email', (req,res) => {
  let email = decodeURIComponent(req.query.email),
      sender = 'Optimizely <me@' + domain +'>',
      variation = optimizely.activate('EMAIL_EXPERIMENT', email),
      image = 'https://s3-us-west-2.amazonaws.com/ab-email-images/ab-original.png',
      data = {
              from: sender,
              to: email,
              subject: 'Thanks for stopping by Optimizely\'s Attic and Button!',
              html: '<html><div align="center" style="max-width:580px; margin:0 auto;"><a href="https://blooming-meadow-23617.herokuapp.com/opticon-redirect?email=' + encodeURIComponent(req.query.email) + '"><img style="width:100%; margin:0 auto;" src="' + image +'"></a></div></html>'
            }
  
  console.log('Variation ', variation);
  
  //Check if user is part of a variation
  if (variation === 'DEFAULT') {
    //Sending email for original version
    mailer.messages().send(data, (err, body) => {
      console.log(body ? body : err);
      return body ? res.sendStatus(200) : res.sendStatus(500);
    });
  } else if (variation === 'VARIATION_ONE') {
    data.subject = "How do you like this Optimizely Full Stack experiment?";
    data.html = '<html><div align="center" style="max-width:580px; margin:0 auto;"><a href="https://blooming-meadow-23617.herokuapp.com/opticon-redirect?email=' + encodeURIComponent(req.query.email) + '"><img style="width:100%; margin:0 auto;" src="http://cdn.optimizely.com/img/3546160213/99859ec12a8d4507a597539968e6c56d.png"></a></div></html>';

    //Sending email for Variation
    mailer.messages().send(data, (err, body) => {
      console.log(body ? body : err);
      return body ? res.sendStatus(200) : res.sendStatus(500);
    });
  }
});

app.get('/westfield-email', (req, res) => {
  let email = decodeURIComponent(req.query.email),
      userid = encodeURIComponent(req.query.email),
      sender = 'Westfield <me@' + domain +'>',
      image = 'https://blooming-meadow-23617.herokuapp.com/img-redirect?email=' + userid,
      data = {
              from: sender,
              to: email,
              subject: 'Welcome to your Westfield account',
              html: '<html><div align="center" style="max-width:580px; margin:0 auto;"><a href="https://www.westfield.com/sanfrancisco/#userid=' + encodeURIComponent(req.query.email) + '"><img style="width:100%; margin:0 auto;" src="' + image +'"></a></div></html>'
            };
  mailer.messages().send(data, (err, body) => {
    console.log(body ? body : err);
    return body ? res.sendStatus(200) : res.sendStatus(500);
  });

});

app.get('/img-redirect', (req,res) => {
  let email = encodeURIComponent(req.query.email);

  let docClient = new AWS.DynamoDB.DocumentClient(),
      tableName = 'optimizely-profiles',
      property = 'favorite_category',
      params = {
        TableName: tableName,
        Key:{
          "userid": email,
          "property": property
        }
      };

  let response = {
      contenttype : "image/jpeg",
      cachecontrol : "no-cache, max-age=0",
      location : "https://s3-us-west-2.amazonaws.com/demo-email-images/lululemon.jpg"
    };

  docClient.get(params, function(err, data) {
      if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        return res.redirect(301, response.location);
      } else {
        console.log('Favorite category', data.Item.value);
        response.location = "https://s3-us-west-2.amazonaws.com/demo-email-images/" + data.Item.value + ".png";
        return res.redirect(301, response);
      }
    });
});

/**
  Endpoint to record event!
*/
app.get('/opticon-redirect', (req, res) => {
  let email = decodeURIComponent(req.query.email);
  optimizely.track('EMAIL_OPENED', email);
  res.redirect('http://www.atticandbutton.us/#userid=' + encodeURIComponent(email));
});

/**
  TODO: Image redirect would be DOPE
  Endpoint should respond with redirect to image url &&
  set header to image type
*/

app.listen(process.env.PORT || 3000, function(){
  console.log("Up and running - check localhost:3000 for local dev");
});