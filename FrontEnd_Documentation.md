# Frontend Documentation — Dev.inc Book Catalog

This document describes the **React + Vite** frontend: routing, authentication, public catalog, user area, admin portal, data flow, styling, and scripts.

---

## Overview

The frontend is a **React 18** single-page application built with **Vite 5** and **React Router 7**. It talks to the **Express/MongoDB backend** via `fetch` (public catalog reads; authenticated calls use JWT).

**Roles (from API):**

- **Guest** — landing page, catalog browsing, login/signup.
- **User** — dashboard, profile (`PUT /api/auth/me`).
- **Admin** — admin dashboard, manage users, manage books (plus all user capabilities where applicable).

Environment: set **`VITE_API_BASE_URL`** in a root `.env` (see README). If unset, dev defaults to `http://localhost:5000` and production build defaults to the deployed API URL defined in `AuthContext.jsx`.

---

## Tech stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI |
| Vite 5 | Dev server, build, `@` → `src/` alias |
| React Router 7 | Client-side routing |
| Tailwind CSS 3 | Utility-first styling (with `index.css` / component classes) |
| Motion (`motion/react`) | Animations on several pages |
| Lucide React | Icons |
| Recharts | Admin dashboard charts |
| `@vercel/analytics` | Analytics component in `App.jsx` |
| Vitest + Testing Library | Unit tests (`src/**/*.test.jsx`) |
| Playwright | E2E (`npm run test:e2e`) |

Fonts and global theming are set in `index.html` / `index.css` (dark theme is applied in `main.jsx`).

---

## Project structure

The Vite app lives at the **repository root** (next to `Backend/`), not in a nested `Frontend/` folder.

```
./
├── index.html
├── package.json
├── vite.config.js          # React plugin, @ alias, Vitest config
├── postcss.config.js       # Tailwind pipeline
├── tailwind.config.js
├── public/                 # Static assets
└── src/
    ├── main.jsx            # StrictMode, BrowserRouter, AuthProvider
    ├── App.jsx             # Navbar, Footer, Routes, scroll-to-top
    ├── App.css
    ├── index.css
    ├── setupTests.js
    ├── auth/
    │   └── AuthContext.jsx # JWT, user, login/signup/logout, authFetch, API_BASE_URL
    ├── lib/
    │   ├── adminAudit.js   # localStorage admin event log + CSV export
    │   └── utils.js        # cn(), etc.
    ├── data/
    │   └── books.js        # Legacy/sample data if still referenced
    ├── components/         # Navbar, Footer, modals, AdminLayout, ProtectedRoute, Skeleton, …
    └── pages/              # Route-level screens
```

---

## Entry points

1. **`index.html`** — mounts `#root` with `src/main.jsx`.
2. **`main.jsx`** — `BrowserRouter` → `AuthProvider` → `App`.
3. **`App.jsx`** — global `Navbar` + `Footer`, `<Routes>` for all pages, `@vercel/analytics`.

---

## Authentication (`src/auth/AuthContext.jsx`)

- **Token** stored in `localStorage` under `devinc_auth_token`.
- On load (if token exists), **`GET /api/auth/me`** restores the user; invalid token is cleared.
- **`authFetch(url, options)`** — same as `fetch` but injects `Authorization: Bearer <token>`.
- **Exports:** `user`, `token`, `loading`, `login`, `signup`, `logout`, `updateProfile`, `authFetch`, `API_BASE_URL`.

---

## Routing (`src/App.jsx`)

| Path | Guard | Page |
|------|--------|------|
| `/` | — | `LandingPage` |
| `/catalog` | — | `CatalogPage` (receives `searchQuery` from App state / Navbar) |
| `/login`, `/signup` | — | `LoginPage`, `SignupPage` |
| `/profile` | `ProtectedRoute` | `ProfilePage` |
| `/dashboard` | `ProtectedRoute` | `UserDashboard` |
| `/admin` | `ProtectedRoute requireAdmin` | `AdminDashboard` |
| `/admin/users` | `requireAdmin` | `ManageUsers` |
| `/admin/users/:id` | `requireAdmin` | `AdminUserProfile` |
| `/admin/books` | `requireAdmin` | `ManageBooks` |
| `*` | — | Redirect to `/` |

**`ProtectedRoute`** (`src/components/ProtectedRoute.jsx`):

- While auth is loading → skeleton.
- No user → redirect to `/login` (with `state.from` for return URL).
- `requireAdmin` and `user.role !== 'admin'` → redirect to `/dashboard`.

Admins are sent to **`/admin`** after login/signup (see `LoginPage` / `SignupPage`).

---

## Public catalog (`CatalogPage`)

- Fetches books from **`GET ${API_BASE_URL}/api/books`**.
- Search is driven by **Navbar** state lifted in `App.jsx` (`searchQuery` / `onSearchChange`).
- Uses **`BookCard`**, **`CatalogFilters`**, **`BookDetailsModal`**, **`BookFormModal`** for browsing and details.
- **Admins** see catalog CRUD controls (add/edit/delete) that call the same book API with **`authFetch`**; guests and regular users browse without those mutations.
- **Wishlist / recent** selections use **browser `localStorage`** (`devinc_wishlist_books`, `devinc_recent_books`).

