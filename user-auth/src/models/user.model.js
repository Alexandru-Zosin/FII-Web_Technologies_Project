const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});

connection.connect((err) => {
    if (err)
        throw err; // callback function that would return a 500/503 code
    console.log('Connected to the database successfully!');
});

function findUserByUsername(username, callback) {
    const query = 'SELECT * FROM users WHERE username = ?'; // this should be in a separate file
    connection.query(query, [username], (err, result) => {
        if (err)
            return callback(err, null);
        else
            callback(null, result[0]);
    });
}

function registerUser(userData, callback) {
    findUserByUsername(userData.username, (err, results) => {
        if (err)
            return callback(err, false);
        if (results.length > 0) { // user already exists
            return callback(null, false);
        }
    });
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [userData.username, userData.password], (err, results) => {
        if (err)
            return callback(err);
        callback(null, true);
    });
}

module.exports = { findUserByUsername, registerUser };
