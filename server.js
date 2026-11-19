const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

let DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10);
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
};

const COMPRESSIBLE_EXTS = new Set(['.html', '.css', '.js', '.json', '.svg']);

const server = http.createServer((req, res) => {
  let parsedUrl = req.url.split('?')[0];
  let safePath = path.normalize(decodeURIComponent(parsedUrl)).replace(/^(\.\.[\/\\])+/, '');

  // Handle API mock (e.g. Payload CMS auth check /api/users/me or search /api/search)
  if (safePath === '/api/search' || safePath.startsWith('/api/search')) {
    const urlObj = new URL(req.url, 'http://localhost');
    const query = (urlObj.searchParams.get('q') || '').trim().toLowerCase();
    
    let searchData = [];
    try {
      searchData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'search-index.json'), 'utf8'));
    } catch (e) {}

    const results = query ? searchData.filter(item => {
      return (item.title && item.title.toLowerCase().includes(query)) ||
             (item.excerpt && item.excerpt.toLowerCase().includes(query));
    }).slice(0, 15) : [];

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ docs: results }));
    return;
  }

  if (safePath.startsWith('/api/') || safePath === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ user: null }));
    return;
  }
  
  if (safePath === '/' || safePath === '/vi' || safePath === '/vi/') {
    safePath = '/index.html';
  }
  if (safePath === '/vi/news' || safePath === '/vi/news/') {
    safePath = '/vi/posts/index.html';
  }
  if (safePath === '/vi/creative-products' || safePath === '/vi/creative-products/') {
    safePath = '/vi/services/souvenirs/index.html';
  }

  let filePath = path.join(ROOT_DIR, safePath);

  // 1. Direct file check
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      return serveFile(filePath, req, res, stats);
    }
    if (stats.isDirectory()) {
      const dirIndex = path.join(filePath, 'index.html');
      if (fs.existsSync(dirIndex)) {
        return serveFile(dirIndex, req, res);
      }
    }
  }

  // 2. Try with .html extension
  if (!path.extname(safePath)) {
    const htmlPath = filePath + '.html';
    if (fs.existsSync(htmlPath)) {
      return serveFile(htmlPath, req, res);
    }

    const nestedIndex = path.join(filePath, 'index.html');
    if (fs.existsSync(nestedIndex)) {
      return serveFile(nestedIndex, req, res);
    }

    // Default fallback to index.html
    return serveFile(path.join(ROOT_DIR, 'index.html'), req, res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

function serveFile(filePath, req, res, stats) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isHtml = ext === '.html';

  if (!stats) {
    try {
      stats = fs.statSync(filePath);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
  }

  const cacheControl = isHtml
    ? 'no-cache, must-revalidate'
    : 'public, max-age=604800, stale-while-revalidate=86400';

  // Dynamic component injection for HTML (Single footer.html file source)
  if (isHtml) {
    try {
      let htmlContent = fs.readFileSync(filePath, 'utf8');
      const footerPath = path.join(ROOT_DIR, 'footer.html');
      if (fs.existsSync(footerPath)) {
        const footerHtml = fs.readFileSync(footerPath, 'utf8');
        if (htmlContent.includes('id="site-footer-container"')) {
          htmlContent = htmlContent.replace(
            /<div id="site-footer-container">[\s\S]*?<\/div>/,
            `<div id="site-footer-container">${footerHtml}</div>`
          );
        } else if (htmlContent.includes('<!-- INCLUDE:FOOTER -->')) {
          htmlContent = htmlContent.replace('<!-- INCLUDE:FOOTER -->', footerHtml);
        } else if (htmlContent.includes('<footer class="site-footer')) {
          htmlContent = htmlContent.replace(/<footer class="site-footer[\s\S]*?<\/footer>/, footerHtml);
        }
      }

      const htmlBuffer = Buffer.from(htmlContent, 'utf8');
      const acceptEncoding = req.headers['accept-encoding'] || '';

      if (acceptEncoding.includes('gzip') && htmlBuffer.length > 1024) {
        zlib.gzip(htmlBuffer, (err, gzipped) => {
          if (err) {
            res.writeHead(500);
            return res.end();
          }
          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Encoding': 'gzip',
            'Vary': 'Accept-Encoding',
            'Cache-Control': cacheControl,
            'Content-Length': gzipped.length,
          });
          res.end(gzipped);
        });
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'Content-Length': htmlBuffer.length,
      });
      res.end(htmlBuffer);
      return;
    } catch (e) {
      console.error('Error serving HTML:', e);
    }
  }

  const range = req.headers.range;
  if (range && stats.size > 0) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
    const chunksize = (end - start) + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (COMPRESSIBLE_EXTS.has(ext) && acceptEncoding.includes('gzip') && stats.size > 1024) {
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Encoding': 'gzip',
      'Vary': 'Accept-Encoding',
      'Cache-Control': cacheControl,
    });
    fs.createReadStream(filePath).pipe(zlib.createGzip()).pipe(res);
    return;
  }

  res.writeHead(200, {
    'Content-Length': stats.size,
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
  });
  fs.createReadStream(filePath).pipe(res);
}

function startListening(port) {
  server.listen(port, () => {
    console.log(`\n====================================================`);
    console.log(`  LƯU SẮC KIM HOÀNG - Đang chạy tại: http://localhost:${port}`);
    console.log(`====================================================\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    DEFAULT_PORT++;
    startListening(DEFAULT_PORT);
  } else {
    console.error('Server error:', err);
  }
});

startListening(DEFAULT_PORT);
