// This test suite will test every method in the BooksClass class. 
// Altogether, we have the insertIntoDatabase, get/set for title, date, author, page count, and cover. 
// https://jestjs.io/docs/asynchronous
// To run tests, navigate to backend and run npm install --save-dev jest
// Then, run "npm test"

const Book = require('../BooksClass.js');

describe ("Book Class Tests", () => {

    let book;

    beforeEach(() => {
        book = new Book("Title1", "2020", "Author1", "cover.png", 100);
    });

     test("constructor sets values correctly", () => {
        expect(book.Title).toBe("Title1");
        expect(book.Date).toBe("2020");
        expect(book.Author).toBe("Author1");
        expect(book.Cover).toBe("cover.png");
        expect(book.PageCount).toBe(100);
        expect(book.Genre).toBe("");
    });

    test("constructor accepts optional genre", () => {
        const b = new Book("T", "2020", "A", "c.png", 50, "Fiction");
        expect(b.Genre).toBe("Fiction");
    });


    // Expected to be successful tests below.
    test("get Title", () => {
        expect(book.Title).toBe("Title1");
    });

    test("get Author", () => {
        expect(book.Author).toBe("Author1");
    });

    test("set Title works", () => {
        book.Title = "New Title";
        expect(book.Title).toBe("New Title");
    });

    test("set Author works", () => {
        book.Author = "New Author";
        expect(book.Author).toBe("New Author");
    });

    test("get Date", () => {
        expect(book.Date).toBe("2020");
    });

    test("set Date works", () => {
        book.Date = "2025";           
        expect(book.Date).toBe("2025");
    });

    test("get Cover", () => {
    expect(book.Cover).toBe("cover.png");
    });

    test("get PageCount", () => {
    expect(book.PageCount).toBe(100);
    });


    test("set Title throws error if not string", () => {
        expect(() => {
            book.Title = 123;
        }).toThrow(TypeError);
    });

    test("set Author throws error if not string", () => {
        expect(() => {
            book.Author = 123;
        }).toThrow(TypeError);
    });

    test("set Date throws error if not string", () => {
    expect(() => {
        book.Date = 123;
    }).toThrow(TypeError);
    });


    // Database test using mock functions 

    test("insertIntoDatabase saves book", async () => {

        const mockSave = jest.fn().mockResolvedValue({
            title: "Title1"
        });

        const mockDatabase = {
            BookModel: jest.fn().mockImplementation(() => ({
                save: mockSave
            }))
        };

        const result = await book.insertIntoDatabase(mockDatabase);

        expect(mockDatabase.BookModel).toHaveBeenCalledWith(
            expect.objectContaining({ genre: "" })
        );
        expect(mockSave).toHaveBeenCalled();
        expect(result).toEqual({ title: "Title1" });
    });


    test("set PageCount works", () => {
        book.PageCount = "250";
        expect(book.PageCount).toBe("250");
    });



});