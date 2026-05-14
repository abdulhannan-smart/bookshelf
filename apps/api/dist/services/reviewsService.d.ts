import { Review, CreateReviewInput } from "@bookshelf/shared";
import type { RatingStats } from "../data/reviewsRepository";
export declare function listReviewsForBook(bookId: string): Promise<Review[]>;
export declare function getRatingStats(bookId: string): Promise<RatingStats>;
export declare function addReview(bookId: string, input: Omit<CreateReviewInput, "bookId">): Promise<Review>;
