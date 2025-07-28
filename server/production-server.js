import express from 'express';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// ESM-compatible __dirname and __filename with fallbacks
const __filename = fileURLToPath(import.meta.url || 'file:///app/server/production-server.js');
const __dirname = dirname(__filename);

const app = express();

// Path to Vite build output in dist/public
const staticPath = resolve(__dirname, '../dist/public');
const indexPath = resolve(staticPath, 'index.html');

console.log('Static path:', staticPath);
console.log('Index path:', indexPath);
console.log('Static path exists:', existsSync(staticPath));
console.log('Index file exists:', existsSync(indexPath));

// Serve static files from dist/public
app.use(express.static(staticPath));

// SPA fallback - serve index.html for all unknown routes
app.get('*', (req, res) => {
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      error: 'Build files not found',
      staticPath,
      indexPath,
      staticExists: existsSync(staticPath),
      indexExists: existsSync(indexPath),
      cwd: process.cwd()
    });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Production server running on port ${PORT}`);
  console.log(`Serving static files from: ${staticPath}`);
});