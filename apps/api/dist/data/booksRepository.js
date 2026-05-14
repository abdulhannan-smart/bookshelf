"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBooks = getAllBooks;
exports.getBookById = getBookById;
exports.searchBooks = searchBooks;
exports.createBook = createBook;
const uuid_1 = require("uuid");
const jsonStore_1 = require("./jsonStore");
const FILE = "books.json";
async function getAllBooks() {
    return (0, jsonStore_1.readJson)(FILE);
}
async function getBookById(id) {
    const books = await getAllBooks();
    return books.find((b) => b.id === id);
}
async function searchBooks(query) {
    const books = await getAllBooks();
    const q = query.toLowerCase().trim();
    if (!q)
        return books;
    return books.filter((b) => b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q));
}
async function createBook(input) {
    const books = await getAllBooks();
    const newBook = {
        ...input,
        id: `book_${(0, uuid_1.v4)().replace(/-/g, "").slice(0, 8)}`,
        addedAt: new Date().toISOString(),
    };
    books.push(newBook);
    await (0, jsonStore_1.writeJson)(FILE, books);
    return newBook;
}
//# sourceMappingURL=booksRepository.js.map