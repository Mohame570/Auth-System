# Full-Stack Authentication System — Documentation

## Overview

A complete authentication system built with **Next.js** (Frontend), **NestJS** (Backend), **PostgreSQL** (Database), and **Prisma** (ORM).

### Features
- User registration with input validation
- User login with JWT authentication
- Protected home page (token-based authorization)
- Logout
- Forgot password with server-side token storage
- Reset password (token expires after 15 minutes, invalidated after use)
- Proper HTTP status codes and error handling

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js + React + TypeScript + Tailwind CSS | 16.3.2 / 19.2.8 / v4 |
| Backend | NestJS + TypeScript | 10.x |
| Database | PostgreSQL | 17 |
| ORM | Prisma | 6.19.3 |
| Authentication | JWT (`@nestjs/jwt`) + bcrypt | — |
| Validation | class-validator + class-transformer | — |

---

## Project Structure

```
Auth-System/
├── app/                          # Next.js Frontend
│   ├── page.tsx                  # Welcome page with Login/Register links
│   ├── layout.tsx                # Root layout with navbar
│   ├── globals.css               # Global styles (Tailwind + gradient)
│   ├── login/page.tsx            # Login form
│   ├── register/page.tsx         # Registration form
│   ├── home/page.tsx             # Protected home page
│   └── reset-password/page.tsx   # Forgot + Reset password (2-step)
│
├── auth-back/                    # NestJS Backend
│   ├── src/
│   │   ├── main.ts               # Entry point (port 3001, CORS, ValidationPipe)
│   │   ├── app.module.ts         # Root module (ConfigModule)
│   │   ├── prisma/
│   │   │   └── prisma.service.ts # Injectable PrismaService
│   │   └── auth/
│   │       ├── auth.module.ts    # Auth module (JWT config)
│   │       ├── auth.controller.ts # Routes: register, login, me, forgot-password, reset-password
│   │       ├── auth.service.ts   # Business logic
│   │       └── dto/
│   │           ├── register.dto.ts
│   │           ├── login.dto.ts
│   │           └── reset-password.dto.ts
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # Auto-generated SQL migrations
│   ├── test/
│   │   ├── auth.e2e-spec.ts      # E2E tests for auth endpoints
│   │   ├── app.e2e-spec.ts       # E2E test for root endpoint
│   │   └── jest-e2e.json         # Jest config for E2E tests
│   ├── .env                      # DATABASE_URL + JWT_SECRET
│   └── prisma.config.ts          # Prisma config with dotenv
│
├── .env.local                    # NEXT_PUBLIC_API_URL
├── README.md                     # Setup instructions
└── DOCUMENTATION.md              # This file
```

---

## Database Schema

```sql
CREATE TABLE "User" (
  id                SERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  email             TEXT UNIQUE NOT NULL,
  password          TEXT NOT NULL,
  "resetToken"      TEXT,
  "resetTokenExpiry" TIMESTAMP,
  "createdAt"       TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

| Method | Endpoint | Body | Response | Status Codes |
|--------|----------|------|----------|-------------|
| POST | `/auth/register` | `{ name, email, password }` | `{ token, user: { id, name, email } }` | 201, 400, 409 |
| POST | `/auth/login` | `{ email, password }` | `{ token, user: { id, name, email } }` | 200, 400, 401 |
| GET | `/auth/me` | — (Bearer token in header) | `{ id, name, email }` | 200, 401 |
| POST | `/auth/forgot-password` | `{ email }` | `{ message }` | 201, 400 |
| POST | `/auth/reset-password` | `{ token, newPassword }` | `{ message }` | 201, 400, 401 |

---

## Authentication Flow

```
Register:
  Frontend → POST /auth/register → Backend hashes password (bcrypt, 10 rounds)
  → Creates user in PostgreSQL → Signs JWT → Returns token + user

Login:
  Frontend → POST /auth/login → Backend finds user → Compares password (bcrypt)
  → Signs JWT → Returns token + user → Frontend stores in localStorage

Protected Page:
  Frontend reads token from localStorage → Sends in Authorization: Bearer <token>
  → Backend verifies JWT → Returns user profile

Reset Password:
  Frontend → POST /auth/forgot-password with email
  → Backend generates JWT token (15min expiry), stores in DB
  → Logs token to server console (dev mode)
  → Frontend shows generic message
  → User copies token from server console
  → Frontend → POST /auth/reset-password with token + newPassword
  → Backend verifies token, checks expiry, updates password, clears token
