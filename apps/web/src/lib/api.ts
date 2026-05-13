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

export interface CreateReviewPayload {
  reviewer: string;
  rating: number;
  body: string;
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  const json: unknown = await res.json();
  if (!isSuccess(json)) {
    throw new Error(getErrorMessage(json));
  }
  return json.data as T;
}

function isSuccess(json: unknown): json is { success: true; data: unknown } {
  return (
    typeof json === "object" &&
    json !== null &&
    "success" in json &&
    (json as { success: unknown }).success === true &&
    "data" in json
  );
}

function getErrorMessage(json: unknown): string {
  if (
    typeof json === "object" &&
    json !== null &&
    "error" in json &&
    typeof (json as { error: unknown }).error === "string"
  ) {
    return (json as { error: string }).error;
  }
  return "API error";
}

export const api = {
  getBooks: (): Promise<Book[]> => request<Book[]>("/books"),

  searchBooks: (q: string): Promise<Book[]> =>
    request<Book[]>(`/books/search?q=${encodeURIComponent(q)}`),

  getBook: (id: string): Promise<Book> => request<Book>(`/books/${encodeURIComponent(id)}`),

  getReviews: (bookId: string): Promise<Review[]> =>
    request<Review[]>(`/books/${encodeURIComponent(bookId)}/reviews`),

  addReview: async (
    bookId: string,
    review: CreateReviewPayload
  ): Promise<Review> => {
    const res = await fetch(
      `${BASE_URL}/books/${encodeURIComponent(bookId)}/reviews`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      }
    );
    const json: unknown = await res.json();
    if (!isSuccess(json)) {
      throw new Error(getErrorMessage(json));
    }
    return json.data as Review;
  },
};
