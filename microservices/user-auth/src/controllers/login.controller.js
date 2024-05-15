const { findUserByEmail } = require('../models/user.model');
const { encrypt, hashWithKey } = require('../../utils/crypting');

async function login(req, res) {
    const { email, password } = req.body;
    const hashedPassword = hashWithKey(password, process.env.HASH_KEY);

    const user = await findUserByEmail(email); // internal server occured try catch block

    if (!user || user.password !== hashedPassword) {
        res.writeHead(401, {
            'Content-Type': 'application/json',
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
            `default=${token}; HttpOnly; Path=/; SameSite=None; Secure;`,
            `dark_theme=${user.darkPreference}; Path=/; SameSite=None; Secure;`
        ],
    });

    return res.end(JSON.stringify({
        message: 'Login successful'
    }));
}

module.exports = { login };