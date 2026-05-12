// ─── Book ────────────────────────────────────────────────────────────────────
export type Genre =
  | "Technology"
  | "Fiction"
  | "Science"
  | "History"
  | "Self-Help";

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

// ─── Shelf ───────────────────────────────────────────────────────────────────
export interface Shelf {
  id: string;
  name: string;
  bookIds: string[];
  createdAt: string;
}

export type CreateShelfInput = Omit<Shelf, "id" | "createdAt">;

// ─── Review ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  bookId: string;
  reviewer: string;
  rating: number; // 1–5
  body: string;
  createdAt: string;
}

export type CreateReviewInput = Omit<Review, "id" | "createdAt">;

// ─── API helpers ─────────────────────────────────────────────────────────────
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