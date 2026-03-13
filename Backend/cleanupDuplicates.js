/**
 * Cleanup script: remove duplicate books by title, keeping one copy.
 * Run from Backend folder: node cleanupDuplicates.js
 */

require("dotenv").config();
const dataBaseManager = require("./DatabaseManager");

// Titles the user reported as duplicated
const DUP_TITLES = [
  "Harry Potter and the Half-Blood Prince",
  "The Lord of the Rings",
  "The Catcher in the Rye",
  "1984",
  "The Hobbit",
  "The Great Gatsby",
  "Pride and Prejudice",
  "To Kill a Mockingbird",
];

async function cleanup() {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in .env");
    process.exit(1);
  }

  try {
    await dataBaseManager.connect(process.env.MONGO_URI);
    console.log("Connected. Cleaning duplicates...");

    for (const title of DUP_TITLES) {
      const docs = await dataBaseManager.BookModel
        .find({ title })
        .sort({ _id: 1 })
        .exec();

      if (docs.length <= 1) {
        console.log(`Title "${title}": nothing to clean (${docs.length} record).`);
        continue;
      }

      const [keep, ...rest] = docs;
      const idsToDelete = rest.map((d) => d._id);
      await dataBaseManager.BookModel.deleteMany({ _id: { $in: idsToDelete } });
      console.log(
        `Title "${title}": kept ${keep._id.toString()}, deleted ${idsToDelete.length} duplicates.`
      );
    }
  } catch (err) {
    console.error("Cleanup failed:", err.message);
    process.exit(1);
  } finally {
    await dataBaseManager.disconnect();
  }
}

cleanup();

