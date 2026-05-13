import { Book, CreateBookInput } from "@bookshelf/shared";
import * as repo from "../data/booksRepository";
import { AppError } from "../middleware/errorHandler";

const CURRENT_YEAR = new Date().getFullYear();

function createHttpError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}

export async function listBooks(): Promise<Book[]> {
  return repo.getAllBooks();
}

export async function findBook(id: string): Promise<Book> {
  const book = await repo.getBookById(id);
  if (!book) {
    throw createHttpError(`Book with id '${id}' not found`, 404);
  }
  return book;
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query || !query.trim()) {
    throw createHttpError("Query parameter 'q' is required", 400);
  }
  return repo.searchBooks(query);
}

export async function addBook(input: CreateBookInput): Promise<Book> {
  const { title, author, genre, year, isbn } = input;

  if (!title?.trim()) {
    throw createHttpError("'title' is required", 400);
  }
  if (title.trim().length > 200) {
    throw createHttpError("'title' must be 200 characters or fewer", 400);
  }
  if (!author?.trim()) {
    throw createHttpError("'author' is required", 400);
  }
  if (!genre?.trim()) {
    throw createHttpError("'genre' is required", 400);
  }
  if (!year || typeof year !== "number") {
    throw createHttpError("'year' must be a number", 400);
  }
  if (year < 1000 || year > CURRENT_YEAR) {
    throw createHttpError(`'year' must be between 1000 and ${CURRENT_YEAR}`, 400);
  }
  if (!isbn?.trim()) {
    throw createHttpError("'isbn' is required", 400);
  }

  return repo.createBook(input);
}

export async function removeBook(id: string): Promise<void> {
  const deletedBook = await repo.deleteBook(id);

  if (!deletedBook) {
    throw createHttpError(`Book with id '${id}' not found`, 404);
  }
}