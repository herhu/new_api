"use strict";
var jwt = require('jsonwebtoken');
var config = require('../config');
var mysqlCn = require("../mysqlConnection");
var extr = require('../services/extras.service');
var oracleCn = require("../connection");
var objoracle = require("oracledb");
module.exports = {
    getRatesWithoutAgency: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_name_id = parseInt(data.resvNameId);
            var hotel = data.hotel;
            var rate_code = data.rate_code;
            var agent_name = data.agent_name;
            var dayarrival = data.dayarrival;
            var agency = data.agency;
            var amount = data.amount;
            var room_class = data.room_class;
            console.log(data);
            var sql = "";
            if (hotel == "HTALM") {
                var varDay = "day" + (dayarrival + 1);
                sql = "SELECT * FROM (SELECT amount_1,cat_pkg_price_code \n            \tFROM RATE_SET \n            \tWHERE resort = :hotel\n            \tAND amount_1 > 0\n            \tAND rate_code IN ('WALKIN CLP','DIRECTO USD',\n            \t'DIRECTOSDUSD','WALKIN USD','WALKINSDCLP',\n            \t'WALKINSDUSD','DIRECTO CLP','DIRECTOSDCLP')\n            \tAND rate_code IN (:rate_code) \n            \tAND cat_pkg_price_code <> (:room_class) \n            \tAND amount_1 > :amount\n            \tAND \" + varDay + \" = 'Y'\n            \torder by amount_1) \n            \tWHERE rownum <=1";
                oracleCn.open(sql, [hotel, rate_code, room_class, amount], false)
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
                var varDay = "day" + (dayarrival + 1);
                sql = "SELECT * FROM (SELECT amount_1,cat_pkg_price_code \n            \tFROM RATE_SET \n            \tWHERE resort = :hotel\n            \tAND amount_1 > 0\n            \tAND rate_code IN ('WALKIN CLP','DIRECTO USD',\n            \t'DIRECTOSDUSD','WALKIN USD','WALKINSDCLP',\n            \t'WALKINSDUSD','DIRECTO CLP','DIRECTOSDCLP')\n            \tAND rate_code IN (:rate_code) \n            \tAND cat_pkg_price_code <> (:room_class) \n            \tAND amount_1 > :amount\n            \tAND \" + varDay + \" = 'Y'\n            \torder by amount_1) \n            \tWHERE rownum <=1";
                oracleCn.open(sql, [hotel, rate_code, room_class, amount], false)
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
    getRates: function (data) {
        return new Promise(function (resolve, reject) {
            console.log(data);
            var resv_name_id = parseInt(data.resvNameId);
            var hotel = data.hotel;
            var rate_code = data.rate_code;
            var agent_name = data.agent_name;
            var amount = data.amount;
            var dayarrival = data.dayarrival;
            var varDay = "rsv.day" + (dayarrival + 1);
            var sql = "SELECT * FROM (\n            SELECT NV.DISPLAY_NAME,\n            RNV.RATE_CODE,\n            rsv.ROOM_TYPES,\n            rsv.BEGIN_DATE,\n            rsv.END_DATE,\n            rsv.AMOUNT_1,\n            rsv.AMOUNT_2,\n            rsv.AMOUNT_3,\n            rsv.AMOUNT_4,\n            rhv.currency_code,\n            rsv.ADULT_CHARGE,\n            rsv.CHILDREN_CHARGE\n            FROM RATE_HEADER_NEGOTIAT_BASE_VIEW RNV,\n            NAME_VIEW                      NV,\n            RATE_SET_VIEW                  rsv,\n            rate_header_view               rhv\n            WHERE RNV.NAME_ID = NV.NAME_ID\n            AND rnv.RESORT = :hotel\n            AND rhv.RESORT = :hotel\n            AND rsv.RESORT = :hotel\n            AND rnv.RATE_CODE = rsv.RATE_CODE\n            and rhv.RATE_CODE = rsv.RATE_CODE\n            and rhv.rate_code = rnv.RATE_CODE\n            and amount_1 > :amount\n            and NV.DISPLAY_NAME = :agent_name\n            and RNV.RATE_CODE = :rate_code\n            and TRUNC(SYSDATE) BETWEEN  rsv.BEGIN_DATE AND rsv.END_DATE\n            AND " + varDay + " = 'Y'\n            ORDER BY amount_1)\n            WHERE rownum <= 1";
            console.log("data query:", { hotel: hotel, amount: amount, agent_name: agent_name, rate_code: rate_code, varDay: varDay });
            oracleCn.open(sql, [hotel, hotel, hotel, amount, agent_name, rate_code], false)
                .then(function (data) {
                console.log("rates:", data.length);
                resolve(data);
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    getRoomsFeature: function (data) {
        return new Promise(function (resolve, reject) {
            feature;
            roomTypeLabel;
            hotel;
            var feature = data.feature;
            // var resv_name_id = parseInt(data.resv_name_id);
            var hotel = data.hotel;
            var roomTypeLabel = data.roomTypeLabel;
            // var type = data.type;
            // var category = data.category;
            console.log("getRoomsFeature:", data);
            var sql = "";
            var sql_params = [];
            sql = "SELECT r.room, \n\t\t\trf.feature, \n\t\t\tr.description,\n\t\t\tDECODE(rf.feature,'CASI','CASINO',\n\t\t\t'VINSI','INTERIOR',\n\t\t\t'LSQU','PLAZA DE ARMAS',\n\t\t\t'MUSE','MUSEO') zona\n\t\t\tFROM RESORT_ROOMS r, room_feature rf\n\t\t\tWHERE r.resort = :hotel\n\t\t\tAND r.room = rf.room\n\t\t\tAND rf.feature = :feature\n\t\t\tAND r.FO_STATUS = 'VAC'\n\t\t\tAND r.ROOM_CATEGORY > 0\n\t\t\tAND r.ROOM_STATUS IN ('IP')\n\t\t\tAND r.room_reservation_status IN (9)\n\t\t\tAND CASE WHEN r.DESCRIPTION = 'King' AND r.resort = 'HTSCR' THEN 'KGNS'\n\t\t\tWHEN r.DESCRIPTION = 'Twin' AND r.resort = 'HTSCR' THEN 'TWNS'\n\t\t\tWHEN r.DESCRIPTION = 'King' AND r.resort = 'HTALM' THEN 'KING'\n\t\t\tWHEN r.DESCRIPTION = 'Twin' AND r.resort = 'HTALM' THEN 'TWIN'\n\t\t\tWHEN r.DESCRIPTION = 'Queen doble' THEN '2QUE'\n\t\t\tWHEN r.DESCRIPTION = 'Triple' THEN 'TRPL'\n\t\t\tWHEN r.DESCRIPTION = 'Junior Suite' THEN 'STKG'\n\t\t\tWHEN r.DESCRIPTION = 'Jr Suite Twin'THEN 'STWN'\n\t\t\tWHEN r.DESCRIPTION = 'Jr Suite King'THEN 'STWS'\n\t\t\tWHEN r.DESCRIPTION = 'Suite King'THEN 'STNS'\n\t\t\tWHEN r.DESCRIPTION = 'Suite Twin'THEN 'STNT'\n\t\t\tWHEN r.DESCRIPTION = 'Suite sup. King'THEN 'STSM'\n\t\t\tWHEN r.DESCRIPTION = 'Suite sup. Twin'THEN 'STST'\n\t\t\tWHEN r.DESCRIPTION = 'Suite Presidencial'THEN 'STPR'\n\t\t\tWHEN r.DESCRIPTION = 'Handicap' THEN 'HNDC' \n\t\t\tEND = :roomTypeLabel";
            sql_params = [hotel, feature, roomTypeLabel];
            oracleCn.open(sql, sql_params, false)
                .then(function (data) {
                console.log("rooms:", data);
                resolve(data);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    },
    getRoomsFromFeature: function (data) {
        return new Promise(function (resolve, reject) {
            var feature = data.feature;
            var room_type = data.roomType;
            var hotel = data.hotel;
            console.log(data);
            console.log(hotel, feature, room_type);
            var sql = "";
            if (hotel == "HTSCR") {
                sql = "SELECT ROOM  FROM ROOM\n\t\t\t\tWHERE resort = :hotel\n\t\t\t\tAND FO_STATUS = 'VAC'\n\t\t\t\tAND ROOM_CATEGORY > 0\n\t\t\t\tAND PCODE IN (:feature)--pin_feature aqui la opcion que eligio\n\t\t\t\tAND ROOM_STATUS NOT IN ('OO')\n\t\t\t\tAND DECODE (DESCRIPTION,  'King','KGNS',\n\t\t\t\t'Twin', 'TWNS',\n\t\t\t\t'Jr Suite Twin', 'STWN',\n\t\t\t\t'Jr Suite King', 'STWS',\n\t\t\t\t'Suite King', 'STNS',\n\t\t\t\t'Suite Twin', 'STNT',\n\t\t\t\t'Suite sup. King', 'STSM',\n\t\t\t\t'Suite sup. Twin', 'STST',\n\t\t\t\t'Suite Presidencial', 'STPR',\n\t\t\t\t'Handicap', 'HNDC') = :room_type";
                oracleCn.open(sql, [hotel, feature, room_type], false)
                    .then(function (data) {
                    resolve(data);
                })
                    .catch(function (err) {
                    reject(err);
                });
            }
            else if (hotel == "HTALM") {
                sql = "SELECT ROOM FROM ROOM \n\t\t\t\tWHERE resort = :hotel\n\t\t\t\tAND FO_STATUS = 'VAC'\n\t\t\t\tAND ROOM_CATEGORY > 0\n\t\t\t\tAND PCODE IN (:feature)--pin_feature aqui la opcion que eligio \n\t\t\t\tAND ROOM_STATUS NOT IN ('OO')\n\t\t\t\tAND DECODE (DESCRIPTION,'Twin','TWIN',\n\t\t\t\t'King','KING',\n\t\t\t\t'Queen No Fumador','1QUE',\n\t\t\t\t'Queen Fumador','1QUE',\n\t\t\t\t'Queen doble','2QUE',\n\t\t\t\t'Triple','TRPL',\n\t\t\t\t'Junior Suite','STKG')= :room_type";
                oracleCn.open(sql, [hotel, feature, room_type], false)
                    .then(function (data) {
                    resolve(data);
                })
                    .catch(function (err) {
                    reject(err);
                });
            }
        });
    },
    getFeatures: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_name_id = parseInt(data.resvNameId);
            var room_type = data.room_type;
            var hotel = data.hotel;
            console.log(data);
            var sql = "";
            sql = "SELECT DISTINCT(DECODE (rf.feature,'MUSE',  'Vista Museo',\n\t\t\t'CASI',  'Vista Casino',\n\t\t\t'VINSI', 'Vista Interior',\n\t\t\t'LSQU',  'Vista Plaza de Armas',\n\t\t\t'SVST',  'Sin ventanas, sin tina',\n\t\t\t'VCAE',  'Vista Calle Alameda(edificios)',\n\t\t\t'VCAPTH','Vista Calle Alameda (parte tras. Edificio Hites',\n\t\t\t'VCASA', 'Vista Calle Alameda Esq. San Antonio sin tina',\n\t\t\t'VCATE', 'Vista Calle Alameda Esq. Calle Tenderini',\n\t\t\t'VET',   'Vista Edificio Calle Tenderini',\n\t\t\t'VPCM',  'Vista Piscina Calle Moneda',\n\t\t\t'VSA' ,  'Vista Calle San Antonio')) vista,(rf.feature)\n\t\t\tFROM RESORT_ROOMS r, room_feature rf\n\t\t\tWHERE r.resort = :hotel\n\t\t\tAND r.room = rf.room\n\t\t\tAND r.room = rf.room\n\t\t\tAND r.FO_STATUS = 'VAC'\n\t\t\tAND r.ROOM_CATEGORY > 0\n\t\t\tAND r.ROOM_STATUS IN ('IP')\n\t\t\tAND r.room_reservation_status IN (9)\n\t\t\tAND CASE WHEN DESCRIPTION = 'King' AND r.resort = 'HTSCR' THEN 'KGNS'\n\t\t\tWHEN DESCRIPTION = 'Twin' AND r.resort = 'HTSCR' THEN 'TWNS'\n\t\t\tWHEN DESCRIPTION = 'King' AND r.resort = 'HTALM' THEN 'KING'\n\t\t\tWHEN DESCRIPTION = 'Twin' AND r.resort = 'HTALM' THEN 'TWIN'\n\t\t\tWHEN DESCRIPTION = 'Queen doble' THEN '2QUE'\n\t\t\tWHEN DESCRIPTION = 'Triple' THEN 'TRPL'\n\t\t\tWHEN DESCRIPTION = 'Junior Suite' THEN 'STKG'\n\t\t\tWHEN DESCRIPTION = 'Jr Suite Twin'THEN 'STWN'\n\t\t\tWHEN DESCRIPTION = 'Jr Suite King'THEN 'STWS'\n\t\t\tWHEN DESCRIPTION = 'Suite King'THEN 'STNS'\n\t\t\tWHEN DESCRIPTION = 'Suite Twin'THEN 'STNT'\n\t\t\tWHEN DESCRIPTION = 'Suite sup. King'THEN 'STSM'\n\t\t\tWHEN DESCRIPTION = 'Suite sup. Twin'THEN 'STST'\n\t\t\tWHEN DESCRIPTION = 'Suite Presidencial'THEN 'STPR'\n\t\t\tWHEN DESCRIPTION = 'Handicap' THEN 'HNDC' \n\t\t\tEND = :room_type";
            oracleCn.open(sql, [hotel, room_type], false)
                .then(function (data) {
                console.log("getFeatures:", data);
                resolve(data);
            })
                .catch(function (err) {
                console.log("error getFeatures:", err);
                reject(err);
            });
        });
    },
    getFeaturesFromType: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_name_id = parseInt(data.resvNameId);
            var room_type = data.roomType;
            var hotel = data.hotel;
            console.log(data);
            var sql = "";
            if (hotel == "HTALM") {
                sql = "SELECT DISTINCT(PCODE) \n\t\t\t\tFROM ROOM\n\t\t\t\tWHERE resort = :hotel\n\t\t\t\tAND FO_STATUS = 'VAC'\n\t\t\t\tAND ROOM_CATEGORY > 0\n\t\t\t\tAND ROOM_STATUS NOT IN ('OO')\n\t\t\t\tAND DECODE (DESCRIPTION,'Twin','TWIN',\n\t\t\t\t'King','KING',\n\t\t\t\t'Queen No Fumador','1QUE',\n\t\t\t\t'Queen Fumador','1QUE',\n\t\t\t\t'Queen doble','2QUE',\n\t\t\t\t'Triple','TRPL',\n\t\t\t\t'Junior Suite','STKG')= :room_type";
                oracleCn.open(sql, [hotel, room_type], false)
                    .then(function (data) {
                    console.log("features", data);
                    resolve(data);
                })
                    .catch(function (err) {
                    console.log("error:", err);
                    reject(err);
                });
            }
            else if (hotel == "HTSCR") {
                sql = "SELECT DISTINCT(PCODE)  FROM ROOM\n\t\t\t\tWHERE resort = :hotel\n\t\t\t\tAND FO_STATUS = 'VAC'\n\t\t\t\tAND ROOM_CATEGORY > 0\n\t\t\t\tAND ROOM_STATUS NOT IN ('OO')\n\t\t\t\tAND DECODE (DESCRIPTION,  'King','KGNS',\n\t\t\t\t'Twin', 'TWNS',\n\t\t\t\t'Jr Suite Twin', 'STWN',\n\t\t\t\t'Jr Suite King', 'STWS',\n\t\t\t\t'Suite King', 'STNS',\n\t\t\t\t'Suite Twin', 'STNT',\n\t\t\t\t'Suite sup. King', 'STSM',\n\t\t\t\t'Suite sup. Twin', 'STST',\n\t\t\t\t'Suite Presidencial', 'STPR',\n\t\t\t\t'Handicap', 'HNDC') = :room_type";
                oracleCn.open(sql, [hotel, room_type], false)
                    .then(function (data) {
                    console.log("getFeaturesFromType", data);
                    resolve(data);
                })
                    .catch(function (err) {
                    console.log("erro getFeaturesFromType:", err);
                    reject(err);
                });
            }
        });
    },
    makePdf: function (dataBody) {
        return new Promise(function (resolve, reject) {
            extr.makePdf(dataBody)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    setAdditionals: function (data) {
        return new Promise(function (resolve, reject) {
            console.log("setAdditionals:", data);
            var resv_name_id = parseInt(data.resv_name_id);
            var user = 2;
            var hotel = data.hotel;
            var amount = 0;
            var pout_error = { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 };
            var sql = "BEGIN pa_web.prc_insertar_cargos  (\n\t\t\t:product,\n\t\t\t:resv_name_id,\n\t\t\t:quantity,\n\t\t\t:user,\n\t\t\t:price,\n\t\t\t:pout_error); END;";
            var sql_params = [];
            var additionals = data.additionals;
            for (var i = 0; i < additionals.length; ++i) {
                var product = additionals[i].product;
                var quantity = parseInt(additionals[i].quantity);
                var price = parseInt(additionals[i].price);
                sql_params = { product: product, resv_name_id: resv_name_id, quantity: quantity, user: user, price: price, pout_error: pout_error };
                console.log("to set:", sql_params);
                oracleCn.openProcedure(sql, sql_params, false)
                    .then(function (data) {
                    console.log("setAdditionals:", data);
                    resolve(data);
                })
                    .catch(function (err) {
                    console.log("setAdditionals:", err);
                    reject(err);
                });
            }
        });
    },
    getRooms: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_id = data.resv_name_id;
            var hotel = data.hotel;
            var sql = "";
            if (hotel == "HTGLR" || hotel == "HTSCR" || hotel == "HTALM") {
                console.log("rooms almacruz:");
                sql = "SELECT ROOM FROM ROOM\n\t\t\t\tWHERE resort = :hotel\n\t\t\t\tAND FO_STATUS = 'VAC'\n\t\t\t\tAND ROOM_CATEGORY > 0\n\t\t\t\tAND ROOM_STATUS NOT IN ('OO')\n\t\t\t\tAND DECODE (DESCRIPTION,'Twin No Fumador','TWIN',\n\t\t\t\t'Twin Fumador','TWIN',\n\t\t\t\t'Twin','TWIN',\n\t\t\t\t'King','KING',\n\t\t\t\t'King Fumador','KING',\n\t\t\t\t'King No Fumador','KING',\n\t\t\t\t'Queen No Fumador','1QUE',\n\t\t\t\t'Queen Fumador','1QUE',\n\t\t\t\t'Queen doble','2QUE',\n\t\t\t\t'Triple','TRPL',\n\t\t\t\t'Junior Suite','STKG')=(SELECT room_category_label\n\t\t\t\tFROM name_reservation\n\t\t\t\tWHERE resv_name_id =:resv_id)";
                oracleCn.open(sql, [hotel, resv_id], false)
                    .then(function (data) {
                    resolve(data);
                })
                    .catch(function (err) {
                    console.log("error:", err);
                    reject(err);
                });
            }
            else {
                console.log("rooms almacruz other:");
                sql = "SELECT ROOM FROM ROOM\n\t\t\t\tWHERE resort = :hotel\n\t\t\t\tAND FO_STATUS = 'VAC'\n\t\t\t\tAND ROOM_CATEGORY > 0\n\t\t\t\tAND ROOM_STATUS = 'IP'\n\t\t\t\tAND DECODE (DESCRIPTION,'Standard','STD',\n\t\t\t\t'Superior','SUP',\n\t\t\t\t'Standard Plus','STP')=(SELECT room_category_label\n\t\t\t\tFROM name_reservation n\n\t\t\t\tWHERE resv_name_id = :resv_id)";
                oracleCn.open(sql, [hotel, resv_id], false)
                    .then(function (data) {
                    resolve(data);
                })
                    .catch(function (err) {
                    console.log("error:", err);
                    reject(err);
                });
            }
        });
    },
    saveRoom: function (data) {
        return new Promise(function (resolve, reject) {
            var pin_resv_name_id = parseInt(data.resv_name_id);
            var pin_room = data.room;
            console.log("save init:", data);
            if (data.amount != null) {
                var pin_amount = parseInt(data.amount);
                var pin_room_category = data.roomCategory;
                var sql = "";
                var params = {};
                if (data.typeSave == "save") {
                    console.log("save:", data);
                    sql = "BEGIN pa_web.prc_update_room (\n\t\t\t\t\t:pin_room,\n\t\t\t\t\t:pin_resv_name_id,\n\t\t\t\t\t:pout_error); END;";
                    params = {
                        pin_room: pin_room,
                        pin_resv_name_id: pin_resv_name_id,
                        pout_error: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 }
                    };
                    console.log("save data:", params);
                    oracleCn.openProcedure(sql, params, false)
                        .then(function (data) {
                        console.log("prc_update_room:", data.outBinds);
                        resolve(data.outBinds);
                    })
                        .catch(function (err) {
                        console.log("error prc_update_room:", err);
                        reject(err);
                    });
                }
                else if (data.typeSave == "upgrade") {
                    sql = "BEGIN pa_web.prc_change (\n\t\t\t\t\t:pin_resv_name_id,\n\t\t\t\t\t:pin_amount,\n\t\t\t\t\t:pin_room,\n\t\t\t\t\t:pout_msg); END;";
                    params = {
                        pin_resv_name_id: pin_resv_name_id,
                        pin_amount: pin_amount,
                        pin_room: pin_room,
                        pout_msg: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 }
                    };
                    console.log("upgrade data:", params);
                    oracleCn.openProcedure(sql, params, false)
                        .then(function (data) {
                        console.log("prc_change:", data.typeSave, "---", data);
                        resolve(data.outBinds);
                    })
                        .catch(function (err) {
                        console.log("error prc_change:", err);
                        reject(err);
                    });
                }
            }
            else {
                if (data.typeSave == "save") {
                    console.log("save:", data);
                    sql = "BEGIN pa_web.prc_update_room (\n\t\t\t\t\t:pin_room,\n\t\t\t\t\t:pin_resv_name_id,\n\t\t\t\t\t:pout_error); END;";
                    params = {
                        pin_room: pin_room,
                        pin_resv_name_id: pin_resv_name_id,
                        pout_error: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 }
                    };
                    console.log("save data:", params);
                    oracleCn.openProcedure(sql, params, false)
                        .then(function (data) {
                        console.log("prc_update_room:", data.outBinds);
                        resolve(data.outBinds);
                    })
                        .catch(function (err) {
                        console.log("error prc_update_room:", data.typeSave, "---", data);
                        reject(err);
                    });
                }
                else {
                    reject({ err: "error en datos" });
                }
            }
        });
    },
};
