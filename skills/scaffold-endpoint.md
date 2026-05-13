---
name: scaffold-endpoint
description: Add a new REST endpoint to apps/api following the BookShelf routes → services → repository pattern, with matching Supertest integration tests.
---

# scaffold-endpoint

How to add a new REST endpoint to `apps/api`. Follow this exact order — the pattern is load-bearing.

---

## When to use

Trigger this skill when the user asks for any of:

- "add a `<METHOD> /api/<resource>/...` endpoint"
- "implement the `PUT /api/books/:id` endpoint" (or any of the planned endpoints in `CLAUDE.md`)
- "wire up shelves / reviews"
- any request that maps to a new row in `CLAUDE.md`'s **Current** or **Planned Endpoints** tables

Do NOT trigger for:
- frontend-only changes (use `apps/web/src/lib/api.ts`)
- modifications to existing endpoints that don't add a new route
- direct edits to `data/*.json` — that's a data migration, not an endpoint

---

## File order (do not reorder)

For a new resource `widget` exposing `GET /api/widgets/:id`:

1. **`packages/shared/src/index.ts`** — add `Widget`, `CreateWidgetInput`, `UpdateWidgetInput` types. Both apps must still typecheck after.
2. **`data/widgets.json`** — create with `[]` (or seed data if the task asks).
3. **`apps/api/src/data/widgetsRepository.ts`** — wraps `readJson` / `writeJson`. ONLY file that touches `widgets.json`.
4. **`apps/api/src/services/widgetsService.ts`** — business logic + validation. Throws `AppError` via `createHttpError`.
5. **`apps/api/src/routes/widgets.ts`** — thin handlers: parse → call service → respond → `next(err)`.
6. **`apps/api/src/app.ts`** — `app.use("/api/widgets", widgetsRouter)`.
7. **`apps/api/tests/widgets.test.ts`** — Supertest integration tests with snapshot/restore.
8. **`CLAUDE.md`** — move the new endpoint row from **Planned** to **Current**.

If the resource already exists, skip 1–3 and add the new handler/service function to the existing files.

---

## Response shape

Every endpoint returns one of these — no exceptions. The error shape is produced by `errorHandler` middleware automatically when you throw; never construct it by hand.

```json
// Success — list / search endpoints (include count)
{ "success": true, "data": [...], "count": 30 }

// Success — single resource
{ "success": true, "data": { "id": "book_a1b2c3d4", ... } }

// Error — produced by errorHandler middleware
{ "success": false, "error": "Book with id 'xyz' not found", "statusCode": 404 }
```

Status codes:
- `GET` / `DELETE` / `PUT` success → `200` (Express default)
- `POST` success → `201` (must set explicitly: `res.status(201).json(...)`)
- validation failure → `400`
- not found → `404`
- anything thrown without a `statusCode` → `500` (message masked to "Internal Server Error" by `errorHandler`)

---

## Error handling pattern

Always throw from the service. The route's only job on failure is `next(err)`.

Copy this helper into every service file — it's the same signature in `apps/api/src/services/booksService.ts`:

```ts
import { AppError } from "../middleware/errorHandler";

function createHttpError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}
```

Real 404 example — `findBook` in `apps/api/src/services/booksService.ts`:

```ts
export async function findBook(id: string): Promise<Book> {
  const book = await repo.getBookById(id);
  if (!book) {
    throw createHttpError(`Book with id '${id}' not found`, 404);
  }
  return book;
}
```

Real validation example — `addBook` in the same file. One guard per field, each throws a 400 whose message names the field so tests can `match(/title/i)`:

```ts
if (!title?.trim()) {
  throw createHttpError("'title' is required", 400);
}
if (title.trim().length > 200) {
  throw createHttpError("'title' must be 200 characters or fewer", 400);
}
if (!year || typeof year !== "number") {
  throw createHttpError("'year' must be a number", 400);
}
if (year < 1000 || year > CURRENT_YEAR) {
  throw createHttpError(`'year' must be between 1000 and ${CURRENT_YEAR}`, 400);
}
```

