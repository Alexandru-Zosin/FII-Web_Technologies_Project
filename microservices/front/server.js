const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 80;

// Base directory where your static files are located
const baseDirectory = path.join(__dirname, 'public');

// Create an HTTP server
const server = http.createServer((req, res) => {
  try {
    // Normalize the URL path and default to index.html if empty
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

    // Serve the file if it exists
    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, {'Content-Type': 'text/html'});
          res.end('<h1>404 Not Found</h1>');
        } else {
          res.writeHead(500);
          res.end('Internal Server Error');
        }
      } else if (stats.isFile()) {
        res.writeHead(200, {'Content-Type': contentType});
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
  console.log(`Server running at http://localhost:${PORT}/`);
});
