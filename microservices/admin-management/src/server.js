const https = require('https');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { parseJSON } = require('../utils/parseJSONBody');
const { setCORSHeadersOnValidOrigin } = require('../utils/corsHeaders');
require('dotenv').config({ path: path.join(__dirname, './.env') });

const PORT = 3001;

const { getDashboard, getUsers, getResources } = require('./controllers/dashboard.controller.js');

let options;
if (process.env.DEBUG_MODE === 'true') {
    options = {
        key: fs.readFileSync(process.env.DEBUG_KEY_PATH, 'utf8'),
        cert: fs.readFileSync(process.env.DEBUG_CERT_PATH, 'utf8')
    };
} else {
    options = {
        key: fs.readFileSync(process.env.KEY_PATH, 'utf8'),
        cert: fs.readFileSync(process.env.CERT_PATH, 'utf8')
    };
}

const agent = new (require('https')).Agent({
    rejectUnauthorized: false
});
async function authorizeRequest(req) {
    const adminValidation = await fetch("https://localhost:3000/validate", {
        agent,
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Origin": "https://localhost:3001",
            "Cookie": req.headers.cookie
        },
        body: JSON.stringify({}),
    });

    const validationJsonPayload = await adminValidation.json();
    if (validationJsonPayload.role === 'admin') {
        return true;
    } else {
        return false;
    }
}

const server = https.createServer(options, (req, res) => {
    if (!setCORSHeadersOnValidOrigin(req, res))
        return;

    if (req.method === 'GET') {
        if (!authorizeRequest(req)) {
            res.writeHead(401, {
                'Content-Type': 'application/json',
            });
            return res.end(JSON.stringify({
                error: 'Unauthorized.'
            }));
        }

        switch (req.url) {
            case '/dashboard':
                getDashboard(req, res);
                break;
            case '/users':
                getUsers(req, res);
                break;
            case '/resources':
                getResources(req, res);
                break;
            default:
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Not found.'
                }));
                break;
        }
    } else if (req.method === 'POST') {
        if (!authorizeRequest(req)) {
            res.writeHead(401, {
                'Content-Type': 'application/json',
            });
            return res.end(JSON.stringify({
                error: 'Unauthorized.'
            }));
        }

        parseJSON(req, res, () => {
            switch (req.url) {
                case '/users/':
                    break;
                case '/resources':
                    break;
                default:
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: 'Not found.'
                    }));
                    break;
            }
        });
    } else if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Content-Length': '0' });
        res.end();
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error.' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});