The route stays a 5-line try/catch — no validation, no error shaping:

```ts
router.post("/", async (req, res, next) => {
  try {
    const input = req.body as CreateBookInput;
    const book = await booksService.addBook(input);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
});
```

---

## Testing requirements

Every new endpoint needs a `describe` block in `apps/api/tests/<resource>.test.ts`. Use Supertest against the imported `app` — never boot a server.

Required boilerplate at the top of any test file that mutates a JSON data file:

```ts
import request from "supertest";
import fs from "fs/promises";
import path from "path";
import app from "../src/app";

const DATA_DIR = path.resolve(__dirname, "../../../data");
const FILE = path.join(DATA_DIR, "widgets.json");

let original: string;

beforeAll(async () => {
  original = await fs.readFile(FILE, "utf-8");
});

afterAll(async () => {
  await fs.writeFile(FILE, original, "utf-8");
});
```

For each new endpoint, write at minimum:

- **happy path** — correct status, `success: true`, expected shape of `data`. List endpoints assert `body.count === body.data.length`.
- **404 path** — for any route with `:id`, assert `status === 404`, `success === false`, `error` regex-matches `/not found/i`, `statusCode === 404`.
- **400 path per validator** — one test per `createHttpError(..., 400)` call in the service. Each assertion regex-matches the field name.
- **persistence check** — for `POST` / `PUT` / `DELETE`, follow up with a `GET` proving the mutation stuck (or the resource is gone).
- **case-insensitivity** — if the endpoint searches/filters, prove lower- and upper-case queries return the same count.

Run from repo root: `npm run test`. Coverage: `npm run test:coverage --workspace=apps/api`.

---

## Constraints — do NOT

- Do NOT validate in the route handler. Validation belongs in the service.
- Do NOT call `fs.readFile` / `fs.writeFile` or `readJson` / `writeJson` outside `apps/api/src/data/`.
- Do NOT construct error response bodies manually. Throw, and let `errorHandler` shape the response.
- Do NOT register `/:id` before a more specific literal route on the same router. See the `/search` GOTCHA in `CLAUDE.md`.
- Do NOT use `any`. Use `unknown` and narrow, or type the body as `CreateXInput` from `@bookshelf/shared`.
- Do NOT mutate seed data without snapshotting in `beforeAll` / restoring in `afterAll`.
- Do NOT add new npm dependencies. Express + Supertest + Jest + uuid is the toolbox.
- Do NOT leave `console.log`. `errorHandler` is the only place `console.error` is permitted.
- Do NOT add pagination, auth, or env config — out of scope per **Known Limitations** in `CLAUDE.md`.

---

## Complete example — the books endpoint

This is the reference. Mirror it exactly for new resources.

**Shared types** (`packages/shared/src/index.ts`):

```ts
export interface Book {
  id: string;
  title: string;
  author: string;
  genre: Genre;
  year: number;
  isbn: string;
  description: string;
  coverUrl: string | null;
  addedAt: string;
}
export type CreateBookInput = Omit<Book, "id" | "addedAt">;
```

**Repository** (`apps/api/src/data/booksRepository.ts`) — owns all I/O for `books.json`. ID format is `<prefix>_<8 hex>`:

```ts
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
  if (index === -1) return undefined;
  const [deletedBook] = books.splice(index, 1);
  await writeJson(FILE, books);
  return deletedBook;
}
```

For other resources use the `shelf_` / `review_` prefix and an `xxxs.json` file. Write pattern is always: read full array → mutate in memory → write full array back.

**Service** (`apps/api/src/services/booksService.ts`) — validation + business logic, throws `AppError`:

