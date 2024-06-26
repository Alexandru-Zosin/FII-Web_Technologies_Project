const PORTS = require('../whitelistports');

const allowedOrigins = Object.values(PORTS.PORTS).map(port => `https://localhost:${port}`);
allowedOrigins.push('https://localhost');

function setCORSHeadersOnValidOrigin(req, res) {
    const requestOrigin = req.headers.origin;
    if (allowedOrigins.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return true;
    } else {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden.' }));
        return false;
    }
}

module.exports = { setCORSHeadersOnValidOrigin };
