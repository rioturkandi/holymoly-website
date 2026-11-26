# HOLYMOLY

**Full-Stack Automotive Company Profile Website**

A full-stack website developed for HOLYMOLY, an automotive customization business. It features a public company profile, an admin dashboard, REST API, and MySQL database.

**Live Demo:** https://holymoly-website-production.up.railway.app/
**Repository:** https://github.com/rioturkandi/holymoly

## Features

### Public Website

| Page | Content |
|---|---|
| Home | Hero, service highlights, and contact CTA |
| About | Our Journey, Vision, Mission, Philosophy, Workshop & Tools |
| Projects | Vehicle information, project descriptions, cover images, and detail galleries |
| Achievements | Awards, events, and Media Coverage |

Workshop & Tools and Media Coverage are sections within their respective pages, not separate public pages.

### Admin Dashboard

- Admin authentication and dashboard overview.
- CRUD content management for supported sections.
- Home, About, Projects, and Achievements management.
- Media Coverage and Workshop photo management.
- Image upload, preview, and cropping.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, JavaScript, Vite 8, Tailwind CSS v4 |
| Routing & UI | React Router 7, React Advanced Cropper |
| Backend | Node.js, Express 5 |
| API | REST API, Fetch API, Server-Sent Events (SSE) |
| Database | MySQL, mysql2 |
| Authentication | JWT, bcryptjs, cookie-parser |
| Security | Helmet, express-rate-limit, dotenv |
| File Processing | Multer, Sharp |
| Development | npm, ESLint, Git, GitHub |
| Deployment | Docker configuration, Railway |

## Application Architecture

The application uses a client-server architecture:

1. React handles the public website and admin dashboard.
2. The frontend communicates with the Express backend through the REST API.
3. The backend handles authentication, authorization, validation, and application logic.
4. MySQL stores application data through mysql2.
5. Multer handles image uploads, while Sharp processes and converts images to WebP.
6. Server-Sent Events support real-time update notifications.

## REST API

| Route | Purpose |
|---|---|
| `/api/home` | Home content |
| `/api/about` | About content |
| `/api/projects` | Project data |
| `/api/achievements` | Achievement data |
| `/api/media-coverage` | Media Coverage content |
| `/api/workshop` | Workshop content |
| `/api/auth` | Admin authentication |
| `/api/admin/*` | Protected content management |
| `/api/uploads` | Image upload operations |
| `/api/events` | Real-time update events |
| `/api/health` | Health check |

## Security

Security measures implemented:

- JWT authentication and protected admin routes.
- bcrypt password hashing and verification.
- HTTP-only cookies, Secure production cookies, and SameSite Strict.
- CSRF protection and trusted-origin validation.
- Rate limiting on authentication endpoints.
- Server-side input validation.
- Parameterized SQL queries.
- React output escaping and avoidance of unsafe HTML rendering.
- Helmet security headers and Content Security Policy (CSP).
- HSTS in production.
- Environment variable validation and secret separation.
- Image format, size, dimension, and pixel-limit validation.
- Server-side image processing with Sharp.
- Production reverse-proxy configuration for Railway.

### Security Testing

| Test | Result |
|---|---|
| SQL Injection | **PASSED** |
| Cross-Site Scripting (XSS) | **PASSED** |

Both tests were completed successfully during development.

## Project Structure

```text
holymoly/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── migrations/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── .env.example
│   ├── Dockerfile
│   └── server.js
├── src/
│   ├── assets/
│   ├── components/
│   ├── data/
│   ├── pages/
│   │   └── admin/
│   ├── services/
│   └── styles/
├── .gitignore
├── package.json
└── vite.config.js
```

## Getting Started

**Requirements:** Node.js, npm, MySQL, and Git.

### 1. Clone and Install

```bash
git clone https://github.com/rioturkandi/holymoly-website.git
cd holymoly-website
npm install
cd backend && npm install
```

### 2. Configure Environment

From the `backend` directory:

```bash
cp .env.example .env
```

Configure the database credentials and application secrets in `backend/.env`.

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `DB_PORT` | MySQL port |
| `JWT_SECRET` | JWT signing secret (minimum 32 bytes) |
| `CSRF_TRUSTED_ORIGINS` | Trusted frontend origins for CSRF fallback |

### 3. Set Up Database

Create the MySQL database and user, then run migrations in order:

1. `000_baseline_schema.sql`
2. `20261113_remove_unused_content_columns.sql`
3. `20261116_create_image_uploads.sql`

Migration files are located in `backend/migrations/`.

### 4. Create Admin Account

From the `backend` directory:

```bash
node scripts/create-admin.js
```

Follow the terminal prompts to create the admin account.

### 5. Run the Application

Start the backend from `backend/`:

```bash
npm run dev
```

Start the frontend from the project root in another terminal:

```bash
npm run dev
```

The Vite development proxy forwards `/api` and `/uploads` requests to the backend.

## Available Scripts

| Location | Command | Purpose |
|---|---|---|
| Frontend | `npm run dev` | Development server |
| Frontend | `npm run build` | Production build |
| Frontend | `npm run lint` | ESLint checks |
| Frontend | `npm run preview` | Preview production build |
| Backend | `npm run dev` | Development server |
| Backend | `npm start` | Production server |
| Backend | `npm test` | Backend tests |

## Verification

| Check | Result |
|---|---|
| Frontend production build (`npm run build`) | PASSED |
| Frontend lint (`npm run lint`) | PASSED |
| Backend automated tests (`npm test`) | 34 passed, 0 failed |
| SQL Injection testing | PASSED |
| Cross-Site Scripting (XSS) testing | PASSED |

## Deployment

Deployed on **Railway**.

https://holymoly-website-production.up.railway.app/

Production deployment requires configured environment variables, database connectivity, and backend service settings.

## Author

**Muhammad Rio Turkandi**
