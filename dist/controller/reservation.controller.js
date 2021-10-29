"use strict";
var express = require('express');
var router = express.Router();
var reservationService = require('../services/reservation.service');
var extraService = require('../services/extras.service');
var reservation = require('../schema/index.schema').reservation;
// routes
router.post('/get_first', getFirst); //traer reserva con sus datos
router.post('/get_first_date', getFirstDate); //traer datos iniciales de opera
router.post('/get_guest', getGuest);
router.post('/get_nights', getNights);
router.post('/save_checkin', saveCheckin);
router.post('/get_deuda', getDeuda);
router.post('/get_additional', getAdditional);
router.post('/get_dataPdfSing', getDataPdfSing);
router.post('/details', details);
router.post('/get_dataPdf', getDataPdf);
router.post('/nationality', nationality);
router.post('/get_price_upgrade', getPriceUpgrade);
router.post('/set_adress', setAddress); //guardar direcciones, guardar en mysql, armar pdf
function setAddress(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("encrypted:", req.body);
    extraService.makePdf(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
        res.contentType('application/json').status(400);
        res.json({ err: err });
    });
}
function getFirstDate(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    reservationService.getFirstDate(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
function getFirst(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    reservationService.getGuest(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
function getGuest(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    reservationService.getGuest(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
function getNights(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    reservationService.getNights(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
function saveCheckin(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    reservationService.saveCheckIn(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
function getDeuda(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    reservationService.getDeuda(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
function getAdditional(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    reservationService.getAdditional(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
function getDataPdfSing(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    reservationService.getDataPdfSing(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
function details(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    reservationService.details(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
    });
}
function getDataPdf(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    var resv_name_id = parseInt(req.body.resvNameId);
    reservationService.statusCheck(resv_name_id)
        .then(function (data) {
        console.log("statusCheck:", data);
        console.log("length:", data.length);
        if (data.length > 0) {
            res.contentType('application/json').status(400);
            res.send({ preCheck: true });
        }
        else {
            reservationService.getDataPdf(req.body)
                .then(function (data) {
                res.json({ data: data });
            })
                .catch(function (err) {
                console.log("error:", err);
                res.json(err.message);
            });
        }
    })
        .catch(function (err) {
        console.log("error:", err);
        res.json({ preCheck: true });
    });
}
function nationality(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    reservationService.getNationality(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
        res.contentType('application/json').status(400);
        res.json({ err: err });
    });
}
function getPriceUpgrade(req, res, next) {
    res.contentType('application/json').status(200);
    console.log("body:", req.body);
    reservationService.getPriceUpgrade(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
        res.contentType('application/json').status(400);
        res.json({ err: err });
    });
}
module.exports = router;
