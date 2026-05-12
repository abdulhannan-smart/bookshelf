import fs from "fs/promises";
import path from "path";
import * as repo from "../src/data/booksRepository";

const DATA_DIR = path.resolve(__dirname, "../../../data");
const BOOKS_FILE = path.join(DATA_DIR, "books.json");

let originalBooks: string;

beforeAll(async () => {
  originalBooks = await fs.readFile(BOOKS_FILE, "utf-8");
});

afterAll(async () => {
  await fs.writeFile(BOOKS_FILE, originalBooks, "utf-8");
});

describe("getAllBooks", () => {
  it("returns an array", async () => {
    const books = await repo.getAllBooks();
    expect(Array.isArray(books)).toBe(true);
  });

  it("returns 30 seeded books", async () => {
    const books = await repo.getAllBooks();
    expect(books).toHaveLength(30);
  });
});

describe("getBookById", () => {
  it("finds an existing book", async () => {
    const book = await repo.getBookById("book_001");
    expect(book).toBeDefined();
    expect(book?.title).toBe("Clean Code");
  });

  it("returns undefined for a missing id", async () => {
    const book = await repo.getBookById("no_such_id");
    expect(book).toBeUndefined();
  });
});

describe("searchBooks", () => {
  it("finds books by partial title (case-insensitive)", async () => {
    const results = await repo.searchBooks("CLEAN");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toMatch(/clean/i);
  });

  it("finds books by author", async () => {
    const results = await repo.searchBooks("hawking");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].author.toLowerCase()).toContain("hawking");
  });

  it("finds books by genre", async () => {
    const results = await repo.searchBooks("technology");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((b) => expect(b.genre.toLowerCase()).toContain("technology"));
  });

  it("returns empty array when nothing matches", async () => {
    const results = await repo.searchBooks("xyzzy99999nomatch");
    expect(results).toHaveLength(0);
  });

  it("returns all books when query is empty string", async () => {
    const all = await repo.getAllBooks();
    const results = await repo.searchBooks("");
    expect(results).toHaveLength(all.length);
  });
});

describe("createBook", () => {
  it("adds a book and returns it with a generated id", async () => {
    const input = {
      title: "Repo Unit Test Book",
      author: "Test Author",
      genre: "Technology" as const,
      year: 2024,
      isbn: "000-0000000000",
      description: "A book created during unit tests.",
      coverUrl: null,
    };

    const created = await repo.createBook(input);

    expect(created.id).toMatch(/^book_/);
    expect(created.title).toBe(input.title);
    expect(typeof created.addedAt).toBe("string");

    // Verify it was actually written to the file
    const found = await repo.getBookById(created.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe(input.title);
  });
});