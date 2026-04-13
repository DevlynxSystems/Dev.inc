/**
 * Curated title → genre labels (shared by seed.js and backfill-genres.js).
 * Generated catalog entries use GENRE_ROTATION by volume index.
 */

const GENRE_ROTATION = [
  "Fiction",
  "Literary",
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Thriller",
  "Historical",
  "Romance",
  "Horror",
  "Dystopian",
  "Adventure",
  "Memoir",
];

/** @type {Record<string, string>} */
const KNOWN_TITLE_GENRES = {
  "The Great Gatsby": "Fiction",
  "To Kill a Mockingbird": "Fiction",
  "1984": "Dystopian",
  "Pride and Prejudice": "Romance",
  "The Catcher in the Rye": "Fiction",
  "Harry Potter and the Half-Blood Prince": "Fantasy",
  "The Hobbit": "Fantasy",
  "The Lord of the Rings": "Fantasy",
  "Brave New World": "Dystopian",
  "Moby-Dick": "Adventure",
  "The Odyssey": "Classic",
  "Crime and Punishment": "Literary",
  "The Brothers Karamazov": "Literary",
  "The Alchemist": "Fiction",
  "The Picture of Dorian Gray": "Gothic",
  "Fahrenheit 451": "Sci-Fi",
  "The Kite Runner": "Fiction",
  "The Da Vinci Code": "Thriller",
  "The Girl with the Dragon Tattoo": "Mystery",
  "Life of Pi": "Fiction",
  "The Road": "Fiction",
  "The Name of the Wind": "Fantasy",
  "Mistborn: The Final Empire": "Fantasy",
  Dune: "Sci-Fi",
  "The Handmaid's Tale": "Dystopian",
  "Slaughterhouse-Five": "Fiction",
  "The Bell Jar": "Fiction",
  "The Book Thief": "Historical Fiction",
  "The Little Prince": "Fiction",
  "A Tale of Two Cities": "Historical Fiction",
  "Wuthering Heights": "Gothic",
  "Jane Eyre": "Romance",
  Frankenstein: "Horror",
  Dracula: "Horror",
  "The Count of Monte Cristo": "Adventure",
  "Don Quixote": "Classic",
  "Anna Karenina": "Literary",
  "War and Peace": "Literary",
  "The Sun Also Rises": "Literary",
  "For Whom the Bell Tolls": "Literary",
  "One Hundred Years of Solitude": "Magical Realism",
  "Love in the Time of Cholera": "Magical Realism",
  "The Old Man and the Sea": "Literary",
  "The Color Purple": "Fiction",
  Beloved: "Fiction",
  "Invisible Man": "Fiction",
  "Catch-22": "Fiction",
  "The Grapes of Wrath": "Fiction",
  "East of Eden": "Fiction",
  "The Trial": "Literary",
  "The Stranger": "Literary",
  "The Metamorphosis": "Literary",
  "A Clockwork Orange": "Dystopian",
  Neuromancer: "Sci-Fi",
  Foundation: "Sci-Fi",
  "The Left Hand of Darkness": "Sci-Fi",
  "Project Hail Mary": "Sci-Fi",
  Circe: "Fantasy",
  Educated: "Memoir",
  Sapiens: "Nonfiction",
  "Thinking, Fast and Slow": "Nonfiction",
  "The Midnight Library": "Fiction",
  "Where the Crawdads Sing": "Fiction",
  "The Seven Husbands of Evelyn Hugo": "Historical Fiction",
  "The Song of Achilles": "Historical Fiction",
  "Klara and the Sun": "Sci-Fi",
  "The Thursday Murder Club": "Mystery",
  "Tomorrow, and Tomorrow, and Tomorrow": "Fiction",

  "The Hitchhiker's Guide to the Galaxy": "Sci-Fi",
  "Ready Player One": "Sci-Fi",
  "The Martian": "Sci-Fi",
  "Leviathan Wakes": "Sci-Fi",
  "Red Rising": "Sci-Fi",
  "The Poppy War": "Fantasy",
  "The Night Circus": "Fantasy",
  "Gone Girl": "Thriller",
  "The Silent Patient": "Thriller",
  "Big Little Lies": "Fiction",
  "All the Light We Cannot See": "Historical Fiction",
  "The Nightingale": "Historical Fiction",
  "The Immortal Life of Henrietta Lacks": "Nonfiction",
  Becoming: "Memoir",
  "Atomic Habits": "Nonfiction",
  "The House in the Cerulean Sea": "Fantasy",
  "Mexican Gothic": "Horror",
  "The Vanishing Half": "Fiction",
  "Normal People": "Romance",
  "The Guest List": "Mystery",
};

function genreForGeneratedIndex(i) {
  return GENRE_ROTATION[i % GENRE_ROTATION.length];
}

/**
 * Infer genre for backfill when `genre` is missing (matches seed rules).
 * @param {{ title?: string }} book
 */
function inferGenreForExistingBook(book) {
  const title = book.title || "";
  if (KNOWN_TITLE_GENRES[title]) return KNOWN_TITLE_GENRES[title];
  const vol = title.match(/Vol\.\s*(\d+)\s*$/i);
  if (vol) {
    const idx = parseInt(vol[1], 10) || 0;
    return genreForGeneratedIndex(idx - 1);
  }
  return "Fiction";
}

module.exports = {
  GENRE_ROTATION,
  KNOWN_TITLE_GENRES,
  genreForGeneratedIndex,
  inferGenreForExistingBook,
};
