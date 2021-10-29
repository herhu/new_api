"use strict";
var express = require('express');
var router = express.Router();
var packagesService = require('../services/packages.service');
var packages = require('../schema/index.schema').packages;
// routes
router.post('/get_packages_price', packagesPrice);
function packagesPrice(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    packagesService.packagesPrices(req.body)
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