```ts
import { Book, CreateBookInput } from "@bookshelf/shared";
import * as repo from "../data/booksRepository";
import { AppError } from "../middleware/errorHandler";

const CURRENT_YEAR = new Date().getFullYear();

function createHttpError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}

export async function findBook(id: string): Promise<Book> {
  const book = await repo.getBookById(id);
  if (!book) throw createHttpError(`Book with id '${id}' not found`, 404);
  return book;
}

export async function addBook(input: CreateBookInput): Promise<Book> {
  const { title, author, genre, year, isbn } = input;
  if (!title?.trim()) throw createHttpError("'title' is required", 400);
  if (title.trim().length > 200) throw createHttpError("'title' must be 200 characters or fewer", 400);
  if (!author?.trim()) throw createHttpError("'author' is required", 400);
  if (!genre?.trim()) throw createHttpError("'genre' is required", 400);
  if (!year || typeof year !== "number") throw createHttpError("'year' must be a number", 400);
  if (year < 1000 || year > CURRENT_YEAR) {
    throw createHttpError(`'year' must be between 1000 and ${CURRENT_YEAR}`, 400);
  }
  if (!isbn?.trim()) throw createHttpError("'isbn' is required", 400);
  return repo.createBook(input);
}

export async function deleteBook(id: string): Promise<Book> {
  const deletedBook = await repo.deleteBook(id);
  if (!deletedBook) throw createHttpError(`Book with id '${id}' not found`, 404);
  return deletedBook;
}
```

**Router** (`apps/api/src/routes/books.ts`) — specific routes before parameterised ones:

```ts
import { Router, Request, Response, NextFunction } from "express";
import * as booksService from "../services/booksService";
import { CreateBookInput } from "@bookshelf/shared";

const router = Router();

// /search MUST be declared before /:id
router.get("/search", async (req, res, next) => {
  try {
    const q = req.query.q as string;
    const results = await booksService.searchBooks(q);
    res.json({ success: true, data: results, count: results.length });
  } catch (err) { next(err); }
});

router.get("/", async (_req, res, next) => {
  try {
    const books = await booksService.listBooks();
    res.json({ success: true, data: books, count: books.length });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const book = await booksService.findBook(req.params.id);
    res.json({ success: true, data: book });
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const input = req.body as CreateBookInput;
    const book = await booksService.addBook(input);
    res.status(201).json({ success: true, data: book });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deletedBook = await booksService.deleteBook(req.params.id);
    res.json({ success: true, data: deletedBook });
  } catch (err) { next(err); }
});

export default router;
```

**App registration** (`apps/api/src/app.ts`):

```ts
app.use("/api/books", booksRouter);
```

**Tests** (`apps/api/tests/books.test.ts`) — one `describe` per endpoint, AAA, snapshot/restore at the file scope:

```ts
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
    expect(res.body.data.id).toMatch(/^book_/);
    expect(typeof res.body.data.addedAt).toBe("string");
  });

  it("returns 400 when title is missing", async () => {
    const { title, ...noTitle } = validBook;
    const res = await request(app).post("/api/books").send(noTitle);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it("persists the new book so GET /api/books/:id finds it", async () => {
    const createRes = await request(app).post("/api/books").send(validBook);
    const getRes = await request(app).get(`/api/books/${createRes.body.data.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(createRes.body.data.id);
  });
});
```

---

## Done checklist

Before reporting the endpoint as complete:

- [ ] Types added to `packages/shared/src/index.ts`; both apps still typecheck
- [ ] `<resource>.json` exists in `/data` (only if a new resource)
- [ ] Repository wraps `jsonStore` — no `fs.*` calls anywhere else
- [ ] Service throws via `createHttpError`, never returns error objects
- [ ] Route handler is a 5-line try/catch ending in `next(err)`
- [ ] Router mounted in `app.ts` under `/api/<resource>`
- [ ] `/search` (or any literal route) declared before `/:id`
- [ ] Tests cover happy path, every 400 validator, 404 if applicable, and a persistence check
- [ ] `npm run test` is green from the repo root
- [ ] No `console.log`, no `any`, no new dependencies
- [ ] `CLAUDE.md` endpoint table updated
