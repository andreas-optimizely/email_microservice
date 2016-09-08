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
      AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

//console.log(datafile);

//let optimizely = optly.createInstance({datafile:datafile});

//AWS.config(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY);
//let dynamodb = new AWS.DynamoDB();

const mailer = mg({apiKey: api_key, domain: domain});
const app = express();

app.get('/' , (req,res) => {
  res.send('Hello World');
});

app.get('/send-ww-welcome', (req,res) => {
  let email = req.query.email;
  let sender = 'Weight Watchers <me@' + domain +'>';
  let data = {
    from: sender,
    to: email,
    subject: 'The first thing you need to know about starting Weight Watchers!',
    html: '<html><div align="center"><a href="https://login.weightwatchers.com/classic/UI/Login?realm=US&service=ldapService&goto=https://cmx.weightwatchers.com&set-uuid=' + email + '"><img src="https://s3-us-west-2.amazonaws.com/keynote-images/ww_email_welcome.jpg"></a></div><table cellpadding="0" cellspacing="0" border="0" width="100%"> <tbody><tr> <td bgcolor="#ffffff"> <div align="center"> <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px"> <tbody><tr> <td align="center" valign="top" width="100%" style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#ffffff;text-align:center"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor=""><tbody><tr><td><table width="100%" bgcolor="" border="0" cellpadding="0" cellspacing="0"><tbody><tr><td style="font-family:Arial;font-size:13px"><table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#7dd093"> <tbody><tr><td height="25" style="line-height:25px;font-size:25px">&nbsp;</td></tr> <tr> <td align="center" valign="top" style="font-family:Helvetica,Arial,sans-serif;font-size:26px;color:#ffffff;text-align:center;font-weight:bold"> EAT SOMETHING GREAT </td> </tr> <tr> <td align="center" valign="top" width="100%" style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#ffffff;text-align:center"> <table cellpadding="0" cellspacing="0" border="0" width="100%"> <tbody><tr> <td width="5%"></td> <td width="90%" align="center" valign="top" style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#ffffff;text-align:center"> Whether you spend a ton of t<font color="#ffffff">ime in the kitchen or not, here are some quick "throw-this-and-that-together" </font><u><a href="http://click.email-weightwatchers.com/?qs=b7c53aa34cd38b86f8213349a2cf27f273b7e89fd46ce9df6d958ae47d50fbeb14bd57d606d5d8a1" title="starter meals" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=http://click.email-weightwatchers.com/?qs%3Db7c53aa34cd38b86f8213349a2cf27f273b7e89fd46ce9df6d958ae47d50fbeb14bd57d606d5d8a1&amp;source=gmail&amp;ust=1473432922283000&amp;usg=AFQjCNGJcvhzrT2h1WlKepl4XoEWoZQ7AQ"><font color="#ffffff">starter meals</font></a></u><font color="#ffffff"> for you</font> to try. </td> <td width="5%"></td> </tr> </tbody></table> </td> </tr> <tr> <td align="center" valign="top" width="100%" style="font-family:Helvetica,Arial,sans-serif;text-align:center;color:#ffffff;width:100%!important;min-width:100%!important"> <img src="https://ci6.googleusercontent.com/proxy/V_ZkV7wp-nC0Nx7fJruQmuWmi7MK_uM6gPp_Drk8VU-WVOdBbo3JoyJn4Ulb1KNCj53T0T7M1unmtY-_-kpYwgh0eyuk0DjgtZd_ilogF8Q=s0-d-e1-ft#http://aka.weightwatchers.com/ezine/images/WelcomeB4_M.jpg" border="0" width="100%" style="display:block;color:#ffffff;line-height:150px;font-size:60px;font-weight:bold;text-align:center;background-color:#5e524c" class="CToWUd"> </td> </tr> <tr><td height="5" bgcolor="#ffffff" style="line-height:5px;font-size:5px">&nbsp;</td></tr> </tbody></table></td></tr></tbody></table></td></tr></tbody></table> </td> </tr> </tbody></table> </div> </td> </tr> </tbody></table><table cellpadding="0" cellspacing="0" border="0" width="100%"> <tbody><tr> <td bgcolor="#ffffff"> <div align="center"> <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px"> <tbody><tr> <td align="center" valign="top" width="100%" style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#ffffff;text-align:center"> <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor=""><tbody><tr><td><table width="100%" bgcolor="" border="0" cellpadding="0" cellspacing="0"><tbody><tr><td style="font-family:Arial;font-size:13px"><table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#a8c178"> <tbody> <tr> <td height="25" style="line-height:25px;font-size:25px">&nbsp;</td> </tr> <tr> <td align="center" valign="top" style="font-family:Helvetica,Arial,sans-serif;font-size:26px;color:#ffffff;text-align:center;font-weight:bold;padding:0px 15px"> SYNC IT UP, BABY! </td> </tr> <tr> <td height="25" style="line-height:25px;font-size:25px">&nbsp;</td> </tr> <tr> <td align="center" valign="top" width="100%" style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#ffffff;text-align:center"> <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%"> <tbody> <tr> <td align="center" height="100%" valign="top" width="100%"> <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"> <tbody> <tr> <td align="center" dir="rtl" valign="top" style="font-size:0px"> <div dir="ltr" style="display:inline-block;max-width:300px;vertical-align:top;width:100%"> <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%"> <tbody> <tr> <td align="center" valign="top"> <img src="https://ci5.googleusercontent.com/proxy/BiUoB56oUNwE_SkpzTtgIBqoD8jfQpWcca-7qG2ruICFxj2dvEn6LKZuii_76Iz7vJF0JrgVeXl7j58KNa-1R0bKjRArDWRBTfCL=s0-d-e1-ft#http://aka.weightwatchers.com/ezine/images/BTS_13.jpg" style="display:block" class="CToWUd"> </td> </tr> </tbody> </table> </div> <div dir="ltr" style="display:inline-block;max-width:300px;vertical-align:top;width:100%"> <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%"> <tbody> <tr> <td align="center" valign="top" style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#ffffff;text-align:left;padding-left:30px"><font color="#ffffff">If you\'ve got an activity device like Jawbone® or Fitbit®, you\'re already ahead of the game. You can </font><u><a href="http://click.email-weightwatchers.com/?qs=f31ec992246ef8c2b06f29b9bf4008aa022b451a51b4e78181e9ee465af5528fcd2fca686aa7eced" title="sync these devices right to your account" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=http://click.email-weightwatchers.com/?qs%3Df31ec992246ef8c2b06f29b9bf4008aa022b451a51b4e78181e9ee465af5528fcd2fca686aa7eced&amp;source=gmail&amp;ust=1473401661911000&amp;usg=AFQjCNH-dvm2F7fkyAxd2nADK6Rmq0FlvA"><font color="#ffffff">sync these devices right to your account</font></a></u><font color="#ffffff"> to track your activity and watch your FitPoints add up as you earn them in real time! Go to&nbsp;<b>Settings </b>to select your device.</font><br> <br> <font color="#ffffff">Don\'t have a device? You can track directly into your <span class="il">Weight</span> <span class="il">Watchers</span> app or on the web.&nbsp;</font></td> </tr> </tbody> </table> </div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="30" style="line-height:30px;font-size:30px">&nbsp;</td> </tr> <tr> <td height="5" bgcolor="#ffffff" style="line-height:5px;font-size:5px">&nbsp;</td> </tr> </tbody> </table></td></tr></tbody></table></td></tr></tbody></table> </td> </tr> </tbody></table> </div> </td> </tr> </tbody></table></html>'
  }

  mailer.messages().send(data, (err, body) => {
    console.log(body ? body : err);
    return body ? res.sendStatus(200) : res.sendStatus(500);
  });

});

