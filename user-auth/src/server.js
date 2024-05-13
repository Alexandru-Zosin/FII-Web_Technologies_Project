const http = require('http');
const { login } = require('./controllers/login.controller');
const { signup } = require('./controllers/signup.controller');
const { logout } = require('./controllers/logout.controller');
const { validate } = require('./controllers/validate.controller');
const PORT = 3000;

require('dotenv').config({ path: require('path').join(__dirname, './.env') });

function parseJSON(req, res, next) { // middleware
    let data = '';
    req.on('data', chunk => {
        data += chunk.toString(); // buffer to string
    });
    req.on('end', () => {
        try {
            req.body = JSON.parse(data); // string to json
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON format.' }));
        }
        next();
    });
}

const server = http.createServer((req, res) => { // requestListener
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
                    logout(res);
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
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Not found.'
        }));
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});