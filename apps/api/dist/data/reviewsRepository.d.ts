import { CreateReviewInput, Review } from "@bookshelf/shared";
export declare function getAllReviews(): Promise<Review[]>;
export declare function getReviewsByBookId(bookId: string): Promise<Review[]>;
export declare function createReview(input: CreateReviewInput): Promise<Review>;
