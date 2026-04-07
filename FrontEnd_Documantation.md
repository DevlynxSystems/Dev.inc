# Frontend Documentation — Book Catalog

This document describes the *Book Catalog* frontend: structure, components, data flow, styling, and how to run and build it.

---

## Overview

The frontend is a *React 18* single-page app built with *Vite 5*. It provides a book catalog where users can:

- Browse books in a grid
- Search by title, author, or genre
- Add new books via a modal form
- View book details in a modal
- Delete books from the catalog

State is kept in memory (no backend API calls in the current setup). Sample data is loaded from src/data/books.js.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^18.2.0 | UI components and state |
| React DOM | ^18.2.0 | Rendering |
| Vite | ^5.0.0 | Dev server and build |
| @vitejs/plugin-react | ^4.2.1 | React Fast Refresh / JSX |

*Fonts:* Crimson Pro (serif) and DM Sans (sans-serif), loaded from Google Fonts in index.html.

---

## Project Structure

The Vite app lives at the **repository root** (alongside `Backend/`), not in a nested `Frontend/` folder.

```
./
├── index.html              # Entry HTML, fonts, root div
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite config (React plugin)
├── public/
│   ├── logo.png            # Navbar logo
│   └── cover-*.png         # Optional cover images
├── src/
│   ├── main.jsx            # React root mount
│   ├── App.jsx             # Main app layout and state
│   ├── App.css             # Layout, catalog grid, buttons
│   ├── index.css           # Global reset and CSS variables
│   ├── data/
│   │   └── books.js        # sampleBooks array
│   ├── components/
│   │   ├── Navbar.jsx / .css
│   │   ├── BookCard.jsx / .css
│   │   ├── BookFormModal.jsx / .css
│   │   └── BookDetailsModal.jsx / .css
│   └── assets/             # Local cover images (imported in books.js)
```

---

## Entry Points

- *index.html* — Loads /src/main.jsx as a module.
- *main.jsx* — Renders <App /> inside #root with React.StrictMode.
- *App.jsx* — Holds catalog state, search, and modals; composes Navbar, book grid, and modals.

---

## Data Model

A *book* object has:

| Field     | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| id      | string | Yes      | Unique identifier              |
| title   | string | Yes      | Book title                     |
| author  | string | Yes      | Author name                    |
| year    | number | No       | Publication year (e.g. 1925)   |
| genre   | string | No       | Genre (e.g. Fiction, Romance)  |
| coverUrl| string | No       | URL or imported image for cover|

sampleBooks in src/data/books.js is an array of such objects; new books get an id from Date.now() in App.jsx.

---

## Components

### 1. App.jsx

*Role:* Root layout and single source of truth for catalog and UI state.

*State:*

- books — Array of book objects (initialized from sampleBooks).
- detailsBook — Book currently shown in the details modal, or null.
- addModalOpen — Boolean for add-book modal visibility.
- searchQuery — Search input value.

*Behavior:*

- *Filtering:* filteredBooks = books where title, author, or genre (case-insensitive) contains searchQuery.
- *Remove:* removeBook(id) removes the book with that id from books.
- *Add:* addBook(bookData) appends a new book (id from Date.now()) and closes the add modal.

*Renders:* Navbar, main catalog section (list of BookCard or empty states), BookDetailsModal, BookFormModal.

---

### 2. Navbar (components/Navbar.jsx)

*Props:*

| Prop            | Type     | Description                          |
|-----------------|----------|--------------------------------------|
| searchQuery   | string   | Current search value                 |
| onSearchChange| function | Called with new value on input change|
| onAddBook     | function | Called when “Add book” is clicked    |

*Features:*

- Logo and “Book Catalog” title.
- Search input (placeholder: “Search by title, author, or genre…”).
- “Add book” button.
- Admin profile dropdown (avatar “A”, “Admin”) with click-outside close; menu items (Profile, Settings, Log out) are presentational (e.g. href="#").

*Accessibility:* role="banner", aria-label on search and buttons, aria-expanded / aria-haspopup on profile, role="menu" / role="menuitem" on dropdown.

---

### 3. BookCard (components/BookCard.jsx)

*Props:*

