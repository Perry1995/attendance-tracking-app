# Attendance Tracking Application

A modern, full-stack attendance tracking system designed for educational institutions. Built with Next.js, Express.js, PostgreSQL, and TypeScript.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Database](#database)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

This application provides a comprehensive solution for tracking student attendance in educational institutions. It supports multiple user roles (Admin, Teacher, Student, Guardian) and provides real-time attendance tracking, reporting, and analytics.

## ✨ Features

### Current Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (RBAC) - Admin, Teacher, Student, Guardian
  - Secure password hashing with bcrypt
  - Token refresh mechanism
  - Protected routes and API endpoints

- **User Management**
  - Multiple user roles (Admin, Teacher, Student, Guardian)
  - User CRUD operations
  - Role assignment and management
  - Bulk user import via CSV
  - User search and filtering
  - Profile management

- **Institution Management**
  - Multi-institution support
  - Institution CRUD operations
  - Institution details and contact information
  - User-institution relationships
  - Active/Inactive status management

- **Class Management**
  - Create and manage classes
  - Assign teachers to classes
  - Enroll students in classes
  - Academic year and section tracking
  - Class filtering and search

- **Student Management**
  - Student CRUD operations
  - Student profile management
  - Class enrollment tracking
  - Bulk student import via CSV
  - Student search and filtering
  - Active/Inactive status management

- **Guardian Management**
  - Link guardians to students
  - Manage guardian-student relationships
  - Primary guardian designation
  - View guardian children
  - Relationship updates and deletion

- **Attendance Tracking**
  - Mark attendance (Present, Absent, Late, Excused)
  - Check-in/check-out times
  - Add notes to attendance records
  - Historical attendance data
  - Class-based attendance marking
  - Real-time status updates
  - Date range filtering

- **Dashboard & Reporting**
  - Role-based dashboard views
  - Attendance statistics and summaries
  - Daily attendance trends
  - Attendance rate calculation
  - Recent activity feed
  - Generate attendance reports
  - Export reports to PDF and CSV
  - Interactive charts and graphs
  - Quick access reports (Today, Weekly, Monthly)

- **Settings & Preferences**
  - Profile management
  - Password change functionality
  - Notification preferences (Email, Push)
  - Theme selection (Light, Dark, System)
  - Language selection
  - Timezone settings
  - Date/time format preferences
  - System status monitoring

- **Help & Support**
  - Comprehensive help documentation
  - FAQ section
  - System status dashboard
  - Support contact options

### Upcoming Features

- Email notification delivery (SMTP integration ready)
- Real-time notifications via WebSockets
- Advanced analytics and insights
- Attendance pattern analysis
- Mobile app (React Native or PWA)
- Attendance QR code scanning
- Geofencing for attendance
- Integration with Learning Management Systems
- Parent email alerts for absences/late arrivals

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16+
- **ORM/Query Builder**: pg (node-postgres)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Logging**: Winston + Morgan
- **Security**: Helmet, CORS

### DevOps

- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL (Docker)
- **Development**: Hot reload (ts-node-dev, Next.js dev)

## 📁 Project Structure

```
attendance-tracker/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API client
│   ├── types/              # TypeScript types
│   ├── styles/             # Global styles
│   └── public/             # Static assets
│
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   └── logs/               # Application logs
│
├── database/               # Database files
│   ├── init.sql           # Initial schema
│   └── migrations/        # Migration files
│
├── docker-compose.yml     # Docker Compose configuration
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PostgreSQL** 16+ or Docker
- **npm** or **yarn**
- **Git**

### Quick Start with Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd attendance-tracker
```

2. **Create environment file**
```bash
cp .env.example .env
```

3. **Update environment variables** in `.env` if needed

4. **Start all services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on `localhost:5432`
- Backend API on `localhost:3001`
- Frontend on `localhost:3000`

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/v1/health

### Manual Setup (Without Docker)

#### 1. Setup PostgreSQL

Install PostgreSQL 16+ and create a database:

```bash
createdb attendance_db
```

Or use the provided Docker setup for PostgreSQL only:

```bash
docker-compose up -d postgres
```

#### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

The backend will be available at http://localhost:3001

#### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

The frontend will be available at http://localhost:3000

## 💻 Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format
```

### Adding shadcn/ui Components

The frontend uses shadcn/ui for UI components. To add new components:

```bash
cd frontend
npx shadcn-ui@latest add [component-name]
```

Examples:
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dropdown-menu
```

## 🗄️ Database

### Schema

The database schema includes the following main tables:

- **users**: User accounts with authentication details
- **institutions**: Schools/colleges information
- **user_roles**: User roles within institutions
- **classes**: Classes/sections
- **class_enrollments**: Student enrollments in classes
- **guardian_relationships**: Guardian-student relationships
- **attendance_records**: Daily attendance records
- **refresh_tokens**: JWT refresh tokens

### Migrations

Migration files are stored in `database/migrations/`.

To create a new migration:

1. Create a file with the naming convention: `YYYYMMDDHHMMSS_description.sql`
2. Write your SQL migration
3. Apply the migration:

```bash
docker exec -i attendance-postgres psql -U attendance_user -d attendance_db < database/migrations/YYYYMMDDHHMMSS_description.sql
```

### Database Reset

To reset the database (⚠️ **Warning**: This will delete all data):

```bash
docker-compose down -v
docker-compose up -d postgres
```

### Accessing the Database

```bash
# Using Docker
docker exec -it attendance-postgres psql -U attendance_user -d attendance_db

# Using local PostgreSQL
psql -U attendance_user -d attendance_db
```

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api/v1
```

### Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Endpoints

#### Health Check

```http
GET /health
```

Returns the health status of the API and database.

#### Authentication

```http
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/profile
```

### Response Format

#### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🚢 Deployment

### Environment Variables

Make sure to set the following environment variables in production:

#### Required

- `NODE_ENV=production`
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong secret key for JWT
- `JWT_REFRESH_SECRET`: Strong secret key for refresh tokens
- `CORS_ORIGIN`: Frontend URL

#### Optional

- `PORT`: Backend port (default: 3001)
- `LOG_LEVEL`: Logging level (default: info)

### Docker Deployment

1. Build images:
```bash
docker-compose build
```

2. Start services:
```bash
docker-compose up -d
```

3. View logs:
```bash
docker-compose logs -f
```

### Manual Deployment

#### Backend

```bash
cd backend
npm install
npm run build
NODE_ENV=production npm start
```

#### Frontend

```bash
cd frontend
npm install
npm run build
npm start
```

## 🤝 Contributing

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

### Git Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run linting and type checking
4. Commit your changes
5. Push to your branch
6. Create a pull request

### Commit Message Format

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(auth): add password reset functionality
fix(attendance): correct date filtering bug
docs(readme): update setup instructions
```

## 📝 License

ISC

## 👥 Authors

[Your Name/Team]

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn for the beautiful UI components
- Express.js community
- PostgreSQL team

## 📞 Support

For support, email support@example.com or open an issue in the repository.

---

**Built with ❤️ for educational institutions**
