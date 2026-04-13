/**
 * Sets `genre` on books that are missing it (or empty), using the same rules as seed.js.
 * Run: node backfill-genres.js
 * Requires .env with MONGO_URI.
 */

require("dotenv").config();
const dataBaseManager = require("./DatabaseManager");
const { inferGenreForExistingBook } = require("./seedGenres");

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in .env");
    process.exit(1);
  }

  await dataBaseManager.connect(process.env.MONGO_URI);
  const books = await dataBaseManager.getAllBooks();
  let updated = 0;

  for (const book of books) {
    const doc = book.toObject ? book.toObject() : book;
    const id = doc._id;
    const current = (doc.genre || "").trim();
    if (current) continue;

    const genre = inferGenreForExistingBook({ title: doc.title });
    // eslint-disable-next-line no-await-in-loop
    await dataBaseManager.updateBook(String(id), { genre });
    console.log("  Updated genre:", doc.title, "→", genre);
    updated++;
  }

  console.log(`Done. Updated ${updated} book(s).`);
  await dataBaseManager.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
