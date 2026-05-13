import { Router, Request, Response, NextFunction } from "express";
import type { CreateReviewBody } from "@bookshelf/shared";
import * as reviewsService from "../services/reviewsService";

const router = Router();

// GET /api/books/:id/reviews
router.get(
  "/:id/reviews",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviews = await reviewsService.listReviewsForBook(req.params.id);
      res.json({ success: true, data: reviews, count: reviews.length });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/books/:id/reviews
router.post(
  "/:id/reviews",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body as CreateReviewBody;
      const review = await reviewsService.addReview(req.params.id, payload);
      res.status(201).json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
