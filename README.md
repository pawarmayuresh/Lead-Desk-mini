# LeadDesk Mini Pro

A production-quality lead capture and management platform built for the **Digital Heroes Full Stack Development Internship Qualification Task**.

---

## 1. Live Demo

| Service | URL |
|---|---|
| **Landing Page** | https://lead-desk-mini-sage.vercel.app |
| **Admin Dashboard** | https://lead-desk-mini-sage.vercel.app/dashboard |
| **Backend API** | https://leakdesk-mini-production.up.railway.app |
| **API Docs (OpenAPI)** | https://leakdesk-mini-production.up.railway.app/docs |
| **Health Check** | https://leakdesk-mini-production.up.railway.app/health |

**Test Credentials**

```
Email:    admin@digitalheroes.com
Password: Admin@123
```

---

## 2. Project Overview

LeadDesk Mini Pro has two distinct user experiences:

**Visitors** submit project inquiries through a responsive landing page with a lead form (name, email, budget range, message). Submissions are validated on both client and server before being stored in PostgreSQL.

**Admins** log in to a secure dashboard to view all leads, search by name or email, and update lead status through a NEW → CONTACTED → CLOSED lifecycle.

---

## 3. Features

### Task A — Lead Capture

- ✅ Responsive public landing page with hero, services, and benefits sections
- ✅ Lead form with fields: name, email, budget range (dropdown), message
- ✅ Client-side validation using React Hook Form + Zod
- ✅ Server-side validation using Pydantic v2
- ✅ Leads stored in PostgreSQL (Neon) via SQLAlchemy ORM
- ✅ Admin view at `/dashboard` listing all leads
- ✅ Search leads by name or email (debounced 300ms)
- ✅ Status toggle: New / Contacted / Closed
- ✅ Dashboard stats cards showing counts by status
- ✅ Footer credit: "Built for Digital Heroes Training Task" linked to digitalheroesco.com

### Task B — Security & Deployment

- ✅ Real JWT authentication — not a hardcoded string
- ✅ HTTP-only cookie session management (XSS-resistant)
- ✅ Access token (15 min) + Refresh token (7 days) with rotation
- ✅ bcrypt password hashing via passlib
- ✅ Protected routes — unauthenticated users redirected to `/login`
- ✅ Deployed on Vercel (frontend) + Railway (backend) + Neon (database)
- ✅ Works from a fresh incognito browser with no local state
- ✅ Loom walkthrough (see below)

---

## 4. System Architecture

```
Browser (Vercel)
      ↓ HTTPS + withCredentials
FastAPI (Railway)
      ↓ SQLAlchemy ORM
PostgreSQL (Neon)
```

**Layered backend architecture:**

```
API Routes (FastAPI)       — HTTP only, no business logic
      ↓
Service Layer              — Business logic, transactions
      ↓
Repository Layer           — DB queries only, no business logic
      ↓
SQLAlchemy ORM
      ↓
PostgreSQL (Neon)
```

Each layer has one responsibility. Routes never touch the database. Services never know about HTTP status codes. Repositories never make business decisions.

---

## 5. Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React 19 + TypeScript | UI framework with strong typing |
| Vite | Build tool — fast dev server and optimized production builds |
| Tailwind CSS v4 | Utility-first styling with consistent design system |
| React Hook Form + Zod | Performant forms with schema-driven validation |
| TanStack Query | Server state management with caching, loading, error states |
| Axios | HTTP client with automatic cookie attachment (`withCredentials: true`) |
| Framer Motion | Page transitions and component animations |
| React Three Fiber + Three.js | 3D hero scene (lazy loaded — only on landing page) |
| React Router v7 | Client-side routing with protected route guards |

### Backend
| Tool | Purpose |
|---|---|
| FastAPI | High-performance Python API with automatic OpenAPI docs |
| SQLAlchemy 2.x | Type-safe ORM with mapped columns |
| Alembic | Version-controlled database migrations |
| Pydantic v2 | Request/response validation with clear error messages |
| python-jose | JWT encoding and decoding |
| passlib + bcrypt | Industry-standard password hashing |
| PostgreSQL (Neon) | Serverless-ready relational database |

### Deployment
| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Railway |
| Database | Neon PostgreSQL |

---

## 6. Folder Structure

