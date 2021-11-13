"use strict";
var jwt = require('jsonwebtoken');
var config = require('../config');
var mysqlCn = require("../mysqlConnection");
var oracleCn = require("../connection");
var objoracle = require("oracledb");
module.exports = {
    packagesPrices: function (data) {
        return new Promise(function (resolve, reject) {
            var hotel = data.hotel;
            var currency = data.currency;
            console.log(data);
            var sql = "";
            if (currency == "USD") {
                sql = "SELECT rrpp.resort,\n\t\t\t\tp.product,\n\t\t\t\tdescription,\n\t\t\t\tppr.trx_code,\n\t\t\t\trrpp.price,\n\t\t\t\tdescription|| ' + ' ||rrpp.price || ' p/p' nombre_web\n\t\t\t\tFROM products p,product_posting_rules ppr,\n\t\t\t\tRESORT_RATE_PRODUCT_PRICES rrpp\n\t\t\t\tWHERE p.product IN ('CAVERNASWEB','EBIKEAPALTAWEB','CABALGATAWEB','GRANCHAMANWEB','VINACAMPESINAWEB','PACKMUSEOS','HOTTUBUS')\n\t\t\t\tAND p.product = ppr.product\n\t\t\t\tAND rrpp.product = p.product\n\t\t\t\tAND rrpp.product = ppr.product\n\t\t\t\tAND rrpp.resort = :pin_resort --HTSCR\n\t\t\t\tAND rrpp.price > 0 \n\t\t\t\tAND TRUNC(SYSDATE) BETWEEN begin_date and end_date";
                oracleCn.open(sql, [hotel], false)
                    .then(function (data) {
                    console.log("data->", data);
                    resolve(data);
                })
                    .catch(function (err) {
                    console.log("error:", err);
                    reject(err);
                });
            }
            else if (hotel == "HTSCR") {
                sql = "SELECT rrpp.resort,\n\t\t\t\tp.product,\n\t\t\t\tdescription,\n\t\t\t\tppr.trx_code,\n\t\t\t\trrpp.price,\n\t\t\t\tdescription|| ' + ' ||rrpp.price || ' p/p' nombre_web\n\t\t\t\tFROM products p,product_posting_rules ppr,\n\t\t\t\tRESORT_RATE_PRODUCT_PRICES rrpp\n\t\t\t\tWHERE p.product IN ('GRANCHAMANWEBC','VINACAMPESINAWEBC','EBIKEAPALTAWEBC','RUTAMUSEOS','HOTTUB','CAVERNASWEBC')\n\t\t\t\tAND p.product = ppr.product\n\t\t\t\tAND rrpp.product = p.product\n\t\t\t\tAND rrpp.product = ppr.product\n\t\t\t\tAND rrpp.resort = :pin_resort --'HTSCR'\n\t\t\t\tAND rrpp.price > 0 \n\t\t\t\tAND TRUNC(SYSDATE) BETWEEN begin_date and end_date";
                oracleCn.open(sql, [hotel], false)
                    .then(function (data) {
                    console.log("data->", data);
                    resolve(data);
                })
                    .catch(function (err) {
                    console.log("error:", err);
                    reject(err);
                });
            }
        });
    },
};