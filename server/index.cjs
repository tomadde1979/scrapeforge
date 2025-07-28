const express = require('express');
const path = require('path');
require('dotenv').config();

const { initDatabase, registerUser, loginUser, getUserById, authenticateToken } = require('./auth');

// Mock storage for demonstration - in production you'd use the real database storage
const mockProjects = [
  {
    id: '1',
    name: 'Fitness Influencers Campaign',
    description: 'Target health and wellness creators on Instagram',
    platforms: ['instagram', 'tiktok'],
    keywords: 'fitness, health, wellness, gym',
    domains: '@gmail.com, @icloud.com',
    status: 'active',
    useRealScraping: true,
    useHeadlessMode: true,
    includeFollowers: false,
    includeCommenters: true,
    maxCommentsPerProfile: 25,
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-27')
  },
  {
    id: '2', 
    name: 'Tech Startup Founders',
    description: 'Find email contacts of startup founders and tech entrepreneurs',
    platforms: ['linkedin', 'twitter'],
    keywords: 'founder, CEO, startup, tech',
    domains: '@company.com, @startup.io',
    status: 'completed',
    useRealScraping: true,
    useHeadlessMode: false,
    includeFollowers: true,
    includeCommenters: false,
    maxFollowersPerProfile: 50,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-25')
  }
];

const mockResults = [
  { id: '1', projectId: '1', profileName: '@fitnessqueen', platform: 'instagram', email: 'maria@gmail.com', emailSource: 'bio', foundAt: new Date('2025-01-27') },
  { id: '2', projectId: '1', profileName: '@gymlife', platform: 'instagram', email: 'john.smith@icloud.com', emailSource: 'bio_link', foundAt: new Date('2025-01-27') },
  { id: '3', projectId: '2', profileName: 'techfounder', platform: 'linkedin', email: 'sarah@startup.io', emailSource: 'ai_parsed', foundAt: new Date('2025-01-25') },
];

const mockJobs = [
  { id: '1', projectId: '1', platform: 'instagram', status: 'running', progress: 75, totalProfiles: 100, scannedProfiles: 75, foundEmails: 23, currentProfile: '@healthygirl', startedAt: new Date('2025-01-27') },
  { id: '2', projectId: '2', platform: 'linkedin', status: 'completed', progress: 100, totalProfiles: 50, scannedProfiles: 50, foundEmails: 32, completedAt: new Date('2025-01-25') }
];

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database on startup
initDatabase();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    port: PORT
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    deployment: 'Railway'
  });
});

// Authentication routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const result = await registerUser(email, password);
    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await loginUser(email, password);
    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: error.message });
  }
});

app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Welcome to your dashboard!',
      user: user,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/verify-token', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ScrapeForge API routes
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    // In production, get projects for specific user: mockProjects.filter(p => p.userId === req.user.userId)
    res.json(mockProjects);
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description, platforms, keywords, domains, includeFollowers, includeCommenters, useHeadlessMode } = req.body;
    
    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      platforms,
      keywords,
      domains,
      status: 'active',
      useRealScraping: true,
      useHeadlessMode: useHeadlessMode || true,
      includeFollowers: includeFollowers || false,
      includeCommenters: includeCommenters || false,
      maxCommentsPerProfile: 25,
      maxFollowersPerProfile: 50,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockProjects.push(newProject);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

app.get('/api/projects/:id/results', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const results = mockResults.filter(r => r.projectId === id);
    res.json(results);
  } catch (error) {
    console.error('Results error:', error);
    res.status(500).json({ message: 'Failed to fetch results' });
  }
});

app.get('/api/projects/:id/jobs', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const jobs = mockJobs.filter(j => j.projectId === id);
    res.json(jobs);
  } catch (error) {
    console.error('Jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

app.post('/api/projects/:id/start-scraping', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { platforms } = req.body;
    
    // Create new scraping jobs for each platform
    const newJobs = platforms.map(platform => ({
      id: Date.now().toString() + Math.random(),
      projectId: id,
      platform,
      status: 'running',
      progress: 0,
      totalProfiles: Math.floor(Math.random() * 100) + 50,
      scannedProfiles: 0,
      foundEmails: 0,
      currentProfile: '',
      startedAt: new Date()
    }));
    
    mockJobs.push(...newJobs);
    res.json({ message: 'Scraping started', jobs: newJobs });
  } catch (error) {
    console.error('Start scraping error:', error);
    res.status(500).json({ message: 'Failed to start scraping' });
  }
});

app.get('/api/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const stats = {
      activeProjects: mockProjects.filter(p => p.status === 'active').length,
      totalProjects: mockProjects.length,
      emailsFound: mockResults.length,
      profilesScanned: mockJobs.reduce((sum, job) => sum + job.scannedProfiles, 0),
      successRate: 45.2,
      recentActivity: [
        { action: 'New email found', project: 'Fitness Influencers Campaign', time: '2 minutes ago' },
        { action: 'Scraping completed', project: 'Tech Startup Founders', time: '1 hour ago' },
        { action: 'Project created', project: 'Fitness Influencers Campaign', time: '1 day ago' }
      ]
    };
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

// Serve static files from client/dist in production
const clientDistPath = path.join(__dirname, '../client/dist');

// Static file serving
app.use(express.static(clientDistPath));

// Handle React routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${clientDistPath}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🚂 Railway deployment ready!`);
});