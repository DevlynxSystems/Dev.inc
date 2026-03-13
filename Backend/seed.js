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

  // Additional books
  { title: "Brave New World", author: "Aldous Huxley", date: "1932-01-01", pageCount: 288, cover: coverUrl("0060850523") },
  { title: "Moby-Dick", author: "Herman Melville", date: "1851-10-18", pageCount: 720, cover: coverUrl("0142437247") },
  { title: "The Odyssey", author: "Homer", date: "0800-01-01", pageCount: 560, cover: coverUrl("0140268863") },
  { title: "Crime and Punishment", author: "Fyodor Dostoevsky", date: "1866-01-01", pageCount: 671, cover: coverUrl("0140449132") },
  { title: "The Brothers Karamazov", author: "Fyodor Dostoevsky", date: "1880-01-01", pageCount: 824, cover: coverUrl("0374528373") },
  { title: "The Alchemist", author: "Paulo Coelho", date: "1988-01-01", pageCount: 208, cover: coverUrl("0061122416") },
  { title: "The Picture of Dorian Gray", author: "Oscar Wilde", date: "1890-07-01", pageCount: 272, cover: coverUrl("0141439572") },
  { title: "Fahrenheit 451", author: "Ray Bradbury", date: "1953-10-19", pageCount: 256, cover: coverUrl("1451673310") },
  { title: "The Kite Runner", author: "Khaled Hosseini", date: "2003-05-29", pageCount: 372, cover: coverUrl("159463193X") },
  { title: "The Da Vinci Code", author: "Dan Brown", date: "2003-03-18", pageCount: 454, cover: coverUrl("0307474275") },
  { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", date: "2005-08-01", pageCount: 600, cover: coverUrl("0307454541") },
  { title: "Life of Pi", author: "Yann Martel", date: "2001-09-11", pageCount: 352, cover: coverUrl("0156027321") },
  { title: "The Road", author: "Cormac McCarthy", date: "2006-09-26", pageCount: 287, cover: coverUrl("0307387895") },
  { title: "The Name of the Wind", author: "Patrick Rothfuss", date: "2007-03-27", pageCount: 662, cover: coverUrl("0756404746") },
  { title: "Mistborn: The Final Empire", author: "Brandon Sanderson", date: "2006-07-17", pageCount: 672, cover: coverUrl("0765350386") },
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
