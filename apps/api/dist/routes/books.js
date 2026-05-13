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
const express_1 = require("express");
const booksService = __importStar(require("../services/booksService"));
const router = (0, express_1.Router)();
// NOTE: /search must be declared BEFORE /:id so Express doesn't treat
// the word "search" as a book id.
// GET /api/books/search?q=...
router.get("/search", async (req, res, next) => {
    try {
        const q = req.query.q;
        const results = await booksService.searchBooks(q);
        res.json({ success: true, data: results, count: results.length });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/books
router.get("/", async (_req, res, next) => {
    try {
        const books = await booksService.listBooks();
        res.json({ success: true, data: books, count: books.length });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/books/:id
router.get("/:id", async (req, res, next) => {
    try {
        const book = await booksService.findBook(req.params.id);
        res.json({ success: true, data: book });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/books
router.post("/", async (req, res, next) => {
    try {
        const input = req.body;
        const book = await booksService.addBook(input);
        res.status(201).json({ success: true, data: book });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/books/:id
router.delete("/:id", async (req, res, next) => {
    try {
        const deletedBook = await booksService.deleteBook(req.params.id);
        res.json({ success: true, data: deletedBook });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=books.js.map