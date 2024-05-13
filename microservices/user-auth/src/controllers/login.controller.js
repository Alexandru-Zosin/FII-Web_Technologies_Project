const { findUserByUsername } = require('../models/user.model');
const { encrypt, hashWithKey } = require('../../utils/crypting');

async function login(req, res) {
    const { username, password } = req.body;
    const hashedPassword = hashWithKey(password, process.env.HASH_KEY);

    const user = await findUserByUsername(username); // internal server occured try catch block

    if (!user || user.password !== hashedPassword) {
        res.writeHead(401, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost'
        });
        return res.end(JSON.stringify({
            error: 'Unauthorized.'
        }));
    }

    // else internal server occured try catch block
    /*
    if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                error: 'Internal server error.'
            }));
        }
    */

    const token = encrypt(`${user.id}|${user.role}|${Date.now() + 3600000 * 24}|
                               ${user.openAiKey}`,
        process.env.SECRET_KEY);

    res.writeHead(200, {
        'Set-Cookie': [
            `default=${token}; HttpOnly; Secure`,
            `dark_theme=${user.darkPreference}; Path=/; Secure`
        ],
        'Access-Control-Allow-Origin': 'http://localhost'
    });

    return res.end(JSON.stringify({
        message: 'Login successful'
    }));
}

module.exports = { login };