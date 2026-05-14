import {
  ReadingList,
  ReadingListWithBooks,
  CreateReadingListInput,
  ReadingListBookAction,
} from "@bookshelf/shared";
import * as repo from "../data/listsRepository";
import * as booksRepo from "../data/booksRepository";
import { AppError } from "../middleware/errorHandler";

function createHttpError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}

export async function listLists(): Promise<ReadingList[]> {
  return repo.getAllLists();
}

export async function findList(id: string): Promise<ReadingListWithBooks> {
  const list = await repo.getListById(id);
  if (!list) {
    throw createHttpError(`List with id '${id}' not found`, 404);
  }

  const books = await booksRepo.getAllBooks();
  const bookMap = new Map(books.map((b) => [b.id, b]));
  const hydrated = list.bookIds
    .map((bookId) => bookMap.get(bookId))
    .filter((b): b is NonNullable<typeof b> => b !== undefined);

  const { bookIds: _bookIds, ...rest } = list;
  return { ...rest, books: hydrated };
}

export async function addList(
  input: CreateReadingListInput
): Promise<ReadingList> {
  const { name, description, userId } = input;

  if (!name?.trim()) {
    throw createHttpError("'name' is required", 400);
  }
  if (name.length > 100) {
    throw createHttpError("'name' must be 100 characters or fewer", 400);
  }
  if (typeof description !== "string") {
    throw createHttpError("'description' is required", 400);
  }

  return repo.createList({ name, description, userId: userId ?? null });
}

export async function removeList(id: string): Promise<void> {
  const deleted = await repo.deleteList(id);
  if (!deleted) {
    throw createHttpError(`List with id '${id}' not found`, 404);
  }
}

export async function updateBookMembership(
  id: string,
  bookId: string,
  action: ReadingListBookAction
): Promise<ReadingList> {
  const list = await repo.getListById(id);
  if (!list) {
    throw createHttpError(`List with id '${id}' not found`, 404);
  }

  if (!bookId || typeof bookId !== "string" || !bookId.trim()) {
    throw createHttpError("'bookId' is required", 400);
  }
  if (action !== "add" && action !== "remove") {
    throw createHttpError("'action' must be 'add' or 'remove'", 400);
  }

  if (action === "add") {
    const book = await booksRepo.getBookById(bookId);
    if (!book) {
      throw createHttpError(`Book with id '${bookId}' not found`, 404);
    }
    const updated = await repo.addBookToList(id, bookId);
    return updated!;
  }

  const updated = await repo.removeBookFromList(id, bookId);
  return updated!;
}
