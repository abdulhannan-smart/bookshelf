import request from "supertest";
import fs from "fs/promises";
import path from "path";
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

// ─── GET /api/books/search — by title ─────────────────────────────────────────
describe("GET /api/books/search — title matching", () => {
  it("returns books whose title contains the query (partial match)", async () => {
    const res = await request(app).get("/api/books/search?q=clean");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(
      res.body.data.some((b: any) => b.title.toLowerCase().includes("clean"))
    ).toBe(true);
  });

  it("matches titles case-insensitively (uppercase query)", async () => {
    const res = await request(app).get("/api/books/search?q=CLEAN");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(
      res.body.data.some((b: any) => b.title.toLowerCase().includes("clean"))
    ).toBe(true);
  });

  it("matches titles case-insensitively (mixed case query)", async () => {
    const lower = await request(app).get("/api/books/search?q=dune");
    const mixed = await request(app).get("/api/books/search?q=DuNe");

    expect(lower.status).toBe(200);
    expect(mixed.status).toBe(200);
    expect(mixed.body.data.length).toBe(lower.body.data.length);
  });

  it("count matches data.length on a title search", async () => {
    const res = await request(app).get("/api/books/search?q=code");

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(res.body.data.length);
  });
});

// ─── GET /api/books/search — by author ────────────────────────────────────────
describe("GET /api/books/search — author matching", () => {
  it("returns books whose author contains the query (partial match)", async () => {
    const res = await request(app).get("/api/books/search?q=orwell");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(
      res.body.data.some((b: any) =>
        b.author.toLowerCase().includes("orwell")
      )
    ).toBe(true);
  });

  it("matches a partial last name", async () => {
    const res = await request(app).get("/api/books/search?q=hawking");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(
      res.body.data.some((b: any) =>
        b.author.toLowerCase().includes("hawking")
      )
    ).toBe(true);
  });

  it("author search is case-insensitive", async () => {
    const lower = await request(app).get("/api/books/search?q=martin");
    const upper = await request(app).get("/api/books/search?q=MARTIN");

    expect(lower.status).toBe(200);
    expect(upper.status).toBe(200);
    expect(upper.body.data.length).toBe(lower.body.data.length);
    expect(upper.body.data.length).toBeGreaterThan(0);
  });
});

// ─── GET /api/books/search — by genre ─────────────────────────────────────────
describe("GET /api/books/search — genre matching", () => {
  it("returns all books in the Fiction genre", async () => {
    const res = await request(app).get("/api/books/search?q=fiction");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((b: any) => {
      expect(b.genre.toLowerCase()).toBe("fiction");
    });
  });

  it("returns all books in the Technology genre", async () => {
    const res = await request(app).get("/api/books/search?q=technology");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((b: any) => {
      expect(b.genre.toLowerCase()).toBe("technology");
    });
  });

  it("returns all books in the Science genre", async () => {
    const res = await request(app).get("/api/books/search?q=science");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((b: any) => {
      expect(b.genre.toLowerCase()).toBe("science");
    });
  });

  it("genre search is case-insensitive", async () => {
    const lower = await request(app).get("/api/books/search?q=fiction");
    const upper = await request(app).get("/api/books/search?q=FICTION");

    expect(lower.status).toBe(200);
    expect(upper.status).toBe(200);
    expect(upper.body.data.length).toBe(lower.body.data.length);
  });
});

// ─── GET /api/books/search — no results ──────────────────────────────────────
describe("GET /api/books/search — no results", () => {
  it("returns 200 with an empty array (not 404) when nothing matches", async () => {
    const res = await request(app).get("/api/books/search?q=zzznomatchzzz");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  it("returns count: 0 alongside the empty array", async () => {
    const res = await request(app).get(
      "/api/books/search?q=qqqxxxnothingmatcheshere"
    );

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.data).toHaveLength(0);
  });
});

// ─── GET /api/books/search — missing / empty / whitespace query ──────────────
describe("GET /api/books/search — invalid query parameter", () => {
  it("returns 400 when q is missing entirely", async () => {
    const res = await request(app).get("/api/books/search");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/q/i);
    expect(res.body.statusCode).toBe(400);
  });

  it("returns 400 when q is present but empty", async () => {
    const res = await request(app).get("/api/books/search?q=");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/q/i);
    expect(res.body.statusCode).toBe(400);
  });

  it("returns 400 when q contains only spaces", async () => {
    const res = await request(app).get("/api/books/search?q=%20%20%20");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/q/i);
  });

  it("returns 400 when q contains only mixed whitespace (tabs, newlines)", async () => {
    const res = await request(app).get("/api/books/search?q=%09%0A%20");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/q/i);
  });
});

// ─── GET /api/books/search — special characters ──────────────────────────────
describe("GET /api/books/search — special characters", () => {
  it("does not crash on regex metacharacters", async () => {
    const res = await request(app).get(
      "/api/books/search?q=" + encodeURIComponent(".*+?^${}()|[]\\")
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("does not crash on SQL-injection-style payloads", async () => {
    const res = await request(app).get(
      "/api/books/search?q=" + encodeURIComponent("'; DROP TABLE books; --")
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("does not crash on HTML/script payloads", async () => {
    const res = await request(app).get(
      "/api/books/search?q=" + encodeURIComponent("<script>alert(1)</script>")
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("does not crash on unicode / emoji input", async () => {
    const res = await request(app).get(
      "/api/books/search?q=" + encodeURIComponent("📚漢字ñ")
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("matches a query containing punctuation that appears in the data", async () => {
    // 'You Don't Know JS' contains an apostrophe in the title
    const res = await request(app).get(
      "/api/books/search?q=" + encodeURIComponent("don't")
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});