```
LeadDesk-Mini-Pro/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Button, Input, Navbar, Footer, Toast, etc.
│   │   │   ├── dashboard/     # StatsCard, SearchBar, LeadsTable
│   │   │   └── forms/         # LeadForm
│   │   ├── pages/             # Home, Login, Dashboard
│   │   ├── layouts/           # PublicLayout, AdminLayout
│   │   ├── context/           # AuthContext (cookie session state)
│   │   ├── services/          # Axios API client
│   │   ├── routes/            # ProtectedRoute guard
│   │   ├── types/             # TypeScript interfaces
│   │   └── constants/         # Budget labels, status values, API URL
│   ├── vercel.json
│   └── .env.example
│
└── backend/
    ├── app/
    │   ├── api/               # Route handlers (thin layer)
    │   ├── services/          # Business logic
    │   ├── repositories/      # Database queries
    │   ├── models/            # SQLAlchemy ORM models
    │   ├── schemas/           # Pydantic schemas
    │   ├── core/              # Config, JWT, security, cookies, rate limiting
    │   ├── database/          # Engine, session, base
    │   ├── dependencies/      # FastAPI dependency injection wiring
    │   └── middleware/        # JWT auth dependency
    ├── migrations/            # Alembic migration files
    ├── start.sh               # Production startup script
    ├── railway.toml           # Railway deployment config
    └── .env.example
```

---

## 7. Database Design

### users table

| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) | UUID primary key |
| email | VARCHAR(255) | Unique, indexed |
| password_hash | TEXT | bcrypt hash — never plaintext |
| role | ENUM(ADMIN) | Extensible for future RBAC |
| is_active | BOOLEAN | Soft-disable without deletion |
| last_login | TIMESTAMP TZ | Audit trail |
| created_at | TIMESTAMP TZ | Auto |
| updated_at | TIMESTAMP TZ | Auto |

### leads table

| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) | UUID primary key |
| name | VARCHAR(100) | Required |
| email | VARCHAR(255) | Indexed |
| budget | ENUM | LESS_THAN_50K, 50K_TO_1L, 1L_TO_5L, ABOVE_5L |
| message | TEXT | Required |
| status | ENUM | NEW (default), CONTACTED, CLOSED |
| created_at | TIMESTAMP TZ | Indexed |
| updated_at | TIMESTAMP TZ | Auto-updated |
| deleted_at | TIMESTAMP TZ | NULL = active; soft delete ready |

### Why UUID primary keys?

UUID primary keys prevent sequential ID enumeration attacks. An attacker cannot guess `lead/2` after seeing `lead/1`.

### Why ENUM for budget and status?

ENUM types reject invalid values at the database level, not just the application level. They simplify filtering and analytics compared to free-text strings.

### Why no foreign key from leads to users?

This is a single-admin MVP. Adding a foreign key for one user would be premature. An `assigned_to` field referencing `users.id` is the natural next step for multi-user support.

### Indexes

| Index | Columns | Reason |
|---|---|---|
| ix_leads_email | email | Case-insensitive name/email search |
| ix_leads_status | status | Dashboard status filter |
| ix_leads_created_at | created_at | Default sort order |
| ix_leads_status_created_at | status, created_at | Composite — single scan for filtered+sorted dashboard query |
| ix_leads_active | created_at WHERE deleted_at IS NULL | Partial index — only indexes active leads, smaller and faster |

### Migrations

Two Alembic revisions:
- `001` — Creates `users` and `leads` tables with enums and indexes
- `002` — Adds `role`, `is_active`, `last_login`, `updated_at` to users; adds `deleted_at` soft delete column and partial index to leads

Migrations run automatically on every Railway deploy via `start.sh`.

---

## 8. Authentication Design

### Flow

```
1. POST /api/v1/auth/login  (email + password)
         ↓
2. bcrypt.verify password (constant-time — always runs even if user not found)
         ↓
3. Generate access token (15 min) + refresh token (7 days)
         ↓
4. Set both as HTTP-only cookies on the response
         ↓
5. Browser stores cookies automatically — JavaScript never sees the tokens
         ↓
6. Every subsequent request sends the access_token cookie automatically
         ↓
7. GET /api/v1/auth/me validates the cookie session on app load
         ↓
8. When access token expires, POST /api/v1/auth/refresh rotates both tokens
         ↓
9. POST /api/v1/auth/logout clears both cookies server-side
```

### Why HTTP-only cookies instead of localStorage?

`localStorage` is readable by any JavaScript on the page. If the site has an XSS vulnerability, an attacker can steal tokens from localStorage. HTTP-only cookies cannot be read by JavaScript at all — the browser attaches them automatically on every request.

### Why two tokens?

The access token has a 15-minute lifetime to limit damage if intercepted. The refresh token (7 days) allows silent re-authentication without forcing the user to log in every 15 minutes.

### Why SameSite=None; Secure in production?