| Prop      | Type     | Description                              |
|-----------|----------|------------------------------------------|
| book    | object   | Book data (id, title, author, year, genre, coverUrl) |
| onView  | function | Called with book when “View details” is clicked     |
| onRemove| function | Called when “Delete” is clicked (no argument)        |

*Features:*

- Cover: shows book.coverUrl image, or first letter of title if no URL or image fails (onError → fallback).
- Title, author, optional year and genre.
- “View details” and “Delete” buttons.

*Accessibility:* data-book-id, aria-label on buttons, semantic <article>.

---

### 4. BookFormModal (components/BookFormModal.jsx)

*Props:*

| Prop     | Type     | Description                    |
|----------|----------|--------------------------------|
| open   | boolean  | Whether the modal is visible   |
| onClose| function | Close modal (e.g. Cancel / backdrop) |
| onSave | function | Called with new book data (no id)   |

*Form fields:* Title (required), Author (required), Year (number, optional), Genre (optional), Cover image URL (optional). On submit, values are trimmed; year is parsed as integer; empty optional fields are sent as null.

*Behavior:* Submit calls onSave(bookData) and resets form + closes. Cancel or clicking backdrop calls onClose and resets form. When open is false, returns null.

*Accessibility:* role="dialog", aria-modal="true", aria-labelledby="modal-title", labeled inputs.

---

### 5. BookDetailsModal (components/BookDetailsModal.jsx)

*Props:*

| Prop   | Type    | Description                 |
|--------|---------|-----------------------------|
| book | object  | Book to show, or null       |
| open | boolean | Whether the modal is visible|
| onClose| function | Close modal                |

*Behavior:* If !open || !book, returns null. Otherwise shows title “Book details”, optional cover image, and a definition list (Title, Author, Year if present, Genre if present). Single “Close” button.

*Accessibility:* role="dialog", aria-modal="true", aria-labelledby="details-title".

---

## Styling

### Global (index.css)

- Box-sizing reset for all elements.
- *CSS variables* (e.g. in :root):
  - Colors: --color-bg, --color-surface, --color-navbar-bg, --color-border, --color-text, --color-text-muted, --color-accent, --color-accent-hover, --color-secondary.
  - --shadow, --radius, --navbar-height.
- Body: DM Sans, background and text color from variables, min-height 100vh.

### App (App.css)

- .app-layout: flex column, min-height 100vh.
- .main: max-width 72rem, centered, padding.
- .btn / .btn-primary / .btn-secondary / .btn-danger: shared button styles and variants.
- .catalog: CSS Grid, repeat(auto-fill, minmax(200px, 1fr)), gap 1.5rem.
- .catalog-empty: centered muted text for empty/search-no-results.

Component-specific styles live in Navbar.css, BookCard.css, BookFormModal.css, and BookDetailsModal.css next to each component.

---

## Scripts

From the repository root:

| Command       | Description              |
|---------------|--------------------------|
| npm run dev | Start Vite dev server    |
| npm run build | Production build (output in dist/) |
| npm run preview | Serve the production build locally |

---

## Vite Configuration

vite.config.js only enables the React plugin; no custom base path or proxy. To talk to a backend later, you can add a server.proxy in this file.

---

## Adding a Backend

Right now all data is in-memory. To connect a backend:

1. Replace useState(sampleBooks) with data from an API (e.g. useEffect + fetch or a data-fetching library).
2. Implement addBook and removeBook to call your API and then update local state (or refetch).
3. Optionally add loading and error state in App.jsx and surface them in the UI.
4. If the API runs on another origin/port, configure server.proxy in vite.config.js or use full URLs with CORS enabled on the server.

---

## Summary

- *Stack:* React 18 + Vite 5, no router, no global state library.
- *Screens:* Single page: navbar + book grid + two modals (details, add).
- *State:* All in App.jsx; search filters the same books array; add/delete update that array.
- *Styling:* Global variables in index.css, layout and buttons in App.css, components in their own .css files.
- *Data:* Book shape and sampleBooks are defined in src/data/books.js; new books get an id in App.addBook.

For run/build instructions and exact dependency versions, see package.json and the *Scripts* section above.
