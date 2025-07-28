# ScrapeForge - Email Scraping Platform

## Overview

ScrapeForge is a fullstack web application designed for managing email scraping projects across multiple social media platforms. The application allows users to create projects, configure scraping parameters, extract public email addresses from platforms like Instagram, LinkedIn, and Reddit, and manage the collected data through an intuitive dashboard.

**NEW: Real Web Scraping Implementation** - The platform now supports both demo mode (synthetic data) and real scraping mode using Puppeteer for actual web automation and data collection from live social media platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: Zustand for client-side state management
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for both frontend and backend consistency
- **Database**: PostgreSQL via Neon serverless with Drizzle ORM
- **Web Scraping**: Dual-mode implementation:
  - **Demo Mode**: Intelligent synthetic data generation for testing and UI development
  - **Real Mode**: Puppeteer-powered headless browser automation for live platform scraping
- **AI Integration**: OpenAI GPT-4o for intelligent email parsing and extraction
- **Stealth Features**: User-agent rotation, rate limiting, and anti-detection measures

### Build System
- **Frontend Bundler**: Vite for fast development and optimized production builds
- **Backend Bundler**: esbuild for server-side bundling
- **Development**: Hot module replacement and runtime error overlays via Replit plugins

## Key Components

### Database Schema
The application uses a relational database structure with the following core entities:
- **Users**: Basic user authentication and management
- **Projects**: Container for scraping configurations and settings
- **Scraping Results**: Individual profile data and extracted emails
- **Scraping Jobs**: Job tracking and progress monitoring
- **Scraping Logs**: Audit trail and error tracking

### Scraping Engine
- **Base Scraper Class**: Abstract implementation for extensible platform support
- **Dual-Mode Scrapers**: 
  - **Demo Scrapers**: High-quality synthetic data for development and testing
  - **Real Scrapers**: Puppeteer-based automation for Instagram and Reddit
- **Advanced Features**: Follower scraping, commenter extraction, and network expansion
- **AI-Enhanced Parsing**: OpenAI integration for obfuscated email detection
- **Scale Optimization**: 10,000+ profiles per platform with 0.3s rate limiting
- **Stealth Technology**: Anti-detection headers, realistic browsing patterns

### UI Components
- **Dashboard**: Real-time statistics and project overview
- **Project Management**: CRUD operations for scraping projects
- **Results Display**: Filterable tables with export functionality
- **Real-time Updates**: Progress tracking and status indicators

## Data Flow

1. **Project Creation**: Users define scraping parameters (platforms, keywords, domains)
2. **Job Initialization**: Scraping engine creates job records and begins processing
3. **Data Extraction**: Platform-specific scrapers collect profile information
4. **Email Processing**: AI-enhanced parsing for complex email patterns
5. **Result Storage**: Structured data storage with audit trails
6. **Dashboard Updates**: Real-time UI updates via polling and state management

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **OpenAI API**: GPT-4o for intelligent text processing
- **Puppeteer**: Headless Chrome automation

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Consistent iconography
- **Date-fns**: Date manipulation utilities

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **ESLint/Prettier**: Code quality and formatting
- **TypeScript**: Static type checking

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite development server with Express API proxy
- **Database**: Neon development database with migration support
- **Environment Variables**: Secure API key management

### Production Build
- **Frontend**: Static asset generation via Vite build
- **Backend**: Single bundle via esbuild with external dependencies
- **Database**: Production Neon instance with connection pooling
- **Monitoring**: Built-in logging and error tracking

### Security Considerations
- **Rate Limiting**: Configurable delays to prevent platform blocking
- **Data Privacy**: Only public information collection
- **API Security**: Environment-based credential management
- **CORS**: Proper cross-origin resource sharing configuration

## Recent Changes (January 2025)

### Real Web Scraping Implementation
- **Real Instagram Scraper**: Puppeteer-based automation for hashtag exploration and profile extraction
- **Real Reddit Scraper**: User search and profile bio extraction from live Reddit data
- **Intelligent Mode Switching**: Automatic selection between demo and real scrapers based on user preference
- **Enhanced Database Schema**: Added `useRealScraping` boolean field for per-project configuration
- **UI Toggles**: Real scraping mode switch in both create and edit project modals
- **Massive Scale Support**: 10,000 profiles per platform, 40% email discovery rate
- **Advanced Follower/Commenter Scraping**: Network expansion through followers and post commenters

### Performance Optimizations
- **Rate Limiting**: Reduced to 300ms delays for faster processing
- **Stealth Features**: User-agent rotation and anti-detection measures
- **Error Handling**: Comprehensive error catching and graceful degradation

The application is designed for extensibility, allowing easy addition of new platforms and enhancement of existing scraping capabilities while maintaining data integrity and user experience quality. The real scraping implementation provides authentic data collection while the demo mode ensures seamless development and testing workflows.