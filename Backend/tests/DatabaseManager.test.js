//test cases for databaseManager.js
// To run tests, navigate to backend and run npm install --save-dev jest
// Then, run "npm test"
console.log("loaded");
const db = require("../DatabaseManager");

// mock book class so no real DB is used
jest.mock("../BooksClass", () => {
    return jest.fn().mockImplementation(() => {
        return {
            insertIntoDatabase: jest.fn().mockResolvedValue({
                title: "Test",
                author: "Author",
                pageCount: 100
            })
        };
    });
});

describe("DatabaseManager", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("addBook trims input", async () => {
        const result = await db.addBook({
            title: "  Test  ",
            author: "  Author  ",
            pageCount: "100"
        });

        expect(result.title).toBe("Test");
        expect(result.author).toBe("Author");
    });

    test("updateBook calls database", async () => {
        db.BookModel.findByIdAndUpdate = jest.fn().mockResolvedValue({ title: "Updated" });

        const result = await db.updateBook("1", { title: "Updated" });

        expect(result.title).toBe("Updated");
    });

    test("deleteBook removes a book", async () => {
        db.BookModel.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: "1" });

        const result = await db.deleteBook("1");

        expect(result._id).toBe("1");
    });

    test("getAllBooks returns data", async () => {
        db.BookModel.find = jest.fn().mockResolvedValue([{ title: "A" }]);

        const result = await db.getAllBooks();

        expect(result.length).toBe(1);
    });

    test("getBookById returns null if no id", async () => {
        const result = await db.getBookById(null);

        expect(result).toBeNull();
    });

});