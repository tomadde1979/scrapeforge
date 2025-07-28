const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email });
  
  // Mock login - always returns success
  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: { 
      id: 1, 
      email: email || 'user@example.com',
      name: 'Test User'
    },
    token: 'mock-jwt-token',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from client/dist in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  // Handle React routing - return all non-API requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Development server running', 
      frontend: 'http://localhost:5173',
      api: `http://localhost:${PORT}/api`
    });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Express server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
});