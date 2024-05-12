const { registerUser } = require('../models/user');
const { hashWithKey } = require('../../utils/hashWithKey');

function signup(req, res) {
    const { username, password } = req.body;

    // other validation logic, to be discussed
    if (!(username && password)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            error: 'Bad Request: Missing fields.'
        }));
    }

    const hashedPassword = hashWithKey(password, secretKey);
    const userData = {
        username: username,
        password: hashedPassword,
    };

    registerUser(userData, (err, userCreated) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                error: 'Internal server error'
            }));
        }
        if (!userCreated) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                error: 'User already exists.'
            }));
        }
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'User registered successfully. Please log in.'
        }));
    });
}

module.exports = { signup };