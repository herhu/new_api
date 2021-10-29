"use strict";
var express = require('express');
var router = express.Router();
var cryptService = require('../services/crypt.service');
var crypt = require('../schema/index.schema').crypt;
// routes
router.post('/decrypt_simple_data', decrypt_simple);
router.post('/decrypt_first', decrypt_first);
router.post('/encrypt_data', encrypt_data);
function decrypt_simple(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("encrypted:", req.body.encrypted);
    cryptService.decrypt(req.body.encrypted)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
function decrypt_first(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("encrypted:", req.body.encrypted);
    cryptService.decryptFirst(req.body.encrypted)
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
function encrypt_data(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("toEncrypt:", req.body.toEncrypt);
    cryptService.encrypt(req.body.toEncrypt)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
module.exports = router;