The frontend (Vercel, `.vercel.app` domain) and backend (Railway, `.railway.app` domain) are on different domains. `SameSite=Lax` blocks cross-site cookies entirely. `SameSite=None; Secure` allows the browser to send cookies cross-site, which is required for this architecture. `Secure` is mandatory with `SameSite=None` — the cookie only travels over HTTPS.

### Why constant-time password verification?

If the check for "user not found" returns faster than the check for "wrong password", an attacker can time the response to determine whether an email address exists in the database. The implementation always runs `bcrypt.verify` regardless — even against a dummy hash — to make all failures take the same time.

### Token type claims

Each JWT contains a `type` claim (`access` or `refresh`). The decode functions reject tokens of the wrong type — a refresh token cannot be used as an access token and vice versa.

### Rate limiting

Login is rate-limited to 5 attempts per minute per IP address using an in-memory sliding window limiter. The limiter runs inside the route handler — never in middleware — to avoid interfering with CORS OPTIONS preflight requests.

---

## 9. API Overview

### Public

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/v1/auth/login` | Admin login — sets HTTP-only cookies |
| POST | `/api/v1/auth/logout` | Clears cookies server-side |
| POST | `/api/v1/leads` | Submit a lead (public) |

### Protected (requires valid `access_token` cookie)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/auth/me` | Validate current session |
| POST | `/api/v1/auth/refresh` | Rotate access + refresh tokens |
| GET | `/api/v1/leads` | List all leads (supports `?search=`) |
| PATCH | `/api/v1/leads/{id}/status` | Update lead status |
| GET | `/api/v1/dashboard/stats` | Aggregated counts by status |

Full interactive API documentation: https://leakdesk-mini-production.up.railway.app/docs

---

## 10. Validation Strategy

Validation happens at three independent layers:

**Layer 1 — Client (Zod + React Hook Form)**
- Name: 2–100 characters
- Email: valid format
- Budget: must select from predefined options
- Message: 10–1000 characters
- Errors shown inline below each field

**Layer 2 — API (Pydantic v2)**
- Same rules enforced on the server
- Returns structured 422 errors with field-level messages
- `EmailStr` type validates email format
- Client input is never trusted

**Layer 3 — Database (PostgreSQL constraints)**
- `NOT NULL` on required fields
- `UNIQUE` on user email
- `ENUM` types reject invalid budget/status values at DB level
- UUID primary keys prevent predictable IDs

---

## 11. Security Considerations

| Concern | Implementation |
|---|---|
| XSS token theft | HTTP-only cookies — tokens never in JavaScript |
| CSRF | SameSite=None with explicit CORS origin allowlist |
| SQL injection | SQLAlchemy ORM with parameterized queries |
| Password exposure | bcrypt hashing, never stored or logged in plaintext |
| User enumeration | Constant-time auth, generic error messages |
| Brute force | Rate limiting: 5 login attempts/minute per IP |
| Secret exposure | All secrets in environment variables, `.env` in `.gitignore` |
| Stack traces | Centralized exception handler returns safe error messages |
| Clickjacking | `X-Frame-Options: DENY` header |
| MIME sniffing | `X-Content-Type-Options: nosniff` header |
| Info leakage | `Referrer-Policy: strict-origin-when-cross-origin` header |
| CORS misconfiguration | Explicit origin allowlist, no wildcard with credentials |

---

## 12. Deployment

### Architecture

```
GitHub → Railway (auto-deploy on push to main)
GitHub → Vercel  (auto-deploy on push to main)
```

### Backend — Railway

Start command (`start.sh`):
1. Run Alembic migrations (`alembic upgrade head`)
2. Seed admin user if not exists
3. Start uvicorn

### Frontend — Vercel

- Build command: `npm run build`
- Output: `dist/`
- `vercel.json` handles SPA routing (all paths → `index.html`)
- Static assets cached for 1 year (`Cache-Control: immutable`)

---

## 13. Local Setup

### Prerequisites

