"use strict";
var config = require('./config');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "awsCheck-in2021",
    database: "precheck"
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
