import { Review, CreateReviewInput } from "@bookshelf/shared";
import * as repo from "../data/reviewsRepository";
import type { RatingStats } from "../data/reviewsRepository";
import * as booksRepo from "../data/booksRepository";
import { AppError } from "../middleware/errorHandler";

function createHttpError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}

export async function listReviewsForBook(bookId: string): Promise<Review[]> {
  const book = await booksRepo.getBookById(bookId);
  if (!book) {
    throw createHttpError(`Book with id '${bookId}' not found`, 404);
  }
  return repo.getReviewsByBookId(bookId);
}

export async function getRatingStats(bookId: string): Promise<RatingStats> {
  const book = await booksRepo.getBookById(bookId);
  if (!book) {
    throw createHttpError(`Book with id '${bookId}' not found`, 404);
  }
  return repo.getRatingStats(bookId);
}

export async function addReview(
  bookId: string,
  input: Omit<CreateReviewInput, "bookId">
): Promise<Review> {
  const book = await booksRepo.getBookById(bookId);
  if (!book) {
    throw createHttpError(`Book with id '${bookId}' not found`, 404);
  }

  const { reviewer, rating, body, userId } = input;

  if (!reviewer?.trim()) {
    throw createHttpError("'reviewer' is required", 400);
  }
  if (rating === undefined || rating === null || typeof rating !== "number") {
    throw createHttpError("'rating' must be a number", 400);
  }
  if (rating < 1 || rating > 5) {
    throw createHttpError("'rating' must be between 1 and 5", 400);
  }
  if (!body?.trim()) {
    throw createHttpError("'body' is required", 400);
  }

  return repo.createReview({
    bookId,
    reviewer,
    rating,
    body,
    userId: userId ?? null,
  });
}