app.get('/send-best-buy', (req,res) => {
  let email = req.query.email;

  let sender = 'Best Buy <me@' + domain +'>';
  let data = {
    from: sender,
    to: email,
    subject: 'Welcome to Best Buy!',
    html: '<html><div align="center" style="max-width:580px; margin:0 auto;"><a href="http://www.bestbuy.com/#userid=' + email + '"><img style="width:100%; margin:0 auto;" src="https://d2jj17vqv9.execute-api.us-west-2.amazonaws.com/prod/customerProfileEmailImageRedirector?userid='+ email +'"></a></div></html>'
  }

  mailer.messages().send(data, (err, body) => {
    console.log(body ? body : err);
    return body ? res.sendStatus(200) : res.sendStatus(500);
  });

});

app.get('/send-booth-email', (req,res) => {
  let email = req.query.email;

  let sender = 'Optimizely <me@' + domain +'>';
  let data = {
    from: sender,
    to: email,
    subject: 'Thanks for stopping by Attic and Button!',
    html: '<html><div align="center" style="max-width:580px; margin:0 auto;"><a href="http://www.atticandbutton.us/#userid=' + email + '"><img style="width:100%; margin:0 auto;" src="https://s3-us-west-2.amazonaws.com/optimizely-email-images/shirts.jpg"></a></div></html>'
  }

  mailer.messages().send(data, (err, body) => {
    console.log(body ? body : err);
    return body ? res.sendStatus(200) : res.sendStatus(500);
  });

});

app.get('/image-redirect', (req, res) => {
  let email = req.query.email;

  let response = {
    contenttype : "image/jpeg",
    cachecontrol : "no-cache, max-age=0",
    location : "https://s3-us-west-2.amazonaws.com/keynote-images/ww_email_welcome.jpg"
  };

  res.writeHead(200, {'Content-Type': 'image/jpeg', 'Cache-Control': 'no-cache, max-age=0'});
  res.end(response.location);

});
//var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

//httpServer.listen(8080);
//httpsServer.listen(8443);

app.listen(process.env.PORT || 3000, function(){
  console.log("Running! GO CHECK LOCALHOST:3000");
});