---

## User area

- **`UserDashboard`** — personalized home: loads **`GET /api/books`**, merges with **`sampleBooks`** from `src/data/books.js` as fallback, and surfaces **recent**, **wishlist**, and **reading progress** from **`localStorage`** (`devinc_recent_books`, `devinc_wishlist_books`, `devinc_reading_progress`).
- **`ProfilePage`** — profile edit via **`updateProfile`** → `PUT /api/auth/me`.

---

## Admin portal

All admin screens use **`AdminLayout`** (sidebar: Dashboard, Users, Books, Logout; top bar with placeholder search, notifications from `adminAudit`, “Add Book”, link to profile).

### Dashboard (`AdminDashboard`)

- Loads **`GET /api/admin/users`** (auth) and **`GET /api/books`**.
- Summary cards, monthly users-vs-books chart (Recharts), recent users/books, quick links, activity feed from **`getAdminEvents()`** with optional CSV export.
- Some UI metrics (e.g. review count, “% this month” on cards) may be **placeholders** — see code for current behavior.

### Manage users (`ManageUsers`)

- List: **`GET /api/admin/users`** with optional `q`, `role` query params.
- Update name/phone: **`PUT /api/admin/users/:id`**.
- Role (user/admin): **`PATCH /api/admin/users/:id/role`**.
- Delete: **`DELETE /api/admin/users/:id`**.
- **Client-only:** “moderator” role, user status (active/pending/suspended), and “invite” are stored/logged locally (`localStorage` / `logAdminEvent`) where not backed by the API — see `ManageUsers.jsx` and `User` model on the backend.

### Admin user profile (`AdminUserProfile`)

- **`GET /api/admin/users/:id`** — read-only detail view; “activity” section is placeholder copy until features exist.

### Manage books (`ManageBooks`)

- List: **`GET /api/books`**.
- Create/update/delete: **`POST/PUT/DELETE /api/books`** with **`authFetch`** (admin JWT).
- **`BookFormModal`** / **`BookDetailsModal`** — add/edit/view; cover images are compressed client-side before send (size limits apply; **413** handled in UI).
- CSV import/export and bulk actions are implemented in-page; see `ManageBooks.jsx`.

### Client audit trail (`src/lib/adminAudit.js`)

- Events in **`localStorage`** (`devinc_admin_audit_events`), capped in length.
- **`logAdminEvent`**, **`getAdminEvents`**, **`exportAdminEventsCsv`** — used by admin pages for lightweight, **browser-local** auditing (not a server audit log).

---

## Book shape (API / UI)

The backend returns MongoDB-style documents. The UI typically uses:

| Field | Notes |
|-------|--------|
| `_id` | Mongo id string |
| `title`, `author` | Required for create |
| `cover` | Optional string (e.g. data URL) |
| `pageCount` | Number |
| `date` | Publication date |
| `genre` | May appear in UI/filters when present on documents |

---

## Key shared components

| Component | Role |
|-----------|------|
| `Navbar` | Nav links, search, auth-aware menu (user vs admin) |
| `Footer` | Site links including admin entry where relevant |
| `BookFormModal` | Add/edit book (file upload + compression, validation) |
| `BookDetailsModal` | Read-only book details |
| `AdminLayout` | Admin chrome |
| `ProtectedRoute` | Auth + optional admin gate |
| `Skeleton` | Loading placeholders (auth, admin tables, charts) |

---

## Styling

- **Tailwind** utility classes across pages and many components.
- **`index.css`** — global base, variables, Tailwind layers as configured.
- **`App.css`** — layout and legacy/shared classes (e.g. `.btn`, `.catalog-intro`).
- Some components still use co-located **`.css`** files (e.g. `AdminLayout.css`, `BookFormModal.css`).

---

## Scripts (repository root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Vitest unit tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright |

---

## Vite configuration (`vite.config.js`)

- `@` resolves to `./src`.
- **Vitest:** `jsdom`, `setupFiles: ./src/setupTests.js`, tests under `src/**/*.{test,spec}.{js,jsx}`.
- No `server.proxy` by default; the app calls **`VITE_API_BASE_URL`** directly (ensure CORS is enabled on the backend for dev).

---

## Testing

- **Unit:** `src/**/*.test.jsx` (and `.js`), Vitest + Testing Library.
- **E2E:** Playwright configuration at repo root (see `playwright.config` if present).
- High-level cases are also listed in `docs/TESTING_PLAN.md`.

---

## Summary

- **Stack:** React 18, Vite 5, React Router 7, Tailwind, Motion, Recharts, JWT auth via `AuthContext`.
- **Data:** Catalog and admin operations use the **REST API**; not an in-memory-only catalog.
- **Admin:** Dedicated routes under `/admin/*` with `requireAdmin`, user/book management, local audit helpers.
- **Config:** `VITE_API_BASE_URL` for API origin; token in `localStorage`.

For backend endpoints and env setup, see **`README.md`** in the repository root.
