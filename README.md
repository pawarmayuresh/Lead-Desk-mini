# LeadDesk Mini Pro

A production-quality lead management platform built for the Digital Heroes Full Stack Development Internship qualification task.

**Live Demo**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-api.onrender.com`
- API Docs: `https://your-api.onrender.com/docs`

---

## Overview

LeadDesk Mini Pro is a SaaS-inspired application where:
- **Visitors** submit project inquiries through a responsive landing page
- **Admins** log in to a secure dashboard to view, search, and update lead statuses

---

## Architecture

```
Browser → Vercel (React + TypeScript)
             ↓ HTTPS / REST
        Render (FastAPI)
             ↓ SQLAlchemy ORM
        Neon (PostgreSQL)
```

**Layered backend architecture:**
```
API Layer (routes) → Service Layer (business logic) → Repository Layer (DB queries) → Database
```

This separation means business logic is never mixed with DB queries or HTTP concerns — each layer has one responsibility.

---

## Features

| Feature | Details |
|---|---|
| Responsive Landing Page | Hero, Services, Benefits, Lead Form, Footer |
| Lead Form | React Hook Form + Zod client-side validation |
| Server Validation | Pydantic v2 on every request |
| PostgreSQL Database | Neon serverless PostgreSQL |
| JWT Authentication | Stateless, Bearer token, bcrypt password hashing |
| Admin Dashboard | Stats cards, searchable lead table, status updates |
| Search | Debounced (300ms), searches name and email |
| Status Management | NEW → CONTACTED → CLOSED inline dropdown |
| Loading States | Skeleton loaders on every async operation |
| Error States | Retry buttons, user-friendly messages |
| Toast Notifications | Success and error feedback |
| Fully Responsive | Mobile-first, tested at 375px, 768px, 1280px |

---

## Tech Stack

### Frontend
| Tool | Why |
|---|---|
| React 19 + TypeScript | Strong typing prevents runtime bugs; modern concurrent features |
| Vite | Fastest dev server and build tool in the ecosystem |
| Tailwind CSS | Utility-first CSS eliminates context switching; consistent design system |
| React Hook Form + Zod | Performant forms with schema-driven validation — no uncontrolled inputs |
| TanStack Query | Server state management with caching, loading, and error states built in |
| Axios | Interceptors allow centralized auth token injection |
| React Router v6 | Protected routes with declarative navigation |

### Backend
| Tool | Why |
|---|---|
| FastAPI | Auto-generates OpenAPI docs; async-ready; Pydantic integration |
| SQLAlchemy 2 | Type-safe ORM; parameterized queries prevent SQL injection |
| Alembic | Version-controlled schema migrations — never manually alter tables |
| Pydantic v2 | Request/response validation with clear error messages |
| python-jose | JWT encoding/decoding — stateless auth suitable for REST APIs |
| passlib + bcrypt | Industry-standard password hashing |
| PostgreSQL (Neon) | ACID-compliant, production-grade, serverless-friendly |

---

## Project Structure

```
LeadDesk-Mini-Pro/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level page components
│   │   ├── layouts/        # PublicLayout, AdminLayout
│   │   ├── services/       # Axios API client
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # TypeScript interfaces
│   │   ├── constants/      # Enums, labels, API URL
│   │   └── routes/         # ProtectedRoute guard
│   ├── .env.example
│   └── vercel.json
│
├── backend/
│   ├── app/
│   │   ├── api/            # Route handlers (thin layer)
│   │   ├── services/       # Business logic
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── core/           # Config, JWT, security, logging, exceptions
│   │   ├── database/       # Engine, session, base
│   │   ├── middleware/     # JWT auth dependency
│   │   └── utils/          # Repository layer, seed script
│   ├── migrations/         # Alembic migration files
│   ├── requirements.txt
│   ├── render.yaml
│   └── .env.example
│
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.12+
- A [Neon](https://neon.tech) PostgreSQL database

### Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate       # macOS/Linux
# venv\Scripts\activate        # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL to your Neon connection string

# Run database migrations
PYTHONPATH=. alembic upgrade head

# Seed the admin user
PYTHONPATH=. python -m app.utils.seed

# Start the development server
uvicorn app.main:app --reload
```

API available at: `http://localhost:8000`  
OpenAPI docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

