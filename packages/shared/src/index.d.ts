export type Genre = "Technology" | "Fiction" | "Science" | "History" | "Self-Help";
export interface Book {
    id: string;
    title: string;
    author: string;
    genre: Genre;
    year: number;
    isbn: string;
    description: string;
    coverUrl: string | null;
    addedAt: string;
}
export type CreateBookInput = Omit<Book, "id" | "addedAt">;
export type UpdateBookInput = Partial<CreateBookInput>;
export interface Shelf {
    id: string;
    name: string;
    bookIds: string[];
    createdAt: string;
}
export type CreateShelfInput = Omit<Shelf, "id" | "createdAt">;
export interface ReadingList {
    id: string;
    name: string;
    description: string;
    bookIds: string[];
    createdAt: string;
}
export type CreateReadingListInput = Pick<ReadingList, "name" | "description">;
export interface ReadingListWithBooks extends Omit<ReadingList, "bookIds"> {
    books: Book[];
}
export type ReadingListBookAction = "add" | "remove";
export interface Review {
    id: string;
    bookId: string;
    reviewer: string;
    rating: number;
    body: string;
    createdAt: string;
}
export type CreateReviewInput = Omit<Review, "id" | "createdAt">;
export interface ApiSuccess<T> {
    success: true;
    data: T;
}
export interface ApiError {
    success: false;
    error: string;
    statusCode: number;
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
