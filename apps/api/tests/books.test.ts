import request from "supertest";
import fs from "fs/promises";
import path from "path";
import type { Book } from "@bookshelf/shared";
import app from "../src/app";

const DATA_DIR = path.resolve(__dirname, "../../../data");
const BOOKS_FILE = path.join(DATA_DIR, "books.json");

let originalBooks: string;

beforeAll(async () => {
  // Snapshot books.json so tests can't corrupt the seed data
  originalBooks = await fs.readFile(BOOKS_FILE, "utf-8");
});

afterAll(async () => {
  // Always restore the original file
  await fs.writeFile(BOOKS_FILE, originalBooks, "utf-8");
});

// ─── GET /api/books ───────────────────────────────────────────────────────────
describe("GET /api/books", () => {
  it("returns 200 with an array of books", async () => {
    const res = await request(app).get("/api/books");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);
  });

  it("returns 30 seeded books", async () => {
    const res = await request(app).get("/api/books");
    expect(res.body.count).toBe(30);
  });

  it("each book has the expected shape", async () => {
    const res = await request(app).get("/api/books");
    const book = res.body.data[0];
    expect(book).toHaveProperty("id");
    expect(book).toHaveProperty("title");
    expect(book).toHaveProperty("author");
    expect(book).toHaveProperty("genre");
    expect(book).toHaveProperty("year");
    expect(book).toHaveProperty("isbn");
    expect(book).toHaveProperty("description");
    expect(book).toHaveProperty("addedAt");
  });
});

// ─── GET /api/books/:id ──────────────────────────────────────────────────────
describe("GET /api/books/:id", () => {
  it("returns a single book by id", async () => {
    const res = await request(app).get("/api/books/book_001");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("book_001");
    expect(res.body.data.title).toBe("Clean Code");
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/books/does_not_exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });
});

// ─── GET /api/books/search ───────────────────────────────────────────────────
describe("GET /api/books/search", () => {
  it("finds books by partial title match (case-insensitive)", async () => {
    // Arrange
    const partialTitle = "LEAN";
    const expectedSubstring = "lean";

    // Act
    const res = await request(app).get(`/api/books/search?q=${partialTitle}`);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);
    expect(res.body.data.length).toBeGreaterThan(0);
    const titles = (res.body.data as Book[]).map((b) => b.title.toLowerCase());
    expect(titles.some((t) => t.includes(expectedSubstring))).toBe(true);
    (res.body.data as Book[]).forEach((book) => {
      const haystack = `${book.title} ${book.author} ${book.genre}`.toLowerCase();
      expect(haystack).toContain(expectedSubstring);
    });
  });

  it("finds books by partial author match", async () => {
    // Arrange
    const partialAuthor = "martin";

    // Act
    const res = await request(app).get(`/api/books/search?q=${partialAuthor}`);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(
      (res.body.data as Book[]).some((b) => b.author.toLowerCase().includes(partialAuthor))
    ).toBe(true);
  });

  it("finds books by genre matching the query", async () => {
    // Arrange
    const genreQuery = "Technology";

    // Act
    const res = await request(app).get(
      `/api/books/search?q=${encodeURIComponent(genreQuery)}`
    );

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);
    expect(res.body.data.length).toBeGreaterThan(0);
    (res.body.data as Book[]).forEach((book) => {
      expect(book.genre).toBe(genreQuery);
    });
  });

  it("returns 200 with an empty array when no books match (not 404)", async () => {
    // Arrange
    const unmatched = "zzznomatchzzzquery123";

    // Act
    const res = await request(app).get(`/api/books/search?q=${unmatched}`);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  it("returns 400 when the q parameter is missing", async () => {
    // Arrange
    const pathWithoutQuery = "/api/books/search";

    // Act
    const res = await request(app).get(pathWithoutQuery);

    // Assert
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/q/i);
    expect(res.body.statusCode).toBe(400);
  });

  it("returns 400 when q is empty", async () => {
    // Arrange
    const pathWithEmptyQ = "/api/books/search?q=";

    // Act
    const res = await request(app).get(pathWithEmptyQ);

    // Assert
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/q/i);
    expect(res.body.statusCode).toBe(400);
  });

  it("returns 400 when q is only whitespace", async () => {
    // Arrange
    const whitespaceQ = "   \t  ";

    // Act
    const res = await request(app).get(
      `/api/books/search?q=${encodeURIComponent(whitespaceQ)}`
    );

    // Assert
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/q/i);
    expect(res.body.statusCode).toBe(400);
  });

  it("handles special characters in q without crashing", async () => {
    // Arrange
    const special = "!@#$%^&*()[]{}|\\:;\"'<>,.?/~`";

    // Act
    const res = await request(app).get(`/api/books/search?q=${encodeURIComponent(special)}`);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);
  });
});

