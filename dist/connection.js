"use strict";
var objoracle = require("oracledb");
var cns = {
    /*user: "opera",
    password: "opera",
    connectString: "191.239.252.231/opera"*/
    //------------laboratorio------------
    user: "opera",
    password: "opera",
    // connectString: "181.118.163.93/opera"
    connectString: "181.212.30.93/opera"
    
};
function error(err, cn) {
    if (err) {
        console.log(err.message);
        if (cn != null)
            close(cn);
        return -1;
    }
    else {
        return 0;
    }
}
function open(sql, binds, dml) {
    return new Promise(function (resolve, reject) {
        objoracle.getConnection(cns, function (err, cn) {
            if (error(err, null) == -1)
                reject();
            // cn.execute(sql,binds,{autoCommit: dml, outFormat: objoracle.OUT_FORMAT_OBJECT},
            cn.execute(sql, binds, { autoCommit: dml, outFormat: objoracle.OUT_FORMAT_OBJECT }, function (err, result) {
                if (error(err, cn) == -1)
                    return;
                if (dml) {
                    resolve(JSON.stringify(result.rowsAffected));
                }
                else {
                    // console.log(result.metaData);
                    // resolve(JSON.stringify(result.rows));
                    resolve(result.rows);
                }
                close(cn);
            });
        });
    });
}
function openProcedure(sql, binds, dml) {
    return new Promise(function (resolve, reject) {
        objoracle.getConnection(cns, function (err, cn) {
            if (error(err, null) == -1)
                reject();
            var result = cn.execute(sql, binds);
            // console.log(result);
            resolve(result);
        });
    });
}
function openProcedureMany(sql, binds, options) {
    return new Promise(function (resolve, reject) {
        objoracle.getConnection(cns, function (err, cn) {
            if (error(err, null) == -1)
                reject();
            var result = cn.executeMany(sql, binds, options);
            // console.log(result);
            resolve(result);
        });
    });
}
function close(cn) {
    cn.release(function (err) {
        if (err) {
            console.error(err.message);
        }
    });
}
exports.openProcedureMany = openProcedureMany;
exports.openProcedure = openProcedure;
exports.open = open;
exports.close = close;
