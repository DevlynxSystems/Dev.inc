# Testing Plan — Book Catalog (Dev.inc)

## 1. Introduction (brief overview)

**Approach:** We use a **test pyramid**: many fast **automated unit tests** (Jest for Node, Vitest for React), fewer **integration tests** that exercise the HTTP API with mocked persistence (Jest + Supertest), and **system tests** that drive the browser against the running Vite app (Playwright) for critical user journeys.

**Components under test:**

| Layer | Components |
|-------|----------------|
| Backend | `filterBooks`, `BooksClass`, `cleanupDuplicates`, Express `app` (`/`, `/api/auth/*`, `/api/books`) |
| Frontend | `cn` (`utils`), `adminAudit`, `ProtectedRoute`, routing |
| System | Landing, catalog navigation, login and signup screens |

**Automation tools:**

| Level | Tool | Location |
|-------|------|----------|
| Unit (backend) | Jest | `Backend/*.test.js` (excluding integration file) |
| Integration (API) | Jest + Supertest | `Backend/api.integration.test.js` |
| Unit (frontend) | Vitest + Testing Library | `src/**/*.test.js(x)` |
| System (E2E) | Playwright | `e2e/system.spec.js` |

**Test views (CB, TB, OB):** We apply **Clear Box (CB)** where internal branches matter (validation, redirects), **Translucent Box (TB)** at component boundaries (API + mocked DB, audit storage), and **Opaque Box (OB)** where behavior is specified by inputs/outputs or user-visible flows only. Each automated case is tagged with `UT-xx-TV`, `IT-xx-TV`, or `ST-xx-TV` in code or this document.

**Run all automated tests (from repo root):**

```bash
npm run test:all
```

---

## 2. Unit tests

Unit tests verify **individual methods or functions** in isolation.

**Test ID format:** `UT-XX-TV` — UT = Unit Test, XX = number, TV = CB | TB | OB.

| Test ID | Method / class | Input(s) | Expected output(s) | Testing approach | Owner |
|---------|----------------|----------|--------------------|------------------|-------|
| UT-01-CB | `filterBooks()` | `books`, `{ genre: 'Sci-Fi' }` | Array length 2, all `genre === 'Sci-Fi'` | Automated (Jest) | Team |
| UT-02-OB | `filterBooks()` | `books`, `{ genre: 'Horror' }` | `[]` | Automated (Jest) | Team |
| UT-03-TB | `filterBooks()` | `books`, `{ genre: 'sci-fi' }` | Same as Sci-Fi (case-insensitive) | Automated (Jest) | Team |
| UT-04-OB | `filterBooks()` | `books`, `{ author: 'Harper Lee' }` | Single book, *Mockingbird* | Automated (Jest) | Team |
| UT-05-OB | `filterBooks()` | `books`, `{ author: 'Unknown' }` | `[]` | Automated (Jest) | Team |
| UT-06-TB | `filterBooks()` | `books`, `{ author: 'harper lee' }` | Same as Harper Lee | Automated (Jest) | Team |
| UT-07-OB | `filterBooks()` | `books`, `{ title: 'the' }` | At least *The Great Gatsby* | Automated (Jest) | Team |
| UT-08-TB | `filterBooks()` | `books`, `{ title: 'DUNE' }` | *Dune* | Automated (Jest) | Team |
| UT-09-OB | `filterBooks()` | `books`, `{ title: 'nomatch' }` | `[]` | Automated (Jest) | Team |
| UT-10-OB | `filterBooks()` | Combined `{ genre, author }` | Intersection correct | Automated (Jest) | Team |
| UT-11-OB | `filterBooks()` | Conflicting genre/author | `[]` | Automated (Jest) | Team |
| UT-12-CB | `Book` constructor | Title, date, author, cover, pages | Fields set | Automated (Jest) | Team |
| UT-13–UT-23 | `Book` getters/setters / validation | Various | Correct get/set or `TypeError` | Automated (Jest) | Team |
| UT-24-CB | `insertIntoDatabase()` | Mock DB | `save` called, resolved shape | Automated (Jest) | Team |
| UT-25-TB | `cleanup()` | Mock DB, no dupes | No `deleteMany` | Automated (Jest) | Team |
| UT-26-CB | `cleanup()` | Mock DB, dupes | `deleteMany` called | Automated (Jest) | Team |
| UT-27-CB | `cleanup()` | Missing `MONGO_URI` | Error path / `process.exit(1)` mocked | Automated (Jest) | Team |
| UT-28-CB | `cleanup()` | Connect + disconnect | Called as expected | Automated (Jest) | Team |
| UT-29-CB | `cn()` | `'p-2 p-4'` | Resolved Tailwind class (e.g. `p-4`) | Automated (Vitest) | Team |
| UT-30-OB | `cn()` | Conditional classes | Correct merged string | Automated (Vitest) | Team |
| UT-31-OB | `logAdminEvent()` | `{ actor, type, message }` | Event stored in `localStorage` | Automated (Vitest) | Team |
| UT-32-TB | `getAdminEvents()` | Corrupt JSON in storage | `[]` | Automated (Vitest) | Team |
| UT-33-CB | `ProtectedRoute` | `loading: true` | “Loading…” | Automated (Vitest) | Team |
| UT-34-OB | `ProtectedRoute` | No user | Redirect to `/login` | Automated (Vitest) | Team |
| UT-35-OB | `ProtectedRoute` | User present | Children render | Automated (Vitest) | Team |
| UT-36-CB | `ProtectedRoute` | `requireAdmin`, role `user` | Redirect to `/dashboard` | Automated (Vitest) | Team |

