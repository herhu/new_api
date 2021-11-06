"use strict";
var fileS = require('fs');
var pdf = require('phantom-html2pdf');
var oracleCn = require("../connection");
var objoracle = require("oracledb");
var mysqlCn = require("../mysqlConnection");
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
var pathLb = require('path');
var sendFileUrl = "http://181.212.30.93:3000/fileUploadFaceDoc";
var filePdf = "http://181.212.30.93:3000/filePdf";
module.exports = {
    sendFaceDoc: function (base64, nameId, hotel) {
        console.log("length:", base64.length);
        var files = [];
        if (base64.length > 0) {
            var nameIdTitular = base64[0].name_id;
            for (var i = 0; i < base64.length; ++i) {
                if (base64[i].base64 != "") {
                    var base64String = base64[i].base64;
                    var nameIdFile = base64[i].name_id;
                    console.log("base64:", i, base64[i].name_id);
                    if (nameIdFile == null || nameIdFile == "") {
                        nameIdFile = (nameIdTitular * 10000) + i;
                    }
                    // var path = 'imgDocs/frontDoc-'+nameIdFile+'.png';
                    var path = '/home/administrador/frenonApi/imgDocs/frontDoc-' + nameIdFile + '.png';
                    var nameFile = 'frontDoc-' + nameIdFile + '.png';
                    var base64Image = base64String.split(';base64,').pop();
                    files.push({ file: path, nameIdFile: nameIdFile });
                    fileS.writeFile(path, base64Image, { encoding: 'base64' }, function (err) {
                        console.log('File created');
                        console.log(nameFile);
                        console.log(nameIdFile);
                    });
                    module.exports.setPdfFront(nameFile, nameIdFile, "document_id", hotel);
                    if (i == (base64.length - 1)) {
                        setTimeout(function () { module.exports.senFiles(files); }, 1500);
                    }
                }
            }
        }
    },
    setPdfFront: function (name_file, name_id, type_doc, hotel) {
        if (name_file === void 0) {
            name_file = "magallanes.pdf";
        }
        if (name_id === void 0) {
            name_id = 235602;
        }
        if (type_doc === void 0) {
            type_doc = "Carta Registro";
        }
        var sql = "BEGIN pa_web.prc_attachment(\n        :pin_nombre_archivo,\n        :pin_tipo_doc,\n        :pin_link_type,\n        :pin_name_id,\n        :pin_resort,\n        :pin_directorio,\n        :pout_error);\n        END;";
        var pin_nombre_archivo = name_file;
        var pin_name_id = name_id;
        var pin_tipo_doc = type_doc;
        var pin_directorio = "ATTACHMENTS";
        var pin_resort = hotel;
        var pin_link_type = "CONTACT"; // account, contact, booking
        oracleCn.openProcedure(sql, {
            pin_nombre_archivo: pin_nombre_archivo,
            pin_tipo_doc: pin_tipo_doc,
            pin_link_type: pin_link_type,
            pin_name_id: pin_name_id,
            pin_resort: pin_resort,
            pin_directorio: pin_directorio,
            pout_error: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 }
        })
            .then(function (data) {
            console.log("success pdf to perfil:", data);
        })
            .catch(function (error) {
            console.log("error pdf to perfil:", error);
        });
    },
    senFiles: function (files) {
        var request = require('request');
        console.log(files);
        for (var i = 0; i < files.length; ++i) {
            var reqSend = request.post(sendFileUrl, function (err, resp, body) {
                if (err) {
                    console.log('Error sendFaceDoc!', err);
                }
                else {
                    console.log('uploades sendFaceDoc success: ' + body);
                }
            });
            var formSend = reqSend.form();
            formSend.append('filetoupload', fileS.createReadStream(files[i].file));
            formSend.append('nameID', files[i].nameIdFile);
        }
    },
    setPicFromBase64: function (titularPic, nameIds, hotel) {
        console.log("nameIds:", nameIds);
        var titular = nameIds.titular.name_id;
        var files = [];
        console.log("titular name id:", titular);
        var res = titularPic.split(";");
        res = res[0].split("/");
        var type = res[1];
        if (type == "jpeg") {
            type = "jpg";
        }
        var image = titularPic;
        var data = image.replace(/^data:image\/\w+;base64,/, '');
        var nameFileTitular = "DocId-" + titular + "." + type;
        // var pathtitular = "./docID/"+nameFileTitular;
        var pathtitular = "/home/ubuntu/serverAPI/dist/docID/" + nameFileTitular; // to path centos
        fileS.writeFile(pathtitular, data, { encoding: 'base64' }, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("succes copied img:", pathtitular);
                module.exports.sendFileImg(fileS.createReadStream(pathtitular));
                files.push({ path: pathtitular, nameId: titular, type: type });
            }
        });
    },
    sendFileImg: function (file) {
        var request = require('request');
        // var reqSend = request.post("http://104.41.25.129:3000/filePdf", 
        var reqSend = request.post(filePdf, function (err, resp, body) {
            if (err) {
                console.log('Error!', err);
            }
            else {
                console.log('uploades success: ' + body);
            }
        });
        var formSend = reqSend.form();
        formSend.append('filetoupload', file);
    },
    setPic: function (name_file, name_id, type_doc, hotel) {
        if (name_file === void 0) {
            name_file = "magallanes.jpg";
        }
        if (name_id === void 0) {
            name_id = 235602;
        }
        if (type_doc === void 0) {
            type_doc = "PASSPORT";
        }
        if (hotel === void 0) {
            hotel = "";
        }
        return new Promise(function (resolve, reject) {
            var sql = "BEGIN pa_web.prc_attachment(\n            :pin_nombre_archivo,\n            :pin_tipo_doc,\n            :pin_link_type,\n            :pin_name_id,\n            :pin_resort,\n            :pin_directorio,\n            :pout_error\n            ); END;";
            var pin_nombre_archivo = name_file;
            var pin_name_id = name_id;
            var pin_tipo_doc = type_doc;
            var pin_directorio = "ATTACHMENTS";
            var pin_resort = hotel;
            var pin_link_type = "CONTACT"; // account, contact, booking
            oracleCn.openProcedure(sql, {
                pin_nombre_archivo: pin_nombre_archivo,
                pin_tipo_doc: pin_tipo_doc,
                pin_link_type: pin_link_type,
                pin_name_id: pin_name_id,
                pin_resort: pin_resort,
                pin_directorio: pin_directorio,
                pout_error: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 }
            })
                .then(function (data) {
                resolve(data.outBinds);
            })
                .catch(function (error) {
                console.log("error:", error);
                reject(error);
            });
        });
    },
    makePdf: function (data) {
        return new Promise(function (resolve, reject) {
            console.log("pdf data: ", {
                room: data.room,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                guests: data.guests,
                name: data.name,
                lastName: data.lastName,
                address: data.address,
                country: data.country,
                countryLong: data.countryLong,
                city: data.city,
                phone: data.phone,
                email: data.email,
                personalNmb: data.personalNmb,
                carPlate: data.carPlate,
                passportNmb: data.passportNmb,
                group: data.group,
                hotel: data.hotel,
                resv_name_id: data.resv_name_id
            });
            var room = data.room;
            var newChechIn = new Date(data.checkIn);
            var newcheckOut = new Date(data.checkOut);
            var checkIn = newChechIn.toISOString().slice(0, 10).replace(/-/g, "-");
            var checkOut = newcheckOut.toISOString().slice(0, 10).replace(/-/g, "-");
            var guests = data.guests;
            var name = data.name;
            var lastName = data.lastName;
            var address = data.address;
            var country = data.country;
            var countryLong = data.countryLong;
            var city = data.city;
            var phone = data.phone;
            var email = data.email;
            var personalNmb = data.personalNmb;
            var carPlate = data.carPlate;
            var passportNmb = data.passportNmb;
            var group = data.group;
            var hotel = data.hotel;
            if (passportNmb == "" || passportNmb == null || passportNmb == undefined) {
                passportNmb = " ";
            }
            if (carPlate == "" || carPlate == null || carPlate == undefined) {
                carPlate = " ";
            }
            if (group == "" || group == null || group == undefined) {
                group = " ";
            }
            var signatureBse64 = data.signatureBase64;
            // console.log(data.signatureBase64);
            if (phone != null && phone != undefined && phone != "null") {
            }
            else {
                phone = "";
            }
            var resv_name_id = data.resv_name_id;
            module.exports.setAddressData(resv_name_id, address, city, country, phone);
            module.exports.setCheck(resv_name_id, hotel);
            var imgLogo = "";
            if (hotel == "HTGLR") {
                imgLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAV0AAAD3CAMAAACJpne5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODMwRTNGQzNGNkE0MTFFQUE1MzNBQjU0NTkxRjIxRDQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODMwRTNGQzRGNkE0MTFFQUE1MzNBQjU0NTkxRjIxRDQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4MzBFM0ZDMUY2QTQxMUVBQTUzM0FCNTQ1OTFGMjFENCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4MzBFM0ZDMkY2QTQxMUVBQTUzM0FCNTQ1OTFGMjFENCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnadxzAAAAMAUExURdedAOOqeNeJRPTluOK6Rfv06unc0tihBOzIpsqslMphCfz6+erMd+HRw+m8lMhcAfbx7Pnu5PPcxvrz4stkDYRAB9B7C+3TidrGtbqTc8Wli/nx2fj08bWMatS9qdaEO4I+BIA5AMyxmtqSU5piNO7l3eTVyb6ae/Tu6cthDap6U/Hdo3w0AHcrAPbk0qV0S9igAeG1OfHVutKDC/369M1pFd2tI89zDNK6pfjq3oVCC+bBWdSLC9zJucCdgH84AJFUI4I8Auzi2dyrHdN7Lu7Xk4pKFfn29Pr39Z5pPP79/MleBNBzIoxNGf7+/Pz465deLdaTCrGFYXowAOWyg66BXOnJbaFtQtqmCfbpwfDo4s1rDObYzchbANyWWP358d7MvdF7Ft2ZXffryX42ANeZCsOhhdeeANR+M9jCsPLgrNa/rPHq5N6cYZRZKNqmEtidCc5tGefEYfjv04I8Cceojv78+MpgBtmkCf38+5xlONnEs6x+WI5QHOm+mKNwRvDam7OIZeGlb+vCndWHKeS+UP79+vPs5vXgzc9vHP779u/QstC3odGCAt+wK/DStdqnCbyWeP37+u/NsMZUAOa1iNWVAdOKANqlDYA6BOvf1ohHEd+gZ/z27//++t3Lu8xnDpdeMdWMFoZDEPv59+DOwNuoF8pfDdqlCd+yMcxnEaZ2T3syANifCcdYAOjGZfLYv+e3jPfn3JNYJvDn4MtkDoM/BtmkBb+cfvfo2evh2JBSH9miC9zIuH43A76afn01BtyZVOvPf+/m3+Suf5JWJujaz+i6kJ9qP9F3KH85C342C5VaK9mOTah3UMtjCv///6h4T4dFDZNYKLePbriRcXowBdmjCX01An02An01AP/+/v7+/v///tmjCH02ANmiCffz75hfL/jz8JZbKsepj6d2TtmiB9mkC8+0ntBxH+Swf7eObvXfz6+EX3w0BNfBr5lgMdvHt//+/8tlDe3j2+7k3NmgCdOAIvfszdvHtolHG341A9qjC//9/////1HpIkYAAAEAdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wBT9wclAAAzt0lEQVR42uydDVwTZ5744xuRUAvWBAVBE7UIOGgsKohoiCgvicaXVMWXVLdGQMGKirwpWnXVlloLdLctoNU9UdHNqj012+pp73x3/1ZmrZ42ENBWy+q5PW2rPfu/27nnZWYyM5mEF3tCIb/97K5kXjL5zm9+z+/teUZCtXUhi/oumbhp+P79+4ePeXPJyvk11K9HJG378nKeTtwUf0utrqu7AUWtli4bPrNLN4OH7jPL/C6b/iZRSzFYVhqkaZJRvfvWeOg+g9SsXNGQJiTLEgaAh4zw0G0p2y7bJGoH2rq6hgaptKGhro4DuOH0fA/dlgxks0elNTBgG9RpwDz8bVl8/N6PGtSSNDWz5YZaevpjD93mSreuDNs6dZp62fAVvZcs7NtrypRefZ8umXho+DJ1mpThu6wL6aHbHLFPZOBJ06TbZi7pZSeR2O34f+29lqyIT6P5N0g2jfDQbbqM6JpGe19p8TNnf0w6C8A8ZUnXBpqv+l8Weug2Vfp+JKX1dtvE+bTW6nq+1P3Cf3TqdPaT7od7bqYJLxwjxbehTtKb9NBtknTBY1aDJH5iEcJoGLp2afpyma8JiW/uyPSlG0fTfLvSJiTtkMFDtwkyRFKHnYGZUxDbz15Nlx886JsrYyXX9+DBA190n4/4vrk3DePtmuOh2wS4GNaoLojt4YG7TAdGOsvyXN9Ln3SDfHttkiBdV3fd7KHbmFlAcOvSuk6BBvelL3JN1fqlO7r1FMiI90ZW55omrc0HeD8+rZZivPkeuu4HNDRKNaTNNAC23TbIfOVAcl91chk+u5QLN5j6vwX/HPI/UnRLDpEeuu5yNssaENzTUHEPXzJVQ7jyat+zArpDJ/keQ5t8f7wAd+2yTI3MyUQPXddi6Ip18AVI8MVqvZwWIV4WrlwuM70OR7cu2IlLW+ih61LeREZXcggSPGuSyVmpNp0VhwvE1L/bDwCvFOJtWDbCQ9eF9EqjXStgWDfQVkFEe0fz4MqPmdJ7Qs8MecnqMaSHrqjUDIfqp46HSYWzJjlfZLKhdNRGXjh4jL8Na+9MrPhdPHRFZQlU3Qb1EkBxo2+1XIj3JUZ3XxSSl5u+AOpeNBwef2tvjoeuiOQsu4UiWujmHpAJAcqr3dCVmzaAz5/+raGuDfoNbYPuRKh60vheJDk/HRhWh8fgnu6xXBnY2bc72HBagjLtIzx0naRoWR3yWAGlTgBf9dudfZtC95hvemcQWOS+PZokR2yDXm9abw9dZ28Mqq56fxGwC3JgF3IvdVtqapzuMdOEXkvhbTC9DmM25HR8VOShK7S6e5HqDgGMvoC0ZJN22Hl4Reke8700mnwd7l+d+wpJfjwcKe8QD12+5L8Auai3gbH/HWRwZZO6kZu5eMXoIriYrty3M/CSkfI27O3rocuREb2XSbHVBd4YtreQLqlbaqqmRSZ7yeHv5tJimvAZydCV699hLG+DZFNf0kOXZntaiqsR0r2A6GHsjCG6QHvlB7DsGvkWo7vd70/AcqkzhMvQ9f0CKO9pnEqXSrr29dAFoptI18ZAnLXCbidfN3HokvmfDcX/GfoZo7pkjU9RDpKizXYO3Wo54L+yjq7TSyVj5nvoPo1n2Eol6tmkvedyru7i8rrdbifdCE1XbuoE9t7Etu9IpW/WdGy6hhdw1Qa2hMQfms0Zsli6jQtDN3fCCJKc0nu4mq7D16UN79aR6U7Zn0azVQ9/E6ZpyR0T9C2mK/ddC3X94y5jbtB8pdIlZIelu/Inpm9h+BIDAjXiNYZUS+jKDryDjcnTFQ1Mn8NMQwelS/ct1Enih2C2n12YwEa/LaErl1UvPZyDbPXTrriS+T9pw3M6JN0luG9Bqj6E+hZy3hl4wJQrfya68mpTbvqL6ED7kHhcupfuH9EB6S6h+xb2LkGNTN3TfX25aceW0YVBhen+WXRor03Y+qq3jehwdFdiwyjZ3xeSeKm/ryDh2GK6sA5//0VoH8jeUtznsD+ng9Ht9RPSK8km6CmMoPsWROgOPfsftJwdzfQyDN3eCf69YfurQ0XpOvoclnykxm0khg5FN2cb0irJGKhjQ9NNTnUemu7Q+wdNtPzuPUZXL/yO+Uz+e3G6wDmT/x5GILPpPocXOhLdmjFqFq79/ZEidBBd+9D7juqv/j3nHJnMdMEFXbDptR0gaJ69TNratcznTncJXVr/GOjX2tzcYy7oDr2vd2wSoyuX5XZ3QRdWinuC03e5gRpQfprSYehOwenGbdATe1EvE2UjmzSChRsWFuaCLvBwu7uiK4d9DqT9TZR3UG+ydxC69k3QLkiXPYWldRdw5bJLhydhuGHyuVFzd+2DtQeRuppM3327SfwUx0zp3Wpav8/hOdNFTaR1qD75XrUMt4IIpVq+/G1sMfZFTbuVd2uRv+/7JPnD39e++E7pWh5N2a771SInwHg755D2EftRRn3U5g5BNyce9S1sgj1LbyMvd+Ryp97n5WFyrNRhUXnFeXl5VcXvdiL/eaD/hx+++9t0vrqDG3TA+QQj0baDsM9hdkNDa/ZHPl+6qPgrXQaiCF1n0zFkBN7awe997ja6PxMT78pKodO1v+3+Xx+mpKQUS99F1PeB/zDqu/w9wQn8un2B7lu1Hmg8eQh+Y92yog5ANwf1LUhOg1/9Cf2I6zsL4rIiNlUW5l9MT/orjtV/UJyH/hUZJg+b6x8bGbWPiR4uDRXEb53ou6O/BE7day/0G9KWdAC6yBuTjgL+wmcjZY42Oy6aEQNZy7ovlqGbEsuArroRJY+8VVycciOSGb/09/l4N7AnONiJqbY1bKtp93Rr9qNmr94AAaeeDvDWiMEFdFMYuv7TWDX29y+uAv+fB7WYLr3fH8qpDm1wNPnJdg1llFeyst3T7StB3WJAdd/6sZrr+vdi0Oz4guMTOCxDlf+iPIZuJK3ReXlzOXhFNBeeeTv4ZCZq9Hmh3dOdibplZpJs8Zd5grezJvMg5+OwuTeqENuUlKhFVSzdaVWMFoexjSMTdtAnOMxrT5WN/Iwkn8JScd3eze2c7mY4pjU0LARWl99F6vsaQ3cgG3qFgVFrn39K1Y2UqkXTIh0mOM8/i1bjlMh97M7H6CSa/R1+MtP0H+BD1ALVOqbhOdLtix7R4cBGvsqPsBx0Hf7C3Nhpi6ZF+WdVTYuMjI31j6Kds+LYqFt5jO7uc+hoT9ryCujqJ+SQ5ERJq7m8z5Fub0g3Dbhj9nS9nJu+caYb5n+rOKUqpTh27tyoRcDPBVCzwAfFKdPkYYuwGqdk7eJYgJ6kCN3qXHnuYdK+8iNgGqTDyXZNl4RTpuqks8GYVq3v1J8zu8SJblgUtrhAVXfdKsY+WVTktGmx/v7+UVEQb1XxDYfqutBdmWzD8oOd7KQdmoa6hqJ2TRea3TrpqPkwkvDd2G2CA68zXcYBy/uJNrNVxYt27ZsLRjSgvlGxVTcWRUbtCgtzq7sy37U9D/j2t9NeQ6sY3udHF82ZSuuKxi7fteToSyxeJ7q7WBchheMizP1TMTS+xVlzo6L8py3KmsY6DWK6K/O9YB99QHYAeA0oiGmVcO350V2I/U4QMVzKBXTtb41kxjaTw2cw4SGN8QtuVMU66DIKnTJtX2QVEGCW2VYRVncZjwzAJUlAV9+dtPeFhrdVPN7nRxdlcNKG2KE/hvqSXuovwwsvHHydibVeQ+25slwR97YqMotxym75035DcaRMBg/Qs3TfM+HuXr0M1oUAXdi+VwQ7e6Wb2jVd6DLUqcGg9kou7voic9565fDQv7/191dGs1MpX4HyVqd3HXb3pzw6NPO/dYP1eenQLeWDCS8dhke8xMTS88Gfh+FHKHoDdGFnL9k1DSZ5a9ozXZhOafhoJZzuR9N1KTvSJVVoKCuOjCqmR7XYqGInunlpv610dx5oGdIB+BXwq/fq2jPdMVLYYd4LJR8boUse/s0HwMldFOk/Vx6ZV5yXUjUtVv7jIkahs/yZleD+/F89G6Gbe2kHLgDVSUe0Z7pdoU8fP98OI7XG6JJ//8L/w0j/2EW3AOFpwDvwj4yN9I+sykNqHMkmz9S/LW2ELpw/RKIspKRbB6CLJvw1Stf+j6H9/fOKq/JSiqft+jFqWnFxSvGtSH8Qv+Utig1jsg7FH24gG6dLki+gAbVXe6a7SUrTPdsEuiTZ87/oBUxBOIyTDHnF/pE3cLgWi6xxseQ3oxujmzuJtgw3JO2aLnw8pXunkPbfN4XuD7//kClHxDKqWnVr7i7/rKqUlCz/yJSUlIYPfvMe2SjdCUWkHdFNa9eWAXpkDbBgubZJuvtvH1Q5p879o/KQM5HiH/VP//Tb7f9MNkpX3x/8/xhkd6e0Z7owmmioW0ja39fTdHe8h+UdtrTw0otradk4QcIwFSlMVGVNev31Ths30ju/2D2HsSfvoBN27z6a8XcHAiOO/N26ovZMdzYaWrrYybeqqxHdbp3pwMrUn4nVBv6O7Xv8MUtEdzlZB71M78vse7Caccw+QcEe2DJyIx2rgXFvM4zVGvYa2jPdvjiJTf7Q620UCQO4TBanM2NsX3O0hYVFFgsUFobATAKi2FGYgEmFt5m68gXmnLn67lh315J2VLhs2G9vz3Tnw5a5tENATfvrwW/e0Zmtoem/sAtrEyhRVowchaoo2tjCHHrKDWFRjab7g4CuXLbrPeSRvUSSs6H3oT7UrvMMNaNgpmo4WrPJd6Ous6P6g3IBTnTD5k4D8dpPkf5Ru/xvFVfByG2XnI7Xqn6aK3evu0B7dx3ueUAPHDI7WrlE3btd06UOQeu3rJedfN9Xf5ZbWge6a3emKw+TR0XGRsVm/ZQVGRW7CPw3Kys2CqUhq/iGQVR35cdyR764HCU3NyGXYXb7pjsEJ7FJe8+3ZT9y61/iuosLw4voeC0MRm5VxVkAb0peFs8uuNBd8LF8l+9G0j5/FGp2mt++6eJhbYUzRBe6i4e2PLq+9hPyFooX7Yryj4wKE9C9L6K7qEVyeU872QUa/NbpdXqOdHXxDXRhTVgXF/MZeCWgqmmMB5ESNXdaVtYifz7d5axHxq/lwxVz7LgZ5zTVvunSvThDSDInXc+f5cBOPxMslTf3T3SaPJal6z8N2YpYrvbmjmQsw+8P8qdXHSbJKfHSjtAtQi2UoAlkQJ14LeQyWXdmbYuhb+t5eH9clILqEsUO3cWxRV4Kx/TK9C+yuZ900zHBQ4EqTg3xhvZOdzMwDbDVyU6OmKAXgQvkreU8vGGw4bEqb9E0/7l5uEaxyJ8uqcU6OnH0FzipNS5eOJvFMLzV/LHn3L97GpmGMXB9G19RuKT9LZ72/iiPLS6eBpOO8kjgK8AekWkpdGFYRHNpvKzFGQjnXKJ5P2nd2j9d1NLQ0DCbra3jaVE8eUtgHPwj/WFUkRXlvyhrUezcqGKmSyeMhctf26VnOt0oITswFC5Thjqyx1Dtny6F5lmijpHPlqP+++pd7wvThkMv8Rok9839E9TWlFtR+6IiIyOjInG1nQmFq+UbhSfoRk+8MP2esbqtkjl//nR7ofljaW9C26CHfR3Vy18bKJDXJ/DoMmWe4kj/W0CH8yL90TQgplGkeqTzCfpXoylVMHvRDTkM6lZS3ec9Xw0pr3RvX2BhO5nwwtBOIjsm13N6nLHLmzLNPyUPd/RHVuVlRf6IPS7wf84ngP2Vx/ST4GzLFWjKT1q3jkGXVt6uBmARB7qYJynPnfBqrkxIl0ntVmXtioraFUYHC6/pXZ1jJFzdcAge0lptZdPnPU+4N56EDVfmn9/Z5Iqu3TGFmLYMKWwOPSWKmaxmGmhfKj5P+FiuHDhj9pVolnvrTbV87nRz4tFbJdRDgFHc4QIvrDReYPCGRd1KQfVgJnFeFcXCLXIxC/uYfhdc4WnKNrxYwUqqo9Cll22R3oCv8tnxmsjaF5guF29W8a1Fi6JoR7fqp10OuC7o+r59GM7O6oqfk1Zc8fj5ry2Cctk3pB9BvLpO+lwXdMkLvvrcXD34775dUSCc+BF3lOUVvws+0+v1ByFcUbrVpv5wBc4ilNYFkXdNR6JbM4aDl3z/vrP6Yrrk2kuXLqWnX7o0SR75p7yqLH/gkcGZwpPSoUzYPsLFyi16/Yb5wObO34QGUOmo1lzVqRVWHdqMpjgB4wBtL9lze66vOF1yxI4dOTk77GffhfFZVVVUVOS77/7m7I6azUB04ms6yXNN6Wgxh17D8TuZ/tSL6lh0qaL9GK/6BfQaxcNf5PJfMcHQxWLojzsbij98/e8b3+/pdsUsvWnSBaTTXeLT8EuHV1IdjS6Dt0HStS9UX/vh1w6Y9K7ojv7Nn3G9/YN/c78emcykT7+AEr2bT6MVccAXPKU6Hl2qCBuHG2nLeuMums8+6e9YgYhH1/7PNN2qD153S9f3/vb38HGzh6c1tAm4rbXK5uau9DLaafuX0Cmu9ybpRXW3hrUMr7qjq99A1yd6HWqgz/2nlVTHpEuRvem1jdXq4UtycGqXWbOBT9fe3f/PKXl54u2kjvV36ZncK2cuoxfgTdvW+usbt97a0U/xWnc36tLU2073hVVhZvY/ny5JfuL/gUTyoWg7KUMXFX/JKUs2/S2toQ5bhRVt4MUerbjuedEKx9LceV2nsEv2O9G1v7L0t507jXa77vlS8MfEvcwLyG+o/6VNvOC9VdfsXzhKQi8D3yCZCIZ6ulQspAtr8aTd/brnwMmdQr9dGC5Sv2I+RXV0upRhyTJ62X5YsLDT3Qg03Vc60bLBUb94deBrWAae5cZq+v4GpgzRpl440drvSimaiEch2DdN0q9EwHS7y5he3t91ZhU3/SCTIj/4Wo6Drmkj2KMrXhJW0nVlm3lZSuu/58ewZG8DXtGFGdcQ3e4ymXOfGdnfEXSYIF5MN/fSCLqP9IZ0Zq829HbLtvCOKlQqRhMFRyPlhXS7c6oT4nQRXkwXqS5KDqlXUG1J2sT71dCrhGG9As4HQrUJjua6pAvnxqPahG//HNK+EL2HRtLLQ9fJd5Bg5bWTI6DbkJu+8UeZvHG6wA8bqIedjq8wTbqtVvxty3RJ9L5bCWw+fQlwrR4p56/55IquXM+8NtTeRYpUt6+HrgvlbZDCfPqL6G1/8qbRxS+33EGSOOvW1lS3jdCtQZZXjVaU3uBUynRLNxe+fM1+WnKj7VndNvO2ZtznIIENfDWvHxTS7eyg6+v0nuzueJldOKHoNOWhKyqoPbIOrcCZI2gjOQbXImViNYFio5lv9m6j0BLRe4s8dMVlM5o60qCGLWY5S3mVTBQ2sCtFcjcdy82F3aU5OFncKrN6fh10qb64z6EBvvrH3onz3h8eXD5e3wOoPXUFbp+aSXnouhSchAF4YVJh4wFfcbj4bdl038IE9M6Zmfi+bNvsoevG6Z1J430TNUn3N8lE4QK89HtYZdvhurAfH6JL690oD1136ZyudCH+NNTeEa+OBDZA//pm56Tu2VwQR/j2h91M5JRNCG5d2lPKQ9c9XlwpbkjbhN5p99nSH02y/l90dhaZKbd/d4R94Tac1JUsoTx0G3Mc8OBflzaqC27y3/72wd+ZfPVc8T34u4P3l76ClnfL6Z2HD5AMoTx0G5WPcY/ZDbV0JlLfH7p1f22SzGSCDXtoUQuTfmT69vfp2noXpm8hrY3CbWN0KXtvyS1cZ4ufWIRf2LzjpbUbBvZPnzBhQv8vtn/y3mjGEC/cJMUvZ5ZKF1Ieuk2TLlLmVbjbJk7hdJPpdAbOwDZ/SVfmJeXq+F6Uh25TpRs9UN1QS+IPzS4SKQRP6XJoVBrNtkGyIofy0G2G8e0tkdLV3TTpthVvPp3Cvu3DPr9vl9Nd49Vp9Epwdepls0nKQ7d5GbPhEno52DppWtqf44dvWjETyIpNw0d9pE5j0MIuqdNFFOWh29y4rUs83aeDsuqAKBa1tIEhCzt4Zk6hKA/dFkhNl1ESNUvSSerUkv853dbZtl26gO/TFQ0SqRjgBrXk1pjZORTlofssMqLLoWVpErW6jhVgJCRp216YXUT9KkTSxq9vc68lL2wa9ZEUSV5810NDFs6voX4tIvk1XGRNTtEIIEU5BpL6VYmE8oiHroeuRzx0PXQ9dD3ioeuh66HrkV8B3Rq73V7jCLhI+Lcw/sqfs/NhdMbJ45W8T+1OUlPjtKW2lnNu/ld1BLqL4woKToSwf54vLCiI28rb4/anFcYIKJaYGU8cH4eeG4SkAAj6x6M7V/fgTcF3Cgq+jjt37tyRqW9MHsce0Q9+VWaHoptp1GqJUPbPpGyt1jKes93gfZM4tX5P+fjzgQkarSXYh2UVYbRarYoyrVZbprRC+fokrZhbLVrVnQfBwcHhcWXGYeypHoOPJ+d3KLr5hUrrCcdr5MhkpfWqD2fzFUJVQMP3eWBWaL5MpLd4h3xTWlqaH3REqQ33yYf/ZF8f4UUo6ldju1P5/XTWFpRWKFXrO5bdtRcoVeGcv68orRz9MoTXK5MdsFNtCu0gvJUk2duhChCcs5ylC0TH0tUVKjUBHYzuRaXqO87fgzXaZMfIs4pQlPk5NuoKtArzKv6oOEipuu6OLu8x0ZR0LLpQ97iPa6pZtY6lG3pToRrH3dvLplBkBwnpPmg63XEdj+4aV3QDVArbFgFLha2fkO50D90W0K2MsSoH/cDb/Z5ZoV1Heuj+AnRDCIXGm7/7GUJhjalshG6oxkPXQXeGC7qBZgUxj7+7z1WrgtjSCN0glbW+j4cupqt8FFqZREvldyoH3WFaq+o2f/faO8DwhnCPvyhKV3NPB1xgn8rK0KAOTlehNDqkTMHSrRmktVqTBPuvAQPdTt7xWjG6ipirV6/GZNuMcbc7OF1rYcbY77GM3QOCC4Zu7R2t9WqlYP/vBHRdWAaFQmFVTJ4VcF7nGdU4f3ubeXSVSSJ0QxqnqxmQX+mjIz12V+gzWON0rGVQmLeIWIZMz6jWcrpsnmGWUkH0oISBr6IsqAl0PR5ZY3RBqCbEATwy5aAaD91fgO73NoXyso63+8s2QRrHQ9ct3Yt8uoEcurc1CoWtnLd7oEZB8MsLF5tMV9fx6IKQgUf3LocuNUOl4Oe7fRKs2jX842c1XXcTOiBdYSTMofuyUaEwP+b5a4pToVQLdTdRa+2IluEK5+/1WmthPsdOKJR3HAHFPLPC0s/JiXAq58yp52ZxfJjbM4dwDJKG82RHoFs7Vam8U8uFba1wlHoMV+oV2kGMB7anTGkMdDKmVl7lCEoIoWD9XZ8eCUyJuYeNoUuGJgd2CN0NKrNatYkORatQ8iII3TijVnn1Xmh+TWV5uE2TfVJ4vB9hVQoLvQPMVu2MsauBrAq/ShgZ3f1cY1XeWdxn9erUZLNxXoegu9qo1RodiQMv+OcA7g7Hh5ktRmP2ZEuE8WpJkNPxC+ABx3kfGf6g0So1KCdkMauUkysZh0ylBfsCITSqU0Edgq5PUlJSYqljXE+EaUi+Zfbbkxo8Y02wt1epyPGl4IBEvu7WJDL5zKCgxKTKfKePnb6i/foMHUs8dD10PXQ94qHroeuh6xEP3bZFl9SVlubran+tPwY2NeTr2uT7Jmoz762/WJiQMLnw62/XzAi+fv222P72GizOP4FdGkj8i+gX9djhZIlGhXsO0uU38oK4JxnXrhxJAJcft27N9GvjMhafxGUOXWWNoTIp8fbtMyF7xq7O2FpSsvXkeB/+pTGXLvId7PuF7PyrcS2cqRssXd3iqTazSqtUqjQqrQpKRIjYr1gfNxXK5B5OW0LOJUMpSD4u+vNvvwG3xi2gqC2FU93LiWHcUlpIAvowLtg1XsO84Ks2QqVSQlGgqycsRpwsStx9+Y3dMVqVxkxAsalUNuJmTAA3bVy7ZhC69EciX1FZUIC23cEFqNJ1bzRy8edm5TvRLY+zKRUK1c2Er2dMDz9iJbQKp54ufOuSNVoomjXOujsLb9Jm+4kRqCmAWRVY4I22aN0KYTnPPfB7I/7YZSamtk+cTWVVKM02whoTU2axqRSwe0RJJxcC4C9TKMoQXKJehf7SmLdySPbDV2QRycFTJTa0jU4dZdIXgxWQK8zVG8c7WYbVRvCdylMlR/Oh1hiSenxrU4rSNRxBF6dw7pqhqB4E2qRQhYtqWT8z2ATrCsNUWrONESs+neMD4moA3yRF1+PT2laLw50zqB5ck9Y26K7XlsrS0ttHxwZna8AprfQVwhZr8M2D/UIz5xwdv7jkBKZt+dxxilAzugit2P3zQr9KSXddnAcnA7fRvPvO10CmJjNy8RG+SAUR7WR3d1rA59q4oxwdDakQzYkGlTFncbYbSQorva2PGIWj4DJtwKAk/WfCDO+t96BEZ2QUwJ9qfSM6ox+SjJNnhKmx6Sp8Vu0VUbiLLVr4lcPGc6xJ0Dizle1MTUSXbGNTxboecVp0lQsco+EJeOXKqWLDeRK6F0xBJNqsJI6s8rrtU4uEfXcWlYh/vCq8VkjXrwxsscbwVcZvdw+R75pnUyjR1aqCnZ/9QVivFdbdiSKHVl61KmzA3Hl5c/mt0sDn1E3pIL/QqkA0+G0jjKRCzbSWrRY8LvOylUzNw/CGkkcXADuBbulkx3WEw2/gTegQkDfTSei7EY9CDGK7pSIdUCYkOvkMwfDBMAvrAKFbRE4yTmONmwEvhVuwEWqZwmlqA7rMOKUS1tDsvE/vIrqrXNM9A+5neIJCAIg9HD631mzngbT8Zgx9geRFrfBgL2QJOKbvGrxys2iNk1wHDzdn0LdhgLi7SltFwsvJI/M7BakXNmXiXP4JpW0nhS5XxCyPA6SUruwG7MVVDrILP8W666Z2G6hRJlNbIQ6t80i6E9nUsnKR43b+hVHNdU50ax/By9Q4LG8Joiv+BH2L6C7GqP3ELzJoN7ILNm9nfzejnmNY3Eu5DQ5n0TfhAc5zwQCpq5cRXmWh86BXO1Vsdl5jdHVHlMRY1EgCRNgh6Zdt5RtQrp16UMpVPr7ifwrPxyn9j0N07zZK14WQa9BTqx1mcKY7GP3Au02h+0ClGUwPsdaEUmdS1ke3pyK85lQxuvDgZtI9TkAbRBMSPBFkuMqNXjAxmxhd6L8oOG0rz0g3Az1CyqtBIrHaOsjD7N0EuGBgss0BnNDwJbQxiO5l5BrArcd/GbrXVGgKG7p+4Ug6z4JuZKj7i6bpfs87kuCPYs9GN/MUsgtED5FIGA/1TbIMq23aYVAjBqBbXyJC941ayhv5p9qp+b8E3aQY3EjmZ3YeSWtmaV2NoCJ0ebp7HtFN/WXo/iMZ+TRig6KEIpHLqZxc2ihccpaWQLP2MwmBR8Ola6C/LPCXoLuawPcTI+KPpOXoKSHKm0aXp1gLbPyh95no3kUeiLbgH6JZnDXYud7ZKN05hDXBx+HZEo9F6dJjjYIY/+x0ARl62gQ2DbwpwtchEmujvo4Y3VQYzHEmwj0L3XJkn6wKP/EcmTeOAxOSGqNbomIU0hsxSRWnSy3GwePl/Gem+7KNGTz9nEZSnwqruOvSOF079Cm5A687un91T7cyDg3jtj0uMpD0OKSd1YhtSLpqZUaQTBsn9naiS67XiPgNLaEboGLCOBIZWeK8wHYq6h+2gG6mGRrxpKbRneGebjD+rQGu8rvkMBxpqgoS3V5mtE37rYOUiGlg6FJJCUrnmKIFdBMVKHbGTpTQNIxDP4s42gK6wQCmkZuIazndsQQew31cZs+3YI9Coa3o4SZFbfiD0uFzIGsidGpZulSIxdnYtIBudL0jPvPT8E0DhiaefGiEbgihsFoyqCbSDXdHNzQb/dCyTDe1iZMWOv1C/HGLy6sMITgjCLImynM6F3SpVLNC6OY1n25+nNKh/jUFfK8hPwHltU7omk23PMaqNf9MNZXuMDd0DbOwR/DQbeWnj4VOb2lvBrgyD+FaTrJFhyJe4mVXdPNxyEYsfha6PQjrCcfIiB4XxyCGg2Pl17XNpFsZeFNpi5tDNZmuO5/hLgrSNMGN1NWeTNYw+S2rd6WL9CxnMSZqFfqtg13RpV5G9sjKqVM0my6IFrgRJHay2YDiDHZMkmuaRlf1aWhSZeLLC9bHaMxWb6EX10K62ONWfunTWNXSp6ReS5sHc8X3IgoRrNJOFwy7woCCS5fais39RV2L6XoRCu1trhul5I6Ux2m6VNPoKsoIpVJL2LRWpbez69kyukmT8QP6mGqMLlCGWTYm+2256BS739ZaVYMzX2ZkTkiMwil44tGtxT/KdrfFdMO1ykGPzzDfeGYLTnGv5+tN0+naVFY0eJtFRqAW0SVnoMwYsZVqAl2K7BFHl7kU2q/6CbwHOEwpCUf1CxsSfl6FRxeEbLgc5tVCuujpcNTbmBJcdiKP7qAmWgbt9YdryhBm5R2f5tC1r3NF9yG6AtUaskl0Ydm9gjG/RADvsoN4lUUo9ah6EpPkki61AP9+ptW+uXQfqMDTzP1GAhfI+vAsQ1wzfIYtBa48fzd0cWlDhO6cU/jnuQtxBZ1OlZ8y3oOFV40Bg9jue9/3yYhGtcXoh3369DunFBYoBXSp9SquW9ZMuqE28GQs7sfI6tWrxz6A51POIjmjmvOaA+58Bp9B2FrtbAbdmkfidEvvaBtPIjn1kR2Po6tjXJuatFu47BqsU6B0fI1rukmT0cNs6dMSugEqpyScARVs6KmteM0LBfGkOR4ZjpucMy5u6Oajmp4z3QDk0dsGUM2iS/ngUQCYNAPX17QKgyLDVM5vFaVL9wJYraHNp+t3SnEzWvjhVpg6pm9zaQIeo6Kb5e/iKoI2Wddkuvh7nOjiAEy7rraZdCnDFay9Fi9OOkqkKB5tExTLA4V06ZBNm/yPZtMtUdHZTp7jcgq5gchbJXEaWfvXZtGlx3lhedEN3coYMbqhqH3BuruROFysw7TyHO6QKOHUjb5yTl8GaQVJwXFOdHUF2DgNaC5doLrmeyIZFZUDVAnWgeyg5tClgiqUfM1pjG6SUoQu/bssIVTz6cI0B7c3pbRQqRIL9r5T8SuyznSpTDSwKszjm0kXoLOKhOTzkK2/gsa1nThxalvcvEi4hw0nmBKd6Yp2VWD7LqD7OTa6jc6PFaWLy5LslNGtZoXtqKubwFlJ8FON9bLQDuGQTXnOp1l0Q08pRPbFjTnghs5h8+ng1I90zcvilOAE0wzSie6nYoc/JpxHNexramfpWkQXrjoB23byGYeBcYPEfquFHbUDgO4KK/o1qCquMA+mappBF6iueKkXXRhu88COKGC9p3l0Sy9jtyxaSFe8UQ0nU3l0M1HQZ832o1pGFzXuMLoLHAZbD/EUEUrlXHOEriJVrm9icJvKPKrpdIHqasPF86nYC0lk8+kwCenTvAwk9pQVp8449vlU5TIyWaUR0i2d6sJrbh5dHGUm7hbrDGE8fniZ9D2sGaQUqyEusOCY5uggq0u6gUJfV7RXimLqKFjvkvB9UzSyhrFz9nwAbu64XMqnK/q44IoTj+4DTRO+laYrGiWfRM4WtkOBZlcdVkxFj95qOKIUvQ0BOBO7O0bhku5doeq6up+4Vq7EaV9c6nZdW6s1iNM1YI+ewwc/BmaRfEyQ1iqgm4FHkkdN6buTBIo9VwEqtkQYZHVTvNqJc66VjGcoGpj6oIZO6CCK0L0rUl2+phJpRWFOhpx7HIAnVTBRu6jfoAvewqE7lus3Y6239OA9qwrlEWfTMADfQQfd8Rp0bJn7DqAk708H76yhJH+4JnJd0OFV3tFhR4D5l9hvRVXv+nusTSTECkxedGFJjG6gs919bOMXf/kyGJnIL9EVLTDSJ64f7HyF38yiuyBFOp36YJq7mfRxKO5vv9nPidJVK59uYiH2l8e6JnvGToUOOjkvxHuGQbKOyHAeJ21sW9Qci9s2r89VDuWFXe/iSY27N13SRZVd3ucw5ScSp/EqesyQkmpj7tuXe/jeis+AbHpZDWw5bT+LpGZVTCCrewM/BacEl187g066MHQZF8iN0V19maSu+J1fnRr6/QDJOl7xCw+KX4LvMqNKBAlT1kQPl6eag38rMlj3zK7Cfjq0EaNbguhynx/Yk+vCY0C/Lxn54vhxMlxhMqZK4o53Zj4eRMjKx4NjzFq6W4XuPefrENMTEMg3ANZsXjlAN92swFMZmN8VSHc1uTS6SQGWGZTfOGrnztWJujWArqK+hDeE5E8Hl2zGE4OQYXXTZYi6WmjlhYV/Fz1zdMgmQhd1vmrXccJwWE5x15H5EOkrbUfzw79SMHzNRMK671Z5e09PVtxUKZTZdGUST/UQnhGHowoL3bxXmUDPtjEHbGGyfrqQOyplzOc4R4bH3T020RZz9pHw867QADuZuZUKKSih7OGSWfDYuD2s3SJf/oMGzvJAwBOhXWXnJonJYvR9Xw2gk0liA4NjoHWmq0N9QlwPAXkYrub3OBwx5RGsPjXeTEIazdqBs4nK4AfabKbadR7P+RE2rgdiz7mM7oQNMdJlGRUxaFw/r/J5W4MLbUrV7jOlyPLiSGNLGd34MS7zyfjxT+aw8vL4x+VeP49LLqu3Km4uphLXU6vLB+ys/E6yDo6BStvkT3tkBgVtCblXYFMqtF8NMDjMk1Xhhm4i+q3WmETqCdYp8b4JO7JXzu8u2YKfSIKtgO+xcAsQohKg4vUQHD9HWBUC0VrW3ebv7uTi1c7AXm823TWw06hlHwI4cdBcZtVapidRSVr8AyvZljHH5De+2DS4owzY7pKdSflk+YwQSWhJAmHWWq0qwqzRmAmzUqkh1tDxwaoIGzwswl3IF2xEuwRTn0egf7hwjb+J0ahUlulOoyI6iIhgRok5ERb09z033/gYHWP5C5Mcy49OILQctMBEJM9jk/q3/x2d0RIhvGH5wXjDv9ORfPnX/LNoiFlewI7PARoMZ55+T/3jjxFE42KBtPJnlJSHrMmAsVr+ce9hFTcJMxJC80YgA1O3us/PUBa7q674RZ8Eu/Q5mR+yGu672lVSrvyPa9Z8KzSnNTvxN/TZSdMof/g9+HOst7vusFp8UIZjNChdEG6lr7/eUlYwYAsnRPLLQN8gcmHkFnSih8yG2pDwq0Q9fRbVoNRMdJYz2VPXTA8OCADPe7+TPzcufXYakH1dfPI2EwmTpVvKM7wDU+9Ge/n9Ome4J5VHBw4u+TTw4fgge8vP4nO0j3dqauqqxceDWOXPN7T8fJ71Gf4vxUPXQ9dD1yMeuh66Hroe8dD10PXQFZfSOT9nLH6cyeY6k0Lu3evBdmHU6PgLm/mc6ZOx+mW0N6nT0TPQdYlBbNRak8hPmetC5/V7uOBoKNzBns8cwT0tOE9TAjND6J5+GV6ZKK+j0+XjKMyu06EgrJY+sUHHLmQGLy8/X6d79pXNWk63ctxX/3ox/KIxgi6CBF2LmBw+6z+NM+hpQ2O1Wk4aNDGAODUrfGoEWocrqOIq3WNSQkSwffHXia84BwSNi/lLcvhlY8S/B6EjYuhGVb8YK1vjfKy9Or1RAjWLEyLiZvz1LxGzUNIpRoGv74lWiTLi/ZQVSCECFCeYLFpQRULco6lxyrKkVqPrlxAxAF7ONwWYbnl2jBfQisoSC91dtcBy0zHrIXN3RDTU2tBCuFFXaKEzvX0Itr+6dmq9xpFD2/nf2WPh6ZO8/x88S+0dI12w1cVZWLo7I1REaGOKGx6xBqp/6fUC+Odqy278hCQp8frr/Yy4Kea6ZRb7lFktIYZ8n8xVQa1F1+cEM5/OB+lCaJmF7r5Yr/pvlOM9QzgW10+8aqHbzUKhqtYMstCsxhsvM0kSv4poJZtJXmws/Ib+ZyhSqfAIuuWGXEewPbN/HbzGsrWRC71uDMbWoxatTDTPWIC1PX8yLgk/tJxDVzCYYG9taYXlfOvaXW/jLF7r/xqCqfncphdoybRMZusUJRbuC1Io8qKFrlO9bGT7+rxnkAVMDTzTaONPhXPQta8zMq1NQf+a2MM4y71p8LJoeWtVnTcms3RRDe2kBb//ItCRfGY2tRrd0gT+/EI/m41dMCBYhZaC2+KgmyRco2idM9383eXUACNtXNffFBZqHLo7jF0o7e4wKlF7U5ja180by7EW6wnefeXRRVZ+rAW3HPWJYOnqTrQy3eMEf2JSH6KCraycJAhoJEIddHtYBMvUfetMd8FkA5VJ4CX6KmP47QdcutS3zPxpXQVgsMYoqELr1hktRjZT7lNRzzcd5Ry65Vh3C5zpNrqkxv8t3Xtm3kuUqcG2WY4fYEM1Uz8H3VSN4P0mwzTTz4cAOT/OTE+JIi9nwAqzEZmGJ4TtiUvdXWekf/qCqXZYh7vINw0hRtjsznzmV2/jm9Djlsk754FvntfnKkZYTuvuTi5d1b2j44+fP9NadFM1V3nO6XrCMeH6tgrZAQ7daxpB994w7Z3104GsH6TFmkM9MW49H3J+mBk9x/MIFaPrpX5+iUK6XrTxXvck5Pw9laAfAK7/pTzCGPNQs2D5o+NETDj86vXhMZjuUZruHgfd2jeUZUplxZXHrUbXrOI1b39nczS/fqNCfUo8uoKV94YxluG4kaY7o/CvyQWzhllP3UZ0WbszJ8KYyqebTOvueMuwi8nJV04IGvJDLUqrha09h5ptCwSWoYBvGY46667hiG2e/RdZ47mFdPvZ+B0T11WOqfyZZjTNiWN372oE00ed6GZGYB8/3AhbubwItsE0PwF3ArF0ax7RursOIzxvEbRQ7CmMucaOAbfrBd2r54V297zIqFYoXNPnOdM9Q6g+5/790OZ41RQY4Xz4Htk8i2Clx2GOUQ3TnUH7CHssX+tg0z7buqY7hxv/wiMWMOMU9j8e030AYAfBAK8rdVhi3Qktv8XQie739KjWz9h2fAbdZf4ixlsIVaDD9Q2gownmd5VOVsZw9yZnWR7y6M6JKGc8PejI1z7SMqvW6OJwNBZupKv1iWWY5jrG0/K2XHFzoeM05u9F6TIIx1rwEg+fO6KJ/MJWpkv1sWgv0l4DfDM9OUwVk8ioNe5t3cmJJgbYtMn05i3gKHsyo7tPMN01cYyVC7RALV5AMCvgALrooZiu+RIPjHtsaD1RrwjGF/A7VT/H9XWGfqUoo/f0mcPT3UIcsS+24Lke1+logkS3mKZLthLd2ivmssk/J+p0twcMgj97S7YqHMFMfIPueonGdINQYuGipixhcVJNzTeBcLmK2qlMNDvPAld/OR+xim+0yWCiPlVH+56I3T1CFQDvQGiFUgOO/cdlpY/jWQl2c6FbjdayVL/82sqQyY/RF9LuCwh3kSXvZ8Ejxgysu+Xg23xi8HfW9NjSWlmc/OmEylZ2oiLi/2OP6Gic8Q89/EK3/iWbjmavEarU6K3BEajj2CecUJmz78RFnIMqXKm4SU+R9I6ICKVK4yIcXXnDjHDxvNp72cZC7+OhfhlmHPhWnjObC6JXr4/5vNACbFB0hMPNnWc0upssnJFtNtcnHDHimx5IENjZ22Ixos7aARH/WonuoiZhQPSAdeByKD/CHNxv69bUwoik1qJLkV4Pzk2e/O1ixpPVjQ3P3r37D9FMlLF18LjrwQ8eRNO9ivPWx01O+HYs0pPKksHeGI7Xw4zb1JNrnLcAJnoHoDMkZkw/l727onDNDOxuJAVerCj7MjWIGrC+B2VIve5wtOzRwW7NZNCA5MkJdwJxuiG6hF6uPzQgAKnBmYzF0MPQpY779MGDB9fg6sW3S8YFgCsPHtDjWS3D/wowAJOg4WhxTBp2AAAAAElFTkSuQmCC";
            }
            else if (hotel == "HTSCR") {
                imgLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAV0AAAD3CAMAAACJpne5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODMwRTNGQzNGNkE0MTFFQUE1MzNBQjU0NTkxRjIxRDQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODMwRTNGQzRGNkE0MTFFQUE1MzNBQjU0NTkxRjIxRDQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4MzBFM0ZDMUY2QTQxMUVBQTUzM0FCNTQ1OTFGMjFENCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4MzBFM0ZDMkY2QTQxMUVBQTUzM0FCNTQ1OTFGMjFENCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnadxzAAAAMAUExURdedAOOqeNeJRPTluOK6Rfv06unc0tihBOzIpsqslMphCfz6+erMd+HRw+m8lMhcAfbx7Pnu5PPcxvrz4stkDYRAB9B7C+3TidrGtbqTc8Wli/nx2fj08bWMatS9qdaEO4I+BIA5AMyxmtqSU5piNO7l3eTVyb6ae/Tu6cthDap6U/Hdo3w0AHcrAPbk0qV0S9igAeG1OfHVutKDC/369M1pFd2tI89zDNK6pfjq3oVCC+bBWdSLC9zJucCdgH84AJFUI4I8Auzi2dyrHdN7Lu7Xk4pKFfn29Pr39Z5pPP79/MleBNBzIoxNGf7+/Pz465deLdaTCrGFYXowAOWyg66BXOnJbaFtQtqmCfbpwfDo4s1rDObYzchbANyWWP358d7MvdF7Ft2ZXffryX42ANeZCsOhhdeeANR+M9jCsPLgrNa/rPHq5N6cYZRZKNqmEtidCc5tGefEYfjv04I8Cceojv78+MpgBtmkCf38+5xlONnEs6x+WI5QHOm+mKNwRvDam7OIZeGlb+vCndWHKeS+UP79+vPs5vXgzc9vHP779u/QstC3odGCAt+wK/DStdqnCbyWeP37+u/NsMZUAOa1iNWVAdOKANqlDYA6BOvf1ohHEd+gZ/z27//++t3Lu8xnDpdeMdWMFoZDEPv59+DOwNuoF8pfDdqlCd+yMcxnEaZ2T3syANifCcdYAOjGZfLYv+e3jPfn3JNYJvDn4MtkDoM/BtmkBb+cfvfo2evh2JBSH9miC9zIuH43A76afn01BtyZVOvPf+/m3+Suf5JWJujaz+i6kJ9qP9F3KH85C342C5VaK9mOTah3UMtjCv///6h4T4dFDZNYKLePbriRcXowBdmjCX01An02An01AP/+/v7+/v///tmjCH02ANmiCffz75hfL/jz8JZbKsepj6d2TtmiB9mkC8+0ntBxH+Swf7eObvXfz6+EX3w0BNfBr5lgMdvHt//+/8tlDe3j2+7k3NmgCdOAIvfszdvHtolHG341A9qjC//9/////1HpIkYAAAEAdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wBT9wclAAAzt0lEQVR42uydDVwTZ5744xuRUAvWBAVBE7UIOGgsKohoiCgvicaXVMWXVLdGQMGKirwpWnXVlloLdLctoNU9UdHNqj012+pp73x3/1ZmrZ42ENBWy+q5PW2rPfu/27nnZWYyM5mEF3tCIb/97K5kXjL5zm9+z+/teUZCtXUhi/oumbhp+P79+4ePeXPJyvk11K9HJG378nKeTtwUf0utrqu7AUWtli4bPrNLN4OH7jPL/C6b/iZRSzFYVhqkaZJRvfvWeOg+g9SsXNGQJiTLEgaAh4zw0G0p2y7bJGoH2rq6hgaptKGhro4DuOH0fA/dlgxks0elNTBgG9RpwDz8bVl8/N6PGtSSNDWz5YZaevpjD93mSreuDNs6dZp62fAVvZcs7NtrypRefZ8umXho+DJ1mpThu6wL6aHbHLFPZOBJ06TbZi7pZSeR2O34f+29lqyIT6P5N0g2jfDQbbqM6JpGe19p8TNnf0w6C8A8ZUnXBpqv+l8Weug2Vfp+JKX1dtvE+bTW6nq+1P3Cf3TqdPaT7od7bqYJLxwjxbehTtKb9NBtknTBY1aDJH5iEcJoGLp2afpyma8JiW/uyPSlG0fTfLvSJiTtkMFDtwkyRFKHnYGZUxDbz15Nlx886JsrYyXX9+DBA190n4/4vrk3DePtmuOh2wS4GNaoLojt4YG7TAdGOsvyXN9Ln3SDfHttkiBdV3fd7KHbmFlAcOvSuk6BBvelL3JN1fqlO7r1FMiI90ZW55omrc0HeD8+rZZivPkeuu4HNDRKNaTNNAC23TbIfOVAcl91chk+u5QLN5j6vwX/HPI/UnRLDpEeuu5yNssaENzTUHEPXzJVQ7jyat+zArpDJ/keQ5t8f7wAd+2yTI3MyUQPXddi6Ip18AVI8MVqvZwWIV4WrlwuM70OR7cu2IlLW+ih61LeREZXcggSPGuSyVmpNp0VhwvE1L/bDwCvFOJtWDbCQ9eF9EqjXStgWDfQVkFEe0fz4MqPmdJ7Qs8MecnqMaSHrqjU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";
            }
            var imagenPerfil = "";
            var separador = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAFCAYAAAA3zK6FAAAAHUlEQVQokWM8X6P8n2EQA6aBdgAhMOpASsGgdyAArdwCd0qzu3UAAAAASUVORK5CYII=";
            var content = "";
            var aditionalsHtml = "";
            var companionHtml = "";
            var tarifa = "";
            module.exports.getExtraGuest(resv_name_id)
                .then(function (guest) {
                if (guest.length > 0) {
                    console.log(guest[0]);
                    var amountTarifa = parseInt(guest[0]['SHARE_AMOUNT']).toLocaleString("de-DE", { minimumFractionDigits: 0 });
                    tarifa = guest[0]['RATE_CODE'] + " $" + amountTarifa.replace(",", ".");
                    var companion = guest[0]['ACCOMPANYING_NAMES'];
                    console.log(companion);
                    if (companion != null && companion != undefined && companion != "") {
                        companion = companion.split("/");
                        if (companion.length > 0) {
                            companionHtml = "<img class=\"separador\" src=\"" + separador + "\">\n                           <h4 class=\"separadorTitle\">Acompa\u00F1antes</h4>";
                            if (companion.length >= 2) {
                                companion = companion.slice(0, 2);
                            }
                            for (var i = 0; i < companion.length; ++i) {
                                var nameCompanion = companion[i].split(",");
                                companionHtml = companionHtml + "<div class=\"row\">\n                               <div class=\"col\">\n                               <div class=\"row\">\n                               <div class=\"contentData subCol\"><label for=\"firstName\">Nombre / Name:</label></div>\n                               <div class=\"contentData subCol data\"><span>" + nameCompanion[0] + " </span></div>\n                               </div>\n                               </div>\n                               <div class=\"col\">\n                               <div class=\"row\">\n                               <div class=\"contentData subCol\"><label>Apellido / Surname:</label></div>\n                               <div class=\"contentData subCol data\"><span>" + nameCompanion[1] + " </span></div>\n                               </div>\n                               </div>\n                               </div>";
                            }
                        }
                    }
                    console.log(companion);
                    fileS.readFile('/home/ubuntu/serverAPI/dist/docID/DocId-' + guest[0]['GUEST_NAME_ID'] + '.png', 'base64', function (err, dataimg) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        // console.log("imagen perfil:",dataimg);
                        imagenPerfil = "data:image/png;base64," + dataimg;
                        content = "";
                        module.exports.getAdditional(resv_name_id)
                            .then(function (dataAditionals) {
                            aditionalsHtml = dataAditionals;
                            content = "<!doctype html><html><head> <meta charset=\"utf-8\"> <title>PDF</title> <link href=\"stylePdf.css\" rel=\"stylesheet\"></head><body> <div class=\"contentPdf\"> <div class=\"logo\"> <img src=\"" + imgLogo + "\"> <img class=\"perfil imagen\" src=\"" + imagenPerfil + "\"> </div><div class=\"header\"> <div class=\"row\"> <div class=\"contentData subCol\"><label for=\"firstName\">Room:</label></div><div class=\"contentData subCol data\"><span>" + room + " </span></div></div><div class=\"row\"> <div class=\"contentData subCol\"><label for=\"firstName\">Check In:</label></div><div class=\"contentData subCol data\"><span>" + checkIn + " </span></div></div><div class=\"row\"> <div class=\"contentData subCol\"><label for=\"firstName\">Check Out:</label></div><div class=\"contentData subCol data\"><span>" + checkOut + " </span></div></div><div class=\"row\"> <div class=\"contentData subCol\"><label for=\"firstName\">Guest N\u00B0:</label></div><div class=\"contentData subCol data\"><span>" + guests + " </span></div></div><div class=\"row\"> <div class=\"contentData subCol\"><label for=\"firstName\">Tarifa:</label></div><div class=\"contentData subCol data\"><span>" + tarifa + " </span></div></div></div><div class=\"bodyData\"> <img class=\"separador1\" src=\"" + separador + "\"> <h4 class=\"separadorTitle\">Datos del titular</h4> <div class=\"row\"> <div class=\"col\"> <div class=\"row\"> <div class=\"contentData subCol\"><label for=\"firstName\">Nombre / Name:</label></div><div class=\"contentData subCol data\"><span>" + name + " </span></div></div></div><div class=\"col\"> <div class=\"row\"> <div class=\"contentData subCol\"><label>Apellido / Surname:</label></div><div class=\"contentData subCol data\"><span>" + lastName + " </span></div></div></div></div><div class=\"row\"> <div class=\"col\"> <div class=\"row\"> <div class=\"contentData subCol\"><label>Direccion / Address:</label></div><div class=\"contentData subCol data\"><span>" + address + " </span></div></div></div><div class=\"col\"> <div class=\"row\"> <div class=\"contentData subCol\"><label>Pais / Country:</label></div><div class=\"contentData subCol data\"><span>" + countryLong + " </span></div></div></div></div><div class=\"row\"> <div class=\"col\"> <div class=\"row\"> <div class=\"contentData subCol\"><label>Ciudad / City:</label></div><div class=\"contentData subCol data\"><span>" + city + " </span></div></div></div><div class=\"col\"> <div class=\"row\"> <div class=\"contentData subCol\"><label>Telefono / Phone:</label></div><div class=\"contentData subCol data\"><span>" + phone + " </span></div></div></div></div><div class=\"row\"> <div class=\"col\"> <div class=\"row\"> <div class=\"contentData subCol\"><label>E-mail:</label></div><div class=\"contentData subCol data\"><span>" + email + " </span></div></div></div><div class=\"col\"> <div class=\"row\"> <div class=\"contentData subCol\"><label>Cedula identidad:</label></div><div class=\"contentData subCol data\"><span>" + personalNmb + " </span></div></div></div></div><div class=\"row\"> <div class=\"col\"> <div class=\"row\"> <div class=\"contentData subCol\"><label>Passport N\u00B0:</label></div><div class=\"contentData subCol data\"><span>" + passportNmb + " </span></div></div></div></div>" + companionHtml + " " + aditionalsHtml + " </div></div><div class=\"footer\" id=\"footerContent\"> <img src=\"" + signatureBse64 + " \"> <div class=\"description\"> <h3>Firma Huesped / Guest Signature</h3> </div></div><div class=\"contentPdf2\"> <div class=\"bodyData2 formulario\"> <p>EN LOS ULTIMOS 15 D\u00CDAS \u00BFHA ESTADO EN CONTACTO CON ALGUIEN DIAGNOSTICADO COVID POSITIVO?(*)</p><input type=\"radio\" id=\"yes\" name=\"yes\" value=\"male\"> <label for=\"yes\">SI</label><br><input type=\"radio\" id=\"no\" name=\"no\" value=\"female\" checked> <label for=\"no\">NO</label> <br><p>\u00BFUSTED HA TENIDO ALGUNO DE ESTOS S\u00CDNTOMAS?(*)</p><input type=\"radio\" id=\"sitoma\" name=\"sitoma\" value=\"30\" checked> <label for=\"sitoma\">NINGUNO</label> <br><p>DECLARACI\u00D3N JURADA: LOS ANTECEDENTES QUE EXPONGO SON VERDADEROS, EN CASO DE FALSEDAD DE LA DECLARACI\u00D3N, PODRA SER SANCIONADO PENALMENTE.(*)</p><input type=\"radio\" id=\"acept\" name=\"acept\" value=\"30\" checked> <label for=\"acept\">ENTIENDO Y ACEPTO</label> </div><div class=\"bodyData2 list\"> <img class=\"separador\" src=\"" + separador + "\"> <h4 class=\"separadorTitle\">Politicas del Hotel</h4> <ul> <li>Declaraci\u00F3n Jurada COVID-19 aprobada.</li><li>En caso de contingencia o alg\u00FAn motivo de fuerza mayor su habitaci\u00F3n podr\u00EDa ser resignada.</li><li>Hotel Santa Cruz Plaza no se responsabiliza por las p\u00E9rdidas de dinero, joyas u otros objetos de valor no declarados, para su conveniencia encontrar\u00E1 una caja de seguridad en su habitaci\u00F3n.</li><li>No se permiten mascotas al interior de las habitaciones.</li><li>Se proh\u00EDbe fumar al interior de las habitaciones.</li><li>Por el Presente documento autorizo al hotel para cargar a mi tarjeta de cr\u00E9dito ____________ exp __/__, entregada para realizar mi reserva el total de los cargos que se registren durante mi estad\u00EDa, consumos de alimentaci\u00F3n y otros.</li></ul> </div></div><div class=\"footer\" id=\"footerContent\"> <img src=\"" + signatureBse64 + " \"> <div class=\"description\"> <h3>Firma Huesped / Guest Signature</h3> </div></div></body></html>";
                            module.exports.constructPdf(content, resv_name_id, hotel, name, lastName, email)
                                .then(function (respConstruct) {
                                resolve({ success: "success" });
                            })
                                .catch(function (err) {
                                console.log("error: obteniendo imagen de perfil");
                                resolve({ success: "success" });
                            });
                        })
                            .catch(function (err) {
                            console.log("error: getAdditional");
                        });
                    });
                }
            })
                .catch(function (err) {
                console.log("error getExtraGuest:", err);
            });
        });
    },
    getAdditional: function (resv_name_id) {
        return new Promise(function (resolve, reject) {
            var separador = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAFCAYAAAA3zK6FAAAAHUlEQVQokWM8X6P8n2EQA6aBdgAhMOpASsGgdyAArdwCd0qzu3UAAAAASUVORK5CYII=";
            var sql = "SELECT \n            PRODUCT as product,\n            PRICE as price,\n            quantity as quantity\n            FROM reservation_product_prices\n            WHERE resv_name_id = :resv_name_id\n            AND product IN ('MUSEOCOLUSD','CENACOLUSD','DESAEJEUSD','DESACAMPUSD',\n            'MUSEOCOL','CENACOLCHAGUA','DESAEJE','DESACAMP','RUTAMUSEOS','PACKMUSEOS')";
            oracleCn.open(sql, [resv_name_id], false)
                .then(function (data) {
                console.log("adicionales:", data);
                var aditionals = "";
                if (data.length > 0) {
                    aditionals = "<img class=\"separador\" src=\"" + separador + "\">\n                    <h4 class=\"separadorTitle\">Adicionales</h4>\n                    <table>\n                    <tr>\n                       <th>PRODUCTO</th>\n                       <th>PRECIO</th>\n                       <th>CANTIDAD</th>\n                    </tr>";
                    for (var i = 0; i < data.length; ++i) {
                        aditionals = aditionals + "<tr>\n                        <td>" + data[i]['PRODUCT'] + "</td>\n                        <td>" + data[i]['PRICE'] + "</td>\n                        <td>" + data[i]['QUANTITY'] + "</td>\n                        </tr>";
                        if (i == (data.length - 1)) {
                            aditionals = aditionals + "</table>";
                            resolve(aditionals);
                        }
                    }
                }
                else {
                    resolve("");
                }
            })
                .catch(function (err) {
                resolve("");
            });
        });
    },
    constructPdf: function (content, resv_name_id, hotel, name, lastName, email) {
        return new Promise(function (resolve, reject) {
            var options = {
                "html": content,
                "css": "/home/ubuntu/serverAPI/dist/stylePdf.css",
                'papersize': { format: 'Tabloid', orientation: 'portrait', border: '0cm' },
                'footer': "<footer class=\"pdf-footer\" style=\"font-size: 10px; font-weight: bold; color: #000;><p style=\"margin: 0\">Powered by XYZ</p></footer>"
            };
            pdf.convert(options, function (err, result) {
                console.log("convert pdf:", err);
                result.toBuffer(function (returnedBuffer) { });
                var stream = result.toStream();
                var tmpPath = result.getTmpPath();
                result.toFile('/home/ubuntu/serverAPI/dist/pdf/Pdf-' + resv_name_id + '.pdf', function (data) {
                    console.log("toFile:", data);
                    resolve({ success: "success" });
                    module.exports.sendFilePdf(fileS.createReadStream('/home/ubuntu/serverAPI/dist/pdf/Pdf-' + resv_name_id + '.pdf')); // to centos path  
                    module.exports.setCheckInRoom(resv_name_id, hotel);
                    module.exports.getNameIdTitular(resv_name_id, 'Pdf-' + resv_name_id + '.pdf', hotel);
                    module.exports.sendEmailFinal(resv_name_id, 'Pdf-' + resv_name_id + '.pdf', hotel, email, name + " " + lastName);
                });
            });
        });
    },
    getExtraGuest: function (resv_name_id) {
        return new Promise(function (resolve, reject) {
            var sql = "SELECT\n            n.guest_name apellido,\n            n.GUEST_FIRST_NAME nombre,\n            n.address1||n.address2 direccion,\n            n.country_desc pais,\n            n.city ciudad,\n            n.phone_no telefono,\n            n.email email,\n            n.rg_udfc05 patente,\n            n.tax1_no cedula,\n            n.passport pasaporte,\n            n.group_name grupo,\n            n.adults+n.children guest_number,\n            n.room room,\n            n.ACCOMPANYING_NAMES,\n            n.resv_name_id,\n            n.guest_name_id,\n            n.my_room_rate,\n            NVL(actual_check_in_date,arrival) check_in,\n            NVL(actual_check_out_date,departure) check_out,\n            n.room_category_label,\n            n.rate_code,\n            CASE when n.travel_agent_name is not null then n.travel_agent_name\n            when n.company_name is not null then n.company_name\n            when (n.travel_agent_name IS NULL AND n.company_name IS NULL) THEN 'Particular'\n            END travel_agent_name,\n            n.room_class,\n            n.share_amount\n            FROM name_reservation n\n            WHERE n.resv_name_id = :resv_name_id";
            oracleCn.open(sql, [resv_name_id], false)
                .then(function (data) {
                console.log("acompañantes:", data);
                resolve(data);
            })
                .catch(function (err) {
                resolve({});
            });
        });
    },
    getPicDocId: function (resv_name_id) {
        return new Promise(function (resolve, reject) {
            var request = require('request').defaults({ encoding: null });
            request.get('/home/ubuntu/serverAPI/dist/docID/DocId-' + resv_name_id + '.png', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var img64 = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                    // console.log(img64);
                    resolve(img64);
                }
                else {
                    console.log("error getPicDocId :", error);
                    reject();
                }
            });
        });
    },
    setAddressData: function (resv_name_id, address, city, country, number, patente) {
        if (resv_name_id === void 0) {
            resv_name_id = "";
        }
        if (address === void 0) {
            address = "";
        }
        if (city === void 0) {
            city = "";
        }
        if (country === void 0) {
            country = "";
        }
        if (number === void 0) {
            number = "";
        }
        if (patente === void 0) {
            patente = "";
        }
        var sql = "BEGIN pa_web.PRC_ACT_DIRECCION(\n        :pin_resv_name_id,\n        :pin_address,\n        :pin_city,\n        :pin_country,\n        :pin_number,\n        :pin_patente,\n        :pout_message);\n        END;";
        var pin_resv_name_id = parseInt(resv_name_id);
        var pin_address = address;
        var pin_city = city;
        var pin_country = country;
        var pin_number = number;
        var pin_patente = patente;
        var setss = { pin_resv_name_id: pin_resv_name_id,
            pin_address: pin_address,
            pin_city: pin_city,
            pin_number: pin_number,
            pin_country: pin_country,
            pin_patente: pin_patente };
        console.log("setAddressData:", setss);
        oracleCn.openProcedure(sql, {
            pin_resv_name_id: pin_resv_name_id,
            pin_address: pin_address,
            pin_city: pin_city,
            pin_country: pin_country,
            pin_number: pin_number,
            pin_patente: pin_patente,
            pout_message: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 }
        })
            .then(function (data) {
            console.log("setAddressData:", data);
        })
            .catch(function (error) {
            console.log("error setAddressData:", error);
        });
    },
    setCheck: function (resv_name_id, hotel) {
        var dateCheck = new Date();
        var var_sql = [
            resv_name_id,
            dateCheck,
            hotel
        ];
        var p_status = "REALIZADO";
        var sql = "BEGIN pa_web.pro_status_resv_web (\n        :p_status,\n        :resv_name_id,\n        :pout_message); END;";
        var pout_message = { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 };
        oracleCn.open(sql, [p_status, parseInt(resv_name_id), pout_message], false)
            .then(function (resp) {
            console.log("success status Pre-Check:", resv_name_id);
            console.log("pout_message Pre-Check:", pout_message);
        })
            .catch(function (err) {
            console.log("error set check-in:", err);
        });
        var sql2 = "INSERT INTO `precheck`.`checking` (`resv_name_id`, `inserted`, `resort`) VALUES (?, ?, ?);";
        mysqlCn.connectQuery(sql2, var_sql)
            .then(function (data) {
            console.log("success statusCheck:", data.insertId);
        })
            .catch(function (err) {
            console.log("error statusCheck:", err);
        });
    },
    sendFilePdf: function (file) {
        var request = require('request');
        var reqSend = request.post(filePdf, function (err, resp, body) {
            if (err) {
                console.log('Error!', err);
            }
            else {
                console.log('uploades success: ' + body);
            }
        });
        var formSend = reqSend.form();
        formSend.append('filetoupload', file);
    },
    setCheckInRoom: function (pin_resv_name_id, hotel) {
        var sql = "UPDATE reservation_name\n        SET udfc01 = 'Y'\n        WHERE resv_name_id = :pin_resv_name_id\n        AND resort = :hotel";
        oracleCn.open(sql, [pin_resv_name_id, hotel], true)
            .then(function (data) {
            console.log("success check in room:", data);
            console.log("dataSend check in room:", pin_resv_name_id, hotel);
        })
            .catch(function (err) {
            console.log("error setCheckInRoom:", err);
        });
    },
    getNameIdTitular: function (resv_name_id, namePdf, hotel) {
        var sql = "BEGIN pa_web.prc_buscar_name(\n        :pin_resv_name_id,\n        :pout_name_id,\n        :pout_mensaje);\n        END;";
        var pin_resv_name_id = resv_name_id;
        oracleCn.openProcedure(sql, {
            pin_resv_name_id: pin_resv_name_id,
            pout_name_id: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 },
            pout_mensaje: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 }
        })
            .then(function (data) {
            console.log("getNameIdTitular:", data);
            module.exports.setPdf(namePdf, data.outBinds.pout_name_id, "Carta Registro", hotel);
        })
            .catch(function (error) {
            console.log("error getNameIdTitular:", error);
        });
    },
    setPdf: function (name_file, name_id, type_doc, hotel) {
        if (name_file === void 0) {
            name_file = "magallanes.pdf";
        }
        if (name_id === void 0) {
            name_id = 235602;
        }
        if (type_doc === void 0) {
            type_doc = "Carta Registro";
        }
        var sql = "BEGIN pa_web.prc_attachment(\n        :pin_nombre_archivo,\n        :pin_tipo_doc,\n        :pin_link_type,\n        :pin_name_id,\n        :pin_resort,\n        :pin_directorio,\n        :pout_error\n        );\n        END;";
        var pin_nombre_archivo = name_file;
        var pin_name_id = name_id;
        var pin_tipo_doc = type_doc;
        var pin_directorio = "ATTACHMENTS";
        var pin_resort = hotel;
        var pin_link_type = "CONTACT"; // account, contact, booking
        oracleCn.openProcedure(sql, {
            pin_nombre_archivo: pin_nombre_archivo,
            pin_tipo_doc: pin_tipo_doc,
            pin_link_type: pin_link_type,
            pin_name_id: pin_name_id,
            pin_resort: pin_resort,
            pin_directorio: pin_directorio,
            pout_error: { dir: objoracle.BIND_OUT, type: objoracle.STRING, maxSize: 40 }
        })
            .then(function (data) {
            console.log("success pdf to perfil:", data);
        })
            .catch(function (error) {
            console.log("error pdf to perfil:", error);
        });
    },
    sendEmailFinal: function (resv_name_id, pdfName, resort, email, name) {
        return new Promise(function (resolve, reject) {
            var hotel = "";
            var logo = "";
            var bgHotel = "";
            if (resort == "HTSCR") {
                hotel = "HOTEL SANTA CRUZ";
            }
            var pathPdf = "/home/ubuntu/serverAPI/dist/pdf/" + pdfName; // to centos path
            var messageHtml = "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\"><title></title></head><body><table style=\"width: 750px; font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 20px;border-spacing: inherit;\"><tbody><tr><td style=\"height: 160px; background-color: #231c1d;text-align: center\"> <img src=\"https://checkin.hscp.cl/api/logosanta.png\" class=\"mx-auto d-block\"></td></tr><tr style=\"color:#fff;text-align:center;width: 100%;height: 500px; background-image: url('https://checkin.hscp.cl/api/hotel_fondo_final.jpg');padding-left: 20px; padding-right: 20px;background-size: contain;\"><td style=\"background-color: rgba(0,0,0,0.5);\"><h2>Estimado " + name + "</h2><p>Gracias por su preferencia adjunto encontrara su comprobante de Check in.</p><p>Le recordamos pasar por recepcion a retirar sus llaves.</p> <img src=\"https://checkin.hscp.cl/api/line_santa.png\"></td></tr><tr><td style=\"background-color: #fff;height: 400px\"><table style=\"width:100%\" ><tbody><tr><td style=\"text-align: center; width: 50%\"> <img src=\"https://checkin.hscp.cl/api/grupoimagensanta.png\"></td><td style=\"text-align: left; width: 50%\"> <img src=\"https://checkin.hscp.cl/api/line_santa.png\"><h2>HOTEL<br>SANTA CRUZ</h2><p>Contacto: <span style=\"color:#cf7c23\">+56 72 220 9600</span><br>Ubicaci\u00F3n: <span style=\"color:#cf7c23\">Plaza de Armas 286, Santa Cruz. Chile.</span><br>Correo: <span style=\"color:#cf7c23\">reservas@hscp.cl</span></p><p>\u2192 VISITA NUESTRO <span style=\"color:#cf7c23\"><a href=\"https://www.hotelsantacruzplaza.cl\">SITIO WEB</a></span></p></td></tr></tbody></table></td></tr><tr><td style=\"font-size:12px;background-color: #000000;color:#fff;height: 250px;text-align: center;\"> <img src=\"https://checkin.hscp.cl/api/fb.png\" style=\"width: 45px;\"><img src=\"https://checkin.hscp.cl/api/in.png\" style=\"width: 45px;\"><img src=\"https://checkin.hscp.cl/api/hoo.png\" style=\"width: 45px;\"><img src=\"https://checkin.hscp.cl/api/pin.png\" style=\"width: 45px;\"><p>2020 \u00A9 Hotel Santa Cruz, Hotel y Centro de Convenciones.</p></td></tr></tbody></table></body></html> ";
            var mailOptions = {
                from: 'checkin@hscp.cl',
                to: email,
                subject: "Comprobante de Check-in",
                html: messageHtml,
                attachments: [{
                        filename: 'resumen.pdf',
                        path: pathLb.join(pathPdf),
                        contentType: 'application/pdf'
                    }],
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
        });
    },
};
