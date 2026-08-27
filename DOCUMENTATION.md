# Full Documentation — Auth System Project

---

## Part 1: What Did We Build?

A website where users can:
1. **Register** — Create a new account (name, email, password)
2. **Login** — Enter their account
3. **Home Page** — A protected page that only logged-in users can see
4. **Logout** — Leave their account
5. **Forgot Password** — Reset their password if they forgot it

The website stores user data in a cloud database (Neon) and uses JWT tokens for authentication.

---

## Part 2: Technologies Used (What Are They?)

### Frontend (What the user sees)

| Technology | What It Does |
|-----------|-------------|
| **Next.js** | A React framework for building websites. It handles pages, routing, and API routes |
| **React** | A JavaScript library for building user interfaces |
| **TypeScript** | JavaScript with types — helps catch errors before they happen |
| **Tailwind CSS** | A CSS framework for styling — makes it easy to make things look good |

### Backend (The server logic)

| Technology | What It Does |
|-----------|-------------|
| **Next.js API Routes** | Backend endpoints inside the same Next.js project. Files in `app/api/` become API endpoints |
| **Prisma** | An ORM (Object-Relational Mapping) — translates JavaScript code into database queries |
| **bcryptjs** | Hashes (encrypts) passwords before storing them |
| **jose** | Creates and verifies JWT tokens |

### Database (Where data is stored)

| Technology | What It Does |
|-----------|-------------|
| **PostgreSQL** | A relational database — stores data in tables with rows and columns |
| **Neon** | A cloud hosting service for PostgreSQL — hosts our database online for free |

---

## Part 3: Project Structure

```
Auth-System/
│
├── app/                          ← Frontend pages
│   ├── page.tsx                  ← Home page (welcome screen)
│   ├── layout.tsx                ← Layout with navigation bar
│   ├── globals.css               ← Styling
│   ├── login/page.tsx            ← Login page
│   ├── register/page.tsx         ← Registration page
│   ├── home/page.tsx             ← Protected home page (needs login)
│   ├── reset-password/page.tsx   ← Forgot password page
│   │
│   └── api/auth/                 ← Backend API routes
│       ├── register/route.ts     ← POST /api/auth/register
│       ├── login/route.ts        ← POST /api/auth/login
│       ├── me/route.ts           ← GET /api/auth/me
│       ├── forgot-password/route.ts  ← POST /api/auth/forgot-password
│       └── reset-password/route.ts   ← POST /api/auth/reset-password
│
├── lib/                          ← Shared utilities
│   ├── prisma.ts                 ← Database connection
│   └── jwt.ts                    ← JWT token creation/verification
│
├── prisma/
│   └── schema.prisma             ← Database schema (defines tables)
│
├── .env                          ← Secret environment variables
├── vercel.json                   ← Vercel deployment config
├── package.json                  ← Project dependencies
├── tsconfig.json                 ← TypeScript config
├── README.md                     ← Setup instructions
└── DOCUMENTATION.md              ← This file
```

---

## Part 4: How Each File Works

### 4.1 Database Schema (`prisma/schema.prisma`)

This file defines what our database looks like:

```prisma
model User {
  id              Int       @id @default(autoincrement())
  name            String
  email           String    @unique
  password        String
  resetToken      String?
  resetTokenExpiry DateTime?
  createdAt       DateTime  @default(now())
}
```

**What each field means:**
- `id` — Unique number for each user (auto-increments: 1, 2, 3...)
- `name` — User's name
- `email` — User's email (must be unique — no two users with same email)
- `password` — Hashed password (never stored as plain text)
- `resetToken` — Token for password reset (optional)
- `resetTokenExpiry` — When the reset token expires (optional)
- `createdAt` — When the user was created (auto-set)

**When you change this file, run:**
```bash
npx prisma db push
```
This updates the database to match the schema.

---

### 4.2 Database Connection (`lib/prisma.ts`)

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Why this is complicated:**
In development, Next.js reloads your code on every change. Without this trick, a new database connection would be created every time — eventually crashing the app. This saves the connection in a global variable so it's reused.

**In production (Vercel),** each request gets a fresh connection, so this isn't needed — but it doesn't hurt.

---

### 4.3 JWT Token (`lib/jwt.ts`)

JWT (JSON Web Token) is a way to prove "this user is logged in" without storing sessions on the server.

