# Attendance Tracking Backend API

Express.js + TypeScript backend API for the attendance tracking application.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Logging**: Winston + Morgan
- **Security**: Helmet, CORS

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # Database connection
│   │   ├── env.ts       # Environment variables
│   │   └── logger.ts    # Winston logger setup
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   │   ├── auth.ts      # Authentication & authorization
│   │   ├── errorHandler.ts  # Error handling
│   │   └── validator.ts # Validation middleware
│   ├── models/          # Database models (to be implemented)
│   ├── routes/          # API routes
│   ├── services/        # Business logic (to be implemented)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   │   ├── jwt.ts       # JWT token utilities
│   │   ├── password.ts  # Password hashing utilities
│   │   └── response.ts  # Response helpers
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── logs/                # Application logs
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies
└── Dockerfile           # Docker configuration
```

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env` file

4. Start PostgreSQL (if using Docker):
```bash
docker-compose up -d postgres
```

5. Run migrations (when implemented):
```bash
npm run migrate
```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Building

Build the TypeScript code:

```bash
npm run build
```

## Production

Run the production build:

```bash
npm start
```

## API Endpoints

### Health Check

- `GET /api/v1/health` - Health check endpoint

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/profile` - Get user profile (requires authentication)

### Future Endpoints (To be implemented)

- User management
- Institution management
- Class management
- Attendance records
- Reports and analytics

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Request Headers

Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Types

- **Access Token**: Short-lived token (7 days default) for API requests
- **Refresh Token**: Long-lived token (30 days default) to obtain new access tokens

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:

- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for access tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `CORS_ORIGIN` - Allowed CORS origins

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": {} // Optional
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

## Code Quality

### Linting

```bash
npm run lint
npm run lint:fix
```

### Formatting

```bash
npm run format
```

## Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Docker

Build the Docker image:

```bash
docker build -t attendance-backend .
```

Run with Docker Compose:

```bash
docker-compose up backend
```

## Security Best Practices

- Environment variables for sensitive data
- Helmet for security headers
- CORS configuration
- JWT token expiration
- Password hashing with bcrypt
- Input validation with express-validator
- SQL injection prevention with parameterized queries

## Contributing

1. Follow TypeScript and ESLint rules
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation

## License

ISC
