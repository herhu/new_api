"use strict";
var express = require('express');
var router = express.Router();
var emailService = require('../services/email.service');
var email = require('../schema/index.schema').email;
// routes
router.post('/send_email', sendEmail);
router.post('/send_email_test', sendEmailTest);
function sendEmail(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    emailService.sendEmail(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
function sendEmailTest(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body.resvName);
    emailService.sendEmailTest(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
module.exports = router;