**How JWT works:**
1. User logs in → Server creates a JWT token containing `{ id, email }`
2. Server signs it with a secret key (`JWT_SECRET`)
3. User's browser stores the token
4. Every request includes the token in the `Authorization` header
5. Server verifies the token using the same secret key
6. If valid → user is authenticated

**The three functions:**
- `signToken(payload)` — Creates a token (expires in 1 hour)
- `signResetToken(payload)` — Creates a password reset token (expires in 15 minutes)
- `verifyToken(token)` — Checks if a token is valid

---

### 4.4 API Routes

#### Register (`app/api/auth/register/route.ts`)
```
POST /api/auth/register
Body: { name, email, password }
```
1. Validates input (all fields required, password >= 6 chars, valid email)
2. Checks if email already exists → 409 Conflict
3. Hashes password with bcryptjs (10 salt rounds)
4. Creates user in database
5. Creates JWT token
6. Returns `{ token, user: { id, name, email } }`

#### Login (`app/api/auth/login/route.ts`)
```
POST /api/auth/login
Body: { email, password }
```
1. Finds user by email → 401 if not found
2. Compares password with hash → 401 if wrong
3. Creates JWT token
4. Returns `{ token, user: { id, name, email } }`

#### Get Profile (`app/api/auth/me/route.ts`)
```
GET /api/auth/me
Header: Authorization: Bearer <token>
```
1. Extracts token from header
2. Verifies token → 401 if invalid
3. Finds user by ID from token
4. Returns `{ id, name, email }`

#### Forgot Password (`app/api/auth/forgot-password/route.ts`)
```
POST /api/auth/forgot-password
Body: { email }
```
1. Finds user by email
2. If exists: creates reset token (15min expiry), saves to database
3. Logs token to server console (for development)
4. Returns same message whether email exists or not (prevents email enumeration)

#### Reset Password (`app/api/auth/reset-password/route.ts`)
```
POST /api/auth/reset-password
Body: { token, newPassword }
```
1. Verifies token → 401 if invalid/expired
2. Checks token matches what's stored in database
3. Checks token hasn't expired
4. Hashes new password
5. Updates password in database
6. Clears reset token

---

### 4.5 Frontend Pages

#### Login Page (`app/login/page.tsx`)
- Form with email and password inputs
- On submit: sends POST to `/api/auth/login`
- If success: saves token to `localStorage`, redirects to `/home`
- If error: shows error message

#### Register Page (`app/register/page.tsx`)
- Form with name, email, and password inputs
- On submit: sends POST to `/api/auth/register`
- If success: redirects to `/login`
- If error: shows error message

#### Home Page (`app/home/page.tsx`)
- Protected page — redirects to `/login` if no token
- On mount: sends GET to `/api/auth/me` with token
- Displays user name and email
- Has logout button (removes token from localStorage)

#### Reset Password Page (`app/reset-password/page.tsx`)
- Two-step process:
  1. Enter email → sends POST to `/api/auth/forgot-password`
  2. Enter token + new password → sends POST to `/api/auth/reset-password`

---

## Part 5: How Authentication Works (Step by Step)

```
1. USER REGISTERS
   Browser → POST /api/auth/register → Server
   Server: hash password → save to DB → create JWT → return token
   Browser: save token in localStorage

2. USER LOGS IN
   Browser → POST /api/auth/login → Server
   Server: check email → check password → create JWT → return token
   Browser: save token in localStorage

3. USER ACCESSES PROTECTED PAGE
   Browser → GET /api/auth/me (with token in header) → Server
   Server: verify token → find user → return user data
   Browser: display user info

4. USER LOGS OUT
   Browser: remove token from localStorage → redirect to /login
```

---

## Part 6: Security Measures

| Measure | How It Works |
|---------|-------------|
| **Password Hashing** | Passwords are encrypted with bcryptjs (10 salt rounds). Even if database is stolen, passwords can't be read |
| **JWT Authentication** | Tokens are signed with a secret key. Can't be forged without the key |
| **Reset Token Expiry** | Password reset tokens expire after 15 minutes |
| **Email Enumeration Prevention** | Forgot password returns same message for existing/non-existing emails |
| **Input Validation** | All inputs are validated (email format, password length, required fields) |
| **CORS** | Only accepts requests from configured frontend URL |

---

## Part 7: Environment Variables