npm install

# Configure environment
cp .env.example .env
# .env already points to http://localhost:8000/api/v1 for local dev

npm run dev
```

Frontend available at: `http://localhost:5173`

---

## API Reference

### Public

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/leads` | Submit a new lead |
| POST | `/api/v1/auth/login` | Admin login — returns JWT |
| POST | `/api/v1/auth/logout` | Logout (client-side token removal) |
| GET | `/health` | Health check |

### Protected (requires `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/leads` | Get all leads (supports `?search=`) |
| PATCH | `/api/v1/leads/{id}/status` | Update lead status |
| GET | `/api/v1/dashboard/stats` | Dashboard statistics |

---

## Authentication

The application uses **JWT Bearer token authentication**.

1. Admin submits credentials to `POST /api/v1/auth/login`
2. Server verifies password using bcrypt and returns a signed JWT
3. Frontend stores the token in `localStorage` and attaches it to every protected request via an Axios interceptor
4. Server validates the JWT signature and expiry on every protected endpoint

**Security note:** For a production deployment beyond this MVP, JWT tokens should be stored in `HttpOnly` cookies to prevent XSS attacks. `localStorage` is used here for simplicity, with this tradeoff explicitly acknowledged.

---

## Admin Credentials

```
Email:    admin@digitalheroes.com
Password: Admin@123
```

---

## Deployment

### Database (Neon)
1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Run migrations against it: `PYTHONPATH=. alembic upgrade head`
4. Run seed: `PYTHONPATH=. python -m app.utils.seed`

### Backend (Render)
1. Connect your GitHub repository to Render
2. Create a new **Web Service**, point to the `backend/` folder
3. Set environment variables: `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_ORIGINS`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
1. Import your GitHub repository to Vercel
2. Set root directory to `frontend/`
3. Add environment variable: `VITE_API_URL=https://your-api.onrender.com/api/v1`
4. Deploy — `vercel.json` handles SPA routing automatically

---

## Database Schema

### users
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique |
| password_hash | TEXT | bcrypt |
| created_at | TIMESTAMP TZ | Auto |

### leads
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | VARCHAR(100) | Required |
| email | VARCHAR(255) | Indexed |
| budget | ENUM | LESS_THAN_50K, 50K_TO_1L, 1L_TO_5L, ABOVE_5L |
| message | TEXT | Required |
| status | ENUM | NEW (default), CONTACTED, CLOSED |
| created_at | TIMESTAMP TZ | Indexed |
| updated_at | TIMESTAMP TZ | Auto-updated |

**Indexes:** `email`, `status`, `created_at`, composite `(status, created_at)` for dashboard queries.

---

## Design Decisions

**Why no FK from leads to users?**  
MVP uses a single admin. Adding a foreign key for a single-user system would be premature. An `assigned_to` field referencing `users.id` is the natural next step for multi-user support.

**Why UUID primary keys instead of integers?**  
UUIDs prevent ID enumeration attacks (a user can't guess `lead/2` after seeing `lead/1`), support distributed systems, and are the production standard.

**Why ENUM for budget and status?**  
Prevents invalid values at the database level. Makes filtering and analytics simpler. More honest than storing free text.

**Why NullPool for SQLAlchemy?**  
Neon and Render are serverless/containerized — connection pools can create orphaned connections. NullPool creates a fresh connection per request, which is safer in this environment.

**Why localStorage for JWT?**  
Acceptable for an MVP with a single admin. The tradeoff (XSS risk) is acknowledged. Production upgrade path: HttpOnly cookies with CSRF protection.

---

## AI Usage

GitHub Copilot and Claude assisted with boilerplate generation (Pydantic schemas, Tailwind class suggestions, Alembic migration structure). All generated code was reviewed, understood, and modified to match the project's architecture. Business logic, security decisions, database design, and architectural choices were made independently. Generated UI components were restructured to follow the project's component hierarchy and design system.

---

## Future Improvements

- Email notifications on lead submission (SendGrid)
- Password reset flow
- Pagination on the leads table
- Multi-admin support with RBAC
- JWT HttpOnly cookie migration
- Redis-based token denylist for logout
- End-to-end tests with Playwright
- CI/CD pipeline with GitHub Actions
