'use strict';

require('dotenv').config();
var fs = require('fs'),
    http = require('http'),
    https = require('https');

/**
 * Credentials for MailGun service. Must be stored locally.
 * Contact andreas@optimizely.com with questions.
 */
var privateKey  = fs.readFileSync('ssl/server.key', 'utf8'),
    certificate = fs.readFileSync('ssl/server.crt', 'utf8'),
    credentials = {key: privateKey, cert: certificate};

const express = require('express'),
      mg = require('mailgun-js'),
      optly = require('optimizely-server-sdk');

const api_key = process.env.MAILGUN_API_KEY,
      domain = process.env.MAILGUN_DOMAIN,
      mailer = mg({apiKey: api_key, domain: domain}),
      sender = 'Optimizely <me@' + domain +'>';

//let optimizely = optly.createInstance({datafile:datafile});

const images = {
  "shirts": "http://cdn.optimizely.com/img/3546160213/e4aa2777a11542a782be2697e4ca5426.jpg",
  "jeans": "http://cdn.optimizely.com/img/3546160213/e4aa2777a11542a782be2697e4ca5426.jpg"
}

const app = express();

app.get('/' , (req,res) => {
  res.send('Hello World');
});

app.get('/send', (req,res) => {
  let email = req.query.email;

  //let variationKey = optimizely.activate('email_subjects', email);

  let data = {
    from: sender,
    to: email,
    subject: 'Welcome to the Gap',
    html: '<html><a href="https://www.atticandbutton.us/?pid=6878261810#userid=' + email + '"><img src="http://cdn.optimizely.com/img/3546160213/e4aa2777a11542a782be2697e4ca5426.jpg"></a></html>'
  }

  mailer.messages().send(data, (err, body) => {
    console.log(body ? body : err);
    return body ? res.sendStatus(200) : res.sendStatus(500);
  });

});

var server = http.createServer(app);
var secureServer = https.createServer(credentials, app);

server.listen(8080);
secureServer.listen(8443);