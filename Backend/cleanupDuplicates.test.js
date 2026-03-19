// This test suite will test every method in the cleanupDuplicates class. 
// Altogether, we have the cleanup, including database connection, duplicate detection, deletion logic, and error handling using mocked database objects. 

// To run tests, navigate to backend and run npm install --save-dev jest
// Then, run "npm test"

const cleanup = require('./cleanupDuplicates');

jest.mock('./DatabaseManager', () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    BookModel: {
        find: jest.fn(),
        deleteMany: jest.fn()
    }
}));

const dataBaseManager = require('./DatabaseManager');

describe("cleanupDuplicates Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.MONGO_URI = "mock_uri";
    });

    test("connects to database", async () => {

        dataBaseManager.BookModel.find.mockReturnValue({
            sort: () => ({
                exec: () => Promise.resolve([]) 
            })
        });

        await cleanup();

        expect(dataBaseManager.connect).toHaveBeenCalledWith("mock_uri");
        expect(dataBaseManager.disconnect).toHaveBeenCalled();
    });

    test("does nothing when no duplicates exist", async () => {

        dataBaseManager.BookModel.find.mockReturnValue({
            sort: () => ({
                exec: () => Promise.resolve([{ _id: 1 }]) 
            })
        });

        await cleanup();

        expect(dataBaseManager.BookModel.deleteMany).not.toHaveBeenCalled();
    });

    test("deletes duplicates when multiple exist", async () => {

        dataBaseManager.BookModel.find.mockReturnValue({
            sort: () => ({
                exec: () => Promise.resolve([
                    { _id: 1 },
                    { _id: 2 },
                    { _id: 3 }
                ])
            })
        });

        await cleanup();

        expect(dataBaseManager.BookModel.deleteMany).toHaveBeenCalled();
    });

    test("handles missing MONGO_URI", async () => {

        delete process.env.MONGO_URI;

        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await cleanup();

        expect(errorSpy).toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalledWith(1);

        exitSpy.mockRestore();
        errorSpy.mockRestore();
    });

});