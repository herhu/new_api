"use strict";
var express = require('express');
var router = express.Router();
var statusService = require('../services/status.service');
var statusSche = require('../schema/index.schema').status;
// routes
router.post('/set_check', setCheck);
router.post('/get_check', getCheck);
function setCheck(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    statusService.setCheck(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
        res.contentType('application/json').status(500);
        res.json({ err: err });
    });
}
function getCheck(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    statusService.statusCheck(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
        res.contentType('application/json').status(500);
        res.json({ err: err });
    });
}
module.exports = router;
