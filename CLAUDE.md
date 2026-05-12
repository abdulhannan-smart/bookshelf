# BookShelf — AI Context File

BookShelf is a book catalogue REST API + React frontend built as a Node.js
monorepo. Users can browse books, search by title/author/genre, and add new
books. Think simplified Goodreads. Built across a 5-day intensive program.

---

## Tech Stack

- **Runtime:** Node.js 20+
- **API:** Express 4 + TypeScript (strict mode)
- **Frontend:** React 18 + Vite + Tailwind CSS (`apps/web/`)
- **Data store:** JSON files in `/data` — no database, intentional
- **Testing:** Jest + Supertest + ts-jest
- **Monorepo:** npm workspaces
- **Shared types:** `packages/shared/src/index.ts`

---

## Folder Structure

```
bookshelf/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── routes/         Route handlers — parse req, call service, send res
│   │       ├── services/       Business logic + input validation
│   │       ├── data/           JSON file access (ONLY place that reads/writes files)
│   │       └── middleware/     errorHandler, notFoundHandler
│   └── web/
│       └── src/
│           ├── components/     Reusable React components (BookCard, SearchBar)
│           ├── pages/          Page-level components (CataloguePage)
│           └── lib/            API client (api.ts)
├── packages/
│   └── shared/src/index.ts     Shared TypeScript types (Book, Shelf, Review)
└── data/
    ├── books.json              30 seeded books — do not delete
    ├── shelves.json            Empty — Day 3+
    └── reviews.json            Empty — Day 4+
```

---

## API Response Shape

Every single endpoint returns this shape — no exceptions:

```json
// Success
{
  "success": true,
  "data": <payload>,
  "count": <number>
}

// Error
{
  "success": false,
  "error": "<human readable message>",
  "statusCode": <http status code>
}
```

Example real response from GET /api/books/book_001:
```json
{
  "success": true,
  "data": {
    "id": "book_001",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "genre": "Technology",
    "year": 2008,
    "isbn": "978-0132350884",
    "description": "...",
    "coverUrl": null,
    "addedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## ID Format

- Books:   `book_`   + 8 hex chars — e.g. `book_a1b2c3d4`
- Shelves: `shelf_`  + 8 hex chars — e.g. `shelf_a1b2c3d4`
- Reviews: `review_` + 8 hex chars — e.g. `review_a1b2c3d4`

IDs are generated with uuid v4, sliced to 8 chars, prefixed.

---

## Data Layer Rules

- ALL file reads and writes go through `apps/api/src/data/`
- `jsonStore.ts` — the only file that calls `fs.readFile` / `fs.writeFile`
- `booksRepository.ts` — all CRUD operations for books
- Routes and services NEVER access JSON files directly
- No concurrency handling on writes — this is intentional, do not add it
- Pattern: read full array → mutate → write full array back

---

## Validation Rules (enforced in services, not routes)

POST /api/books requires:
- `title`  — string, required, max 200 characters
- `author` — string, required
- `genre`  — string, required, one of: Technology | Fiction | Science | History | Self-Help
- `year`   — number, required, between 1000 and current year
- `isbn`   — string, required

Validation lives in `services/booksService.ts`.
Routes never validate — they just call the service and handle errors.

---

## Current Endpoints (Day 1 + Day 2 complete)

```
GET    /api/health                     Health check
GET    /api/books                      List all books
GET    /api/books/:id                  Get single book
GET    /api/books/search?q=            Search title, author, genre
POST   /api/books                      Add a new book
```

Note: /search is declared BEFORE /:id in the router — this is intentional.
If /:id comes first, Express treats "search" as a book id and returns 404.

## Planned Endpoints (Day 3+)

```
PUT    /api/books/:id
DELETE /api/books/:id
GET    /api/shelves
POST   /api/shelves
POST   /api/shelves/:id/books
DELETE /api/shelves/:id/books/:bookId
GET    /api/books/:id/reviews
POST   /api/books/:id/reviews
```

---

## Testing Conventions

- Framework: Jest + Supertest
- Pattern: AAA — Arrange, Act, Assert
- Integration tests: import `app` from `src/app.ts`, fire requests via Supertest
- No live server needed — Supertest handles it
- Unit tests: call repository/service functions directly, skip HTTP layer
- `books.json` is snapshotted in `beforeAll` and restored in `afterAll`
- Tests never permanently change seed data
- Run from repo root: `npm run test`
- Coverage: `npm run test:coverage --workspace=apps/api`

Example test pattern to follow:
```ts
it("returns 400 when title is missing", async () => {
  // Arrange
  const { title, ...noTitle } = validBook;

  // Act
  const res = await request(app).post("/api/books").send(noTitle);

  // Assert
  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
  expect(res.body.error).toMatch(/title/i);
});
```

---

## Frontend Conventions

- Framework: React 18 + Vite + Tailwind CSS
- API calls go through `src/lib/api.ts` — never fetch directly from components
- Use `import type` for TypeScript interfaces from api.ts (Vite requirement)
- Colour palette: cream (background), brown (text), forest green (focus/accent)
- Responsive grid: 1 col mobile → 2 col tablet → 3 col desktop
- Components go in `src/components/`, pages go in `src/pages/`

---

## What NOT To Do

- Do NOT add a real database — JSON files are intentional for this project
- Do NOT read or write JSON files from routes or services directly
- Do NOT use `any` in TypeScript — use `unknown` and narrow the type
- Do NOT use `console.log` — remove all debug output before committing
- Do NOT add npm dependencies without a clear reason
- Do NOT modify `packages/shared` types without updating both apps
- Do NOT add concurrency handling to the JSON store — out of scope
- Do NOT put validation logic in route handlers — it belongs in services
- Do NOT declare /:id before /search in the router — search will break

---

## Known Limitations

- No authentication — all endpoints are public
- No pagination — GET /api/books returns all books every time
- No concurrency handling on JSON writes — last write wins
- coverUrl is always null — no image upload support
- No environment config yet — port 3001 is hardcoded in index.ts