```

---

## Security Measures

| Measure | Implementation |
|---------|---------------|
| Password Hashing | bcrypt with 10 salt rounds |
| JWT Authentication | Tokens signed with secret from `.env`, expire after 1 hour |
| Reset Token Expiry | 15 minutes, stored in DB, invalidated after use |
| Input Validation | class-validator decorators on all DTOs, ValidationPipe in main.ts |
| Email Enumeration Prevention | Forgot-password returns same message for existing/non-existing emails |
| CORS Restriction | Only accepts requests from configured `FRONTEND_URL` |
| JWT Secret in .env | Not hardcoded in source code |

---

## Problems Encountered & Solutions

### 1. C: Drive Full (0 GB)
**Problem:** Windows C: drive was completely full. PostgreSQL installer couldn't finish. npm install failed with ENOSPC.

**Solution:**
- Uninstalled OneDrive (~705 MB freed)
- Cleaned npm cache: `npm cache clean --force` (~2.25 GB freed)
- Cleaned temp files: `del /s /q "%TEMP%\*"` (~400 MB freed)
- Installed PostgreSQL on D: drive instead of C:

**Lesson:** Always check disk space before installing. Programs can be installed on any drive.

---

### 2. `psql` Not Recognized
**Problem:** After installing PostgreSQL, `psql` command not found in CMD.

**Solution:** Added PostgreSQL bin directory to Windows PATH:
```powershell
[Environment]::SetEnvironmentVariable("Path", "$currentPath;D:\postgress\bin", "User")
```

**Lesson:** When installing programs outside `C:\Program Files`, you may need to manually add them to PATH.

---

### 3. Prisma Migration — Table Does Not Exist
**Problem:** `npx prisma migrate dev` said "Already in sync" but the User table didn't exist.

**Causes:**
- Used `provider = "prisma-client"` (Prisma v6 new provider) which had issues
- `prisma.config.ts` was skipping `.env` loading

**Solution:**
- Changed to `provider = "prisma-client-js"` (stable, classic provider)
- Added `import "dotenv/config"` to `prisma.config.ts`
- Installed `dotenv`: `npm install dotenv`
- Ran migration again: `npx prisma migrate dev --name init`

**Lesson:** Prisma v6 has breaking changes. Use `prisma-client-js` for stability. Always ensure `.env` is loaded.

---

### 4. Cannot Find Module `../../generated/prisma`
**Problem:** Import path for PrismaClient was wrong after switching providers.

**Solution:** Changed import to standard path:
```typescript
// Before
import { PrismaClient } from '../../generated/prisma';
// After
import { PrismaClient } from '@prisma/client';
```

**Lesson:** With `prisma-client-js`, always import from `@prisma/client`.

---

### 5. Environment Variable Not Found: DATABASE_URL
**Problem:** Prisma CLI detected `prisma.config.ts` and skipped `.env` loading.

**Solution:**
```typescript
// prisma.config.ts
import "dotenv/config";  // ← This loads .env
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
});
```

**Lesson:** When using `prisma.config.ts`, you must explicitly load `.env` via dotenv.

---

### 6. JWT Malformed Error
**Problem:** After switching from mock JWT to real JWT, old tokens in browser were invalid.

**Solution:** Cleared localStorage token and re-logged in.

**Lesson:** When changing JWT secret or implementation, existing tokens become invalid. Users need to re-authenticate.

---

### 7. Hardcoded JWT Secret (Security Issue)
**Problem:** `secret: 'my-secret-key-123'` was committed in source code.

**Solution:**
- Moved to `.env`: `JWT_SECRET="super-secret-key-change-in-production"`
- Used `ConfigModule` + `ConfigService` in NestJS to read it
- Added `.env` to `.gitignore`

**Lesson:** Never commit secrets to source control. Always use environment variables.

---

### 8. Reset Token Exposed in Response
**Problem:** `forgotPassword` returned the reset token in the API response body, visible to anyone.

**Solution:**
- Token is now stored in the database (`resetToken` and `resetTokenExpiry` fields)
- Response only returns a generic message: "If that email is registered, a reset link has been sent."
- Token is logged to server console for development purposes
- In production, this would be sent via email

**Lesson:** Never expose sensitive tokens in API responses. Store them server-side.

---

### 9. Email Enumeration Vulnerability
**Problem:** `forgotPassword` returned 404 for non-existent emails, allowing attackers to discover valid email addresses.

**Solution:** Now returns the same generic message and HTTP 201 for all requests, whether the email exists or not.

**Lesson:** Authentication endpoints should not reveal whether an email is registered.

---

### 10. No Input Validation
**Problem:** DTOs were defined but never used. No ValidationPipe configured. Empty passwords and malformed emails were accepted.

**Solution:**
- Added `class-validator` decorators to all DTOs (`@IsEmail`, `@IsString`, `@MinLength`, `@MaxLength`, `@IsNotEmpty`)
- Added `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))` in `main.ts`
- Controller now uses typed DTOs instead of inline `@Body() body: { ... }`

**Lesson:** Always validate input at the API boundary. `whitelist: true` strips unknown properties.

---

### 11. Frontend Response Shape Mismatches
**Problem:**
- Login checked `data.status === 401` but NestJS returns `statusCode`
- Register checked `data.message === "Email already registered"` but service threw `"Email already exists"`

**Solution:** Changed both to use `res.ok`:
```typescript
if (!res.ok) {
  setError(data.message || "Login failed");
  return;
}
```

**Lesson:** Don't match on error message strings. Use HTTP status codes (`res.ok`) for flow control.

---

### 12. JWT Verify Throws Unhandled Error
**Problem:** `jwtService.verify()` throws `JsonWebTokenError` (non-HTTP exception), resulting in 500 instead of 401.

**Solution:** Wrapped in try/catch:
```typescript
try {
  payload = this.jwtService.verify(token);
} catch {
  throw new UnauthorizedException('Invalid or expired token');
}
```

**Lesson:** Always handle JWT verification errors explicitly.

---

### 13. `<a>` Tags Instead of `<Link>` (Next.js)
**Problem:** Using `<a href="/login">` causes full page reloads instead of client-side navigation.

**Solution:** Replaced all `<a>` with `<Link>` from `next/link` in login, register, and reset-password pages.

**Lesson:** In Next.js, always use `<Link>` for internal navigation to enable SPA behavior.

---

### 14. LayoutProps Type Error
**Problem:** `LayoutProps<"/">` requires `typedRoutes: true` in `next.config.ts`, which wasn't enabled.

**Solution:** Changed to standard type:
```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
```

**Lesson:** Use standard React types unless typed routes are explicitly configured.

---

### 15. CORS Wide Open
**Problem:** `app.enableCors()` accepted requests from any origin.

**Solution:**
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

**Lesson:** Always restrict CORS to your actual frontend domain in production.

---

## Setup Instructions

### Prerequisites
- Node.js v22+
- PostgreSQL 17
- npm

### 1. Clone & Install

```bash
git clone https://github.com/Mohame570/Auth-System.git
cd Auth-System

