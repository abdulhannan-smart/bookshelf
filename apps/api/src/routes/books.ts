import { Router, Request, Response, NextFunction } from "express";
import * as booksService from "../services/booksService";
import { CreateBookInput } from "@bookshelf/shared";

const router = Router();

// NOTE: /search must be declared BEFORE /:id so Express doesn't treat
// the word "search" as a book id.

// GET /api/books/search?q=...
router.get(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = req.query.q as string;
      const results = await booksService.searchBooks(q);
      res.json({ success: true, data: results, count: results.length });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/books
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await booksService.listBooks();
    res.json({ success: true, data: books, count: books.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:id/recommendations — must come before /:id
router.get(
  "/:id/recommendations",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await booksService.findRecommendations(req.params.id);
      res.json({ success: true, data: results, count: results.length });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/books/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await booksService.findBook(req.params.id);
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
});

// POST /api/books
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = req.body as CreateBookInput;
    const book = await booksService.addBook(input);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
});

export default router;