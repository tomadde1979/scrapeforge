// server/production-server.js

import express from 'express';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url || 'file:///app/server/production-server.js');
const __dirname = dirname(__filename || '/app/server');

// Correct path to the build output
const distPath = resolve(__dirname, '../dist');

const app = express();

// Serve static files from the build
app.use(express.static(distPath));

// Fallback route for React Router
app.get('*', (req, res) => {
  res.sendFile(resolve(distPath, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Production server running on port ${PORT}`);
});