# Full-Stack Authentication System

A complete authentication system built with Next.js, NestJS, PostgreSQL, and Prisma.

## Features

- Register a new account
- Login with email and password
- Protected home page (JWT authentication)
- Reset password (forgot password flow)

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL 17
- **ORM:** Prisma 6
- **Auth:** JWT (jsonwebtoken) + bcrypt

## Prerequisites

- Node.js v22+
- PostgreSQL 17 installed and running
- npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/auth-system.git
cd auth-system

2. Database Setup
Open PostgreSQL terminal (psql) and create the database:CREATE DATABASE auth_db;

3. Backend Setup
cd auth-back
npm install
Create a .env file inside auth-back:

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/auth_db"
Replace YOUR_PASSWORD with your PostgreSQL password.

Run the migration:

npx prisma migrate dev --name init
Start the backend server:

npm run start:dev
Backend runs on http://localhost:3001.

4. Frontend Setup
Open a new terminal:

cd auth-front
npm install
npm run dev
Frontend runs on http://localhost:3000.

API Endpoints
Method	Endpoint	Description
POST	/auth/register	Register a new user
POST	/auth/login	Login and get JWT token
GET	/auth/me	Get current user profile (requires Bearer token)
POST	/auth/forgot-password	Generate reset token
POST	/auth/reset-password	Reset password with token
Project Structure
auth-front/
├── app/
│   ├── page.tsx              # Home page (welcome)
│   ├── layout.tsx            # Layout with navbar
│   ├── globals.css           # Global styles
│   ├── login/page.tsx        # Login page
│   ├── register/page.tsx     # Register page
│   ├── home/page.tsx         # Protected home page
│   └── reset-password/page.tsx # Reset password page
├── auth-back/
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── src/
│   │   ├── app.module.ts     # Root module
│   │   ├── main.ts           # Entry point (port 3001)
│   │   └── auth/
│   │       ├── auth.module.ts
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       └── dto/
│   │           ├── register.dto.ts
│   │           ├── login.dto.ts
│   │           └── reset-password.dto.ts
│   ├── .env                  # DATABASE_URL
│   └── prisma.config.ts      # Prisma config with dotenv
└── README.md

## Database Schema

```sql
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);


