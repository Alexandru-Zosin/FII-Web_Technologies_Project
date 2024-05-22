const https = require('https');
const fs = require('fs');
const { login } = require('./controllers/login.controller');
const { signup } = require('./controllers/signup.controller');
const { logout } = require('./controllers/logout.controller');
const { validate } = require('./controllers/validate.controller');
const { setCORSHeadersOnValidOrigin } = require('../utils/corsHeaders');
const { parseJSON } = require('../utils/parseJSONBody');
const PORT = 3000;

require('dotenv').config({ path: require('path').join(__dirname, './.env') });

let options;
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

const server = https.createServer(options, (req, res) => { // requestListener
    if (!setCORSHeadersOnValidOrigin(req, res))
        return;

    if (req.method === 'POST') {
        parseJSON(req, res, () => {
            switch (req.url) {
                case '/login':
                    login(req, res);
                    break;
                case '/signup':
                    signup(req, res);
                    break;
                case '/logout':
                    logout(req, res);
                    break;
                case '/validate':
                    validate(req, res);
                    break;
                default:
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: 'Not found.'
                    }));
                    break;
            }
        });
    }
    else if (req.method == 'OPTIONS') {
        res.writeHead(204, {
            'Content-Length': '0'
        });
        res.end();
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Error.'
        }));
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
});