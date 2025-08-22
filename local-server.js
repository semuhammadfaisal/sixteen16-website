// Simple local development server for testing
// Run with: node local-server.js
// Then visit: http://localhost:3000

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
let orders = []; // In-memory storage for local testing

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveFile(filePath, res) {
  const extname = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

function handleAPI(req, res, pathname) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'sixteen16 Local API is working!',
      timestamp: new Date().toISOString(),
      environment: 'local-development'
    }));
    return;
  }

  if (pathname === '/api/orders') {
    if (req.method === 'GET') {
      // Get all orders
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        orders: orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
        total: orders.length
      }));
      return;
    }

    if (req.method === 'POST') {
      // Create new order
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const orderData = JSON.parse(body);
          
          // Basic validation
          if (!orderData.name || !orderData.phone || !orderData.city || !orderData.address) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              error: 'Missing required fields'
            }));
            return;
          }

          // Create order
          const order = {
            id: 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            ...orderData,
            status: 'pending',
            timestamp: new Date().toISOString(),
            createdAt: new Date().toLocaleString('en-PK', {
              timeZone: 'Asia/Karachi'
            })
          };

          orders.push(order);

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Order submitted successfully',
            order: {
              id: order.id,
              timestamp: order.timestamp,
              total: order.total
            }
          }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid JSON data'
          }));
        }
      });
      return;
    }

    if (req.method === 'DELETE') {
      // Clear all orders
      orders = [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'All orders cleared successfully'
      }));
      return;
    }
  }

  // API endpoint not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    error: 'API endpoint not found'
  }));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    handleAPI(req, res, pathname);
    return;
  }

  // Handle static files
  let filePath = '.' + pathname;
  if (filePath === './') {
    filePath = './index.html';
  }

  serveFile(filePath, res);
});

server.listen(PORT, () => {
  console.log(`🚀 sixteen16 Local Server running at http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin.html`);
  console.log(`🔧 API test: http://localhost:${PORT}/api/test`);
  console.log(`\n💡 This server includes working API endpoints for local testing.`);
  console.log(`   When deployed to Vercel, the serverless API will be used instead.`);
});
