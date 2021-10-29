"use strict";
var jwt = require('jsonwebtoken');
var config = require('../config');
var mysqlCn = require("../mysqlConnection");
var oracleCn = require("../connection");
var cryptService = require('../services/crypt.service');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'check-in@hscp.cl',
        pass: 'hscp286!.,'
    },
    tls: {
        rejectUnauthorized: false
    },
    logger: false,
    debug: false // include SMTP traffic in the logs
});
var Cryptr = require('cryptr');
var cryptr = new Cryptr('Qn8zjsPJfrenon');
module.exports = {
    sendEmail: function (data) {
        return new Promise(function (resolve, reject) {
            console.log("datas:", data);
            var dateSearch = data.dateSearch;
            var resv_name_id = data.resv_name_id;
            var hotel = data.hotel;
            var sql = "SELECT \n\t\t\tCONFIRMATION_NO confirmation_no,\n\t\t\tRESV_NAME_ID resv_name_id,\n\t\t\tNAME_ID name_id,\n\t\t\tEMAIL email,\n\t\t\tGUEST_FIRST_NAME nameTitular,\n\t\t\tGUEST_NAME lastNameTitular\n\t\t\tfrom name_reservation\n\t\t\twhere arrival = TO_DATE(:dateSearch, 'dd-mm-yy')\n\t\t\tAND RESV_NAME_ID = :resv_name_id\n\t\t\tAND RESORT = :hotel";
            oracleCn.open(sql, [dateSearch, resv_name_id, hotel], false)
                .then(function (data) {
                console.log("sendEmail:", data);
                // resolve(data);
                var dataToSend = {
                    data: data,
                    // functions:"getHuespedFromArrival2",
                    hotel: hotel
                };
                module.exports.sendCheckIn(dataToSend)
                    .then(function (resp) {
                    resolve(resp);
                })
                    .catch(function (error) {
                    reject(error);
                });
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    sendEmailTest: function (data) {
        return new Promise(function (resolve, reject) {
            console.log("datas:", data);
            // var dateSearch = data.dateSearch;
            var resv_name_id = String(data.resvName);
            var hotel = "HTSCR";
            var sql = "SELECT\n\t\t\tinsert_date,\n\t\t\tresv_status,\n\t\t\tarrival,\n\t\t\tCONFIRMATION_NO confirmation_no,\n\t\t\tRESV_NAME_ID resv_name_id ,\n\t\t\tNAME_ID name_id,\n\t\t\tEMAIL CORREO ,\n\t\t\tGUEST_FIRST_NAME nameTitular ,\n\t\t\tGUEST_NAME lastNameTitular\n\t\t\tFROM name_reservation\n\t\t\tWHERE resort = :pin_resort\n\t\t\tAND resv_name_id = :pin_resv_name_id";
            // oracleCn.open(sql, [dateSearch, resv_name_id, hotel], false)
            oracleCn.open(sql, [hotel, resv_name_id], false)
                .then(function (reps) {
                console.log("sendEmail:", reps);
                reps = reps[0];
                console.log("Email:", String(reps.CORREO));
                // CONFIRMATION_NO: '46440',
                module.exports.sendEmailSending(reps.NAME_ID, reps.NAMETITULAR, reps.LASTNAMETITULAR, reps.CORREO, reps.RESV_NAME_ID, "HTSCR")
                    .then(function (resp) {
                    resolve(resp);
                })
                    .catch(function (error) {
                    reject(error);
                });
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    sendEmailSending: function (name_id, name, lastName, email, resv_name_id, hotel) {
        if (name_id === void 0) {
            name_id = '';
        }
        if (name === void 0) {
            name = '';
        }
        if (lastName === void 0) {
            lastName = '';
        }
        if (email === void 0) {
            email = '';
        }
        if (resv_name_id === void 0) {
            resv_name_id = '';
        }
        if (hotel === void 0) {
            hotel = "";
        }
        return new Promise(function (resolve, reject) {
            var encryptedData = "";
            cryptService.encrypt({ encryptData: resv_name_id + "/" + hotel })
                .then(function (respEncryt) {
                console.log("respEncryt:", respEncryt);
                encryptedData = respEncryt.data;
                var urlBtn = "https://checkin.hscp.cl/check-in/" + encryptedData;
                // var hotel = "HTGLR";
                var title = "Santa Cruz";
                var logo = "https://checkin.hscp.cl/logosanta.png";
                if (hotel == "HTGLR") {
                    logo = "https://checkin.hscp.cl/logosanta.png";
                    title = "Hotel Santa Cruz";
                }
                else {
                    logo = "https://checkin.hscp.cl/logosanta.png";
                    title = "Hotel Santa Cruz";
                }
                var messageHtml = "<!doctype html><html lang='es'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'><title></title><style type='text/css'>table{width:750px;font-family:'HelveticaNeue-Light','Helvetica Neue Light','Helvetica Neue',Helvetica,Arial,'Lucida Grande',sans-serif;font-size:20px;border-spacing:inherit}.td1{height:160px;background-color:#231c1d;text-align:center}.td2{color:#fff;text-align:center;width:100%;height:500px;background-image:url('https://checkin.hscp.cl/fondosanta.png')}.p1{color:#fff;font-size:32px;line-height:7px}.p2{color:#fff;line-height:0px;font-size:32px}.p3{font-size:32px}.myButton{background:linear-gradient(to bottom, #cf7c23 5%, #cf7c23 100%);background-color:#cf7c23;border-radius:15px;border:1px solid #cf7c23;display:inline-block;cursor:pointer;color:#fff;font-family:'HelveticaNeue-Light','Helvetica Neue Light','Helvetica Neue',Helvetica,Arial,'Lucida Grande',sans-serif;font-size:32px!important;padding:16px 31px;text-decoration:none;text-shadow:0px 1px 0px #2f6627}.myButton:hover{background:linear-gradient(to bottom, #000 5%, #000 100%);background-color:#000;border-color:#000}.myButton:active{position:relative;top:1px}.td3{background-color:#fff;height:400px}.p2{}.p2{}</style></head><body><table><tbody><tr><td class='td1'> <img src='" + logo + "' class='mx-auto d-block'></td></tr><tr><td class='td2'><p class='p1'>Hola " + name + " " + lastName + "</p><p class='p2'>Bienvenido a " + title + "</p> <img src='https://checkin.hscp.cl/line_santa.png'> <br> <br><p class='p3'> Realiza tu <a href='" + urlBtn + "' class='myButton'>> Check In</a></p></td></tr><tr><td class='td3'><table style='width:100%' ><tbody><tr><td style='text-align: center; width: 50%'> <img src='https://checkin.hscp.cl/grupoimagensanta.png'></td><td style='text-align: left; width: 50%'> <img src='https://checkin.hscp.cl/line_santa.png'><h2>HOTEL<br> SANTA CRUZ</h2><p>Contacto: <span style='color:#cf7c23'>+56 72 220 9600</span><br> Ubicaci&oacute;n: <span style='color:#cf7c23'>Plaza De Armas 286, Santa Cruz. Chile.</span><br> Correo: <span style='color:#cf7c23'>reservas@hscp.cl</span></p><p>&rarr; VISITA NUESTRO <span style='color:#cf7c23'><a href='https://www.hotelsantacruzplaza.cl'>SITIO WEB</a></span></p></td></tr></tbody></table></td></tr><tr><td style='font-size:12px;background-color: #000000;color:#fff;height: 250px;text-align: center;'> <img src='https://checkin.hscp.cl/fb.png' style='width: 45px;'><img src='https://checkin.hscp.cl/in.png' style='width: 45px;'><img src='https://checkin.hscp.cl/hoo.png' style='width: 45px;'><img src='https://checkin.hscp.cl/pin.png' style='width: 45px;'><p>2020 &copy; Hotel Santa Cruz, Hotel y Centro de Convenciones.</p></td></tr></tbody></table></body></html>";
                var mailOptions = {
                    from: 'admin@frenon.com',
                    to: email,
                    subject: "Bienvenido/a",
                    html: messageHtml
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        console.log('mailOptions' + mailOptions);
                        reject({ status: error, mailOptions: mailOptions });
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                        resolve({ status: info.response });
                    }
                });
            })
                .catch(function (error) {
                reject(error);
            });
        });
    },
};
