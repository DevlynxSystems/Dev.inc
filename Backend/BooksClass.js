class Book{
    _Title;
    _Date;
    _Author;
    _Cover;
    _PageCount

    constructor(Title, date, Author, Cover, PageCount){
        this._Title = Title;
        this._Date = date;
        this._Author = Author;
        this._Cover = Cover;
        this._PageCount = PageCount;
    }

    insertIntoDatabase(database){
        const data = new manager.BookModel({
            title: this._Title,
            author: this._Author,
            cover: this._Cover,
            pageCount: this._PageCount,
            date: this._Date
        });
        
    }

    get Title() {
        return this._Title;
    }

    set Title(value) {
        if (typeof value !== "string") {
            throw new TypeError("name must be a string");
        }
        this._Title = value;
    }

    get Date() {
        return this._Date;
    }

    set date(value) {
        if (typeof value !== "string") {
            throw new TypeError("name must be a string");
        }
        this._Date = value;
    }

    get Author() {
        return this._Author;
    }

    set Author(value) {
        if (typeof value !== "string") {
            throw new TypeError("name must be a string");
        }
        this._Author = value;
    }

    get Cover() {
        return this._Cover;
    }

    set Cover(value) {
        if (value.isBuffer()) {
            throw new TypeError("name must be a image");
        }
        this._Cover = value;
    }

    get PageCount() {
        return this._PageCount;
    }

    set PageCount(value) {
        if (typeof value !== "string") {
            throw new TypeError("name must be a string");
        }
        this._PageCount = value;
    }

    

}
module.exports = Book;