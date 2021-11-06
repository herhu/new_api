"use strict";
var dotenv = require('dotenv');
var path = require('path');
dotenv.config({
    path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
});
module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 3000,
    PORT_ssl: process.env.PORT_ssl || 3031,
    USER_bd: process.env.USER_bd || "root",
    BD: process.env.BD || "precheck",
    PASS_bd: process.env.PASS_bd || "awsCheck-in2021",
    key: process.env.key || "/home/administrador/certs/oxford.key",
    crt: process.env.crt || "/home/administrador/certs/21d7b736cee4c46e.crt",
    llave: "miclaveultrasecreta123*" // jwt
};
