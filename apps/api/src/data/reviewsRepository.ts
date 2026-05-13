import { v4 as uuidv4 } from "uuid";
import { Review, CreateReviewInput } from "@bookshelf/shared";
import { readJson, writeJson } from "./jsonStore";

const FILE = "reviews.json";

export async function getAllReviews(): Promise<Review[]> {
  return readJson<Review[]>(FILE);
}

export async function getReviewsByBookId(bookId: string): Promise<Review[]> {
  const reviews = await getAllReviews();
  return reviews.filter((r) => r.bookId === bookId);
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
