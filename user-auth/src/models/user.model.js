const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});

async function getConnectionFromPool() {
    return await new Promise((res) => {
        pool.getConnection((err, conn) => {
            res(conn);
        });
    });
}

async function findUserByUsername(username) {
    const connection = await getConnectionFromPool();
    const query = 'SELECT * FROM test WHERE username = ?'; // this should be in a separate file
    const user = await new Promise((res, rej) => {
        connection.query(query, [username], (err, result) => { // try catch in caz de eroare DB
            if (err)
                rej(err);
            else
                res(result[0]);
        });
    });
    connection.release();
    return user;
}

async function registerUser(userData) {
    const user = await findUserByUsername(userData.username); 
    
    if (user != null) {
        return false;
    }
    
    const connection = await getConnectionFromPool();
    const query = 'INSERT INTO test (username, password) VALUES (?, ?)';
    const isRegisterSuccessful = await new Promise((res) => {
        connection.query(query, [userData.username, userData.password], (err, results) => {
        if (err)
            res(false);
        else
            res(true);
        });
    });
    connection.release();
    return isRegisterSuccessful;
}

module.exports = { findUserByUsername, registerUser };
