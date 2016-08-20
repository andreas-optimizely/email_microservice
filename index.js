'use strict';

require('dotenv').config();

const express = require('express'),
      mg = require('mailgun-js'),
      aws = require('aws-sdk'),
      optly = require('optimizely-server-sdk');

const api_key = process.env.MAILGUN_API_KEY,
      domain = process.env.MAILGUN_DOMAIN,
      sender = 'Optimizely <me@' + domain +'>';

const mailer = mg({apiKey: api_key, domain: domain});
const app = express();

app.get('/' , (req,res) => {
  res.send('Hello World');
});

app.post('/send', (req,res) => {
  let email = req.query.email;
  
  let data = {
    from: sender,
    to: email,
    subject: 'Welcome to the Gap',
    text: 'Insert image here'
  };

  mailer.messages().send(data, (err, body) => {
    console.log(body ? body : err);
    return body ? res.sendStatus(200) : res.sendStatus(500);
  });

});

app.listen(process.env.PORT || 3000, () => {
  console.log('Running'); 
});