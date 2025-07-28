# How to Connect ScrapeForge to GitHub (Replit)

## Method 1: Tools Menu (Most Common)
1. Look at the **left sidebar** in Replit
2. Find the **"Tools"** tab (usually has a wrench icon 🔧)
3. Click on **"Tools"**
4. Look for **"Git"** or **"Version Control"** option
5. Click **"Connect to GitHub"**

## Method 2: Shell Tab
1. Click the **"Shell"** tab (terminal icon)
2. In the shell, you can manually connect to GitHub:
```bash
# Check if git is already configured
git remote -v

# If no remote exists, you'll need to add one after creating a GitHub repo
```

## Method 3: Main Menu (Three Dots)
1. Click the **three dots menu** (⋯) in the top-right corner
2. Look for **"Version Control"** or **"Git"** options
3. Select **"Connect to GitHub"**

## Method 4: Files Tab
1. In the **Files** tab (left sidebar)
2. Look for a **Git icon** or **branch icon** near the top
3. Click it to access version control options

## Method 5: Create GitHub Repo Manually (Backup Plan)
If you can't find the built-in integration:

1. Go to **[github.com](https://github.com)**
2. Click **"New repository"**
3. Name it `scrapeforge-headless`
4. Set to **Public** (easier for Railway deployment)
5. Click **"Create repository"**
6. Copy the repository URL
7. In Replit Shell, run:
```bash
git remote add origin https://github.com/yourusername/scrapeforge-headless.git
git branch -M main
git push -u origin main
```

## After Connecting to GitHub:
1. Go to **[railway.app](https://railway.app)**
2. Login with GitHub
3. Deploy from your new repository
4. Your headless browser scraping will work immediately!

## Visual Cues to Look For:
- **Git icon** (branching symbol)
- **"Version Control"** text
- **"GitHub"** option
- **"Connect"** or **"Sync"** buttons
- **Branch name** display (usually shows "main" or "master")

The exact location can vary depending on your Replit interface version, but it's definitely there!