"use strict";
// const sslRedirect = require("heroku-ssl-redirect").default;
const express = require("express");
const compression = require("compression");
const bodyParser = require('body-parser');

const _port = process.env.PORT || 8080;
const _app_folder = 'dist';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.text({ type: '*/*' }));
// app.use(sslRedirect());
app.use(compression());

// ---- SERVE STATIC FILES ---- //
app.get('*', express.static(_app_folder, { maxAge: '1y' }));

app.post('/auth-callback', (req, res) => {
  console.log('Got body:', req.body);
  // console.log(req);
  var method = req.body.METHOD || '';
  var tsoid = req.body.TSOID || '';
  var token = req.body.TOKEN || '';
  var orderId = req.body.ORDERID || '';
  var statusCode = req.body.STATUSCODE || '';
  var errorCode = req.body.ERRORCODE || '';
  var errorDescription = req.body.ERRORDESCRIPTION || '';
  var action = req.body.action || '';
  var userId = req.body.UID || '';
  var transacationId = req.body.TRANSACTIONID || '';

  // res.send('POST request to the homepage')
  var redirectUrl = `/?method=${method}&tsoid=${tsoid}&token=${token}&orderId=${orderId}&statusCode=${statusCode}&errorCode=${errorCode}&errorDescription=${errorDescription}&action=${action}&transactionId=${transacationId}&userId=${userId}`;
  res.redirect(redirectUrl);
});

app.post('/unsubscribe', (req, res) => {
  console.log('Got body:', req.body);
 
  // Just return to home
  var redirectUrl = `/?method=UNSUBSCRIPTION&statusCode=0`;
  res.redirect(redirectUrl);
});

// ---- SERVE APLICATION PATHS ---- //
// app.all('*', function (req, res) {
//     res.status(200).sendFile(`/`, { root: _app_folder });
// });



// ---- START UP THE NODE SERVER  ----
app.listen(_port, function () {
  console.log("Node Express server for " + app.name + " listening on http://localhost:" + _port);
});
