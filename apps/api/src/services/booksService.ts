import { Book, CreateBookInput } from "@bookshelf/shared";
import * as repo from "../data/booksRepository";

const CURRENT_YEAR = new Date().getFullYear();

export async function listBooks(): Promise<Book[]> {
  return repo.getAllBooks();
}

export async function findBook(id: string): Promise<Book> {
  const book = await repo.getBookById(id);
  if (!book) {
    const err = new Error(`Book with id '${id}' not found`);
    (err as any).statusCode = 404;
    throw err;
  }
  return book;
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query || !query.trim()) {
    const err = new Error("Query parameter 'q' is required");
    (err as any).statusCode = 400;
    throw err;
  }
  return repo.searchBooks(query);
}

export async function addBook(input: CreateBookInput): Promise<Book> {
  const { title, author, genre, year, isbn } = input;

  if (!title?.trim()) {
    const err = new Error("'title' is required");
    (err as any).statusCode = 400;
    throw err;
  }
  if (title.trim().length > 200) {
    const err = new Error("'title' must be 200 characters or fewer");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!author?.trim()) {
    const err = new Error("'author' is required");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!genre?.trim()) {
    const err = new Error("'genre' is required");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!year || typeof year !== "number") {
    const err = new Error("'year' must be a number");
    (err as any).statusCode = 400;
    throw err;
  }
  if (year < 1000 || year > CURRENT_YEAR) {
    const err = new Error(`'year' must be between 1000 and ${CURRENT_YEAR}`);
    (err as any).statusCode = 400;
    throw err;
  }
  if (!isbn?.trim()) {
    const err = new Error("'isbn' is required");
    (err as any).statusCode = 400;
    throw err;
  }

  return repo.createBook(input);
}