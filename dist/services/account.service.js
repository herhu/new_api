"use strict";
var jwt = require('jsonwebtoken');
var config = require('../config');
var mysqlCn = require("../mysqlConnection");
module.exports = {
    dateFormat: function (date) {
        var mm = date.getMonth() + 1;
        var dd = date.getDate();
        return [date.getFullYear(),
            (mm > 9 ? '' : '0') + mm,
            (dd > 9 ? '' : '0') + dd
        ].join('-');
    },
    authenticate: function (data) {
        return new Promise(function (resolve, reject) {
            var rut = data.rut;
            var pass = data.pass;
            var sql = "SELECT * FROM usuarios \n\t\t\tWHERE rut = ? \n\t\t\tAND password = ? \n\t\t\tAND estado = 1";
            mysqlCn.connectQuery(sql, [rut, pass])
                .then(function (resp) {
                console.log("login:", resp);
                var payload = {
                    check: true
                };
                var token = jwt.sign(payload, config.llave, {
                    expiresIn: 1440
                });
                resolve({ data: resp[0], token: token });
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    }
};
