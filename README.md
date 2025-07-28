# Railway Fullstack App

A production-ready fullstack JavaScript application built with **Vite (React)** frontend and **Express** backend, structured for seamless deployment on Railway.

## 🏗️ Architecture

```
/
├── server.js              # Express server (port 8080)
├── client/                # Vite + React frontend
│   ├── src/
│   ├── dist/             # Built frontend files
│   └── package.json      # Client dependencies
├── railway.toml          # Railway configuration
├── Procfile              # Railway/Heroku process file
└── package.json          # Root dependencies & scripts
```

## 🚀 Features

- **Express Backend**: REST API with CORS support
- **React Frontend**: Modern Vite-powered React app
- **Railway Ready**: Configured for one-click deployment
- **Health Monitoring**: Built-in health check endpoint
- **Authentication**: Working login endpoint (returns 200 OK)

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login endpoint (returns 200 OK) |
| `GET`  | `/api/health` | Server health check |

## 🛠️ Development

```bash
# Install all dependencies
npm install
cd client && npm install && cd ..

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🚂 Railway Deployment

### Method 1: Direct GitHub Integration

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial Railway-ready setup"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy on Railway**:
   - Connect your GitHub repository
   - Railway will automatically detect the configuration
   - Deploy with the provided `railway.toml` settings

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## ⚙️ Configuration Files

### `railway.toml`
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
```

### `server.js`
- Listens on port 8080 (Railway requirement)
- Serves static files from `client/dist` in production
- Includes CORS and health check endpoints

## 🌐 Production URLs

After deployment, your app will be available at:
- **Main App**: `https://your-app.railway.app`
- **Health Check**: `https://your-app.railway.app/api/health`
- **Login Test**: `https://your-app.railway.app/api/auth/login`

## 🧪 Testing

Test the login endpoint:
```bash
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected response:
```json
{
  "message": "Login successful",
  "user": { "email": "test@example.com" },
  "timestamp": "2025-01-28T..."
}
```

## 📁 Project Structure

This structure ensures:
- ✅ Frontend lives in `client/` folder
- ✅ Backend serves from root on port 8080
- ✅ Express serves Vite build files from `client/dist`
- ✅ Simple login route returns 200 OK
- ✅ Build process handles both frontend and backend
- ✅ Railway deployment configuration included
- ✅ One public domain serves the entire application

Ready for GitHub upload and Railway deployment!