# Backend
cd auth-back
npm install

# Frontend (from root)
cd ..
npm install
```

### 2. Database

```sql
CREATE DATABASE auth_db;
```

### 3. Environment Variables

**auth-back/.env:**
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/auth_db"
JWT_SECRET="your-strong-random-secret"
FRONTEND_URL="http://localhost:3000"
```

**.env.local (root):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Run Migration

```bash
cd auth-back
npx prisma migrate dev --name init
```

### 5. Start Development

```bash
# Terminal 1 — Backend
cd auth-back
npm run start:dev

# Terminal 2 — Frontend
npm run dev
```

### 6. Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## Running Tests

```bash
cd auth-back
npm run test:e2e
```

Tests cover: register (valid, duplicate, invalid input), login (valid, wrong password, wrong email), profile (valid token, no token, invalid token), forgot-password (existing email, non-existing email), reset-password (invalid token).

---

## Deployment Notes

| Item | Status | Notes |
|------|--------|-------|
| Environment variables | Ready | Use platform env vars (Vercel, Railway, etc.) |
| CORS | Configured | Set `FRONTEND_URL` to production URL |
| Database | Ready | Use hosted PostgreSQL (Neon, Supabase, Railway) |
| JWT Secret | Must change | Generate strong secret for production |
| Password Reset | Console log | Implement email service (SendGrid, Nodemailer) for production |
| Rate Limiting | Not implemented | Add `@nestjs/throttler` for production |
| Security Headers | Not implemented | Add `helmet` for production |
