"use strict";
var Joi = require('joi');
module.exports = function (validateRequest) {
    return {
        createAccountSchema: function (req, res, next) {
            var schema = Joi.object({
                title: Joi.string().required(),
            });
            validateRequest(req, res, next, schema);
        }
    };
};
