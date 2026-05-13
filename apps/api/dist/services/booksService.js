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
exports.deleteBook = deleteBook;
const repo = __importStar(require("../data/booksRepository"));
const CURRENT_YEAR = new Date().getFullYear();
function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
async function listBooks() {
    return repo.getAllBooks();
}
async function findBook(id) {
    const book = await repo.getBookById(id);
    if (!book) {
        throw createHttpError(`Book with id '${id}' not found`, 404);
    }
    return book;
}
async function searchBooks(query) {
    if (!query || !query.trim()) {
        throw createHttpError("Query parameter 'q' is required", 400);
    }
    return repo.searchBooks(query);
}
async function addBook(input) {
    const { title, author, genre, year, isbn } = input;
    if (!title?.trim()) {
        throw createHttpError("'title' is required", 400);
    }
    if (title.trim().length > 200) {
        throw createHttpError("'title' must be 200 characters or fewer", 400);
    }
    if (!author?.trim()) {
        throw createHttpError("'author' is required", 400);
    }
    if (!genre?.trim()) {
        throw createHttpError("'genre' is required", 400);
    }
    if (!year || typeof year !== "number") {
        throw createHttpError("'year' must be a number", 400);
    }
    if (year < 1000 || year > CURRENT_YEAR) {
        throw createHttpError(`'year' must be between 1000 and ${CURRENT_YEAR}`, 400);
    }
    if (!isbn?.trim()) {
        throw createHttpError("'isbn' is required", 400);
    }
    return repo.createBook(input);
}
async function deleteBook(id) {
    const deletedBook = await repo.deleteBook(id);
    if (!deletedBook) {
        throw createHttpError(`Book with id '${id}' not found`, 404);
    }
    return deletedBook;
}
//# sourceMappingURL=booksService.js.map