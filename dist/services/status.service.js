"use strict";
var jwt = require('jsonwebtoken');
var config = require('../config');
var mysqlCn = require("../mysqlConnection");
module.exports = {
    statusCheck: function (resv_name_id) {
        return new Promise(function (resolve, reject) {
            var var_sql = [
                resv_name_id
            ];
            var sql2 = "SELECT * FROM checkin where resv_name_id = ?;";
            mysqlCn.connectQuery(sql2, var_sql)
                .then(function (resp) {
                console.log("success setCheck:", resp);
                resolve(resp);
            })
                .catch(function (err) {
                console.log("error setCheck:", err);
                reject(err);
            });
        });
    },
    setCheck: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_name_id = data.resv_name_id;
            var hotel = data.hotel;
            var dateCheck = new Date();
            var var_sql = [
                resv_name_id,
                dateCheck,
                hotel
            ];
            var sql2 = "INSERT INTO `precheck`.`checkin` (`resv_name_id`, `insert`, `resort`) VALUES (?, ?, ?);";
            mysqlCn.connectQuery(sql2, var_sql)
                .then(function (data) {
                console.log("success statusCheck:", data.insertId);
                resolve(data);
            })
                .catch(function (err) {
                console.log("error statusCheck:", err);
                reject(err);
            });
        });
    },
};
