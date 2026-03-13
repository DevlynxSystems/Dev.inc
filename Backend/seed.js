/**
 * Seed script: adds sample books with covers to the database.
 * Run from Backend folder: node seed.js
 * Requires .env with MONGO_URI.
 */

require("dotenv").config();
const dataBaseManager = require("./DatabaseManager");

// Book cover URLs: Open Library (real covers). Seed value used for consistent placeholder if needed.
function coverUrl(isbnOrSeed) {
  return `https://covers.openlibrary.org/b/isbn/${isbnOrSeed}-M.jpg`;
}

const SEED_BOOKS = [
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", date: "1925-04-10", pageCount: 180, cover: coverUrl("9780743273565") },
  { title: "To Kill a Mockingbird", author: "Harper Lee", date: "1960-07-11", pageCount: 336, cover: coverUrl("0061120081") },
  { title: "1984", author: "George Orwell", date: "1949-06-08", pageCount: 328, cover: coverUrl("0451524934") },
  { title: "Pride and Prejudice", author: "Jane Austen", date: "1813-01-28", pageCount: 432, cover: coverUrl("0141439513") },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", date: "1951-07-16", pageCount: 277, cover: coverUrl("0316769487") },
  { title: "Harry Potter and the Half-Blood Prince", author: "J.K. Rowling", date: "2005-07-16", pageCount: 652, cover: coverUrl("0439784549") },
  { title: "The Hobbit", author: "J.R.R. Tolkien", date: "1937-09-21", pageCount: 366, cover: coverUrl("054792822X") },
  { title: "The Lord of the Rings", author: "J.R.R. Tolkien", date: "1954-07-29", pageCount: 1178, cover: coverUrl("0544003411") },
];

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in .env");
    process.exit(1);
  }

  try {
    await dataBaseManager.connect(process.env.MONGO_URI);
    console.log("Seeding books...");

    let added = 0;
    for (const book of SEED_BOOKS) {
      try {
        await dataBaseManager.addBook(book);
        console.log("  Added:", book.title);
        added++;
      } catch (e) {
        console.warn("  Skip:", book.title, "-", e.message);
      }
    }

    console.log(`Done. ${added}/${SEED_BOOKS.length} books added.`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await dataBaseManager.disconnect();
  }
}

seed();
