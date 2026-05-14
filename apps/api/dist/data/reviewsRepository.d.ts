import { Review, CreateReviewInput } from "@bookshelf/shared";
export interface RatingStats {
    average: number | null;
    total: number;
    breakdown: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}
export declare function getAllReviews(): Promise<Review[]>;
export declare function getReviewsByBookId(bookId: string): Promise<Review[]>;
export declare function getRatingStats(bookId: string): Promise<RatingStats>;
export declare function createReview(input: CreateReviewInput): Promise<Review>;
