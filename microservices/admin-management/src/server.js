const https = require('https');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const url = require('url');
const { parseJSON } = require('../utils/parseJSONBody');
const { setCORSHeadersOnValidOrigin } = require('../utils/corsHeaders');
require('dotenv').config({ path: path.join(__dirname, './.env') });

const PORT = 3001;

const { getDashboard } = require('./routes/dashboard.controller.js');
const { getUsers, uploadUser, updateUser, deleteUser } = require('./routes/users.controller.js');
const { getResources, uploadResource, updateResource, deleteResource, importResources, exportResources } = require('./routes/resources.controller.js');

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

const server = https.createServer(options, async (req, res) => {
    if (!setCORSHeadersOnValidOrigin(req, res))
        return;

    if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Content-Length': '0' });
        return res.end();
    }
    const authorizationPayload = await authorizeRequest(req);
    if (!authorizationPayload) {
        res.writeHead(401, {
            'Content-Type': 'application/json',
        });
        return res.end(JSON.stringify({
            error: 'Unauthorized.'
        }));
    }

    if (req.method === 'GET' && req.url === '/dashboard') {
        getDashboard(req, res);
        return;
    }

    if (req.method === 'GET' && req.url === '/resources') {
        exportResources(req, res);
        return;
    }

    if (req.method === 'PUT' && req.url === '/resources') {
        parseJSON(req, res, () => {
            importResources(req, res);
        });
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const userTableMatch = pathname.match(/^\/users\/([^\/]+)$/);
    const resourceTableMatch = pathname.match(/^\/resources\/([^\/]+)$/);

    if (userTableMatch) {
        const userTable = userTableMatch[1];
        switch (req.method) {
            case 'GET':
                getUsers(req, res, userTable);
                break;
            case 'POST':
                parseJSON(req, res, () => {
                    uploadUser(req, res, userTable);
                });
                break;
            case 'DELETE':
                parseJSON(req, res, () => {
                    deleteUser(req, res, userTable);
                });
                break;
            case 'PUT':
                parseJSON(req, res, () => {
                    updateUser(req, res, userTable);
                });
                break;
            default:
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method not allowed.' }));
                break;
        }
    } else if (resourceTableMatch) {
        const resourceTable = resourceTableMatch[1];
        switch (req.method) {
            case 'GET':
                getResources(req, res, resourceTable);
                break;
            case 'POST':
                parseJSON(req, res, () => {
                    uploadResource(req, res, resourceTable);
                });
                break;
            case 'DELETE':
                parseJSON(req, res, () => {
                    deleteResource(req, res, resourceTable);
                });
                break;
            case 'PUT':
                parseJSON(req, res, () => {
                    updateResource(req, res, resourceTable);
                });
                break;
            default:
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method not allowed.' }));
                break;
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found.' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});