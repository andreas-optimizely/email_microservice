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
  data.dimensions = [];
  return optimizely = optly.createInstance({
            datafile: data,
            errorHandler: defaultErrorHandler,
            logger: defaultLogger.createLogger(),
          });
}, (error)=>{
  console.error("Error: ", error);
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
app.get('/send-email', (req,res) => {
  let email = decodeURIComponent(req.query.email),
      sender = 'Optimizely <me@' + domain +'>',
      variation = optimizely.activate('EMAIL_EXPERIMENT', email),
      imageRedirect = 'https://blooming-meadow-23617.herokuapp.com/img-redirect?email=' + email,
      data = {
              from: sender,
              to: email,
              subject: 'Thanks for stopping by Attic and Button',
              html: '<html><div align="center" style="max-width:580px; margin:0 auto;"><a href="https://blooming-meadow-23617.herokuapp.com/redirect?email=' + encodeURIComponent(req.query.email) + '"><img style="width:100%; margin:0 auto;" src="' + imageRedirect +'"></a></div></html>'
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

    //Sending email for Variation
    mailer.messages().send(data, (err, body) => {
      console.log(body ? body : err);
      return body ? res.sendStatus(200) : res.sendStatus(500);
    });
  }
});

app.get('/send-disney', (req,res)=>{
  let email = decodeURIComponent(req.query.email),
      encodedEmail = encodeURIComponent(req.query.email),
      sender = 'Disney Store <me@' + domain +'>',
      imageRedirect = 'https://blooming-meadow-23617.herokuapp.com/img-redirect?email=' + encodedEmail,
      data = {
        from: sender,
        to: email,
        subject: 'A magical experience awaits you',
        html: '<html><tbody><tr> <td colspan="2" valign="top" style="padding:7px 40px 7px 40px" align="left" class="gmail_msg"> <img border="0" style="border:0;margin:0px;padding:0px;display:block;width:160px;height:33px" src="https://ci5.googleusercontent.com/proxy/dZG9mI9E7z_B44F2Vhc8mnsvxU96HVHY6_U9cnyHY0OD8InbQsxi83FSHmQ74WGnHHFbS6XA4V8pTspPSEd9P1JYxjh3tm7vcotrzpQ31cXXc81MhU7q3DoseD4n5f2byYystGkGcbs6vTpvGkA5OTh-0QN-MH5_26QaWtpXJFf19wy1dR-k4VGsWHZTp246mH_au3nodyGZXSw59hME-UNGZ54q5PPd=s0-d-e1-ft#https://secure.cdn1.wdpromedia.com/media/pep/live/media/site/img/style/85186ce6dfeaf6c95a0ae08cb18f91d6-PEPCOM_Orange_Cart_Print_Out_WDW_Logo.png" alt="DisneyWorld" width="160" height="33" class="gmail_msg"> </td> </tr><div align="center" style="max-width:580px; margin:0 auto;"><a href="https://www.disneystore.com/#userid=' + encodedEmail + '"><img style="width:100%; margin:0 auto;" src="' + imageRedirect +'"></a></div></tbody></html>'
      };
  console.log('Sending email for ', email);
  console.log(imageRedirect);
  console.log(req.query.email);

  mailer.messages().send(data, (err, body) => {
    console.log(body ? body : err);
    return body ? res.sendStatus(200) : res.sendStatus(500);
  });
});
/*
  Route to look up user profile and redirect to image
*/
app.get('/img-redirect', (req,res) => {
  let email = encodeURIComponent(req.query.email),
      baseUrl = "https://s3-us-west-2.amazonaws.com/disney-email/";

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
      location : baseUrl + "default"
    };

  console.log('LOOKING UP', email, ' IN DynamoDB');

  docClient.get(params, function(err, data) {
      if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        return res.redirect(301, response.location);
      } else {
        console.log('Favorite category', data.Item.value);
        response.location = baseUrl + data.Item.value;
        return res.redirect(301, response.location);
      }
    });
});

/**
  Endpoint to record event!
*/
app.get('/redirect', (req, res) => {
  let email = decodeURIComponent(req.query.email);
  optimizely.track('EMAIL_OPENED', email);
  res.redirect('http://www.atticandbutton.com/#userid=' + encodeURIComponent(email));
});

/**
  TODO: Image redirect would be DOPE
  Endpoint should respond with redirect to image url &&
  set header to image type
*/

app.listen(process.env.PORT || 3000, function(){
  console.log("Up and running - check localhost:3000 for local dev");
});