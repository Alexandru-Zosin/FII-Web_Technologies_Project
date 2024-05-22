const mysql = require('mysql');

function connectToDatabase(config) {
    return new Promise(function(res, rej) {
        const connection = mysql.createConnection(config);
        connection.connect(function(err) {
            if (err) {
                rej(err);
            } else {
                res(connection);
            }
        });
    });
}

function queryDatabase(connection, sql, values) {
    values = values || [];
    return new Promise(function(res, rej) {
        connection.query(sql, values, function(err, result) {
            if (err) {
                rej(err);
            } else {
                res(result);
            }
        });
    });
}

function closeConnection(connection) {
    return new Promise(function(res, rej) {
        connection.end(function(err) {
            if (err) {
                rej(err);
            } else {
                res();
            }
        });
    });
}

module.exports = { connectToDatabase, queryDatabase, closeConnection };