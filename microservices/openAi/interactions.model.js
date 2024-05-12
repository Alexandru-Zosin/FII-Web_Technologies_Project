const http = require('http');
const url = require('url');
const path = require('path');
const controller = require('./interactions.controller.js');
const routes = {
    'extractFilter': {
        'GET': controller.createFiltersFromPrompt,
    },
}
require('dotenv').config({ path: path.join(__dirname, '.env') });

// this is needed for the requst on the front end side
// let encodedPrompt = encodeURIComponent(prompt);
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    const chosenRoute = routes[trimmedPath];
    if (chosenRoute && chosenRoute[req.method]) {
        chosenRoute[req.method](req, res);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = 3555;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});