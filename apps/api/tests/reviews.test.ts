import request from "supertest";
import fs from "fs/promises";
import path from "path";
import app from "../src/app";

const DATA_DIR = path.resolve(__dirname, "../../../data");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");

let originalReviews: string;

beforeAll(async () => {
  // Snapshot reviews.json so tests can't corrupt seed/dev data
  originalReviews = await fs.readFile(REVIEWS_FILE, "utf-8");
});

beforeEach(async () => {
  // Restore between tests so each one is order-independent
  await fs.writeFile(REVIEWS_FILE, originalReviews, "utf-8");
});

afterAll(async () => {
  await fs.writeFile(REVIEWS_FILE, originalReviews, "utf-8");
});

// Helper: POST a review to a book. Sequential calls only — the JSON store
// has no concurrency handling (CLAUDE.md), so do NOT Promise.all these.
const postReview = (bookId: string, rating: number) =>
  request(app)
    .post(`/api/books/${bookId}/reviews`)
    .send({ reviewer: "tester", rating, body: "x" });

// ─── GET /api/books/:id/ratings ──────────────────────────────────────────────
describe("GET /api/books/:id/ratings", () => {
  // Scenario 7
  it("returns 200 with success: true on a valid request", async () => {
    // Arrange — book_002 has a seeded review

    // Act
    const res = await request(app).get("/api/books/book_002/ratings");

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  // Scenario 2
  it("returns correct stats for a book with a single review", async () => {
    // Arrange — book_002 has one seeded review with rating 4

    // Act
    const res = await request(app).get("/api/books/book_002/ratings");

    // Assert
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.average).toBe(4);
    expect(res.body.data.breakdown).toEqual({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 });
  });

  // Scenario 1
  it("returns the correct average across multiple reviews", async () => {
    // Arrange — three reviews on a book with no seed reviews
    await postReview("book_011", 5);
    await postReview("book_011", 3);
    await postReview("book_011", 2);

    // Act
    const res = await request(app).get("/api/books/book_011/ratings");

    // Assert — (5 + 3 + 2) / 3 = 3.333… → 3.33
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.average).toBe(3.33);
    expect(res.body.data.breakdown).toEqual({ 1: 0, 2: 1, 3: 1, 4: 0, 5: 1 });
  });

  // Scenario 3
  it("returns null average and empty breakdown for a book with no reviews", async () => {
    // Arrange — book_010 has no reviews in the seed

    // Act
    const res = await request(app).get("/api/books/book_010/ratings");

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(0);
    expect(res.body.data.average).toBeNull();
    expect(res.body.data.breakdown).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  // Scenario 4
  it("returns 404 with the documented error envelope when the book does not exist", async () => {
    // Arrange — an id that cannot match any seeded book

    // Act
    const res = await request(app).get("/api/books/does_not_exist/ratings");

    // Assert
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
    expect(res.body.statusCode).toBe(404);
  });

  // Scenario 5
  it("counts each rating value 1-5 in the breakdown, including zero buckets", async () => {
    // Arrange — varied multiplicities; rating 4 deliberately omitted to
    // verify a zero bucket is still present in the response
    await postReview("book_012", 1);
    await postReview("book_012", 1);
    await postReview("book_012", 2);
    await postReview("book_012", 2);
    await postReview("book_012", 2);
    await postReview("book_012", 3);
    await postReview("book_012", 5);
    await postReview("book_012", 5);
    await postReview("book_012", 5);
    await postReview("book_012", 5);

    // Act
    const res = await request(app).get("/api/books/book_012/ratings");

    // Assert
    expect(res.body.data.total).toBe(10);
    expect(res.body.data.breakdown).toEqual({ 1: 2, 2: 3, 3: 1, 4: 0, 5: 4 });
  });

  // Scenario 6
  it("rounds the average to 2 decimal places (both round-down and round-up)", async () => {
    // Arrange/Act — round-DOWN case: (1 + 1 + 2) / 3 = 1.333… → 1.33
    await postReview("book_013", 1);
    await postReview("book_013", 1);
    await postReview("book_013", 2);
    const roundDown = await request(app).get("/api/books/book_013/ratings");

    // Arrange/Act — round-UP case: (4 + 5 + 5) / 3 = 4.666… → 4.67
    await postReview("book_014", 4);
    await postReview("book_014", 5);
    await postReview("book_014", 5);
    const roundUp = await request(app).get("/api/books/book_014/ratings");

    // Assert
    expect(roundDown.body.data.average).toBe(1.33);
    expect(roundUp.body.data.average).toBe(4.67);
  });

  // Regression: previously rotted defensive guard meant breakdown and average
  // could disagree. Lock the all-same-rating case so a future refactor can't
  // re-introduce the bug.
  it("handles all reviews having the same rating", async () => {
    // Arrange
    await postReview("book_015", 5);
    await postReview("book_015", 5);
    await postReview("book_015", 5);

    // Act
    const res = await request(app).get("/api/books/book_015/ratings");

    // Assert
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.average).toBe(5);
    expect(res.body.data.breakdown).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 3 });
  });

  // Contract: ratings is an aggregate endpoint, not a list — CLAUDE.md says
  // `count` only appears on list/search responses.
  it("does not include 'count' on the response", async () => {
    // Arrange

    // Act
    const res = await request(app).get("/api/books/book_002/ratings");

    // Assert
    expect(res.body.count).toBeUndefined();
  });
});
