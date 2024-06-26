const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'refiusers'
});

async function getConnectionFromPool() {
    return await new Promise((res) => {
        pool.getConnection((err, conn) => {
            res(conn);
        });
    });
}

async function findUserByEmail(email) {
    const connection = await getConnectionFromPool();
    const query = 'SELECT * FROM users WHERE email = ?';
    const user = await new Promise((res, rej) => {
        connection.query(query, [email], (err, result) => { // try catch in caz de eroare DB
            if (err)
                rej(err);
            else
                res(result[0]);
        });
    });
    connection.release();
    return user;
}

async function getHashedPasswordForUserId(userId) {
    const connection = await getConnectionFromPool();
    const query = `SELECT password FROM users where id = ?`
    const password = await new Promise((res, rej) => {
        connection.query(query, [userId], (err, result) => {
            if (err)
                rej(err);
            else 
                res(result[0]);
        })
    })
    connection.release();
    return password;
}

async function registerUser(userData) {
    const user = await findUserByEmail(userData.email); 
    
    if (user != null) {
        return false;
    }
    
    const connection = await getConnectionFromPool();
    const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
    const isRegisterSuccessful = await new Promise((res) => {
        connection.query(query, [userData.email, userData.password], (err, results) => {
        if (err)
            res(false);
        else
            res(true);
        });
    });
    connection.release();
    return isRegisterSuccessful;
}

module.exports = { findUserByEmail, registerUser, getHashedPasswordForUserId };
