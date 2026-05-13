import { CreateReviewBody, Review } from "@bookshelf/shared";
export declare function listReviewsForBook(bookId: string): Promise<Review[]>;
export declare function addReview(bookId: string, payload: CreateReviewBody): Promise<Review>;
