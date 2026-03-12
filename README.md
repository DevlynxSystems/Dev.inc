# Dev.inc — Book Catalog

A full-stack book catalog app: browse, search, add, and delete books with a React frontend and a Node.js + MongoDB backend.

## Tech stack

| Layer   | Stack |
|--------|--------|
| **Frontend** | React 18, Vite |
| **Backend**  | Node.js, Express 5 |
| **Database** | MongoDB (Mongoose) |

## Project structure

```
Dev.inc/
├── Frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/ # BookCard, BookDetailsModal, BookFormModal, Navbar
│   │   ├── data/      # Sample data
│   │   └── App.jsx
│   └── package.json
├── Backend/            # Express API
│   ├── server.js      # REST API routes
│   ├── DatabaseManager.js
│   ├── BooksClass.js
│   └── package.json
└── README.md
```

## Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

## Setup

### 1. Backend

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 2. Frontend

```bash
cd Frontend
npm install
```

The frontend is configured to call the API at `http://localhost:5000`. Change this in `Frontend/src/App.jsx` if your backend runs elsewhere.

## Running the app

**Terminal 1 — Backend**

```bash
cd Backend
npm start
```

Server runs at [http://localhost:5000](http://localhost:5000).

**Terminal 2 — Frontend**

```bash
cd Frontend
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173) (or the port Vite prints).

## API

| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| GET    | `/api/books`       | List all books     |
| POST   | `/api/books`       | Add a book         |
| DELETE | `/api/books/:id`   | Delete a book by ID |

## License

MIT
