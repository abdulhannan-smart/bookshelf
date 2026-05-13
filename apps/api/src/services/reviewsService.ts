import { CreateReviewBody, CreateReviewInput, Review } from "@bookshelf/shared";
import * as booksService from "./booksService";
import * as repo from "../data/reviewsRepository";
import { AppError } from "../middleware/errorHandler";

function createHttpError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}

export async function listReviewsForBook(bookId: string): Promise<Review[]> {
  await booksService.findBook(bookId);
  return repo.getReviewsByBookId(bookId);
}

export async function addReview(bookId: string, payload: CreateReviewBody): Promise<Review> {
  await booksService.findBook(bookId);

  const { reviewer, rating, body } = payload;

  if (!reviewer?.trim()) {
    throw createHttpError("'reviewer' is required", 400);
  }

  if (typeof rating !== "number") {
    throw createHttpError("'rating' must be a number", 400);
  }

  if (!Number.isInteger(rating)) {
    throw createHttpError("'rating' must be a whole number", 400);
  }

  if (rating < 1 || rating > 5) {
    throw createHttpError("'rating' must be between 1 and 5", 400);
  }

  if (!body?.trim()) {
    throw createHttpError("'body' is required", 400);
  }

  const input: CreateReviewInput = {
    bookId,
    reviewer: reviewer.trim(),
    rating,
    body: body.trim(),
  };

  return repo.createReview(input);
}
