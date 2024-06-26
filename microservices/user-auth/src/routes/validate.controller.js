const { decrypt } = require('../../utils/crypting');
const { PORTS } = require('../../whitelistports');
const { getHashedPasswordForUserId } = require('../models/user.model');
const url = require('url');

async function validate(req, res) {
    let cookies = {};
    let sessionToken;
    try {
        if (req.headers.cookie) {
            const cookieArray = req.headers.cookie.split(';');
            for (let cookie of cookieArray) {
                const parts = cookie.split('=');
                cookies[parts[0].trim()] = parts[1].trim();
            }
        }

        sessionToken = cookies['default'];
        if (!sessionToken) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                error: 'No session token provided.'
            }));
        }
    } catch (error) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            error: 'No session token provided.'
        }));
    }

    try {
        const decryptedToken = decrypt(sessionToken, process.env.SECRET_KEY);
        const [userId, role, expiration, openAiKey] = decryptedToken.split('|');

        if (Date.now() > parseInt(expiration)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                error: 'Session expired.'
            }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        // switchong remote port for the port from the origin since that is stable 
        const origin = req.headers.origin;
        let remotePort;

        if (origin) {
            const parsedUrl = new url.URL(origin);
            remotePort = parsedUrl.port || '443';
        } else {
            remotePort = req.socket.remotePort;
        }

        switch (parseInt(remotePort)) {
            case PORTS.admin:
                res.end(JSON.stringify({ userId, role }));
                break;
            case PORTS.userProfileHandler:
                const hashedPassword = await getHashedPasswordForUserId(userId);
                res.end(JSON.stringify({ hashedPassword: hashedPassword.password, userId, apiKey: openAiKey.replaceAll(/\s/g,'') }));
                break;
            case PORTS.front:
                res.end(JSON.stringify({ userId, role }));
                break;
            case PORTS.openAI:
                res.end(JSON.stringify({ openAiKey: openAiKey.replaceAll(/\s/g,'') }));
                break;
            default:
                res.end(JSON.stringify({ openAiKey: openAiKey.replaceAll(/\s/g,'') }));
                break;
        }
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Failed to decrypt token or invalid token format.'
        }));
    }
}

module.exports = { validate };
