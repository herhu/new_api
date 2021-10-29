"use strict";
var statusSche = require('./status.schema')(validateRequest);
var packages = require('./packages.schema')(validateRequest);
var room = require('./room.schema')(validateRequest);
var reservation = require('./reservation.schema')(validateRequest);
var email = require('./email.schema')(validateRequest);
var crypt = require('./crypt.schema')(validateRequest);
var perfil = require('./perfil.schema')(validateRequest);
var account = require('./account.schema')(validateRequest);
// account.createAccountSchema()
console.log(account.toString());
function validateRequest(req, res, next, schema) {
    var options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true // remove unknown props
    };
    var _a = schema.validate(req.body, options), error = _a.error, value = _a.value;
    if (error) {
        // req.error = {type: "Validation error", data: error.details.map((x:any) => x.message) };
        // next();
        // next({error: "Validation error", data: error.details.map((x:any) => x.message).join(', ') });
        res.contentType('application/json').status(400);
        res.send({ type: "Validation error", data: error.details.map(function (x) { return x.message; }) });
    }
    else {
        req.body = value;
        next();
    }
}
//account
module.exports.account = account;
module.exports.perfil = perfil;
module.exports.crypt = crypt;
module.exports.email = email;
module.exports.reservation = reservation;
module.exports.room = room;
module.exports.packages = packages;
module.exports.status = statusSche;