- Node.js 18+
- Python 3.13+
- A [Neon](https://neon.tech) PostgreSQL database (free tier)

### Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and SECRET_KEY

# Run migrations
PYTHONPATH=. alembic upgrade head

# Seed admin user
PYTHONPATH=. python -m app.utils.seed

# Start development server
uvicorn app.main:app --reload
```

API: http://localhost:8000 | Docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend

npm install

cp .env.example .env
# .env already set to http://localhost:8000/api/v1

npm run dev
```

Frontend: http://localhost:5173

---

## 14. Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `SECRET_KEY` | ✅ | JWT signing key — generate with `python3 -c "import secrets; print(secrets.token_hex(64))"` |
| `ALGORITHM` | — | Default: `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | — | Default: `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | — | Default: `7` |
| `APP_ENV` | — | `development` or `production` |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated frontend URLs |
| `COOKIE_SECURE` | — | `true` in production (auto-enabled when `APP_ENV=production`) |
| `COOKIE_SAMESITE` | — | `lax` (dev) or `none` (prod, auto-set) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend URL, e.g. `https://your-api.railway.app/api/v1` |

---

## 15. Test Credentials

```
Email:    admin@digitalheroes.com
Password: Admin@123
```

---

## 16. Design Decisions

**Why FastAPI over Django/Flask?**
FastAPI generates OpenAPI documentation automatically, has native async support, and Pydantic integration means request validation is declarative rather than imperative. For a REST API, it produces cleaner code than Django REST Framework with less configuration.

**Why layered architecture (Repository → Service → Route)?**
Each layer has one responsibility. Routes don't contain business logic. Services don't know about HTTP. Repositories don't make business decisions. This separation makes the code testable in isolation and easier to extend without breaking existing functionality.

**Why PostgreSQL ENUM types for budget and status?**
ENUM types enforce valid values at the database level, independently of the application. If someone queries the database directly or a future service inserts records, invalid values are still rejected. Free-text strings require application-level validation only.

**Why UUID primary keys?**
Sequential integer IDs expose the size of the dataset and allow ID enumeration attacks. A user who sees `/leads/42` can guess `/leads/43`. UUIDs are globally unique and unpredictable.

**Why soft delete (`deleted_at`) instead of hard delete?**
Data deleted by mistake cannot be recovered from a hard delete. Soft delete preserves all records while filtering them from normal queries. The partial index `WHERE deleted_at IS NULL` ensures performance is not degraded.

**Why `SameSite=None; Secure` in production?**
The frontend and backend are on different domains (Vercel vs Railway). `SameSite=Lax` blocks cross-site cookies entirely. `SameSite=None; Secure` is the correct setting for cross-site cookie authentication over HTTPS.

---

## 17. Trade-offs

| Decision | Trade-off |
|---|---|
| HTTP-only cookies | Cannot be read by JS (more secure) but requires `withCredentials: true` on every request and `SameSite=None` for cross-domain |
| Stateless JWT | No server-side session storage needed, but logout doesn't truly invalidate tokens until they expire. A Redis token denylist would fix this. |
| In-memory rate limiter | Simple and dependency-free, but resets on server restart and doesn't work across multiple instances. Redis-backed limiter would be correct at scale. |
| Single admin account | Simplest MVP approach. Multi-user RBAC would add `assigned_to` FK on leads and a roles/permissions table. |
| NullPool database connection | Safe for serverless (Neon) — no idle connections held. On a traditional server, QueuePool with `pool_pre_ping` would be more efficient. |

---

## 18. Future Improvements

- Redis-backed token denylist for true logout
- Password reset flow via email (SendGrid)
- Multi-admin support with RBAC
- Email notifications on lead submission
- Pagination on the leads table (offset or cursor-based)
- End-to-end tests with Playwright
- GitHub Actions CI/CD pipeline
- Soft-delete UI (restore deleted leads)

---

## 19. AI Usage Disclosure

AI was used as an engineering assistant throughout the project to accelerate research, validate implementation approaches, and review architectural decisions rather than to generate a complete solution. I primarily used Kiro as my development IDE, with Cursor assisting in targeted code generation and refactoring. ChatGPT was used to understand the product requirements, refine the PRD, evaluate system architecture, compare authentication and database design options, review deployment strategies, and improve technical documentation. Claude was mainly used to generate initial boilerplate code and implementation scaffolding, which I then refactored and integrated into the project. I also consulted different AI models for researching best practices in full-stack development, security, deployment, and software architecture to compare multiple perspectives before making implementation decisions.

After using AI-generated suggestions, I reviewed the output, removed unnecessary complexity, reorganised the project structure, refined the UI/UX, strengthened the authentication flow, improved the database design, and adapted the implementation to fit the scope of this assignment. All final architectural decisions, code integration, debugging, testing, deployment, and documentation were completed through my own judgement to ensure the delivered solution accurately reflects my understanding and engineering approach.

---

## 20. Credits

Built by **Mayuresh Pawar** for the **Digital Heroes Full Stack Development Internship Qualification Task**.

[Built for Digital Heroes Training Task](https://digitalheroesco.com)

**GitHub Repository:** https://github.com/pawarmayuresh/Lead-Desk-mini
