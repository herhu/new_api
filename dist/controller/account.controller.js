"use strict";
var express = require('express');
var router = express.Router();
var acountService = require('../services/account.service');
var account = require('../schema/index.schema').account;
// routes
router.post('/createAccount', account.createAccountSchema, createAccount);
router.post('/authenticate', authenticate);
router.get('/getAll', getAll);
module.exports = router;
function authenticate(req, res, next) {
    // acountService.authenticate(req.query)
    acountService.authenticate(req.body)
        .then(function (user) { return res.json(user); })
        .catch(next);
}
function getAll(req, res, next) {
    res.contentType('application/json').status(200);
    res.send({ dataSuccess: req.body });
}
function createAccount(req, res, next) {
    res.contentType('application/json').status(200);
    res.send({ dataSuccess: req.body });
}
