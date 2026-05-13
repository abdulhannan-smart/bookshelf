import request from "supertest";
import fs from "fs/promises";
import path from "path";
import app from "../src/app";

const DATA_DIR = path.resolve(__dirname, "../../../data");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");

let originalReviews: string;

beforeAll(async () => {
  originalReviews = await fs.readFile(REVIEWS_FILE, "utf-8");
});

afterAll(async () => {
  await fs.writeFile(REVIEWS_FILE, originalReviews, "utf-8");
});

const SEEDED_BOOK_ID = "book_001";

const validReview = {
  reviewer: "Ada Lovelace",
  rating: 5,
  body: "Insightful and practical.",
};

// ─── GET /api/books/:id/reviews ─────────────────────────────────────────────
describe("GET /api/books/:id/reviews", () => {
  it("returns 200 with an empty array when the book exists but has no reviews", async () => {
    const res = await request(app).get(`/api/books/${SEEDED_BOOK_ID}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.count).toBe(0);
    expect(res.body.count).toBe(res.body.data.length);
  });

  it("returns 404 when the book does not exist", async () => {
    const res = await request(app).get("/api/books/book_doesnotexist/reviews");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
    expect(res.body.statusCode).toBe(404);
  });

  it("returns all reviews for the book after one is created", async () => {
    const createRes = await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send(validReview);

    expect(createRes.status).toBe(201);

    const listRes = await request(app).get(`/api/books/${SEEDED_BOOK_ID}/reviews`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.count).toBe(listRes.body.data.length);
    expect(listRes.body.data.some((r: { id: string }) => r.id === createRes.body.data.id)).toBe(
      true
    );
    expect(
      listRes.body.data.every((r: { bookId: string }) => r.bookId === SEEDED_BOOK_ID)
    ).toBe(true);
  });
});

// ─── POST /api/books/:id/reviews ──────────────────────────────────────────────
describe("POST /api/books/:id/reviews", () => {
  it("creates a review and returns 201", async () => {
    const res = await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send(validReview);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookId).toBe(SEEDED_BOOK_ID);
    expect(res.body.data.reviewer).toBe(validReview.reviewer);
    expect(res.body.data.rating).toBe(validReview.rating);
    expect(res.body.data.body).toBe(validReview.body);
    expect(res.body.data.id).toMatch(/^review_/);
    expect(typeof res.body.data.createdAt).toBe("string");
  });

  it("persists the review so GET /api/books/:id/reviews includes it", async () => {
    const payload = {
      reviewer: "Grace Hopper",
      rating: 4,
      body: "Solid overview.",
    };

    const createRes = await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send(payload);

    const newId: string = createRes.body.data.id;

    const listRes = await request(app).get(`/api/books/${SEEDED_BOOK_ID}/reviews`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((r: { id: string }) => r.id === newId)).toBe(true);
  });

  it("returns 404 when the book does not exist", async () => {
    const res = await request(app)
      .post("/api/books/book_doesnotexist/reviews")
      .send(validReview);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
    expect(res.body.statusCode).toBe(404);
  });

  it("returns 400 when reviewer is missing", async () => {
    const { reviewer, ...noReviewer } = validReview;
    const res = await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send(noReviewer);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/reviewer/i);
  });

  it("returns 400 when reviewer is only whitespace", async () => {
    const res = await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send({ ...validReview, reviewer: "   " });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/reviewer/i);
  });

  it("returns 400 when rating is missing", async () => {
    const { rating, ...noRating } = validReview;
    const res = await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send(noRating);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/rating/i);
  });

  it("returns 400 when rating is not a number", async () => {
    const res = await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send({ ...validReview, rating: "five" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/rating/i);
  });

  it("returns 400 when rating is not a whole number", async () => {
    const res = await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send({ ...validReview, rating: 3.5 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/rating/i);
  });

  it("returns 400 when rating is below 1", async () => {
    const res = await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send({ ...validReview, rating: 0 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/rating/i);
  });

  it("returns 400 when rating is above 5", async () => {
    const res = await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send({ ...validReview, rating: 6 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/rating/i);
  });

  it("returns 400 when body is missing", async () => {
    const { body, ...noBody } = validReview;
    const res = await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send(noBody);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/body/i);
  });

  it("returns 400 when body is only whitespace", async () => {
    const res = await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send({ ...validReview, body: "\t  " });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/body/i);
  });
});
