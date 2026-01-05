# Quick Setup Guide

This guide will help you get the Attendance Tracking Application up and running in minutes.

## Prerequisites

- **Docker & Docker Compose** (recommended for easiest setup)
- **OR** Node.js 20+ and PostgreSQL 16+ (for manual setup)

## Option 1: Docker Setup (Recommended)

### Step 1: Clone and Configure

```bash
# Navigate to project directory
cd attendance-tracker

# Create environment file
cp .env.example .env

# (Optional) Edit .env file if you want to change default settings
```

### Step 2: Start Everything

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d

# View logs to ensure everything started correctly
docker-compose logs -f
```

### Step 3: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/v1/health

That's it! The database will be automatically initialized with the schema.

### Useful Docker Commands

```bash
# Stop all services
docker-compose down

# Stop and remove all data (reset database)
docker-compose down -v

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Restart a service
docker-compose restart backend

# Access PostgreSQL
docker exec -it attendance-postgres psql -U attendance_user -d attendance_db
```

## Option 2: Manual Setup

### Step 1: Setup Database

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# OR install PostgreSQL locally and create database
createdb attendance_db

# Initialize database schema
docker exec -i attendance-postgres psql -U attendance_user -d attendance_db < database/init.sql

# OR if using local PostgreSQL
psql -U postgres -d attendance_db -f database/init.sql
```

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# Make sure DATABASE_URL is correct

# Start development server
npm run dev
```

The backend will start on http://localhost:3001

### Step 3: Setup Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local if needed
# NEXT_PUBLIC_API_URL should point to your backend

# Start development server
npm run dev
```

The frontend will start on http://localhost:3000

## Verify Installation

1. Open http://localhost:3000 in your browser
2. You should see the Attendance Tracker landing page
3. Check the health endpoint: http://localhost:3001/api/v1/health
4. You should see a JSON response with `"status": "healthy"`

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Change ports in .env file:
BACKEND_PORT=3002
FRONTEND_PORT=3001
POSTGRES_PORT=5433
```

**Container won't start:**
```bash
# Check logs
docker-compose logs [service-name]

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues

**Can't connect to PostgreSQL:**

1. Verify PostgreSQL is running:
```bash
docker-compose ps
```

2. Check DATABASE_URL in backend/.env:
```env
DATABASE_URL=postgresql://attendance_user:attendance_password@localhost:5432/attendance_db
```

3. If using Docker, use `postgres` as hostname instead of `localhost`:
```env
DATABASE_URL=postgresql://attendance_user:attendance_password@postgres:5432/attendance_db
```

### Backend Issues

**TypeScript errors:**
```bash
cd backend
npm run build
```

**Module not found:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Module not found:**
```bash
cd frontend
rm -rf node_modules package-lock.json .next
npm install
```

**Environment variables not working:**
- Make sure frontend environment variables start with `NEXT_PUBLIC_`
- Restart the dev server after changing .env.local

## Next Steps

1. **Explore the Application**
   - Visit the login page at http://localhost:3000/auth/login
   - Visit the register page at http://localhost:3000/auth/register
   - Visit the dashboard at http://localhost:3000/dashboard

2. **Read the Documentation**
   - Main README: [README.md](README.md)
   - Backend README: [backend/README.md](backend/README.md)
   - Frontend README: [frontend/README.md](frontend/README.md)

3. **Start Implementing Features**
   - The project structure is ready
   - Authentication endpoints are scaffolded
   - Database schema is initialized
   - UI components are available

## Development Workflow

### Starting Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Database (if not using Docker)
docker-compose up postgres
```

### Before Committing

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run type-check
npm run format
```

## Production Build

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Production

```bash
# Backend
cd backend
npm run build
NODE_ENV=production npm start

# Frontend
cd frontend
npm run build
npm start
```

## Getting Help

- Check the main [README.md](README.md) for detailed documentation
- Review API documentation in [backend/README.md](backend/README.md)
- Review frontend documentation in [frontend/README.md](frontend/README.md)
- Check database schema in [database/init.sql](database/init.sql)

## Default Credentials

The application doesn't come with default users. You'll need to register through the frontend or create users through the API.

## Environment Variables Reference

### Root .env

```env
NODE_ENV=development
POSTGRES_USER=attendance_user
POSTGRES_PASSWORD=attendance_password
POSTGRES_DB=attendance_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://attendance_user:attendance_password@localhost:5432/attendance_db
BACKEND_PORT=3001
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:3000
API_VERSION=v1
API_PREFIX=/api
```

### Backend .env

See `backend/.env.example` for backend-specific variables.

### Frontend .env.local

See `frontend/.env.example` for frontend-specific variables.

---

**Happy coding! 🚀**
