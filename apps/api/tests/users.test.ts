import request from "supertest";
import fs from "fs/promises";
import path from "path";
import app from "../src/app";

const DATA_DIR = path.resolve(__dirname, "../../../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const LISTS_FILE = path.join(DATA_DIR, "lists.json");

const SEEDED_BOOK_ID = "book_001";

let originalUsers: string;
let originalReviews: string;
let originalLists: string;

beforeAll(async () => {
  originalUsers = await fs.readFile(USERS_FILE, "utf-8");
  originalReviews = await fs.readFile(REVIEWS_FILE, "utf-8");
  originalLists = await fs.readFile(LISTS_FILE, "utf-8");
});

afterAll(async () => {
  await fs.writeFile(USERS_FILE, originalUsers, "utf-8");
  await fs.writeFile(REVIEWS_FILE, originalReviews, "utf-8");
  await fs.writeFile(LISTS_FILE, originalLists, "utf-8");
});

beforeEach(async () => {
  // Each test starts from empty state so counts/filters are deterministic.
  await fs.writeFile(USERS_FILE, "[]", "utf-8");
  await fs.writeFile(REVIEWS_FILE, "[]", "utf-8");
  await fs.writeFile(LISTS_FILE, "[]", "utf-8");
});

// ─── POST /api/users ─────────────────────────────────────────────────────────
describe("POST /api/users", () => {
  const validUser = {
    displayName: "Ada Lovelace",
    avatarUrl: null,
    favouriteGenres: ["Science", "Technology"],
  };

  it("creates a new user and returns 201", async () => {
    const res = await request(app).post("/api/users").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.displayName).toBe(validUser.displayName);
    expect(res.body.data.id).toMatch(/^user_/);
    expect(res.body.data.avatarUrl).toBeNull();
    expect(res.body.data.favouriteGenres).toEqual(validUser.favouriteGenres);
    expect(typeof res.body.data.createdAt).toBe("string");
  });

  it("persists the new user so it appears in GET /api/users/:id", async () => {
    const createRes = await request(app).post("/api/users").send(validUser);
    const newId = createRes.body.data.id;

    const getRes = await request(app).get(`/api/users/${newId}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(newId);
    expect(getRes.body.data.displayName).toBe(validUser.displayName);
  });

  it("returns 400 when displayName is missing", async () => {
    const { displayName, ...noName } = validUser;

    const res = await request(app).post("/api/users").send(noName);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/displayName/i);
  });

  it("returns 400 when displayName exceeds 100 characters", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ ...validUser, displayName: "A".repeat(101) });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/100/);
  });

  it("returns 400 when favouriteGenres contains an invalid genre", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ ...validUser, favouriteGenres: ["Romance"] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/favouriteGenres/i);
  });

  it("returns 400 when avatarUrl is neither string nor null", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ ...validUser, avatarUrl: 123 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/avatarUrl/i);
  });

  it("defaults favouriteGenres to an empty array when omitted", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ displayName: "Minimal User" });

    expect(res.status).toBe(201);
    expect(res.body.data.favouriteGenres).toEqual([]);
    expect(res.body.data.avatarUrl).toBeNull();
  });
});

// ─── GET /api/users/:id ──────────────────────────────────────────────────────
describe("GET /api/users/:id", () => {
  it("returns the user when the id exists", async () => {
    const createRes = await request(app)
      .post("/api/users")
      .send({ displayName: "Grace Hopper" });
    const newId = createRes.body.data.id;

    const res = await request(app).get(`/api/users/${newId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(newId);
    expect(res.body.data.displayName).toBe("Grace Hopper");
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/users/user_doesnotexist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });
});

// ─── PUT /api/users/:id ──────────────────────────────────────────────────────
describe("PUT /api/users/:id", () => {
  async function createUser(displayName = "Alan Turing") {
    const res = await request(app).post("/api/users").send({ displayName });
    return res.body.data.id as string;
  }

  it("updates the displayName", async () => {
    const userId = await createUser();

    const res = await request(app)
      .put(`/api/users/${userId}`)
      .send({ displayName: "Alan M. Turing" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.displayName).toBe("Alan M. Turing");

    const getRes = await request(app).get(`/api/users/${userId}`);
    expect(getRes.body.data.displayName).toBe("Alan M. Turing");
  });

  it("updates favouriteGenres without touching other fields", async () => {
    const userId = await createUser();

    const res = await request(app)
      .put(`/api/users/${userId}`)
      .send({ favouriteGenres: ["History"] });

    expect(res.status).toBe(200);
    expect(res.body.data.favouriteGenres).toEqual(["History"]);
    expect(res.body.data.displayName).toBe("Alan Turing");
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app)
      .put("/api/users/user_doesnotexist")
      .send({ displayName: "Ghost" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });

  it("returns 400 when favouriteGenres contains an invalid genre", async () => {
    const userId = await createUser();

    const res = await request(app)
      .put(`/api/users/${userId}`)
      .send({ favouriteGenres: ["Romance"] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/favouriteGenres/i);
  });

  it("returns 400 when displayName exceeds 100 characters", async () => {
    const userId = await createUser();

    const res = await request(app)
      .put(`/api/users/${userId}`)
      .send({ displayName: "A".repeat(101) });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/100/);
  });
});

// ─── GET /api/users/:id/activity ─────────────────────────────────────────────
describe("GET /api/users/:id/activity", () => {
  async function createUser(displayName = "Active User") {
    const res = await request(app).post("/api/users").send({ displayName });
    return res.body.data.id as string;
  }

  it("returns empty arrays when the user has no activity", async () => {
    const userId = await createUser();

    const res = await request(app).get(`/api/users/${userId}/activity`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reviews).toEqual([]);
    expect(res.body.data.listUpdates).toEqual([]);
  });

  it("returns reviews authored by this user", async () => {
    const userId = await createUser();

    await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send({
        reviewer: "Active User",
        rating: 5,
        body: "A foundational read.",
        userId,
      });

    const res = await request(app).get(`/api/users/${userId}/activity`);

    expect(res.status).toBe(200);
    expect(res.body.data.reviews).toHaveLength(1);
    expect(res.body.data.reviews[0].userId).toBe(userId);
    expect(res.body.data.reviews[0].bookId).toBe(SEEDED_BOOK_ID);
    expect(res.body.data.reviews[0].rating).toBe(5);
    expect(res.body.data.listUpdates).toEqual([]);
  });

  it("returns reading lists created by this user", async () => {
    const userId = await createUser();

    await request(app)
      .post("/api/lists")
      .send({
        name: "My Shelf",
        description: "Stuff I am reading",
        userId,
      });

    const res = await request(app).get(`/api/users/${userId}/activity`);

    expect(res.status).toBe(200);
    expect(res.body.data.listUpdates).toHaveLength(1);
    expect(res.body.data.listUpdates[0].userId).toBe(userId);
    expect(res.body.data.listUpdates[0].name).toBe("My Shelf");
    expect(res.body.data.reviews).toEqual([]);
  });

  it("excludes reviews and lists belonging to other users", async () => {
    const userId = await createUser("Mine");
    const otherId = await createUser("Other");

    // Mine: 1 review + 1 list
    await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send({ reviewer: "Mine", rating: 4, body: "ok", userId });
    await request(app)
      .post("/api/lists")
      .send({ name: "Mine", description: "x", userId });

    // Other: 2 reviews + 2 lists — must not appear in mine's activity
    await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send({ reviewer: "Other", rating: 3, body: "y", userId: otherId });
    await request(app)
      .post(`/api/books/${SEEDED_BOOK_ID}/reviews`)
      .send({ reviewer: "Other", rating: 2, body: "z", userId: otherId });
    await request(app)
      .post("/api/lists")
      .send({ name: "Other A", description: "a", userId: otherId });
    await request(app)
      .post("/api/lists")
      .send({ name: "Other B", description: "b", userId: otherId });

    const res = await request(app).get(`/api/users/${userId}/activity`);

    expect(res.body.data.reviews).toHaveLength(1);
    expect(res.body.data.reviews[0].userId).toBe(userId);
    expect(res.body.data.listUpdates).toHaveLength(1);
    expect(res.body.data.listUpdates[0].userId).toBe(userId);
  });

  it("returns 404 when the user does not exist", async () => {
    const res = await request(app).get(
      "/api/users/user_doesnotexist/activity"
    );

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });
});
