const BASE_URL = "http://localhost:3001/api";

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  isbn: string;
  description: string;
  coverUrl: string | null;
  addedAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  reviewer: string;
  rating: number;
  body: string;
  createdAt: string;
}

export interface CreateReviewInput {
  reviewer: string;
  rating: number;
  body: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "API error");
  return json.data as T;
}

export const api = {
  getBooks: (): Promise<Book[]> =>
    request<Book[]>("/books"),

  searchBooks: (q: string): Promise<Book[]> =>
    request<Book[]>(`/books/search?q=${encodeURIComponent(q)}`),

  getBook: (id: string): Promise<Book> =>
    request<Book>(`/books/${id}`),

  getReviews: (bookId: string): Promise<Review[]> =>
    request<Review[]>(`/books/${encodeURIComponent(bookId)}/reviews`),

  addReview: (bookId: string, review: CreateReviewInput): Promise<Review> =>
    request<Review>(`/books/${encodeURIComponent(bookId)}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    }),
};