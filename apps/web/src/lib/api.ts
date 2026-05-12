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

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
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
};