# Manual GitHub + Railway Deployment Guide

## Current Status: ✅ Git Configured & Committed

Your ScrapeForge project is now ready for GitHub connection. Here's what to do next:

## Step 1: Create GitHub Repository
1. Open **[github.com](https://github.com)** in a new tab
2. Click **"New repository"** (green button)
3. Repository name: `scrapeforge-headless`
4. Description: `Email scraping platform with headless browser automation`
5. Set to **Public** (easier for Railway deployment)
6. **DO NOT** initialize with README (your project already has files)
7. Click **"Create repository"**

## Step 2: Copy Repository URL
After creating the repo, GitHub will show you a page with commands. 
Copy the repository URL that looks like:
`https://github.com/YOURUSERNAME/scrapeforge-headless.git`

## Step 3: Connect Your Replit to GitHub
Come back to Replit and in the Shell tab, run:
```bash
git remote add origin https://github.com/YOURUSERNAME/scrapeforge-headless.git
git branch -M main
git push -u origin main
```
Replace `YOURUSERNAME` with your actual GitHub username.

## Step 4: Deploy to Railway
1. Go to **[railway.app](https://railway.app)**
2. Click **"Login with GitHub"**
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `scrapeforge-headless` repository
6. Railway automatically:
   - Installs Node.js and all dependencies
   - Installs Playwright and browser dependencies
   - Sets up your database
   - Deploys with full headless browser support

## Step 5: Environment Variables (Railway)
In Railway's dashboard, add these environment variables:
- `DATABASE_URL` (Railway provides this automatically)
- `OPENAI_API_KEY` (optional, for AI email parsing)
- `NODE_ENV=production`

## Step 6: Test Your Live Deployment
Once deployed, your ScrapeForge will have:
- ✅ Working headless Instagram scraping
- ✅ LinkedIn automation with real browsers
- ✅ All browser dependencies (libgbm1, libnss3, etc.)
- ✅ Real email extraction from social media

## What Changes After Deployment:
- "Start Scraping" button will collect real emails
- Instagram hashtag exploration works
- LinkedIn professional search functional
- No more "missing browser dependencies" errors

Your project is fully prepared for deployment!