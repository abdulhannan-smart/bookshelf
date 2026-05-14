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

export interface List {
  id: string;
  name: string;
  description: string;
  bookIds: string[];
  createdAt: string;
}

export interface ListWithBooks {
  id: string;
  name: string;
  description: string;
  books: Book[];
  createdAt: string;
}

export interface CreateListInput {
  name: string;
  description: string;
}

export interface User {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  favouriteGenres: string[];
  createdAt: string;
}

export interface CreateUserInput {
  displayName: string;
  avatarUrl?: string | null;
  favouriteGenres?: string[];
}

export interface UpdateUserInput {
  displayName?: string;
  avatarUrl?: string | null;
  favouriteGenres?: string[];
}

export interface ReviewActivity {
  type: "review";
  at: string;
  reviewId: string;
  bookId: string;
  rating: number;
  body: string;
}

export interface ListActivity {
  type: "list_update";
  at: string;
  listId: string;
  name: string;
  description: string;
}

export type Activity = ReviewActivity | ListActivity;

interface UserActivityResponse {
  reviews: Review[];
  listUpdates: List[];
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

  getLists: (): Promise<List[]> =>
    request<List[]>("/lists"),

  getList: (id: string): Promise<ListWithBooks> =>
    request<ListWithBooks>(`/lists/${encodeURIComponent(id)}`),

  createList: (data: CreateListInput): Promise<List> =>
    request<List>("/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  getUser: (id: string): Promise<User> =>
    request<User>(`/users/${encodeURIComponent(id)}`),

  createUser: (data: CreateUserInput): Promise<User> =>
    request<User>("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  updateUser: (id: string, data: UpdateUserInput): Promise<User> =>
    request<User>(`/users/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  getUserActivity: async (id: string): Promise<Activity[]> => {
    const raw = await request<UserActivityResponse>(
      `/users/${encodeURIComponent(id)}/activity`
    );
    const reviews: Activity[] = raw.reviews.map((r) => ({
      type: "review",
      at: r.createdAt,
      reviewId: r.id,
      bookId: r.bookId,
      rating: r.rating,
      body: r.body,
    }));
    const lists: Activity[] = raw.listUpdates.map((l) => ({
      type: "list_update",
      at: l.createdAt,
      listId: l.id,
      name: l.name,
      description: l.description,
    }));
    return [...reviews, ...lists].sort((a, b) => (a.at < b.at ? 1 : -1));
  },
};