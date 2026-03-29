

// filterBooks.test.js
//to test, write npx jest filterBooks.test.js
// TDD - Tests written BEFORE implementation (Red phase)

const { filterBooks } = require('../filterBooks');

//Sample Data
const books = [
  { id: 1, title: "The Great Gatsby",     author: "F. Scott Fitzgerald", genre: "Classic" },
  { id: 2, title: "To Kill a Mockingbird",author: "Harper Lee",          genre: "Classic" },
  { id: 3, title: "Dune",                 author: "Frank Herbert",       genre: "Sci-Fi"  },
  { id: 4, title: "Neuromancer",          author: "William Gibson",       genre: "Sci-Fi"  },
  { id: 5, title: "Harry Potter",         author: "J.K. Rowling",         genre: "Fantasy" },
];
//Filter by Genre

describe('filterBooks - by genre', () => {

  test('returns only books matching the given genre', () => {
    const result = filterBooks(books, { genre: 'Sci-Fi' });
    expect(result).toHaveLength(2);
    expect(result.every(b => b.genre === 'Sci-Fi')).toBe(true);
  });

  test('returns empty array when no books match genre', () => {
    const result = filterBooks(books, { genre: 'Horror' });
    expect(result).toEqual([]);
  });

  test('genre filter is case-insensitive', () => {
    const result = filterBooks(books, { genre: 'sci-fi' });
    expect(result).toHaveLength(2);
  });

});

//Filter by Author

describe('filterBooks - by author', () => {

  test('returns books by a specific author', () => {
    const result = filterBooks(books, { author: 'Harper Lee' });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('To Kill a Mockingbird');
  });

  test('returns empty array when author not found', () => {
    const result = filterBooks(books, { author: 'Unknown Author' });
    expect(result).toEqual([]);
  });

  test('author filter is case-insensitive', () => {
    const result = filterBooks(books, { author: 'harper lee' });
    expect(result).toHaveLength(1);
  });

});

//Filter by Title / Keyword

describe('filterBooks - by title keyword', () => {

  test('returns books whose title contains the keyword', () => {
    const result = filterBooks(books, { title: 'the' });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some(b => b.title === 'The Great Gatsby')).toBe(true);
  });

  test('keyword search is case-insensitive', () => {
    const result = filterBooks(books, { title: 'DUNE' });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Dune');
  });

  test('returns empty array when keyword matches nothing', () => {
    const result = filterBooks(books, { title: 'nomatch' });
    expect(result).toEqual([]);
  });

});
// SUITE 4: Combined Filters

describe('filterBooks - combined filters', () => {

  test('filters by both genre and author together', () => {
    const result = filterBooks(books, { genre: 'Classic', author: 'Harper Lee' });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('To Kill a Mockingbird');
  });

  test('returns empty if genre matches but author does not', () => {
    const result = filterBooks(books, { genre: 'Sci-Fi', author: 'Harper Lee' });
    expect(result).toEqual([]);
  });

});