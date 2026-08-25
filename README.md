# Full-Stack Authentication System

A complete authentication system built with Next.js, NestJS, PostgreSQL, and Prisma.

## Features

- Register a new account with input validation
- Login with JWT authentication
- Protected home page (token-based)
- Logout
- Forgot password with token stored server-side (invalidated after use)
- Password reset flow
- Proper error handling and HTTP status codes

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL 17
- **ORM:** Prisma 6
- **Auth:** JWT (`@nestjs/jwt`) + bcrypt
- **Validation:** class-validator + class-transformer

## Prerequisites

- Node.js v22+
- PostgreSQL 17 installed and running
- npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Mohame570/Auth-System.git
cd Auth-System
```

### 2. Database Setup

Open PostgreSQL terminal (psql) or pgAdmin 4 and create the database:

```sql
CREATE DATABASE auth_db;
```

### 3. Backend Setup

```bash
cd auth-back
npm install
```

Create a `.env` file inside `auth-back/`:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/auth_db"
JWT_SECRET="your-own-secret-key-here"
```

Replace `YOUR_PASSWORD` with your PostgreSQL password and `your-own-secret-key-here` with a strong random string.

Run the migration:

```bash
npx prisma migrate dev --name init
```

Start the backend server:

```bash
npm run start:dev
```

Backend runs on `http://localhost:3001`.

### 4. Frontend Setup

Open a new terminal from the project root:

```bash
npm install
npm run dev
```

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Frontend runs on `http://localhost:3000`.

### 5. Run Tests (Optional)

```bash
cd auth-back
npm run test:e2e
```

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login and get JWT token | No |
| GET | `/auth/me` | Get current user profile | Yes (Bearer token) |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |

## Project Structure

```
Auth-System/
├── app/
│   ├── page.tsx                  # Welcome page
│   ├── layout.tsx                # Layout with navbar
│   ├── globals.css               # Global styles
│   ├── login/page.tsx            # Login page
│   ├── register/page.tsx         # Register page
│   ├── home/page.tsx             # Protected home page
│   └── reset-password/page.tsx   # Reset password page
├── auth-back/
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # Prisma migrations
│   ├── src/
│   │   ├── main.ts               # Entry point (port 3001, ValidationPipe)
│   │   ├── app.module.ts         # Root module
│   │   ├── prisma/
│   │   │   └── prisma.service.ts # Injectable PrismaService
│   │   └── auth/
│   │       ├── auth.module.ts    # Auth module (JWT, ConfigModule)
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       └── dto/
│   │           ├── register.dto.ts
│   │           ├── login.dto.ts
│   │           └── reset-password.dto.ts
│   ├── .env                      # DATABASE_URL + JWT_SECRET
│   └── test/
│       └── auth.e2e-spec.ts      # E2E tests
├── .env.local                    # NEXT_PUBLIC_API_URL
└── README.md
```

## Database Schema

```sql
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  "resetToken" TEXT,
  "resetTokenExpiry" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

## Security Notes

- JWT secret is stored in `.env` (not hardcoded in source)
- Passwords are hashed with bcrypt (10 salt rounds)
- Reset tokens are stored server-side and invalidated after use
- Input validation via class-validator on all endpoints
- Proper HTTP status codes (401, 404, 409) on errors
