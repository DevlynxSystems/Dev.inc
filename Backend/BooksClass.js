class Book{
    Title;
    Date;
    Author;
    Cover;
    PageCount

    constructor(Title, date, Author, Cover, PageCount){
        this.Title = Title
        this.date = date
        this.Author = Author
        this.Cover = Cover;
        this.PageCount = PageCount;
    }

    get Title() {
        return this._Title;
    }

    set Title(value) {
        if (typeof name !== "string") {
            throw new TypeError("name must be a string");
        }
        this._Title = value;
    }

    get date() {
        return this._date;
    }

    set date(value) {
        if (typeof date !== "string") {
            throw new TypeError("name must be a string");
        }
        this._date = value;
    }

    get Author() {
        return this._Author;
    }

    set Author(value) {
        if (typeof Author !== "string") {
            throw new TypeError("name must be a string");
        }
        this._Author = value;
    }

    get Cover() {
        return this._Cover;
    }

    set Cover(value) {
        if (value.isBuffer()) {
            throw new TypeError("name must be a string");
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