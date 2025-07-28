# ScrapeForge - Email Scraping Platform

A comprehensive full-stack web application for managing email scraping projects across multiple social media platforms. Built with React, Express.js, and PostgreSQL.

## Features

### 🔐 Complete Authentication System
- Email/password registration and login
- JWT token-based authentication
- Protected routes and middleware
- Secure password hashing with bcrypt

### 📊 Project Management Dashboard
- Real-time statistics overview
- Create and manage scraping projects
- Multi-platform support (Instagram, LinkedIn, Twitter, Reddit)
- Advanced scraping options (followers, commenters, headless mode)

### 🎯 Scraping Capabilities
- Email extraction from social media profiles
- Keyword-based targeting
- Domain filtering
- Progress tracking and job management
- Results viewing and analysis

### 🎨 Modern UI/UX
- Professional dashboard interface
- Responsive design for all devices
- Modal-based workflows
- Real-time activity feeds
- Beautiful gradient styling

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling with gradients and animations
- **JavaScript** - Modern ES6+ features

### Backend
- **Express.js** - Web application framework
- **Node.js** - Runtime environment
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **PostgreSQL** - Database (via environment variables)

### Development & Deployment
- **Nodemon** - Development server auto-restart
- **Concurrently** - Run frontend and backend simultaneously
- **Railway Ready** - Configured for Railway deployment
- **Environment Variables** - Secure configuration management

## Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- Environment variables configured

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/scrapeforge.git
cd scrapeforge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

4. Start development servers:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (frontend) with the backend running on port 5000.

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secret Key (required for authentication)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Environment
NODE_ENV=production
```

## Deployment

### Railway Deployment

This application is configured for Railway deployment:

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

The `postinstall` script will automatically build the frontend during deployment.

### Manual Deployment

1. Build the frontend:
```bash
cd client && npm run build
```

2. Start the production server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/verify-token` - Verify JWT token

### Projects
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id/results` - Get project results
- `POST /api/projects/:id/start-scraping` - Start scraping job

### Dashboard
- `GET /api/dashboard-stats` - Get dashboard statistics

## Project Structure

```
scrapeforge/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context (authentication)
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS stylesheets
│   │   └── App.jsx        # Main application component
│   ├── index.html         # HTML template
│   └── package.json       # Frontend dependencies
├── server/                # Express.js backend
│   ├── auth.js           # Authentication logic
│   └── index.cjs         # Main server file
├── shared/               # Shared schemas and types
│   └── schema.ts         # Database schema definitions
├── package.json          # Root dependencies and scripts
└── README.md            # Project documentation
```

## Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:client` - Start only the frontend development server
- `npm run dev:server` - Start only the backend development server
- `npm run build` - Build the frontend for production
- `npm start` - Start the production server

### Adding New Features

1. Database changes: Update `shared/schema.ts`
2. Backend APIs: Add routes to `server/index.cjs`
3. Frontend pages: Create components in `client/src/pages/`
4. Styling: Update CSS files in `client/src/styles/`

## Security Features

- JWT token authentication with expiration
- Password hashing with bcrypt (10 rounds)
- CORS configuration for cross-origin requests
- Input validation and error handling
- Secure token storage in localStorage
- Protected API routes with middleware

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using modern web technologies