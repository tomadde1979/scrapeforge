// Production server entry point to fix Railway path resolution issues
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix for import.meta.dirname in production with fallback
const __filename = fileURLToPath(import.meta.url || 'file:///app/server/production-server.js');
const __dirname = dirname(__filename || '/app/server');

// Import the main server logic from the compiled TypeScript output
import('../dist/index.js').then(async (module) => {
  console.log('Production server started successfully');
}).catch(error => {
  console.error('Failed to start production server:', error);
  
  // Fallback server with proper path resolution
  const app = express();
  
  // Serve static files with correct path resolution
  const distPath = path.resolve(__dirname, '../dist');
  
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    app.get('*', (req, res) => {
      res.status(500).json({ 
        error: 'Build directory not found',
        path: distPath,
        cwd: process.cwd(),
        dirname: __dirname
      });
    });
  }
  
  const port = parseInt(process.env.PORT || '5000', 10);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Fallback server running on port ${port}`);
  });
});