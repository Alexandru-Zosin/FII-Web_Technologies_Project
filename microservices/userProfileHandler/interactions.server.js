const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs');
const controller = require('./interactions.controller.js');
const routes = {
    'account/password': {
        'PATCH': controller.updatePassword,
        'OPTIONS': controller.applyCorsHeadersOnRequest,
    },
    'account/email': {
        'PATCH': controller.updateEmail,
        'OPTIONS': controller.applyCorsHeadersOnRequest,
    },
    'account/apikey': {
        'PATCH': controller.updateApiKey,
        'OPTIONS': controller.applyCorsHeadersOnRequest,
        'GET': controller.getApiKey,
        'PUT': controller.updateApiKeyNoPassword
    },
    'account': {
        'DELETE': controller.deleteAccount,
        'OPTIONS': controller.applyCorsHeadersOnRequest
    }
    
}
require('dotenv').config({ path: path.join(__dirname, '.env') });


if (process.env.DEBUG_MODE == 'true') {
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

// this is needed for the requst on the front end side
// let encodedPrompt = encodeURIComponent(prompt);
const server = https.createServer(options, (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    let data = '';
    req.on('data', chunk => {
        data += chunk.toString(); // buffer to string
    });
    req.on('end', () => {
        if (req.method == 'OPTIONS' || req.method == 'GET') {
            const chosenRoute =     routes[trimmedPath];
            if (chosenRoute && chosenRoute[req.method]) {
                chosenRoute[req.method](req, res);
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
            return;
        }
        else {
            try {
                req.body = JSON.parse(data); // string to json
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON format.' }));
            }
            const chosenRoute =     routes[trimmedPath];
            if (chosenRoute && chosenRoute[req.method]) {
                chosenRoute[req.method](req, res);
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        }
    });

});

const PORT = 8090;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});