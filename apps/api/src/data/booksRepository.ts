import { v4 as uuidv4 } from "uuid";
import { Book, CreateBookInput } from "@bookshelf/shared";
import { readJson, writeJson } from "./jsonStore";

const FILE = "books.json";

export async function getAllBooks(): Promise<Book[]> {
  return readJson<Book[]>(FILE);
}

export async function getBookById(id: string): Promise<Book | undefined> {
  const books = await getAllBooks();
  return books.find((b) => b.id === id);
}

export async function searchBooks(query: string): Promise<Book[]> {
  const books = await getAllBooks();
  const q = query.toLowerCase().trim();
  if (!q) return books;
  return books.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q)
  );
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  const books = await getAllBooks();

  const newBook: Book = {
    ...input,
    id: `book_${uuidv4().replace(/-/g, "").slice(0, 8)}`,
    addedAt: new Date().toISOString(),
  };

  books.push(newBook);
  await writeJson(FILE, books);
  return newBook;
}

export async function deleteBook(id: string): Promise<Book | undefined> {
  const books = await getAllBooks();
  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    return undefined;
  }

  const [deletedBook] = books.splice(index, 1);
  await writeJson(FILE, books);
  return deletedBook;
}