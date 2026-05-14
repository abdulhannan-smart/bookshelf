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
exports.listLists = listLists;
exports.findList = findList;
exports.addList = addList;
exports.removeList = removeList;
exports.updateBookMembership = updateBookMembership;
const repo = __importStar(require("../data/listsRepository"));
const booksRepo = __importStar(require("../data/booksRepository"));
function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
async function listLists() {
    return repo.getAllLists();
}
async function findList(id) {
    const list = await repo.getListById(id);
    if (!list) {
        throw createHttpError(`List with id '${id}' not found`, 404);
    }
    const books = await booksRepo.getAllBooks();
    const bookMap = new Map(books.map((b) => [b.id, b]));
    const hydrated = list.bookIds
        .map((bookId) => bookMap.get(bookId))
        .filter((b) => b !== undefined);
    const { bookIds: _bookIds, ...rest } = list;
    return { ...rest, books: hydrated };
}
async function addList(input) {
    const { name, description } = input;
    if (!name?.trim()) {
        throw createHttpError("'name' is required", 400);
    }
    if (typeof description !== "string") {
        throw createHttpError("'description' is required", 400);
    }
    return repo.createList({ name, description });
}
async function removeList(id) {
    const deleted = await repo.deleteList(id);
    if (!deleted) {
        throw createHttpError(`List with id '${id}' not found`, 404);
    }
}
async function updateBookMembership(id, bookId, action) {
    const list = await repo.getListById(id);
    if (!list) {
        throw createHttpError(`List with id '${id}' not found`, 404);
    }
    if (!bookId || typeof bookId !== "string" || !bookId.trim()) {
        throw createHttpError("'bookId' is required", 400);
    }
    if (action !== "add" && action !== "remove") {
        throw createHttpError("'action' must be 'add' or 'remove'", 400);
    }
    if (action === "add") {
        const book = await booksRepo.getBookById(bookId);
        if (!book) {
            throw createHttpError(`Book with id '${bookId}' not found`, 404);
        }
        const updated = await repo.addBookToList(id, bookId);
        return updated;
    }
    const updated = await repo.removeBookFromList(id, bookId);
    return updated;
}
//# sourceMappingURL=listsService.js.map