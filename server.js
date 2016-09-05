'use strict';

require('dotenv').config();
var fs = require('fs');
var http = require('http');
var https = require('https');
//var privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
//var certificate = fs.readFileSync('ssl/server.crt', 'utf8');
//var credentials = {key: privateKey, cert: certificate};

const express = require('express'),
      mg = require('mailgun-js'),
      AWS = require('aws-sdk'),
      optly = require('optimizely-server-sdk');

const api_key = process.env.MAILGUN_API_KEY,
      domain = process.env.MAILGUN_DOMAIN,
      AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY,
      sender = 'Optimizely <me@' + domain +'>';

//console.log(datafile);

//let optimizely = optly.createInstance({datafile:datafile});

//AWS.config(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY);
//let dynamodb = new AWS.DynamoDB();

const mailer = mg({apiKey: api_key, domain: domain});
const app = express();

const images = {
  "shirts": "http://cdn.optimizely.com/img/3546160213/e4aa2777a11542a782be2697e4ca5426.jpg",
  "jeans": "http://cdn.optimizely.com/img/3546160213/e4aa2777a11542a782be2697e4ca5426.jpg"

}

app.get('/' , (req,res) => {
  res.send('Hello World');
});

app.get('/send', (req,res) => {
  let email = req.query.email;

  let data = {
    from: sender,
    to: email,
    subject: 'Welcome to Weight Watchers!',
    html: '<html><a href="https://login.weightwatchers.com/classic/UI/Login?realm=US&service=ldapService&goto=https://cmx.weightwatchers.com&set-uuid=' + email + '"><img src="https://s3-us-west-2.amazonaws.com/keynote-images/ww_email_welcome.jpg"></a></html>'
  }

  mailer.messages().send(data, (err, body) => {
    console.log(body ? body : err);
    return body ? res.sendStatus(200) : res.sendStatus(500);
  });

});

app.get('/send-best-buy', (req,res) => {
  let email = req.query.email;

  let data = {
    from: sender,
    to: email,
    subject: 'Welcome to Best Buy!',
    html: '<html><a href="http://www.bestbuy.com/#userid=' + email + '"><img src="https://s3-us-west-2.amazonaws.com/keynote-images/ww_email_welcome.jpg"></a></html>'
  }

  mailer.messages().send(data, (err, body) => {
    console.log(body ? body : err);
    return body ? res.sendStatus(200) : res.sendStatus(500);
  });

});
//var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

//httpServer.listen(8080);
//httpsServer.listen(8443);

app.listen(process.env.PORT || 3000, function(){
  console.log("Running! GO CHECK LOCALHOST:3000");
});