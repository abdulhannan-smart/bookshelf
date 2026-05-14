import { v4 as uuidv4 } from "uuid";
import { Review, CreateReviewInput } from "@bookshelf/shared";
import { readJson, writeJson } from "./jsonStore";

const FILE = "reviews.json";

export interface RatingStats {
  // null when there are no reviews — avoids colliding with the
  // impossible-but-readable "0 stars" interpretation.
  average: number | null;
  total: number;
  breakdown: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export async function getAllReviews(): Promise<Review[]> {
  return readJson<Review[]>(FILE);
}

export async function getReviewsByBookId(bookId: string): Promise<Review[]> {
  const reviews = await getAllReviews();
  return reviews.filter((r) => r.bookId === bookId);
}

export async function getReviewsByUserId(userId: string): Promise<Review[]> {
  const reviews = await getAllReviews();
  return reviews.filter((r) => r.userId === userId);
}

export async function getRatingStats(bookId: string): Promise<RatingStats> {
  const reviews = await getReviewsByBookId(bookId);
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const r of reviews) {
    breakdown[r.rating as 1 | 2 | 3 | 4 | 5]++;
  }

  const total = reviews.length;
  const average =
    total === 0
      ? null
      : Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 100
        ) / 100;

  return { average, total, breakdown };
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const reviews = await getAllReviews();

  const newReview: Review = {
    ...input,
    id: `review_${uuidv4().replace(/-/g, "").slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  };

  reviews.push(newReview);
  await writeJson(FILE, reviews);
  return newReview;
}
