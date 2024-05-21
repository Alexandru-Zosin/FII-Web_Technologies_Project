const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs');
const controller = require('./interactions.controller.js');
const routes = {
    'extractTechnologies': {
        'GET': controller.fetchTechnologeisFromDatabase,
        'OPTIONS': controller.applyCorsHeadersOnRequest,
    },
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

    const chosenRoute =     routes[trimmedPath];
    if (chosenRoute && chosenRoute[req.method]) {
        chosenRoute[req.method](req, res);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = 3557;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});