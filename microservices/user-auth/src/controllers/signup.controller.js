const { registerUser } = require('../models/user.model');
const { hashWithKey } = require('../../utils/crypting');

async function signup(req, res) {
    const { email, password } = req.body;

    // other validation logic, to be discussed
    if (!(email && password)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            error: 'Bad Request: Missing fields.'
        }));
    }

    const hashedPassword = hashWithKey(password, process.env.HASH_KEY);
    const userData = {
        email: email,
        password: hashedPassword,
    };

    try {
        const userCreated = await new Promise(async (resolve) => {
            const isUserRegistered = await registerUser(userData);
            resolve(isUserRegistered);
        });

        if (!userCreated) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                error: 'User already exists.'
            }));
        }
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            message: 'User registered successfully.'
        }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            error: 'Internal server error.'
        }));
    }
}

module.exports = { signup };