// ─── POST /api/books ─────────────────────────────────────────────────────────
describe("POST /api/books", () => {
  const validBook = {
    title: "Test Driven Development",
    author: "Kent Beck",
    genre: "Technology",
    year: 2002,
    isbn: "978-0321146533",
    description: "A seminal book on writing tests before code.",
    coverUrl: null,
  };

  it("creates a new book and returns 201", async () => {
    const res = await request(app).post("/api/books").send(validBook);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(validBook.title);
    expect(res.body.data.id).toMatch(/^book_/);
    expect(typeof res.body.data.addedAt).toBe("string");
  });

  it("persists the new book so it appears in GET /api/books/:id", async () => {
    const createRes = await request(app).post("/api/books").send(validBook);
    const newId = createRes.body.data.id;
    const getRes = await request(app).get(`/api/books/${newId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(newId);
  });

  it("returns 400 when title is missing", async () => {
    const { title, ...noTitle } = validBook;
    const res = await request(app).post("/api/books").send(noTitle);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/title/i);
  });

  it("returns 400 when author is missing", async () => {
    const { author, ...noAuthor } = validBook;
    const res = await request(app).post("/api/books").send(noAuthor);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when year is not a number", async () => {
    const res = await request(app).post("/api/books").send({ ...validBook, year: "not-a-number" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when title exceeds 200 characters", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ ...validBook, title: "A".repeat(201) });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/200/);
  });

  it("returns 400 when year is below 1000", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ ...validBook, year: 999 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/year/i);
  });

  it("returns 400 when year is in the future", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ ...validBook, year: new Date().getFullYear() + 1 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/year/i);
  });
});

// ─── DELETE /api/books/:id ───────────────────────────────────────────────────
describe("DELETE /api/books/:id", () => {
  it("deletes an existing book and returns 200", async () => {
    const createPayload = {
      title: "Delete Me",
      author: "Temporary Author",
      genre: "Technology",
      year: 2020,
      isbn: "978-0000000001",
      description: "Created only for delete test.",
      coverUrl: null,
    };

    const createRes = await request(app).post("/api/books").send(createPayload);
    const createdId: string = createRes.body.data.id;

    const deleteRes = await request(app).delete(`/api/books/${createdId}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.data).toBeNull();
  });

  it("returns 404 when deleting a non-existent id", async () => {
    const res = await request(app).delete("/api/books/book_doesnotexist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
    expect(res.body.statusCode).toBe(404);
  });

  it("removes the book so GET /api/books/:id returns 404", async () => {
    const createPayload = {
      title: "Delete Then Verify",
      author: "Verification Author",
      genre: "Science",
      year: 2019,
      isbn: "978-0000000002",
      description: "Ensures deleted books are no longer retrievable.",
      coverUrl: null,
    };

    const createRes = await request(app).post("/api/books").send(createPayload);
    const createdId: string = createRes.body.data.id;

    const deleteRes = await request(app).delete(`/api/books/${createdId}`);
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get(`/api/books/${createdId}`);
    expect(getRes.status).toBe(404);
    expect(getRes.body.success).toBe(false);
    expect(getRes.body.statusCode).toBe(404);
  });
});

// ─── 404 catch-all ───────────────────────────────────────────────────────────
describe("404 handler", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });
});
