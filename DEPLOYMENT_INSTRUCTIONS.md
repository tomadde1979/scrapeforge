# GitHub and Railway Deployment Guide

## Getting Your ScrapeForge App to GitHub

Since git operations are restricted in this environment, here's how to manually upload your complete application to GitHub:

### Step 1: Create GitHub Repository

1. Go to GitHub.com and log in
2. Click "New repository" 
3. Name it: `scrapeforge-app` (or your preferred name)
4. Make it Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 2: Download Your Project Files

You need to download these key files and folders from your Replit project:

**Root Level Files:**
- `package.json` - Main dependencies and scripts
- `README.md` - Complete project documentation
- `.gitignore` - Git ignore rules
- `.env.example` - Environment variable template

**Client Folder** (`client/`):
- `client/package.json` - Frontend dependencies
- `client/index.html` - HTML template
- `client/src/` - **Entire src folder** containing:
  - `App.jsx` - Main React app
  - `main.jsx` - React entry point
  - `context/AuthContext.jsx` - Authentication
  - `pages/Login.jsx` - Login page
  - `pages/Register.jsx` - Register page
  - `pages/Dashboard.jsx` - ScrapeForge dashboard
  - `styles/dashboard.css` - All styling

**Server Folder** (`server/`):
- `server/index.cjs` - Main Express server with all APIs
- `server/auth.js` - Authentication logic

**Shared Folder** (`shared/`):
- `shared/schema.ts` - Database schemas

### Step 3: Upload to GitHub

#### Option A: GitHub Web Interface (Easiest)
1. On your new GitHub repository page, click "uploading an existing file"
2. Drag and drop the files/folders maintaining the exact structure:
   ```
   scrapeforge-app/
   ├── client/
   ├── server/
   ├── shared/
   ├── package.json
   ├── README.md
   ├── .gitignore
   └── .env.example
   ```
3. Commit with message: "Initial commit - Complete ScrapeForge application"

#### Option B: Git Clone (If Available)
```bash
git clone https://github.com/yourusername/scrapeforge-app.git
cd scrapeforge-app
# Copy all files here
git add .
git commit -m "Initial commit - Complete ScrapeForge application"
git push origin main
```

### Step 4: Deploy to Railway

1. Go to Railway.app and sign in
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your `scrapeforge-app` repository
5. Railway will auto-detect it as a Node.js app

#### Environment Variables for Railway:
Set these in Railway dashboard under Variables:

```
DATABASE_URL=your-postgresql-connection-string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=production
```

#### Railway Auto-Deployment:
- The `postinstall` script will automatically build the frontend
- The app will start with `npm start`
- Any push to `main` branch triggers auto-deployment

### Step 5: Database Setup

**Option 1: Railway PostgreSQL (Recommended)**
1. In Railway, add PostgreSQL service to your project
2. Copy the DATABASE_URL from PostgreSQL service
3. Add it to your app's environment variables

**Option 2: External Database**
- Use Neon, Supabase, or any PostgreSQL provider
- Copy the connection string to DATABASE_URL

### Application Features Included

Your uploaded app will have:

✅ **Complete Authentication System**
- Email/password registration and login
- JWT token security
- Protected routes

✅ **ScrapeForge Dashboard**
- Project management interface
- Statistics overview
- Create/view scraping projects
- Professional UI with gradients

✅ **API Endpoints**
- Authentication: register, login, verify
- Projects: CRUD operations
- Dashboard: statistics and data

✅ **Production Ready**
- Railway deployment configuration
- Static file serving
- Environment variable support

### Testing Your Deployment

1. After Railway deployment, you'll get a URL like: `https://scrapeforge-app-production.up.railway.app`
2. Test authentication: register a new account
3. Login and explore the ScrapeForge dashboard
4. Create a test project and verify functionality

### Important Notes

- **Never commit `.env`** - only `.env.example` should be in git
- **Database**: Tables will be created automatically when you first register
- **JWT_SECRET**: Generate a secure 32+ character random string
- **Railway**: Automatically builds and serves both frontend and backend

Your application is now a complete, production-ready full-stack ScrapeForge platform!