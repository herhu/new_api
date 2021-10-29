"use strict";
var jwt = require('jsonwebtoken');
var config = require('../config');
var mysqlCn = require("../mysqlConnection");
var reservationService = require('../services/reservation.service');
var statusService = require('../services/status.service');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'check-in@hscp.cl',
        pass: 'hscp286!.,'
    },
    tls: {
        rejectUnauthorized: false
    },
    logger: false,
    debug: false // include SMTP traffic in the logs
});
var Cryptr = require('cryptr');
var cryptr = new Cryptr('Qn8zjsPJfrenon');
module.exports = {
    decrypt: function (data) {
        return new Promise(function (resolve, reject) {
            console.log("decrypt:", data);
            var dataEncrypted = data;
            var decryptedString = cryptr.decrypt(dataEncrypted);
            resolve({ data: decryptedString });
        });
    },
    decryptFirst: function (data) {
        return new Promise(function (resolve, reject) {
            var dataEncrypted = data;
            var decryptedString = cryptr.decrypt(dataEncrypted);
            console.log("decryptedString:", decryptedString);
            var res = decryptedString.split("/");
            var perfil = {
                resv_name_id: res[0],
                hotel: res[1]
            };
            statusService.statusCheck(perfil.resv_name_id).then(function (resp) {
                console.log("status reserva:", resp);
                if (resp.length > 0) {
                    reject({ error: "Reserva ya ingresada" });
                }
                else {
                    reservationService.getFirst(perfil)
                        .then(function (resp) {
                        console.log("response:", resp);
                        resolve({ content: resp, reserva: perfil });
                    })
                        .catch(function (err) {
                        console.log("error:", err);
                        resolve({ content: {}, reserva: perfil });
                    });
                }
            })
                .catch(function (err) {
                console.log("error:", err);
                reject({ error: "Reserva ya ingresada" });
            });
        });
    },
    encrypt: function (data) {
        return new Promise(function (resolve, reject) {
            var dataToEncryp = data.encryptData;
            var encryptedString = cryptr.encrypt(dataToEncryp);
            resolve({
                // iv: iv.toString('hex'),
                data: encryptedString
            });
        });
    },
};
