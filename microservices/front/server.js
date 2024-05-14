const https = require('https');
const fs = require('fs');
const path = require('path');
const PORT = 443;

// static files location
const baseDirectory = path.join(__dirname, 'public');

let options;

if (process.env.DEBUG_MODE == 'true') {
    options = {
        key: fs.readFileSync('./microservices/key.pem', 'utf8'),
        cert: fs.readFileSync('./microservices/csr.pem', 'utf8')
    };
} else {
    options = {
        key: fs.readFileSync('../key.pem', 'utf8'),
        cert: fs.readFileSync('../csr.pem', 'utf8')
    };
}

const server = https.createServer(options, (req, res) => {
    try {
        let safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');

        const filePath = path.join(baseDirectory, safeSuffix);
        // Determine content type by file extension
        const contentType = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml'
        }[path.extname(filePath).toLowerCase()] || 'application/octet-stream';

        // if the file exists, we send it
        fs.stat(filePath, (err, stats) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('404 Not Found');
                } else {
                    res.writeHead(500);
                    res.end('Internal Server Error');
                }
            } else if (stats.isFile()) {
                res.writeHead(200, { 'Content-Type': contentType });
                fs.createReadStream(filePath).pipe(res);
            } else {
                res.writeHead(403);
                res.end('Forbidden');
            }
        });
    } catch (error) {
        res.writeHead(500);
        res.end('Internal Server Error');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});
