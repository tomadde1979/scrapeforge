# ScrapeForge Deployment Guide - Railway + GitHub

## Step 1: Connect to GitHub

### Option A: Using Replit's GitHub Integration (Easiest)
1. Click the "Version Control" tab in Replit (left sidebar, looks like a branch icon)
2. Click "Create a Git Repo" 
3. Click "Connect to GitHub"
4. Choose "Create a new repository" 
5. Name it `scrapeforge-headless` (or your preferred name)
6. Set to Public or Private (your choice)
7. Click "Create repository"

### Option B: Manual Git Setup (If needed)
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial ScrapeForge with headless browser support"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/scrapeforge-headless.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Railway

### Quick Railway Setup:
1. Go to [railway.app](https://railway.app)
2. Click "Login with GitHub"
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `scrapeforge-headless` repository
5. Railway will automatically:
   - Install all dependencies (including Playwright)
   - Install browser dependencies (libgbm1, libnss3, etc.)
   - Deploy your app with full headless browser support

### Environment Variables (Railway):
Add these in Railway's environment variables section:
```
DATABASE_URL=your_postgres_url
OPENAI_API_KEY=your_openai_key (optional)
NODE_ENV=production
```

### Railway Benefits for ScrapeForge:
- ✅ Zero-config Playwright support
- ✅ Automatic browser dependency installation
- ✅ Built-in PostgreSQL database
- ✅ One-click deployment from GitHub
- ✅ Automatic HTTPS and custom domains
- ✅ Perfect for headless browser automation

## Step 3: Test Your Deployment

Once deployed on Railway:
1. Your headless Instagram scraping will work immediately
2. LinkedIn automation will function properly
3. All browser dependencies are automatically available
4. Real email extraction from social media platforms

## Alternative Platforms:

### Render.com
- Requires Dockerfile with browser dependencies
- Good alternative if Railway isn't preferred

### DigitalOcean App Platform
- Container-based deployment
- Scalable but requires more configuration

### VPS (Advanced)
- Full control over environment
- Manual installation of browser dependencies required

## Next Steps After Deployment:
1. Test headless scraping with real data
2. Configure API authentication tokens for enhanced scraping
3. Set up monitoring and error tracking
4. Scale based on usage patterns

Your ScrapeForge is ready for production deployment with full headless browser automation!