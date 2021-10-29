"use strict";
var jwt = require('jsonwebtoken');
var config = require('../config');
var mysqlCn = require("../mysqlConnection");
var oracleCn = require("../connection");
module.exports = {
    getNationality: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_name_id = data.roomType;
            var hotel = data.hotel;
            var sql = "SELECT attribute_code, description\n            FROM entity_detail \n            WHERE e.entity_name = 'NATIONALITY'\n            ORDER BY description";
            oracleCn.open(sql, [], false)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    getFromArrival: function (data) {
        return new Promise(function (resolve, reject) {
            var dateCheck = data.dateCheck;
            var hotel = data.hotel;
            var sql = "SELECT \n            CONFIRMATION_NO confirmation_no,\n            RESV_NAME_ID resv_name_id ,\n            NAME_ID name_id,\n            EMAIL email ,\n            GUEST_FIRST_NAME nameTitular ,\n            GUEST_NAME lastNameTitular\n            from name_reservation\n            where arrival = TO_DATE(:dateCheck, 'dd-mm-yy')\n            AND RESORT = :hotel";
            oracleCn.open(sql, [dateCheck, hotel], false)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
};