| Variable | Where | What It Does |
|----------|-------|-------------|
| `DATABASE_URL` | `.env` + Vercel | Connection string to Neon PostgreSQL database |
| `JWT_SECRET` | `.env` + Vercel | Secret key for signing JWT tokens |

**NEVER commit `.env` to Git!** It's in `.gitignore`.

---

## Part 8: How Deployment Works

```
GitHub Repository
       │
       ├──→ Vercel (Frontend + API Routes)
       │    ├── Reads code from GitHub
       │    ├── Runs `npx prisma generate` (creates Prisma client)
       │    ├── Runs `next build` (builds the app)
       │    └── Deploys to: https://auth-system-chi-eight.vercel.app
       │
       └──→ Neon (Database)
            ├── PostgreSQL in the cloud
            └── Connection string stored in Vercel env vars
```

---

## Part 9: How to Run Locally

### Prerequisites
- Node.js v22+
- npm

### Steps
```bash
# 1. Clone
git clone https://github.com/Mohame570/Auth-System.git
cd Auth-System

# 2. Install dependencies
npm install

# 3. Set up database
npx prisma db push

# 4. Start development server
npm run dev
```

Open http://localhost:3000

---

## Part 10: How to Deploy

### Automatic (via Vercel)
1. Push to GitHub
2. Vercel auto-deploys
3. Set environment variables in Vercel dashboard

### Environment Variables on Vercel
Go to Settings → Environment Variables:
| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Your secret key |

---

## Part 11: Problems We Faced & Solutions

| # | Problem | Cause | Solution |
|---|---------|-------|----------|
| 1 | C: Drive full | No disk space | Uninstalled OneDrive, cleaned npm cache, installed PostgreSQL on D: |
| 2 | `psql not recognized` | PostgreSQL not in PATH | Added `D:\postgress\bin` to Windows PATH |
| 3 | Table doesn't exist | Prisma migration issues | Changed provider to `prisma-client-js`, added dotenv |
| 4 | Module not found | Wrong import path | Changed to `@prisma/client` |
| 5 | DATABASE_URL not found | Prisma skipping .env | Added `import "dotenv/config"` |
| 6 | JWT malformed | Old tokens in browser | Cleared localStorage, re-logged in |
| 7 | Hardcoded JWT secret | Security issue | Moved to .env, used ConfigService |
| 8 | Reset token in response | Security issue | Stored in DB, return generic message |
| 9 | Email enumeration | Different responses for existing/non-existing emails | Return same message for both |
| 10 | No input validation | DTOs not used | Added class-validator, ValidationPipe |
| 11 | Frontend response mismatch | Wrong error checking | Changed to `res.ok` |
| 12 | JWT verify throws 500 | Unhandled error | Added try/catch |
| 13 | `<a>` tags in Next.js | Full page reloads | Changed to `<Link>` |
| 14 | Vercel build error | TypeScript compiling backend files | Excluded auth-back from tsconfig |
| 15 | bcrypt not working on Vercel | Native module issue | Switched to bcryptjs |
| 16 | Table not in Neon | Never ran migration on Neon | Ran `npx prisma db push` |

---

## Part 12: API Reference

### POST /api/auth/register
```json
// Request
{ "name": "Mohamed", "email": "test@example.com", "password": "123456" }

// Response 201
{ "token": "eyJhbG...", "user": { "id": 1, "name": "Mohamed", "email": "test@example.com" } }

// Response 409
{ "message": "Email already registered" }

// Response 400
{ "message": "All fields are required" }
```

### POST /api/auth/login
```json
// Request
{ "email": "test@example.com", "password": "123456" }

// Response 200
{ "token": "eyJhbG...", "user": { "id": 1, "name": "Mohamed", "email": "test@example.com" } }

// Response 401
{ "message": "Invalid credentials" }
```

### GET /api/auth/me
```
Header: Authorization: Bearer eyJhbG...

// Response 200
{ "id": 1, "name": "Mohamed", "email": "test@example.com" }

// Response 401
{ "message": "Invalid or expired token" }
```

### POST /api/auth/forgot-password
```json
// Request
{ "email": "test@example.com" }

// Response 200
{ "message": "If that email is registered, a reset link has been sent." }
```

### POST /api/auth/reset-password
```json
// Request
{ "token": "eyJhbG...", "newPassword": "newpass123" }

// Response 200
{ "message": "Password reset successfully" }

// Response 401
{ "message": "Invalid or expired token" }
```
