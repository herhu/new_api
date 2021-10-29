"use strict";
var config = require('./config');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: config.HOST,
    user: config.USER_bd,
    password: config.PASS_bd,
    database: config.BD
});
module.exports = {
    connectQuery: function (query, values) {
        return new Promise(function (resolve, reject) {
            // connection.connect();
            // connection.end();
            connection.query(query, values, function (err, rows, fields) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
};
