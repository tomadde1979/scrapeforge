# Railway Fullstack App

A production-ready fullstack JavaScript application with **Vite + React** frontend and **Express** backend, specifically structured for Railway deployment.

## 📁 Project Structure

```
/
├── server.cjs             # Express server (CommonJS, port 8080)
├── client/                # Vite + React frontend
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── main.jsx      # React entry point
│   │   ├── index.css     # Global styles
│   │   └── App.css       # Component styles
│   ├── dist/             # Built frontend files (auto-generated)
│   ├── package.json      # Client dependencies
│   └── vite.config.js    # Vite configuration
├── railway.toml          # Railway configuration
├── Procfile              # Railway process file
├── package-railway.json  # Railway-ready package.json
└── README.md             # This file
```

## ✨ Features

- **Express Backend** (CommonJS): REST API with CORS support
- **React Frontend**: Modern Vite-powered React app with beautiful UI
- **Railway Ready**: Zero-config deployment on Railway
- **Mock Authentication**: Working login endpoint for testing
- **Health Monitoring**: Built-in health check endpoint
- **Development Mode**: Hot reloading for both frontend and backend

## 🚀 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Mock login (always returns success) |
| `GET`  | `/api/health` | Server health check |

## 🛠️ Development

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Start development (both frontend and backend)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🚂 Railway Deployment

### Method 1: GitHub Integration (Recommended)

1. **Create GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Railway fullstack app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Railway will automatically:
     - Detect Node.js project
     - Install dependencies
     - Build the client
     - Start the server on port 8080

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy directly
railway login
railway init
railway up
```

## ⚙️ Configuration

### Railway Configuration (`railway.toml`)
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
```

### Server Features (`server.js`)
- **Port**: 8080 (Railway standard)
- **CommonJS**: Compatible with Node.js 18+
- **Static Files**: Serves React build from `client/dist`
- **API Routes**: Mock authentication and health check
- **CORS**: Enabled for development

### Client Features (`client/`)
- **Vite**: Fast development and optimized builds
- **React**: Modern functional components with hooks
- **Proxy**: API calls proxied to Express server in development
- **Responsive**: Mobile-friendly design

## 🧪 Testing

### Local Testing
```bash
# Test login endpoint
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test health check
curl http://localhost:8080/api/health
```

### Production Testing
After Railway deployment:
```bash
curl -X POST https://YOUR-APP.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User"
  },
  "token": "mock-jwt-token",
  "timestamp": "2025-01-28T..."
}
```

## 🎯 Key Features for Railway

✅ **CommonJS**: No ESM compatibility issues  
✅ **Port 8080**: Railway's default port  
✅ **Static Serving**: Express serves React build files  
✅ **Health Check**: `/api/health` endpoint for monitoring  
✅ **Build Process**: Automated client build on deployment  
✅ **Environment**: Production-ready with proper NODE_ENV  

## 🌐 After Deployment

Your app will be available at `https://your-app-name.railway.app` with:

- **Frontend**: React app with login interface
- **Backend**: Express API with authentication
- **Health Check**: `/api/health` for monitoring
- **Single Domain**: Frontend and backend served together

Ready for immediate deployment to Railway! 🚀