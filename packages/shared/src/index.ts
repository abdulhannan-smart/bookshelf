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

// ─── Reading List ────────────────────────────────────────────────────────────
export interface ReadingList {
  id: string;
  name: string;
  description: string;
  bookIds: string[];
  userId?: string | null;
  createdAt: string;
}

export type CreateReadingListInput = Pick<
  ReadingList,
  "name" | "description"
> & { userId?: string | null };

export interface ReadingListWithBooks extends Omit<ReadingList, "bookIds"> {
  books: Book[];
}

export type ReadingListBookAction = "add" | "remove";

// ─── Review ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  bookId: string;
  reviewer: string;
  rating: number; // 1–5
  body: string;
  userId?: string | null;
  createdAt: string;
}

export type CreateReviewInput = Omit<Review, "id" | "createdAt">;

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  favouriteGenres: Genre[];
  createdAt: string;
}

export type CreateUserInput = Omit<User, "id" | "createdAt">;
export type UpdateUserInput = Partial<CreateUserInput>;

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