const mysql = require('mysql');

function getConnectionFromPool(pool) {
    return new Promise((res, rej) => {
        pool.getConnection((err, connection) => {
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
    return new Promise((res, rej) => {
        connection.query(sql, values, (err, result) => {
            if (err) {
                rej(err);
            } else {
                res(result);
            }
        });
    });
}

module.exports = { getConnectionFromPool, queryDatabase };