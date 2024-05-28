const { findUserByEmail } = require('../models/user.model');
const { encrypt, hashWithKey } = require('../../utils/crypting');
const { validateEmail, validatePassword } = require('../../utils/validate');

async function login(req, res) {
    const { email, password } = req.body;

    if (!(validateEmail(email)) || !(validatePassword(password))) {
        res.writeHead(403, {
            'Content-Type': 'application/json',
        });
        return res.end(JSON.stringify({
            error: 'Fordidden.'
        }));
    }

    try {
        const hashedPassword = hashWithKey(password, process.env.HASH_KEY);
        const user = await findUserByEmail(email);

        if (user?.password !== hashedPassword) {
            res.writeHead(401, {
                'Content-Type': 'application/json',
            });
            return res.end(JSON.stringify({
                error: 'Unauthorized.'
            }));
        }

        const token = encrypt(`${user.id}|${user.role}|${Date.now() + 3600000 * 24}|
                               ${(user.openaikey ?? '').replaceAll(/\s/g, '')}`,
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
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            error: 'Internal server error.'
        }));
    }
}

module.exports = { login };