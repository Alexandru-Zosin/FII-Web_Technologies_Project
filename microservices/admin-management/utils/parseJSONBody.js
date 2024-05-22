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

module.exports = { parseJSON };