*Note: Backend Jest files use descriptive `test()` titles. `BooksClass.test.js` maps to UT-12–UT-24; `cleanupDuplicates.test.js` maps to UT-25–UT-28 (order as in each file).*

- Teams should **automate** unit tests wherever possible (done for listed cases).
- The suite covers **catalog filtering**, **domain model**, **cleanup script**, **UI utilities**, and **route guards**.

---

## 3. Integration tests

Integration tests evaluate **interactions between components** (HTTP stack + controllers + mocked persistence).

**Test ID format:** `IT-XX-TV`.

| Test ID | Components involved | Preconditions | Steps | Expected result | Owner |
|---------|---------------------|---------------|-------|-----------------|-------|
| IT-01-TB | Express + root route | App constructed | `GET /` | 200, body contains “running” | Team |
| IT-02-OB | Auth controller + validation | None | `POST /api/auth/login` with `{}` | 400, error mentions required fields | Team |
| IT-03-OB | Auth controller + validation | None | `POST /api/auth/signup` with invalid `role` | 400 | Team |
| IT-04-CB | JWT middleware | None | `GET /api/auth/me` without header | 401 | Team |
| IT-05-CB | JWT middleware | None | `GET /api/auth/me` with bad Bearer token | 401 | Team |
| IT-06-TB | Books route + `DatabaseManager` (mock) | Mock returns sample book | `GET /api/books` | 200, JSON array with expected title | Team |

Integration tests are **automated** (`npm run test:integration` in `Backend/` or full `npm test`).

---

## 4. System tests

System tests validate **full workflows** from the end-user perspective in a real browser.

**Test ID format:** `ST-XX-TV`.

| Test ID | Scenario | Preconditions | Steps | Expected outcome | Owner |
|---------|----------|---------------|-------|------------------|-------|
| ST-01-OB | Home loads | Dev server via Playwright | Open `/` | Primary nav + home link visible | Team |
| ST-02-OB | Open catalog | Logged-out user | Click **Catalog** (exact) | URL contains `/catalog` | Team |
| ST-03-OB | Login screen | None | Open `/login` | “Welcome back”, email field | Team |
| ST-04-OB | Signup screen | None | Open `/signup` | “Create your account” | Team |

System tests are **automated** (`npm run test:e2e`); extend with logged-in flows when stable test accounts exist in the target environment.

---

## 5. Traceability and coverage notes

**A. Map tests to features**

| Feature | Unit IDs | Integration IDs | System IDs |
|---------|-----------|-----------------|------------|
| Catalog filtering | UT-01–UT-11 | — | ST-02 |
| Book domain / DB helper | UT-12–UT-24 | IT-06 | — |
| Duplicate cleanup | UT-25–UT-28 | — | — |
| Auth API | — | IT-02–IT-05 | ST-03, ST-04 |
| UI utilities & guards | UT-29–UT-36 | — | ST-01–ST-02 |

**B. Higher-risk areas**

- **JWT + role checks** (auth middleware, `ProtectedRoute`, admin routes).
- **Persistence** (mongoose operations; integration uses mocks for CI reliability).
- **Cleanup script** (destructive; covered with mocks only).

**C. Distribution (approximate)**

| Category | Count (automated) |
|----------|-------------------|
| Backend unit (`npm run test:unit` in `Backend/`) | 28 |
| Backend integration (`api.integration.test.js`, also in `npm test`) | 6 |
| Frontend unit (Vitest) | 8 |
| System (E2E, Playwright) | 4 |
| **Total** (`npm run test:all`) | **46** |

**D. CB, TB, OB**

| View | Meaning in this project |
|------|-------------------------|
| **CB** | Branch and internal behavior (validators, redirects, merge rules, mocked `process.exit`). |
| **TB** | Boundaries between modules (API + mocked DB, `localStorage` audit, case-insensitive filters). |
| **OB** | Specified input/output or user-visible outcome without asserting implementation. |

---

*Document version aligns with automated tests in the repository; update this table when adding cases.*
