# Dev.inc — Book Catalog

[![Live Site](https://img.shields.io/badge/Live-Vercel-black?logo=vercel)](https://devinc-brown.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)](https://render.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Repo Stars](https://img.shields.io/github/stars/DevlynxSystems/Dev.inc?style=social)](https://github.com/DevlynxSystems/Dev.inc/stargazers)
[![Forks](https://img.shields.io/github/forks/DevlynxSystems/Dev.inc?style=social)](https://github.com/DevlynxSystems/Dev.inc/network/members)
[![React](https://img.shields.io/badge/React-18-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

Full‑stack book catalog with **JWT authentication** and **role‑based access control**:

- Browse the catalog as a guest
- Sign up / log in as a **user** (dashboard + profile)
- Log in as an **admin** (admin dashboard, manage books, manage users)

## Quick links

- Live app: [https://devinc-brown.vercel.app/](https://devinc-brown.vercel.app/)
- Frontend docs: [FrontEnd_Documentation.md](./FrontEnd_Documentation.md)
- Full static docs: [docs/devdocs.html](./docs/devdocs.html)
- Testing plan: [docs/TESTING_PLAN.md](./docs/TESTING_PLAN.md)

## Documentation
- **[devdocs.html](./docs/devdocs.html)** — complete static documentation for frontend + backend
- **[FrontEnd_Documentation.md](./FrontEnd_Documentation.md)** — React app: routes, auth, catalog, admin UI, scripts, and how the frontend talks to the API
- **[docs/DEVELOPER_DOCUMENTATION.md](./docs/DEVELOPER_DOCUMENTATION.md)** — contributor guide for README + JSDoc documentation standards
- **[docs/USER_DOCUMENTATION.md](./docs/USER_DOCUMENTATION.md)** — end-user guide for guests, users, and admins
- **[docs/TESTING_PLAN.md](./docs/TESTING_PLAN.md)** — testing scope and cases

## Live demo

- Frontend (Vercel): [https://devinc-brown.vercel.app/](https://devinc-brown.vercel.app/)
- Backend API: hosted on Render
- Database: hosted on Render

## Tech stack

| Layer | Stack |
|--------|--------|
| **Frontend** | React 18, Vite 5, React Router 7, Tailwind CSS, Vitest + Testing Library, Playwright (E2E) |
| **Backend** | Node.js, Express |
| **Database** | MongoDB (Mongoose) |

## Project structure (high level)

```
Dev.inc/
├── FrontEnd_Documentation.md # Frontend architecture & features
├── docs/                     # e.g. TESTING_PLAN.md
├── src/                      # React + Vite app (repo root)
│   ├── auth/                 # AuthContext (JWT, authFetch)
│   ├── lib/                  # Utilities, client-side admin audit helpers
│   ├── components/           # Navbar, ProtectedRoute, AdminLayout, modals, …
│   └── pages/                # Landing, catalog, login/signup, dashboards, admin
├── public/                   # Static assets for Vite
├── index.html
├── vite.config.js
├── package.json              # Frontend dependencies & scripts
└── Backend/                  # Express API
    ├── controllers/
    ├── middleware/           # JWT auth + role checks
    ├── models/               # User model
    ├── routes/               # authRoutes, bookRoutes, adminRoutes
    └── server.js
```

## Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** (only needed for local backend development; cloud deployment uses Render)

## Environment variables

Create `Backend/.env` (recommended):

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_value
PORT=5000
```

Notes:

- If `MONGO_URI` is missing, the backend falls back to a local MongoDB URL (for dev).
- If `JWT_SECRET` is missing, a dev-only fallback may be used; set a real secret for anything beyond local development.

For the frontend API base URL, create `.env` in the **repo root** (same folder as `package.json`):

```env
VITE_API_BASE_URL=http://localhost:5000
```

Local reference for env names: `.env.example` in the repo root.

## Install and run

Before running the app for the first time, install dependencies for **Backend** and the **repo root** (Vite frontend).

### Windows

```PowerShell
.\manage.bat setup
```

### Unix / macOS / Git Bash

```Bash
chmod +x manage.sh
./manage.sh setup
```

### Start backend + frontend together

**Windows:**

```PowerShell
.\manage.bat dev
```

**Unix / macOS / Git Bash:**

```Bash
./manage.sh dev
```

### Alternative: two terminals

```bash
cd Backend
npm install
cd ..
npm install
```

**Terminal 1 — Backend**

```bash
cd Backend
npm start
```

Backend: `http://localhost:5000`

**Terminal 2 — Frontend** (from repo root)

```bash
npm run dev
```

Frontend: `http://localhost:5173` (or whatever Vite prints)

## Testing

From the **repo root**:

| Command | Description |
|---------|-------------|
| `npm test` | Frontend unit tests (Vitest) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:backend` | Backend tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run test:all` | Backend + frontend unit + E2E |

## Demo seed (optional)

From `Backend/` you can seed demo accounts:

```bash
npm run seed:demo-users
```

To create many demo users/admins:

```bash
npm run seed:many-users
```

## Deployment (Vercel + Render)

- **Live frontend (Vercel):** [https://devinc-brown.vercel.app/](https://devinc-brown.vercel.app/)
- **Backend:** hosted on **Render**
- **Database:** hosted on **Render**

1. **Root directory**: set the project root to the **repository root** (where `package.json` and `vite.config.js` live), not a nested `Frontend/` folder.
2. **Environment variables** (Project Settings → Environment Variables):
   - **`VITE_API_BASE_URL`**: set this to your deployed Render backend origin (no `/api` suffix unless your server is mounted that way).
   - Add for **Production** (and **Preview** if you use preview deployments). **Redeploy** after changing env vars so Vite picks them up at build time.
3. **SPA routing**: `vercel.json` in the repo root rewrites paths to `/` so React Router routes (e.g. `/login`, `/catalog`, `/admin`) work on refresh.
4. **Build output**: **Output Directory** should be **`dist`**, not `public`.

### Troubleshooting

- If the live site shows a generic **“demo repository”** welcome page, the wrong Git repo is linked or an old deployment is cached—fix the repo link and **Redeploy**.
- If the build succeeds but the site is blank or deep links 404, confirm **Output Directory** is **`dist`**.

## API overview

### Auth (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account (returns JWT + user) |
| POST | `/api/auth/login` | Log in (returns JWT + user) |
| GET | `/api/auth/me` | Current user (requires `Authorization: Bearer <token>`) |
| PUT | `/api/auth/me` | Update profile (name / phone / address / optional password) |

### Books (`/api/books`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/books` | Public | List books |
| GET | `/api/books/:id` | Public | Get one book |
| POST | `/api/books` | Admin | Add book |
| PUT | `/api/books/:id` | Admin | Update book |
| DELETE | `/api/books/:id` | Admin | Delete book |

### Admin (`/api/admin`) — admin only

All endpoints below require:

- `Authorization: Bearer <token>`
- User role: `admin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List users (supports search/filter) |
| GET | `/api/admin/users/:id` | Get user by id |
| PUT | `/api/admin/users/:id` | Update user (name/phone/address) |
| PATCH | `/api/admin/users/:id/role` | Promote/demote role |
| DELETE | `/api/admin/users/:id` | Delete user |

## Roles & UI

- **Guest**: Landing + catalog browsing
- **User**: User dashboard + profile setup/edit
- **Admin**: Admin dashboard (`/admin`), manage books (`/admin/books`), manage users (`/admin/users`)

## Contribution Charts

![Contributors](https://contrib.rocks/image?repo=DevlynxSystems/Dev.inc)

[![Repo Activity Graph](https://github-readme-activity-graph.vercel.app/graph?username=DevlynxSystems&theme=github-compact)](https://github.com/DevlynxSystems/Dev.inc/graphs/contributors)

## Technology Insights

![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=DevlynxSystems&repo=Dev.inc&layout=compact&theme=default)

![Repo Stats](https://github-readme-stats.vercel.app/api/pin/?username=DevlynxSystems&repo=Dev.inc&theme=default)

## License

[MIT](https://opensource.org/licenses/MIT)
