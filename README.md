# Dev.inc — Book Catalog

Full‑stack book catalog with **JWT authentication** and **role‑based access control**:
- Browse the catalog as a guest
- Sign up / log in as a **user** (dashboard + profile)
- Log in as an **admin** (manage books + manage users)

## Tech stack

| Layer   | Stack |
|--------|--------|
| **Frontend** | React 18, Vite, React Router |
| **Backend**  | Node.js, Express |
| **Database** | MongoDB (Mongoose) |

## Project structure (high level)

```
Dev.inc/
├── src/                      # React + Vite app (repo root)
│   ├── auth/                 # AuthContext
│   ├── components/           # Navbar, ProtectedRoute, UI components
│   └── pages/                # Landing/Login/Signup/Dashboards/Admin pages
├── public/                   # Static assets for Vite
├── index.html
├── vite.config.js
├── package.json              # Frontend (Vite) dependencies & scripts
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
- If `JWT_SECRET` is missing, a dev-only fallback may be used; set a real secret for anything beyond local development

For the frontend API base URL, create `.env` in the **repo root** (same folder as `package.json`):

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Install and Run

Installation & Setup
Before running the app for the first time, install dependencies for **Backend** and the **repo root** (Vite frontend)

#### Windows:

```PowerShell
.\manage.bat setup
```
#### Unix / macOS / Git Bash:

```Bash
chmod +x manage.sh
./manage.sh setup
```
Running the Application
To start both the backend server and the React frontend concurrently:

 #### Windows:

```PowerShell
.\manage.bat dev
```
Unix / macOS / Git Bash:

```Bash
./manage.sh dev
```
### Alternative Install and Run

```bash
cd Backend
npm install
cd ..
npm install
```

### (two terminals)

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

## Demo seed (optional)

From `Backend/` you can seed demo accounts:

```bash
npm run seed:demo-users
```

To create many demo users/admins:

```bash
npm run seed:many-users
```

4) **Root directory** (if you deploy on Vercel or similar): set the project **root** to the repository root (where `package.json` and `vite.config.js` live), not a former `Frontend/` subfolder.

5) **Environment variables** (Project Settings → Environment Variables):
   - **`VITE_API_BASE_URL`**: your **deployed backend** origin only, e.g. `https://your-api.onrender.com` (no `/api` suffix unless your server is actually mounted that way).  
   - Add for **Production** (and **Preview** if you use preview deployments). **Redeploy** after changing env vars so Vite picks them up at build time.

6) **SPA routing**: `vercel.json` in the repo root rewrites all paths to `/` so React Router routes (e.g. `/login`, `/catalog`) work on refresh.

7) **Troubleshooting**
   - If the live site shows a generic **“demo repository”** welcome page, the wrong Git repo is linked or an old deployment is cached—fix the repo link and **Redeploy**.
   - If the build succeeds but the site is blank or 404s on deep links, double-check **Output Directory** is **`dist`**, not `public`.

Local reference for env names: `.env.example` in the repo root.

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
- user role: `admin`

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
- **Admin**: Admin dashboard + manage books + manage users

## License

MIT
