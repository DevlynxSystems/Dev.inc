
//filterbooks.js can filter books by genre, author, or title. all are case sensitive since text based
//we check by receiving the filters, and if the filter is filters.genre and it matches, then we can return the result,
//and if not, we dont return the result.
//comment out code below for red.

/*

function filterBooks(books, filters = {}) {
  return books.filter(book => {
    if (filters.genre && book.genre.toLowerCase() !== filters.genre.toLowerCase()) {
      return false;
    }
    if (filters.author && book.author.toLowerCase() !== filters.author.toLowerCase()) {
      return false;
    }
    if (filters.title && !book.title.toLowerCase().includes(filters.title.toLowerCase())) {
      return false;
    }
    return true;
  });
}
 
module.exports = { filterBooks };

*/
