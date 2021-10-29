"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require('path');
var config = require('./config');
var Joi = require('joi');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
console.log("NODE_ENV=" + config.NODE_ENV);
var app = express();
var dir = path.join(__dirname, 'assets/img');
app.use(express.static(dir));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
// jwt
app.set('llave', config.llave);
// routes
require('./controller/index.controller')(app);
app.get("/", function (req, res) {
    res.send("calling");
});
//--------- for https server---------------------------------------------------
var fs = require('fs');
var http = require('http');
var https = require('https');
// var privateKey = fs.readFileSync(config.key, 'utf8');
// var certificate = fs.readFileSync(config.crt, 'utf8');
// var credentials = { key: privateKey, cert: certificate };
// var httpsServer = https.createServer(credentials, app);
app.listen(config.PORT, function () {
    console.log("App listening on http://" + config.HOST + ":" + config.PORT);
});
/*httpsServer.listen(config.PORT_ssl, config.HOST, () =>{
  console.log(`App listening on https://${config.HOST}:${config.PORT_ssl}`);
});*/
