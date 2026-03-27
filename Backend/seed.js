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

function buildGeneratedBooks(count = 80) {
  const titleParts = [
    "Chronicles",
    "Archive",
    "Atlas",
    "Letters",
    "Stories",
    "Memoirs",
    "Legends",
    "Voyages",
    "Poems",
    "Notebooks",
  ];
  const themes = [
    "Midnight",
    "Autumn",
    "Silver",
    "Golden",
    "Hidden",
    "Northern",
    "Silent",
    "Crimson",
    "Echoing",
    "Starlit",
  ];
  const authors = [
    "Elena Hart",
    "Rowan Pierce",
    "Mira Solis",
    "Theo Barnes",
    "Lena Asher",
    "Iris Quinn",
    "Noah Mercer",
    "Sami Patel",
    "Aria Monroe",
    "Jonah Hale",
  ];

  return Array.from({ length: count }, (_, i) => {
    const idx = i + 1;
    const part = titleParts[i % titleParts.length];
    const theme = themes[(i * 3) % themes.length];
    const author = authors[(i * 5) % authors.length];
    const year = 1990 + (i % 34);
    const month = String((i % 12) + 1).padStart(2, "0");
    const day = String((i % 28) + 1).padStart(2, "0");
    const pageCount = 180 + ((i * 17) % 520);
    const isbnSeed = String(9780300000000 + idx);
    return {
      title: `${theme} ${part} Vol. ${idx}`,
      author,
      date: `${year}-${month}-${day}`,
      pageCount,
      cover: coverUrl(isbnSeed),
    };
  });
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
  { title: "Dune", author: "Frank Herbert", date: "1965-08-01", pageCount: 412, cover: coverUrl("0441172717") },
  { title: "The Handmaid's Tale", author: "Margaret Atwood", date: "1985-09-01", pageCount: 311, cover: coverUrl("038549081X") },
  { title: "Slaughterhouse-Five", author: "Kurt Vonnegut", date: "1969-03-31", pageCount: 275, cover: coverUrl("0385333846") },
  { title: "The Bell Jar", author: "Sylvia Plath", date: "1963-01-14", pageCount: 288, cover: coverUrl("0061148512") },
  { title: "The Book Thief", author: "Markus Zusak", date: "2005-03-14", pageCount: 552, cover: coverUrl("0375842209") },
  { title: "The Little Prince", author: "Antoine de Saint-Exupery", date: "1943-04-06", pageCount: 96, cover: coverUrl("0156012197") },
  { title: "A Tale of Two Cities", author: "Charles Dickens", date: "1859-04-30", pageCount: 544, cover: coverUrl("0486406512") },
  { title: "Wuthering Heights", author: "Emily Bronte", date: "1847-12-01", pageCount: 416, cover: coverUrl("0141439556") },
  { title: "Jane Eyre", author: "Charlotte Bronte", date: "1847-10-16", pageCount: 532, cover: coverUrl("0142437204") },
  { title: "Frankenstein", author: "Mary Shelley", date: "1818-01-01", pageCount: 280, cover: coverUrl("0143131842") },
  { title: "Dracula", author: "Bram Stoker", date: "1897-05-26", pageCount: 418, cover: coverUrl("014143984X") },
  { title: "The Count of Monte Cristo", author: "Alexandre Dumas", date: "1844-08-28", pageCount: 1276, cover: coverUrl("0140449264") },
  { title: "Don Quixote", author: "Miguel de Cervantes", date: "1605-01-16", pageCount: 992, cover: coverUrl("0060934344") },
  { title: "Anna Karenina", author: "Leo Tolstoy", date: "1878-01-01", pageCount: 864, cover: coverUrl("0143035002") },
  { title: "War and Peace", author: "Leo Tolstoy", date: "1869-01-01", pageCount: 1392, cover: coverUrl("0199232768") },
  { title: "The Sun Also Rises", author: "Ernest Hemingway", date: "1926-10-22", pageCount: 251, cover: coverUrl("0743297334") },
  { title: "For Whom the Bell Tolls", author: "Ernest Hemingway", date: "1940-10-21", pageCount: 480, cover: coverUrl("0684803356") },
  { title: "One Hundred Years of Solitude", author: "Gabriel Garcia Marquez", date: "1967-06-05", pageCount: 417, cover: coverUrl("0060883286") },
  { title: "Love in the Time of Cholera", author: "Gabriel Garcia Marquez", date: "1985-09-05", pageCount: 368, cover: coverUrl("0307389731") },
  { title: "The Old Man and the Sea", author: "Ernest Hemingway", date: "1952-09-01", pageCount: 132, cover: coverUrl("0684801221") },
  { title: "The Color Purple", author: "Alice Walker", date: "1982-01-01", pageCount: 304, cover: coverUrl("0156028352") },
  { title: "Beloved", author: "Toni Morrison", date: "1987-09-16", pageCount: 352, cover: coverUrl("1400033411") },
  { title: "Invisible Man", author: "Ralph Ellison", date: "1952-04-14", pageCount: 592, cover: coverUrl("0679732764") },
  { title: "Catch-22", author: "Joseph Heller", date: "1961-11-10", pageCount: 544, cover: coverUrl("1451626657") },
  { title: "The Grapes of Wrath", author: "John Steinbeck", date: "1939-04-14", pageCount: 528, cover: coverUrl("0143039431") },
  { title: "East of Eden", author: "John Steinbeck", date: "1952-09-19", pageCount: 608, cover: coverUrl("0142004235") },
  { title: "The Trial", author: "Franz Kafka", date: "1925-04-26", pageCount: 256, cover: coverUrl("0805210407") },
  { title: "The Stranger", author: "Albert Camus", date: "1942-01-01", pageCount: 159, cover: coverUrl("0679720200") },
  { title: "The Metamorphosis", author: "Franz Kafka", date: "1915-10-01", pageCount: 201, cover: coverUrl("0553213695") },
  { title: "A Clockwork Orange", author: "Anthony Burgess", date: "1962-01-01", pageCount: 224, cover: coverUrl("0393312836") },
  ...buildGeneratedBooks(120),
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
