const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const proxyOptions = {
    target: 'http://127.0.0.1:5000', // Use 127.0.0.1 instead of localhost for better reliability
    changeOrigin: true,
    secure: false,
    ws: false, // Disable websocket proxying - only proxy HTTP requests (React HMR uses /ws which should not be proxied)
    logLevel: 'warn', // Reduce log noise
    timeout: 30000, // 30 second timeout
    proxyTimeout: 30000,
    // Path is preserved by default, so no pathRewrite needed
    onProxyReq: (proxyReq, req, res) => {
      // Set proper headers
      proxyReq.setHeader('X-Forwarded-For', req.ip || req.connection.remoteAddress);
      proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
    },
    onError: (err, req, res) => {
      // Only log errors for API requests, not WebSocket
      if (req.url && req.url.startsWith('/api')) {
        console.error('[Proxy Error]', err.code, err.message);
        if (!res.headersSent) {
          res.status(502).json({
            error: 'Proxy error',
            message: 'Could not connect to backend server',
            details: err.message,
            code: err.code,
          });
        }
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log successful proxy requests in debug mode
      if (process.env.NODE_ENV === 'development' && req.url && req.url.startsWith('/api')) {
        console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
      }
    },
  };

  // Proxy all /api/v1 requests to the backend
  // The path is preserved, so /api/v1/auth/me -> http://127.0.0.1:5000/api/v1/auth/me
  app.use('/api/v1', createProxyMiddleware(proxyOptions));

  // Also proxy /api requests (without version) for backwards compatibility
  // This should come after /api/v1 to avoid conflicts
  app.use('/api', createProxyMiddleware(proxyOptions));
};

