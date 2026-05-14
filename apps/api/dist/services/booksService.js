"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBooks = listBooks;
exports.findBook = findBook;
exports.searchBooks = searchBooks;
exports.addBook = addBook;
const repo = __importStar(require("../data/booksRepository"));
const CURRENT_YEAR = new Date().getFullYear();
async function listBooks() {
    return repo.getAllBooks();
}
async function findBook(id) {
    const book = await repo.getBookById(id);
    if (!book) {
        const err = new Error(`Book with id '${id}' not found`);
        err.statusCode = 404;
        throw err;
    }
    return book;
}
async function searchBooks(query) {
    if (!query || !query.trim()) {
        const err = new Error("Query parameter 'q' is required");
        err.statusCode = 400;
        throw err;
    }
    return repo.searchBooks(query);
}
async function addBook(input) {
    const { title, author, genre, year, isbn } = input;
    if (!title?.trim()) {
        const err = new Error("'title' is required");
        err.statusCode = 400;
        throw err;
    }
    if (title.trim().length > 200) {
        const err = new Error("'title' must be 200 characters or fewer");
        err.statusCode = 400;
        throw err;
    }
    if (!author?.trim()) {
        const err = new Error("'author' is required");
        err.statusCode = 400;
        throw err;
    }
    if (!genre?.trim()) {
        const err = new Error("'genre' is required");
        err.statusCode = 400;
        throw err;
    }
    if (!year || typeof year !== "number") {
        const err = new Error("'year' must be a number");
        err.statusCode = 400;
        throw err;
    }
    if (year < 1000 || year > CURRENT_YEAR) {
        const err = new Error(`'year' must be between 1000 and ${CURRENT_YEAR}`);
        err.statusCode = 400;
        throw err;
    }
    if (!isbn?.trim()) {
        const err = new Error("'isbn' is required");
        err.statusCode = 400;
        throw err;
    }
    return repo.createBook(input);
}
//# sourceMappingURL=booksService.js.map