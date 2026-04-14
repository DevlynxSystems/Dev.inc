# Dev.inc — Book Catalog

Full‑stack book catalog with **JWT authentication** and **role‑based access control**:

- Browse the catalog as a guest
- Sign up / log in as a **user** (dashboard + profile)
- Log in as an **admin** (admin dashboard, manage books, manage users)

## Documentation
- **[devdocs.html](./docs/devdocs.html)** - Complete Static Web file with documentation for frontend + backend
- **[FrontEnd_Documentation.md](./FrontEnd_Documentation.md)** — React app: routes, auth, catalog, admin UI, scripts, and how the frontend talks to the API
- **[docs/DEVELOPER_DOCUMENTATION.md](./docs/DEVELOPER_DOCUMENTATION.md)** — contributor guide for README + JSDoc documentation standards
- **[docs/USER_DOCUMENTATION.md](./docs/USER_DOCUMENTATION.md)** — end-user guide for guests, users, and admins
- **[docs/TESTING_PLAN.md](./docs/TESTING_PLAN.md)** — testing scope and cases

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
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

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

## Deployment (e.g. Vercel)

1. **Root directory**: set the project root to the **repository root** (where `package.json` and `vite.config.js` live), not a nested `Frontend/` folder.
2. **Environment variables** (Project Settings → Environment Variables):
   - **`VITE_API_BASE_URL`**: your **deployed backend** origin only, e.g. `https://your-api.onrender.com` (no `/api` suffix unless your server is actually mounted that way).
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

## License

MIT
