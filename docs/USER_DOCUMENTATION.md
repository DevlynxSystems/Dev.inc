# User Documentation — Dev.inc Book Catalog

This guide is for end users of the app (guests, signed-in users, and admins). It explains what each screen does and how to complete common actions.

---

## 1) What this app does

Dev.inc is a book catalog where you can:

- Browse and search books
- Open detailed book previews
- Save books to a wishlist
- Track reading progress (signed-in users)
- Manage books and users (admins only)

---

## 2) Roles and access

### Guest (not logged in)

- Can open:
  - `Home` (`/`)
  - `Catalog` (`/catalog`)
  - `Login` (`/login`)
  - `Signup` (`/signup`)
- Cannot open:
  - `Dashboard` (`/dashboard`)
  - `Profile` (`/profile`)
  - Any admin pages (`/admin/*`)

### Signed-in user

- Can open:
  - `Dashboard` (`/dashboard`)
  - `Profile setup` (`/profile`)
  - `Catalog` (`/catalog`)
- Cannot open admin pages (`/admin/*`)

### Admin

- Can open:
  - `Admin Dashboard` (`/admin`)
  - `Manage Users` (`/admin/users`)
  - `Manage Books` (`/admin/books`)
  - User pages as available from navigation

---

## 3) Navigation basics

- The top navigation changes based on your role.
- When logged in, click the avatar menu in the top-right to:
  - Open `Profile setup`
  - `Log out`
- On the Catalog page, a search bar appears below the navbar for quick searching.

---

## 4) Account actions

## Sign up

1. Go to `Signup`.
2. Enter name, email, and password.
3. Submit the form.
4. You are signed in and redirected to your dashboard.

## Log in

1. Go to `Login`.
2. Enter email and password.
3. Submit the form.
4. Redirect rules:
   - Admin -> `/admin`
   - User -> `/dashboard`

## Log out

- Click `Logout` in the top navigation or avatar menu.
- You are returned to the home page.

---

## 5) Home page (`/`)

The home page introduces the product and shows featured books.

- `Browse Books` takes you to the catalog.
- If not logged in, `Create Account` is shown.
- If logged in:
  - users see `Dashboard`
  - admins see `Admin Dashboard`

If catalog data is unavailable, the page falls back to sample books so the UI still shows content.

---

## 6) Catalog (`/catalog`)

The catalog is available to everyone.

### What you can do

- Search by title, author, or genre
- Filter by date presets
- Sort by different ordering options
- Open book details
- Add a book to wishlist

### Book details modal

From any book card, choose `View details` to open:

- Title and author
- Genre, publish date, and page count (if available)
- A short description preview
- Quick actions:
  - `View Details`
  - `Add to wishlist`
  - `Edit` / `Delete` (admin only)

### Admin-only actions in catalog

If you are an admin, catalog also includes:

- `Add book`
- `Edit` existing books
- `Delete` books

---

## 7) User dashboard (`/dashboard`)

The user dashboard is your personalized reading hub.

### Main sections

- **Stats cards** (books read, currently reading, wishlist size, streak)
- **Continue Reading**
- **Recommended for You**
- **Recently Viewed**
- **Wishlist**

### Progress tracking

- Clicking `Continue` increases progress for a book.
- Progress can also be changed from dashboard cards.
- Your recent reads and progress are used to shape recommendations.

### Quick links

- `Browse Books` -> catalog
- `Update Profile` -> profile setup

---

## 8) Profile setup (`/profile`)

Profile setup is a 3-step flow:

1. **Basic info**: name, phone (email is shown but not editable there)
2. **Address**: line 1, line 2, city, state, postal code, country
3. **Security**: optional password update and confirmation

### Validation highlights

- Name cannot be empty
- Phone must be valid length when provided
- Password update requires:
  - minimum 6 characters
  - matching confirmation

On success, changes are saved and you are redirected to `/dashboard`.

---

## 9) Admin portal overview (admins only)

## Admin Dashboard (`/admin`)

- Summary cards (users/admins/books/reviews)
- Users vs books monthly chart
- Recently joined users
- Recently added books
- Quick links to users and books management
- Activity feed with CSV export

## Manage Users (`/admin/users`)

- Search, filter, sort, and paginate users
- View user details
- Edit user name/phone
- Change role (user/admin)
- Delete users
- Bulk actions (promote/deactivate/export/delete)

## Manage Books (`/admin/books`)

- Search/filter/sort books
- Add/edit/delete books
- Bulk export/delete
- CSV import for batch creation

---

## 10) Data kept in your browser

Some user-centric features are stored locally in your browser:

- `devinc_recent_books`
- `devinc_wishlist_books`
- `devinc_reading_progress`

Admin UI also keeps local event logs for activity display/export:

- `devinc_admin_audit_events`

Because these are local browser values, they may differ across devices/browsers unless the backend feature is implemented for that data.

---

## 11) Common issues and fixes

## I cannot access dashboard/admin page

- Make sure you are logged in.
- Make sure your role is correct (`admin` required for `/admin/*`).

## No books are showing

- Check backend/API availability.
- Reload the page.
- Home page may show fallback sample books when API is unavailable.

## Changes are not visible after update

- Hard refresh your browser.
- If using multiple devices, note that local browser features (wishlist/progress/recent) are device-specific.

---

## 12) Quick glossary

- **Catalog**: browsable list of books
- **Wishlist**: books saved for later
- **Reading progress**: per-book completion percentage
- **Dashboard**: personalized user home
- **Admin portal**: management area for users/books

