import { Router, Request, Response, NextFunction } from "express";
import * as listsService from "../services/listsService";
import { CreateReadingListInput, ReadingListBookAction } from "@bookshelf/shared";

const router = Router();

// GET /api/lists
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const lists = await listsService.listLists();
    res.json({ success: true, data: lists, count: lists.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/lists/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await listsService.findList(req.params.id);
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// POST /api/lists
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = req.body as CreateReadingListInput;
    const list = await listsService.addList(input);
    res.status(201).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// PUT /api/lists/:id/books
router.put(
  "/:id/books",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookId, action } = req.body as {
        bookId: string;
        action: ReadingListBookAction;
      };
      const list = await listsService.updateBookMembership(
        req.params.id,
        bookId,
        action
      );
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/lists/:id
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await listsService.removeList(req.params.id);
      res.json({ success: true, data: { id: req.params.id } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
