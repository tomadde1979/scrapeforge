import express from 'express';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Path to Vite build output
const distPath = resolve(__dirname, '../dist');

// Serve static files from dist folder
app.use(express.static(distPath));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = resolve(distPath, 'index.html');
  
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build files not found');
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});