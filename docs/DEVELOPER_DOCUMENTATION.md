# Developer Documentation — Dev.inc Book Catalog

This guide is for contributors and maintainers. It complements `README.md` by defining how to work in the codebase and how to document code with JSDoc.

---

## 1) Goals

- Keep onboarding fast for new developers.
- Keep behavior discoverable from `README.md` + source code comments.
- Keep API and UI contracts clear through consistent JSDoc.

---

## 2) Documentation standard

Developer documentation in this project uses two layers:

1. **Repository-level docs** in `README.md` and `docs/*.md`
2. **Code-level docs** using **JSDoc** in JavaScript/JSX files

Use both together:

- `README.md` explains setup, scripts, environments, and architecture links.
- JSDoc explains symbols in-place: functions, components, hooks, and modules.

---

## 3) Recommended file map for docs

- `README.md` — project overview, setup, deployment, scripts
- `FrontEnd_Documentation.md` — frontend architecture and routing
- `docs/USER_DOCUMENTATION.md` — end-user product guide
- `docs/TESTING_PLAN.md` — testing strategy and coverage map
- `docs/DEVELOPER_DOCUMENTATION.md` — contributor conventions (this file)

---

## 4) JSDoc conventions (required for new/changed logic)

Add JSDoc for:

- exported functions
- exported React components
- custom hooks
- utility functions with non-obvious behavior
- backend controller/service functions

Keep comments short and practical; explain intent and contracts, not obvious syntax.

### 4.1 Function template

```js
/**
 * Briefly explains what this function does.
 * @param {string} id - Human-readable parameter description.
 * @param {Object} [options] - Optional settings.
 * @returns {Promise<Object>} Returned value description.
 * @throws {Error} When the request fails.
 */
async function loadItem(id, options = {}) {
  // ...
}
```

### 4.2 React component template

```js
/**
 * Profile page onboarding flow.
 * @returns {JSX.Element}
 */
export function ProfilePage() {
  // ...
}
```

If a component takes props, document them with `@param`.

```js
/**
 * Catalog card for a single book.
 * @param {{ book: Object, onView: (book: Object) => void }} props
 * @returns {JSX.Element}
 */
export function BookCard({ book, onView }) {
  // ...
}
```

### 4.3 Module-level notes

At the top of utility files, add a short module comment when needed:

```js
/**
 * Admin audit helpers using browser localStorage.
 * Used by AdminDashboard, ManageUsers, and ManageBooks.
 */
```

---

## 5) Style rules for docs and JSDoc

- Use plain English and short sentences.
- Describe **why** and **contract**, not implementation trivia.
- Keep terms consistent with the UI:
  - "Catalog", "Dashboard", "Admin Dashboard", "Manage Users", "Manage Books".
- Reference real route and endpoint paths when relevant.
- When behavior is local-only (for example `localStorage`), state that clearly.

---

## 6) Where to prioritize JSDoc first

If you are adding docs incrementally, prioritize these files:

### Frontend priority

- `src/auth/AuthContext.jsx`
- `src/components/ProtectedRoute.jsx`
- `src/lib/adminAudit.js`
- `src/pages/CatalogPage.jsx`
- `src/pages/UserDashboard.jsx`
- `src/pages/AdminDashboard.jsx`
- `src/pages/ManageUsers.jsx`
- `src/pages/ManageBooks.jsx`

### Backend priority

- `Backend/controllers/adminController.js`
- `Backend/controllers/booksController.js`
- `Backend/routes/adminRoutes.js`
- `Backend/routes/bookRoutes.js`
- `Backend/middleware/authMiddleware.js`
- `Backend/middleware/roleMiddleware.js`

---

## 7) Definition of done for documentation

A feature/fix is considered documentation-complete when:

1. User-visible behavior changes are reflected in:
   - `README.md` (if setup/scripts/routes changed), and/or
   - `FrontEnd_Documentation.md` / `docs/USER_DOCUMENTATION.md` (if UX changed)
2. New exported symbols include JSDoc.
3. Updated function signatures include updated `@param`/`@returns`.
4. Known limitations are documented (for example placeholders or client-only state).

---

## 8) PR checklist (documentation)

Before opening a PR:

- [ ] Updated docs for any new route/API/script/config
- [ ] Added or updated JSDoc for touched exported symbols
- [ ] Ensured examples and path names are accurate
- [ ] Removed stale statements that no longer match implementation

---

## 9) Quick examples from this project

- `src/lib/adminAudit.js` should document that audit events are browser-local, capped in count, and exportable as CSV.
- `src/components/ProtectedRoute.jsx` should document redirect behavior for unauthenticated and non-admin users.
- `Backend/controllers/adminController.js` should document allowed role values for role updates.

---

## 10) Notes

- This repo currently has no automated JSDoc generation step.
- If you want generated API docs in future, you can add a JSDoc toolchain and publish output to `docs/`.

