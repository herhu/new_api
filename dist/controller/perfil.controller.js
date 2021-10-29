"use strict";
var express = require('express');
var router = express.Router();
var perfilService = require('../services/perfil.service');
var perfil = require('../schema/index.schema').perfil;
// routes
router.post('/get_nationality', get_nationality); //router.post('/check_availability', check_availability);
router.post('/get_fromArrival', getFromArrival);
function get_nationality(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    perfilService.getNationality(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
function getFromArrival(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    perfilService.getFromArrival(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
module.exports = router;
