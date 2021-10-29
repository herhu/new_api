"use strict";
var express = require('express');
var router = express.Router();
var roomService = require('../services/room.service');
var room = require('../schema/index.schema').room;
// routes
router.post('/get_rooms_feature', getRoomsFeature);
router.post('/get_rooms_from_feature', getRoomsFromFeature);
router.post('/get_features', getFeatures);
router.post('/get_features_from_type', getFeaturesFromType);
router.post('/makePdf', makePdf);
router.post('/set_additionals', setAdditionals);
router.post('/get_rooms', getRooms);
router.post('/save_Room', saveRoom);
router.post('/get_rates', getRates);
function getRates(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    roomService.getRates(req.body)
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
function getRoomsFeature(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    roomService.getRoomsFeature(req.body)
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
function getRoomsFromFeature(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    roomService.getRoomsFromFeature(req.body)
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
function getFeatures(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    roomService.getFeatures(req.body)
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
function getFeaturesFromType(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    roomService.getFeaturesFromType(req.body)
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
function makePdf(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    roomService.getFeaturesFromType(req.body)
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
function setAdditionals(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    roomService.setAdditionals(req.body)
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
function getRooms(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    roomService.getRooms(req.body)
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
function saveRoom(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    roomService.saveRoom(req.body)
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
