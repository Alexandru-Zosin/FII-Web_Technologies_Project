const { findUserByUsername } = require('../models/user');
const { encrypt, hashWithKey } = require('../../utils/crypting');
require('dotenv').config();

function login(req, res) {
    const { username, password } = req.body;
    const hashedPassword = hashWithKey(password, process.env.HASH_KEY);

    findUserByUsername(username, (err, user) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                error: 'Internal server error.'
            }));
        }
        if (!user || user.password !== hashedPassword) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                error: 'Unauthorized.'
            }));
        }

        const token = encrypt(`${user.id}|${user.role}|${Date.now() + 3600000}|
                               ${user.openAiKey}`,
            process.env.SECRET_KEY);

        res.writeHead(200, {
            'Set-Cookie': [
                `default=${token}; HttpOnly; Secure`,
                `dark_theme=${user.darkPreference}; Path=/; Secure`
            ]
        });
        return res.end(JSON.stringify({
            message: 'Login successful'
        }));
    });
}

module.exports = { login };