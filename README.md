# Generated Backend Test

A production-ready NestJS backend application with TypeScript, Docker, and PostgreSQL. This project includes both REST and GraphQL APIs, authentication/authorization, validation, error handling, and logging.

## Features

- **NestJS Framework**: Enterprise-ready Node.js framework
- **TypeScript**: Type-safe development
- **PostgreSQL**: Relational database with TypeORM
- **Docker**: Containerized application and database
- **REST API**: Traditional REST endpoints
- **GraphQL**: GraphQL API with Apollo Server
- **JWT Authentication**: Secure authentication with JWT tokens
- **Validation**: Request validation with class-validator
- **Error Handling**: Global exception filters
- **Logging**: Request logging and error tracking

## Prerequisites

- Node.js (v20 or higher)
- Docker and Docker Compose
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd generated-backend-test
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=backend_db

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1d

GRAPHQL_PLAYGROUND=true
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run with Docker Compose

```bash
docker-compose up
```

This will start both the PostgreSQL database and the NestJS application.

### 5. Run Locally (without Docker)

First, make sure PostgreSQL is running locally, then:

```bash
# Development mode with hot-reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## API Endpoints

### REST API

- `GET /` - Hello World
- `GET /health` - Health check
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /users` - Get all users (protected)
- `GET /users/:id` - Get user by ID (protected)
- `POST /users` - Create a new user
- `PATCH /users/:id` - Update user (protected)
- `DELETE /users/:id` - Delete user (protected)

### GraphQL API

- GraphQL Playground: `http://localhost:3000/graphql`

Example queries:

```graphql
query {
  users {
    id
    email
    firstName
    lastName
  }
}

mutation {
  createUser(createUserInput: {
    email: "user@example.com"
    password: "password123"
    firstName: "John"
    lastName: "Doe"
  }) {
    id
    email
    firstName
    lastName
  }
}
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Migrations

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Development

```bash
# Development mode
npm run start:dev

# Build
npm run build

# Production mode
npm run start:prod

# Linting
npm run lint

# Format code
npm run format
```

## Project Structure

```
src/
├── auth/              # Authentication module
│   ├── decorators/    # Custom decorators
│   ├── dto/           # Data transfer objects
│   ├── guards/        # Auth guards
│   └── strategies/    # Passport strategies
├── common/            # Shared utilities
│   ├── filters/       # Exception filters
│   └── interceptors/  # Logging interceptors
├── config/            # Configuration files
├── graphql/           # GraphQL resolvers and types
├── users/             # User module
│   ├── dto/           # User DTOs
│   ├── entities/      # TypeORM entities
│   └── ...
├── app.module.ts      # Root module
├── app.controller.ts  # Root controller
├── app.service.ts     # Root service
└── main.ts            # Application entry point
```

## License

UNLICENSED

