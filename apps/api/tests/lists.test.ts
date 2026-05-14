import request from "supertest";
import fs from "fs/promises";
import path from "path";
import app from "../src/app";

const DATA_DIR = path.resolve(__dirname, "../../../data");
const LISTS_FILE = path.join(DATA_DIR, "lists.json");

const SEEDED_BOOK_ID = "book_001";

let originalLists: string;

beforeAll(async () => {
  // Snapshot lists.json so tests can't corrupt the data file
  originalLists = await fs.readFile(LISTS_FILE, "utf-8");
});

afterAll(async () => {
  // Always restore the original file
  await fs.writeFile(LISTS_FILE, originalLists, "utf-8");
});

beforeEach(async () => {
  // Each test starts from an empty lists.json so assertions about
  // counts and "empty array when none exist" are deterministic.
  await fs.writeFile(LISTS_FILE, "[]", "utf-8");
});

// ─── POST /api/lists ─────────────────────────────────────────────────────────
describe("POST /api/lists", () => {
  const validList = {
    name: "Summer Reading",
    description: "Books to read on the beach.",
  };

  it("creates a new list and returns 201", async () => {
    const res = await request(app).post("/api/lists").send(validList);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(validList.name);
    expect(res.body.data.description).toBe(validList.description);
    expect(res.body.data.id).toMatch(/^list_/);
    expect(Array.isArray(res.body.data.bookIds)).toBe(true);
    expect(res.body.data.bookIds).toHaveLength(0);
    expect(typeof res.body.data.createdAt).toBe("string");
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/api/lists")
      .send({ description: "no name here" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/name/i);
  });

  it("returns 400 when description is missing", async () => {
    const res = await request(app)
      .post("/api/lists")
      .send({ name: "No description" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/description/i);
  });

  it("returns 400 when name exceeds 100 characters", async () => {
    const res = await request(app)
      .post("/api/lists")
      .send({ ...validList, name: "A".repeat(101) });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/100/);
  });
});

// ─── GET /api/lists ──────────────────────────────────────────────────────────
describe("GET /api/lists", () => {
  it("returns an empty array when no lists exist", async () => {
    const res = await request(app).get("/api/lists");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it("returns all created lists", async () => {
    await request(app)
      .post("/api/lists")
      .send({ name: "List A", description: "first" });
    await request(app)
      .post("/api/lists")
      .send({ name: "List B", description: "second" });

    const res = await request(app).get("/api/lists");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
    const names = res.body.data.map((l: any) => l.name);
    expect(names).toEqual(expect.arrayContaining(["List A", "List B"]));
  });
});

// ─── GET /api/lists/:id ──────────────────────────────────────────────────────
describe("GET /api/lists/:id", () => {
  it("returns the list when the id exists", async () => {
    const createRes = await request(app)
      .post("/api/lists")
      .send({ name: "Favourites", description: "Top picks" });
    const newId = createRes.body.data.id;

    const res = await request(app).get(`/api/lists/${newId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(newId);
    expect(res.body.data.name).toBe("Favourites");
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/lists/list_doesnotexist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });

  it("returns books as full objects, not just ids", async () => {
    const createRes = await request(app)
      .post("/api/lists")
      .send({ name: "With Books", description: "hydrated" });
    const listId = createRes.body.data.id;

    await request(app)
      .put(`/api/lists/${listId}/books`)
      .send({ bookId: SEEDED_BOOK_ID, action: "add" });

    const res = await request(app).get(`/api/lists/${listId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.books)).toBe(true);
    expect(res.body.data.books).toHaveLength(1);

    const book = res.body.data.books[0];
    expect(book.id).toBe(SEEDED_BOOK_ID);
    expect(book).toHaveProperty("title");
    expect(book).toHaveProperty("author");
    expect(book).toHaveProperty("genre");
    expect(book).toHaveProperty("year");
    expect(book).toHaveProperty("isbn");
    expect(typeof book.title).toBe("string");
    expect(typeof book.author).toBe("string");
  });
});

// ─── PUT /api/lists/:id/books ────────────────────────────────────────────────
describe("PUT /api/lists/:id/books", () => {
  async function createList() {
    const res = await request(app)
      .post("/api/lists")
      .send({ name: "Mutable", description: "for membership tests" });
    return res.body.data.id as string;
  }

  it("adds a book to the list", async () => {
    const listId = await createList();

    const res = await request(app)
      .put(`/api/lists/${listId}/books`)
      .send({ bookId: SEEDED_BOOK_ID, action: "add" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app).get(`/api/lists/${listId}`);
    const bookIds = getRes.body.data.books.map((b: any) => b.id);
    expect(bookIds).toContain(SEEDED_BOOK_ID);
  });

  it("removes a book from the list", async () => {
    const listId = await createList();
    await request(app)
      .put(`/api/lists/${listId}/books`)
      .send({ bookId: SEEDED_BOOK_ID, action: "add" });

    const res = await request(app)
      .put(`/api/lists/${listId}/books`)
      .send({ bookId: SEEDED_BOOK_ID, action: "remove" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app).get(`/api/lists/${listId}`);
    const bookIds = getRes.body.data.books.map((b: any) => b.id);
    expect(bookIds).not.toContain(SEEDED_BOOK_ID);
  });

  it("returns 404 when the list does not exist", async () => {
    const res = await request(app)
      .put("/api/lists/list_doesnotexist/books")
      .send({ bookId: SEEDED_BOOK_ID, action: "add" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });

  it("returns 404 when adding a non-existent book", async () => {
    const listId = await createList();

    const res = await request(app)
      .put(`/api/lists/${listId}/books`)
      .send({ bookId: "book_doesnotexist", action: "add" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });

  it("returns 400 for an invalid action", async () => {
    const listId = await createList();

    const res = await request(app)
      .put(`/api/lists/${listId}/books`)
      .send({ bookId: SEEDED_BOOK_ID, action: "explode" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/action/i);
  });
});

// ─── DELETE /api/lists/:id ───────────────────────────────────────────────────
describe("DELETE /api/lists/:id", () => {
  it("deletes the list and returns a success status", async () => {
    const createRes = await request(app)
      .post("/api/lists")
      .send({ name: "Doomed", description: "to be deleted" });
    const listId = createRes.body.data.id;

    const res = await request(app).delete(`/api/lists/${listId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 when deleting a non-existent id", async () => {
    const res = await request(app).delete("/api/lists/list_doesnotexist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });

  it("removes the list from subsequent GET /api/lists", async () => {
    const createRes = await request(app)
      .post("/api/lists")
      .send({ name: "Temporary", description: "gone soon" });
    const listId = createRes.body.data.id;

    await request(app).delete(`/api/lists/${listId}`);

    const listRes = await request(app).get("/api/lists");
    const ids = listRes.body.data.map((l: any) => l.id);
    expect(ids).not.toContain(listId);

    const getRes = await request(app).get(`/api/lists/${listId}`);
    expect(getRes.status).toBe(404);
  });
});
