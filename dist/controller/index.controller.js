"use strict";
module.exports = function (app) {
    app.use('/status', require('./status.controller'));
    app.use('/packages', require('./packages.controller'));
    app.use('/room', require('./room.controller'));
    app.use('/reservation', require('./reservation.controller'));
    app.use('/email', require('./email.controller'));
    app.use('/crypt', require('./crypt.controller'));
    app.use('/perfil', require('./perfil.controller'));
    app.use('/account', require('./account.controller'));
};
