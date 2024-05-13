const { decrypt } = require('../../utils/crypting');
const { PORTS } = require('../../whitelistports');

function validate(req, res) {
    const cookies = {};
    if (req.headers.cookie) {
        const cookieArray = req.headers.cookie.split(';');
        for (let cookie of cookieArray) {
            const parts = cookie.split('=');
            cookies[parts[0].trim()] = parts[1].trim();
        }
    }

    const sessionToken = cookies['default'];
    if (!sessionToken) {
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
        switch (req.connection.remotePort) {
            case PORTS.admin:
                res.end(JSON.stringify({ userId, role }));
                break;
            case PORTS.front:
                res.end(JSON.stringify({ userId, role }));
                break;
            case PORTS.openAI:
                res.end(JSON.stringify({ openAiKey }));
                break;
            default:
                res.end(JSON.stringify({ openAiKey }));
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
