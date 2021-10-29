"use strict";
var jwt = require('jsonwebtoken');
var config = require('../config');
var mysqlCn = require("../mysqlConnection");
var extr = require('../services/extras.service');
var oracleCn = require("../connection");
var objoracle = require("oracledb");
module.exports = {
    getFirst: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_id = data.resv_name_id;
            var hotel = data.hotel;
            var sql = "SELECT\n\t\t\tn.guest_name apellido,\n\t\t\tn.GUEST_FIRST_NAME nombre,\n\t\t\tn.address1||n.address2 direccion,\n\t\t\tn.country_desc pais,\n\t\t\tn.city ciudad,\n\t\t\tn.phone_no telefono,\n\t\t\tn.email email,\n\t\t\tn.rg_udfc05 patente,\n\t\t\tn.tax1_no cedula,\n\t\t\tn.passport pasaporte,\n\t\t\tn.group_name grupo,\n\t\t\tn.adults+n.children guest_number,\n\t\t\tn.room room,\n\t\t\tn.group_name,\n      \t\tn.guest_name_id,\n\t\t\tn.my_room_rate,\n\t\t\tNVL(actual_check_in_date,arrival) check_in,\n\t\t\tNVL(actual_check_out_date,departure) check_out,\n\t\t\tn.room_category_label,\n\t\t\tn.rate_code,\n\t\t\tCASE when n.travel_agent_name is not null then n.travel_agent_name\n\t\t\twhen n.company_name is not null then n.company_name\n\t\t\twhen (n.travel_agent_name IS NULL AND n.company_name IS NULL) THEN 'Particular'\n\t\t\tEND travel_agent_name,\n\t\t\tn.room_class,\n\t\t\tn.share_amount\n\t\t\tFROM name_reservation n\n\t\t\tWHERE n.resv_name_id = :resv_name_id";
            oracleCn.open(sql, [resv_id,], false)
                .then(function (resp) {
                console.log("titular data:", resp);
                resolve(resp);
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    getGuest: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_id = data.resv_name_id;
            var hotel = data.hotel;
            var sql = "SELECT \n\t\t\tv.children,\n\t\t\tv.adults,\n\t\t\tv.rg_udfc01,\n\t\t\tv.nights nights\n\t\t\tFROM name_reservation v\n\t\t\tWHERE resv_name_id = :resv_id\n\t\t\tAND RESORT = :pin_resort";
            oracleCn.open(sql, [resv_id, hotel], false)
                .then(function (data) {
                console.log("getGuest data:", data);
                var nights = 0;
                if (data[0].NIGHTS != undefined) {
                    nights = data[0].NIGHTS;
                }
                var children = data[0].CHILDREN;
                var adults = data[0].ADULTS;
                var status = data[0].ADULTS;
                var numGuests = parseInt(children) + parseInt(adults);
                var arrayConstruct = [];
                for (var i = 0; i < numGuests; ++i) {
                    var type = "ACOMPANANTE";
                    if (i == 0) {
                        type = "TITULAR";
                    }
                    var array = {
                        "resv_name_id": "",
                        "parent_resv_name_id": "",
                        "confirmation_no": "",
                        "name_id": "",
                        "firstName": "",
                        "arrival_date_time": "",
                        "departure_date_time": "",
                        "type": type
                    };
                    arrayConstruct.push(array);
                    if (i === (numGuests - 1)) {
                        var response = {
                            guests: arrayConstruct,
                            nights: nights,
                            status: status
                        };
                        resolve(response);
                    }
                }
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    getNights: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_id = data.resv_name_id;
            var hotel = data.hotel;
            var sql = "SELECT\n\t\t\tn.nights nights\n\t\t\tFROM name_reservation n\n\t\t\tWHERE n.resv_name_id = :resv_id\n\t\t\tAND RESORT = :hotel";
            oracleCn.open(sql, [resv_id, hotel], false)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    saveCheckIn: function (data) {
        return new Promise(function (resolve, reject) {
            var response = {
                guests: [],
                titular: {}
            };
            var titularPic = data.titularPic;
            var guestPic = data.guestPic;
            var hotel = data.hotel;
            var base64 = data.base64;
            var guests = data.dataCheck.guest; // all guests array
            var titular = data.dataCheck; // all guests array
            console.log("titular->", titular);
            console.log("guests->", guests);
            // console.log("base64->",base64);
            var pin_nombre = titular.first;
            var pin_apellido = titular.last;
            var dateSub = new Date(titular.birth_date);
            var pin_birthdate = dateSub.toISOString().slice(0, 10).replace(/-/g, "-");
            var pin_gender = titular.gender;
            var pin_nationality = titular.nationality;
            var id_place = titular.id_place;
            var id_type = titular.id_type;
            var pin_passport = titular.passport;
            var id_date = titular.id_date;
            var tax1_no = titular.tax1_no;
            var name_id = titular.name_id;
            var pin_resv_name_id = titular.resv_name_id;
            var type = "";
            /*if (base64 != null && base64 != undefined && base64 != "") {
                console.log("sendFaceDoc");
                // extr.sendFaceDoc(base64, pin_resv_name_id, hotel);
            }*/
            if (titularPic != undefined && titularPic != "") {
                var res = titularPic.split(";");
                res = res[0].split("/");
                type = res[1];
                if (type == "jpeg") {
                    type = "jpg";
                }
                var imagenTitular = titularPic;
                var dataImg = imagenTitular.replace(/^data:image\/\w+;base64,/, '');
            }
            var nameFileTitular = "DocId-" + name_id + "." + type;
            var pin_documento = titular.tax1_no;
            var pin_nombre_archivo = null;
            if (titularPic != undefined && titularPic != "") {
                pin_nombre_archivo = nameFileTitular;
            }
            var sql = "BEGIN pa_web.prc_act_name_titular(\n\t\t\t:pin_resv_name_id,\n\t\t\t:pin_user,\n\t\t\t:pin_nombre,\n\t\t\t:pin_apellido,\n\t\t\t:pin_nationality,\n\t\t\t:pin_language,\n\t\t\t:pin_name_type,\n\t\t\t:pin_summ,\n\t\t\t:pin_gender,\n\t\t\t:pin_resort,\n\t\t\t:pin_passport,\n\t\t\t:pin_birth_place,\n\t\t\tTO_DATE(:pin_birthdate, 'yy-mm-dd'),\n\t\t\t:pin_documento,\n\t\t\t:pin_nombre_archivo,\n\t\t\t:pout_message); END;";
            var pin_user = 2;
            var pin_language = "ES";
            var pin_name_type = "D";
            var pin_summ = "CLP";
            var pin_resort = hotel;
            var pin_birth_place = "";
            var pin_city = "";
            var pin_country = "";
            var pin_address = "";
            oracleCn.openProcedure(sql, {
                pin_resv_name_id: pin_resv_name_id,
                pin_user: pin_user,
                pin_nombre: pin_nombre,
                pin_apellido: pin_apellido,
                pin_nationality: pin_nationality,
                pin_language: pin_language,
                pin_name_type: pin_name_type,
                pin_summ: pin_summ,
                pin_gender: pin_gender,
                pin_resort: pin_resort,
                pin_passport: pin_passport,
                pin_birth_place: pin_birth_place,
                pin_birthdate: pin_birthdate,
                pin_documento: pin_documento,
                pin_nombre_archivo: pin_nombre_archivo,
                pout_message: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 }
            }, false)
                .then(function (data) {
                var tirularResp = data.outBinds;
                var guestData = [];
                response.titular = {
                    tirularResp: tirularResp,
                    name_id: titular.name_id
                };
                console.log("guests.length:", guests.length);
                if (guests != undefined && guests.length > 0) {
                    for (var i = 0; i < guests.length; ++i) {
                        var pin_nombre = guests[i].first;
                        var pin_apellido = guests[i].last;
                        // var dateSub = new Date(guests[i].birth_date);
                        // var pin_birthdate = dateSub.toISOString().slice(0,10).replace(/-/g,"-");
                        // var pin_gender = guests[i].gender;
                        // var pin_nationality = guests[i].nationality;
                        var pin_passport = "";
                        if (guests[i].passport != undefined && guests[i].passport != "") {
                            pin_passport = guests[i].passport;
                        }
                        var pin_resv_name_id = titular.resv_name_id;
                        var pin_user = 2;
                        var pin_language = "ES";
                        var pin_name_type = "D";
                        var pin_summ = "CLP";
                        var pin_resort = hotel;
                        var pin_birth_place = "";
                        var pin_city = "";
                        var pin_country = "";
                        var pin_address = "";
                        var pin_documento = "";
                        if (guests[i].tax1_no != undefined && guests[i].tax1_no != "") {
                            pin_documento = guests[i].tax1_no;
                        }
                        else if (pin_passport != undefined && pin_passport != "") {
                            pin_documento = pin_passport;
                        }
                        pin_country = guests[i].id_place;
                        var pout_name_id = "";
                        var pout_message = "";
                        guestData.push({
                            pin_user: pin_user,
                            pin_nombre: pin_nombre,
                            pin_apellido: pin_apellido,
                            pin_name_type: pin_name_type,
                            pin_summ: pin_summ,
                            pin_resort: pin_resort,
                            pin_resv_name_id: parseInt(pin_resv_name_id),
                            pin_documento: pin_documento,
                            pin_file_name: "testing"
                        });
                        if (i === (guests.length - 1)) {
                            var sqlGuest = "BEGIN pa_web.pro_ins_acomp_short (\n\t\t\t\t\t\t\t:pin_user,\n\t\t\t\t\t\t\t:pin_nombre,\n\t\t\t\t\t\t\t:pin_apellido,\n\t\t\t\t\t\t\t:pin_name_type,\n\t\t\t\t\t\t\t:pin_summ,\n\t\t\t\t\t\t\t:pin_resort,\n\t\t\t\t\t\t\t:pin_resv_name_id,\n\t\t\t\t\t\t\t:pin_file_name,\n\t\t\t\t\t\t\t:pin_documento,\n\t\t\t\t\t\t\t:pout_name_id,\n\t\t\t\t\t\t\t:pout_message); END;";
                            var options = {
                                autoCommit: true,
                                bindDefs: {
                                    pin_user: { type: objoracle.NUMBER },
                                    pin_nombre: { type: objoracle.STRING, maxSize: 200 },
                                    pin_apellido: { type: objoracle.STRING, maxSize: 200 },
                                    pin_name_type: { type: objoracle.STRING, maxSize: 200 },
                                    pin_summ: { type: objoracle.STRING, maxSize: 200 },
                                    pin_resort: { type: objoracle.STRING, maxSize: 200 },
                                    pin_resv_name_id: { type: objoracle.NUMBER },
                                    pin_file_name: { type: objoracle.STRING, maxSize: 200 },
                                    pin_documento: { type: objoracle.STRING, maxSize: 200 },
                                    pout_name_id: { dir: objoracle.BIND_OUT, type: objoracle.NUMBER },
                                    pout_message: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 }
                                }
                            };
                            oracleCn.openProcedureMany(sqlGuest, guestData, options)
                                .then(function (data) {
                                response.guests = data.outBinds;
                                console.log("response:", response);
                                if (titularPic != undefined) {
                                    extr.setPicFromBase64(titularPic, response, hotel);
                                }
                                resolve(response);
                            })
                                .catch(function (err) {
                                var error = { find: "error prc_ins_acom", error: err };
                                console.log("error:", err);
                                reject(error);
                            });
                        }
                    }
                }
                else {
                    if (titularPic != undefined) {
                        extr.setPicFromBase64(titularPic, response, hotel);
                    }
                    resolve(response);
                }
            })
                .catch(function (err) {
                console.log("error:", err);
                var error = { find: "error prc_act_name_titular", error: err };
                reject(error);
            });
        });
    },
    getDeuda: function (data) {
        return new Promise(function (resolve, reject) {
            var pin_resv_name_id = data.resv_name_id;
            console.log(data);
            var sql = "BEGIN pa_web.prc_calcular_deuda_check_in (\n            :pin_resv_name_id,\n            :pout_monto,\n            :pout_msg); END;";
            oracleCn.openProcedure(sql, {
                pin_resv_name_id: pin_resv_name_id,
                pout_monto: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 },
                pout_msg: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 }
            }, false)
                .then(function (data) {
                console.log("getDeuda:", data);
                resolve(data.outBinds);
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    getAdditional: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_name_id = parseInt(data.resvNameId);
            var hotel = data.hotel;
            var currency = data.currency;
            console.log(data);
            var sql = "";
            if (currency == "CLP") {
                sql = "SELECT rrpp.resort,p.product,description,ppr.trx_code,rrpp.price,description|| ' + ' ||rrpp.price || ' p/p' nombre_web\n                FROM products p,product_posting_rules ppr,\n                RESORT_RATE_PRODUCT_PRICES rrpp\n                WHERE p.product IN ('MUSEOCOL','CENACOLCHAGUA','DESAEJE','DESACAMP','RUTAMUSEOS')\n                AND p.product = ppr.product\n                AND rrpp.product = p.product\n                AND rrpp.product = ppr.product\n                AND rrpp.resort = :hotel\n                AND TRUNC(SYSDATE) BETWEEN begin_date and end_date";
            }
            else if (currency == "USD") {
                sql = "SELECT rrpp.resort,p.product,description,ppr.trx_code,rrpp.price,description|| ' + ' ||rrpp.price || ' p/p' nombre_web\n                FROM products p,product_posting_rules ppr,\n                RESORT_RATE_PRODUCT_PRICES rrpp\n                WHERE p.product IN ('MUSEOCOLUSD','CENACOLUSD','DESAEJEUSD','DESACAMPUSD','PACKMUSEOS')\n                AND p.product = ppr.product\n                AND rrpp.product = p.product\n                AND rrpp.product = ppr.product\n                AND rrpp.resort = :resort\n                AND rrpp.price > 0 \n                AND TRUNC(SYSDATE) BETWEEN begin_date and end_date";
            }
            else {
                sql = "SELECT rrpp.resort,p.product,description,ppr.trx_code,rrpp.price,description|| ' + ' ||rrpp.price || ' p/p' nombre_web\n                FROM products p,product_posting_rules ppr,\n                RESORT_RATE_PRODUCT_PRICES rrpp\n                WHERE p.product IN ('MUSEOCOL','CENACOLCHAGUA','DESAEJE','DESACAMP','RUTAMUSEOS')\n                AND p.product = ppr.product\n                AND rrpp.product = p.product\n                AND rrpp.product = ppr.product\n                AND rrpp.resort = :hotel\n                AND TRUNC(SYSDATE) BETWEEN begin_date and end_date";
            }
            oracleCn.open(sql, [hotel], false)
                .then(function (dataRes) {
                console.log(dataRes);
                resolve(dataRes);
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    getDataPdfSing: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_name_id = parseInt(data.resvNameId);
            console.log(data);
            var sql = "SELECT\n    \t\tn.guest_name apellido,\n    \t\tn.GUEST_FIRST_NAME nombre,\n    \t\tn.address1||n.address2 direccion,\n    \t\tn.country_desc pais,\n    \t\tn.city ciudad,\n    \t\tn.phone_no telefono,\n    \t\tn.email email,\n    \t\tn.rg_udfc05 patente,\n    \t\tn.tax1_no cedula,\n    \t\tn.passport pasaporte,\n    \t\tn.group_name grupo,\n    \t\tn.adults+n.children guest_number,\n    \t\tn.room room,\n    \t\tn.group_name,\n    \t\tNVL(actual_check_in_date,arrival) check_in,\n    \t\tNVL(actual_check_out_date,departure) check_out,\n    \t\tn.room_category_label,\n    \t\tn.rate_code,\n    \t\tCASE when n.travel_agent_name is not null then n.travel_agent_name\n    \t\twhen n.company_name is not null then n.company_name\n    \t\twhen (n.travel_agent_name IS NULL AND n.company_name IS NULL) THEN 'Particular'\n    \t\tEND travel_agent_name,\n    \t\tn.room_class,\n    \t\tn.share_amount\n    \t\tFROM name_reservation n\n    \t\tWHERE n.resv_name_id = :resv_name_id";
            oracleCn.open(sql, [resv_name_id], false)
                .then(function (dataRes) {
                console.log(dataRes);
                // resolve(dataRes[0]);
                var resvNameId = parseInt(data.resvNameId);
                var hotel = data.hotel;
                var rate_code = dataRes[0].RATE_CODE;
                var agent_name = dataRes[0].TRAVEL_AGENT_NAME;
                var arrival = new Date(dataRes[0].CHECK_IN);
                var dayarrival = arrival.getDay();
                var agency = dataRes[0].TRAVEL_AGENT_NAME;
                var room_class = dataRes[0].ROOM_CLASS;
                var amount = dataRes[0].SHARE_AMOUNT;
                var dataSend = {
                    agent_name: agent_name,
                    rate_code: rate_code,
                    hotel: hotel,
                    resvNameId: resvNameId,
                    dayarrival: dayarrival,
                    agency: agency,
                    room_class: room_class,
                    amount: amount
                };
                console.log("agencia:", agency);
                resolve({ perfil: dataRes[0] });
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    details: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_name_id = parseInt(data.resvNameId);
            console.log(data);
            var sql = "SELECT\n            n.guest_name apellido,\n            n.GUEST_FIRST_NAME nombre,\n            n.address1||n.address2 direccion,\n            n.country_desc pais,\n            n.city ciudad,\n            n.phone_no telefono,\n            n.email email,\n            n.rg_udfc05 patente,\n            n.tax1_no cedula,\n            n.passport pasaporte,\n            n.group_name grupo,\n            n.adults+n.children guest_number,\n            n.room room,\n            n.group_name,\n            NVL(actual_check_in_date,arrival) check_in,\n            NVL(actual_check_out_date,departure) check_out,\n            n.room_category_label,\n            DECODE (n.room_class,'STD','Estandar'\n            ,'JST','Junior Suite'\n            ,'SUT','Suite'\n            ,'SUTS','Suite Superior'\n            ,'SUTP','Suite Presidencial') room_clase,\n            n.room_class,\n            (SELECT decode(feature,'CASI','CASINO'\n            ,'MUSE','MUSEO'\n            ,'VINSI''VISTA INTERIOR'\n            ,'LSQU','PLAZA DE ARMAS')\n            FROM room_feature f\n            WHERE f.room = n.room) zona,\n            n.share_amount,\n            n.share_amount - n.my_room_rate diference\n            FROM name_reservation n\n            WHERE n.resv_name_id = :resv_name_id";
            var sql2 = "SELECT (SELECT description \n            FROM products\n            WHERE product = r.product)PRODUCT, (price * quantity) total, quantity\n            FROM reservation_product_prices r\n            WHERE r.resv_name_id = :resv_name_id\n            GROUP BY PRODUCT,(price * quantity), quantity";
            oracleCn.open(sql, [resv_name_id], false)
                .then(function (dataRes) {
                console.log(dataRes);
                oracleCn.open(sql2, [resv_name_id], false)
                    .then(function (dataResPrd) {
                    console.log(dataResPrd);
                    var data = fileS.readFileSync('/home/administrador/frenonApi/pdf/Pdf-' + resv_name_id + '.pdf');
                    // var data = fileS.readFileSync('C:/Users/Jona/Documents/trabajo/frenon devs/frenonApi/pdf/Pdf-11164.pdf');
                    resolve({ perfil: dataRes[0], products: dataResPrd, pdf: data });
                })
                    .catch(function (err) {
                    console.log("error:", err);
                    reject(err);
                });
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
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
    getDataPdf: function (data) {
        return new Promise(function (resolve, reject) {
            var resv_name_id = parseInt(data.resvNameId);
            console.log(data);
            var sql = "SELECT\n    \t\tn.guest_name apellido,\n    \t\tn.GUEST_FIRST_NAME nombre,\n    \t\tn.address1||n.address2 direccion,\n    \t\tn.country_desc pais,\n    \t\tn.city ciudad,\n    \t\tn.phone_no telefono,\n    \t\tn.email email,\n    \t\tn.rg_udfc05 patente,\n    \t\tn.tax1_no cedula,\n    \t\tn.passport pasaporte,\n    \t\tn.group_name grupo,\n    \t\tn.adults+n.children guest_number,\n    \t\tn.room room,\n    \t\tn.group_name,\n    \t\tn.my_room_rate,\n    \t\tn.currency_code,\n    \t\tNVL(actual_check_in_date,arrival) check_in,\n    \t\tNVL(actual_check_out_date,departure) check_out,\n    \t\tn.room_category_label,\n    \t\tn.rate_code,\n    \t\tCASE when n.travel_agent_name is not null then n.travel_agent_name\n    \t\twhen n.company_name is not null then n.company_name\n    \t\twhen (n.travel_agent_name IS NULL AND n.company_name IS NULL) THEN 'Particular'\n    \t\tEND travel_agent_name,\n    \t\tn.room_class,\n    \t\tn.share_amount\n    \t\tFROM name_reservation n\n    \t\tWHERE n.resv_name_id = :resv_name_id";
            oracleCn.open(sql, [resv_name_id], false)
                .then(function (dataRes) {
                console.log(dataRes);
                // resolve(dataRes[0]);
                var resvNameId = parseInt(data.resvNameId);
                var hotel = data.hotel;
                var rate_code = dataRes[0].RATE_CODE;
                var agent_name = dataRes[0].TRAVEL_AGENT_NAME;
                var arrival = new Date(dataRes[0].CHECK_IN);
                var dayarrival = arrival.getDay();
                var agency = dataRes[0].TRAVEL_AGENT_NAME;
                var room_class = dataRes[0].ROOM_CLASS;
                var amount = dataRes[0].SHARE_AMOUNT;
                var dataSend = {
                    agent_name: agent_name,
                    rate_code: rate_code,
                    hotel: hotel,
                    resvNameId: resvNameId,
                    dayarrival: dayarrival,
                    agency: agency,
                    room_class: room_class,
                    amount: amount
                };
                console.log("agencia:", agency);
                if (agency != "" && agency != null) {
                    console.log("with agency");
                    module.exports.getRates(dataSend)
                        .then(function (respRate) {
                        console.log("respRate:", respRate);
                        resolve({ perfil: dataRes[0], rates: respRate });
                    })
                        .catch(function (err) {
                        console.log("error:", err);
                        resolve({ perfil: dataRes[0] });
                    });
                }
                else {
                    console.log("Without agency");
                    module.exports.getRatesWithoutAgency(dataSend)
                        .then(function (respRate) {
                        // console.log(respRate);
                        resolve({ perfil: dataRes[0], rates: respRate });
                    })
                        .catch(function (err) {
                        console.log("error:", err);
                        resolve({ perfil: dataRes[0] });
                    });
                }
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
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
                sql = "SELECT * FROM (SELECT amount_1,cat_pkg_price_code \n    \t\t\tFROM RATE_SET \n    \t\t\tWHERE resort = :hotel\n    \t\t\tAND amount_1 > 0\n    \t\t\tAND rate_code IN ('WALKIN CLP','DIRECTO USD',\n    \t\t\t'DIRECTOSDUSD','WALKIN USD','WALKINSDCLP',\n    \t\t\t'WALKINSDUSD','DIRECTO CLP','DIRECTOSDCLP')\n    \t\t\tAND rate_code IN (:rate_code) \n    \t\t\tAND cat_pkg_price_code <> (:room_class) \n    \t\t\tAND amount_1 > :amount\n    \t\t\tAND \" + varDay + \" = 'Y'\n    \t\t\torder by amount_1) \n    \t\t\tWHERE rownum <=1";
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
                sql = "SELECT * FROM (SELECT amount_1,cat_pkg_price_code \n    \t\t\tFROM RATE_SET \n    \t\t\tWHERE resort = :hotel\n    \t\t\tAND amount_1 > 0\n    \t\t\tAND rate_code IN ('WALKIN CLP','DIRECTO USD',\n    \t\t\t'DIRECTOSDUSD','WALKIN USD','WALKINSDCLP',\n    \t\t\t'WALKINSDUSD','DIRECTO CLP','DIRECTOSDCLP')\n    \t\t\tAND rate_code IN (:rate_code) \n    \t\t\tAND cat_pkg_price_code <> (:room_class) \n    \t\t\tAND amount_1 > :amount\n    \t\t\tAND \" + varDay + \" = 'Y'\n    \t\t\torder by amount_1) \n\t\t\t\tWHERE rownum <=1";
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
    getNationality: function (data) {
        return new Promise(function (resolve, reject) {
            var dateCheck = data.dateCheck;
            var hotel = data.hotel;
            var sql = "SELECT attribute_code, description\n    \t\tFROM entity_detail e\n    \t\tWHERE e.entity_name = 'NATIONALITY'\n    \t\tORDER BY description";
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
    getPriceUpgrade: function (data) {
        return new Promise(function (resolve, reject) {
            var originalAmount = data.originalAmount;
            var travelAgent = data.travelAgent;
            var rateCode = data.rateCode;
            var hotel = data.hotel;
            console.log("getPriceUpgrade:", data);
            var sql = "";
            var sql_params = [];
            sql = "SELECT * FROM (SELECT NV.DISPLAY_NAME,\n    \t\tRNV.RATE_CODE,\n    \t\trsv.ROOM_TYPES,\n    \t\trsv.BEGIN_DATE,\n    \t\trsv.END_DATE,\n    \t\trsv.AMOUNT_1,\n    \t\trsv.AMOUNT_2,\n    \t\trsv.AMOUNT_1 - :originalAmount diferencia,\n    \t\trhv.currency_code\n    \t\tFROM RATE_HEADER_NEGOTIAT_BASE_VIEW RNV,\n    \t\tNAME_VIEW NV,\n    \t\tRATE_SET_VIEW  rsv,\n    \t\trate_header_view rhv\n    \t\tWHERE RNV.NAME_ID = NV.NAME_ID\n    \t\tAND rnv.RESORT = :hotel\n    \t\tAND rhv.RESORT = :hotel\n    \t\tAND rsv.RESORT = :hotel\n    \t\tAND rnv.RATE_CODE = rsv.RATE_CODE\n    \t\tand rhv.RATE_CODE = rsv.RATE_CODE\n    \t\tand rhv.rate_code = rnv.RATE_CODE\n    \t\tand rsv.room_types <> 'TRPL'\n    \t\tand amount_1 > :originalAmount\n    \t\tand NV.DISPLAY_NAME = :travelAgent\n    \t\tand RNV.RATE_CODE = :rateCode\n    \t\tand TRUNC(SYSDATE) BETWEEN  rsv.BEGIN_DATE AND rsv.END_DATE\n    \t\tAND DAY1 = 'Y'\n    \t\tORDER BY amount_1)\n    \t\tWHERE rownum <= 1";
            sql = "SELECT * FROM (SELECT NV.DISPLAY_NAME,\n    \t\tRNV.RATE_CODE,\n    \t\trsv.ROOM_TYPES,\n    \t\trsv.BEGIN_DATE,\n    \t\trsv.END_DATE,\n    \t\trsv.AMOUNT_1,\n    \t\trsv.AMOUNT_2,\n    \t\trsv.AMOUNT_1 - :originalAmount diferencia,                  \n    \t\tCASE\n    \t\tWHEN INSTR(TRIM(rsv.room_types),'STWS') > 0 THEN 'Junior Suite'\n    \t\tWHEN INSTR(TRIM(rsv.room_types),'STWN') > 0 THEN 'Junior Suite'\n    \t\tWHEN INSTR(TRIM(rsv.room_types),'STKG') > 0 THEN 'Junior Suite' \n    \t\tWHEN INSTR(TRIM(rsv.room_types),'STNS') > 0 THEN 'Suite' \n    \t\tWHEN INSTR(TRIM(rsv.room_types),'STNT') > 0 THEN 'Suite' \n    \t\tWHEN INSTR(TRIM(rsv.room_types),'STSM') > 0 THEN 'Suite Superior'\n    \t\tWHEN INSTR(TRIM(rsv.room_types),'STST') > 0 THEN 'Suite Superior'\n    \t\tWHEN INSTR(TRIM(rsv.room_types),'STPR') > 0 THEN 'Suite Presidencial'\n    \t\tEND room_class,\n    \t\trhv.currency_code\n    \t\tFROM RATE_HEADER_NEGOTIAT_BASE_VIEW RNV,\n    \t\tNAME_VIEW NV,\n    \t\tRATE_SET_VIEW  rsv,\n    \t\trate_header_view rhv\n    \t\tWHERE RNV.NAME_ID = NV.NAME_ID\n    \t\tAND rnv.RESORT = :hotel\n    \t\tAND rhv.RESORT = :hotel\n    \t\tAND rsv.RESORT = :hotel\n    \t\tAND rnv.RATE_CODE = rsv.RATE_CODE\n    \t\tand rhv.RATE_CODE = rsv.RATE_CODE\n    \t\tand rhv.rate_code = rnv.RATE_CODE\n    \t\tand rsv.room_types <> 'TRPL'\n    \t\tand amount_1 > :originalAmount\n    \t\tand NV.DISPLAY_NAME = :travelAgent\n    \t\tand RNV.RATE_CODE = :rateCode\n    \t\tand TRUNC(SYSDATE) BETWEEN  rsv.BEGIN_DATE AND rsv.END_DATE\n    \t\tAND DAY1 = 'Y'\n    \t\tORDER BY amount_1)\n\t\t\tWHERE rownum <= 1";
            sql_params = [originalAmount, hotel, hotel, hotel, originalAmount, travelAgent, rateCode];
            oracleCn.open(sql, sql_params, false)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    },
};
