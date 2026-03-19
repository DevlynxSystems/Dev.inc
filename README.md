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
├── Frontend/                 # React + Vite app
│   └── src/
│       ├── auth/             # AuthContext
│       ├── components/       # Navbar, ProtectedRoute, UI components
│       └── pages/            # Landing/Login/Signup/Dashboards/Admin pages
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

For the frontend API base URL, set `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Install

```bash
cd Backend
npm install
```

```bash
cd ../Frontend
npm install
```

## Run (two terminals)

**Terminal 1 — Backend**

```bash
cd Backend
npm start
```

Backend: `http://localhost:5000`

**Terminal 2 — Frontend**

```bash
cd Frontend
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

## Deploy frontend to Vercel

1) **Create a new Vercel project** and import this repo.

2) In Vercel project settings, set:
- **Root Directory**: `Frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

3) Add environment variable(s) in Vercel:
- **`VITE_API_BASE_URL`**: your deployed backend base URL (example: `https://your-backend.example.com`)

4) SPA routing is handled via `Frontend/vercel.json` (so routes like `/login` work on refresh).

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
