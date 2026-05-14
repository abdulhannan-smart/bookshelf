# BookShelf — Developer Onboarding

Get the project running locally. For architecture and conventions see [CLAUDE.md](CLAUDE.md).

## 1. Prerequisites

- **Node.js**: `>=20.0.0` (enforced in root [package.json](package.json) `engines`)
- **npm**: `>=10` (ships with Node 20)
- **Git**; macOS, Linux, or WSL2 (native Windows shells untested)

Check: `node -v && npm -v`.

## 2. Installation

```bash
git clone <repo-url> bookshelf
cd bookshelf
npm install        # installs root + workspaces (apps/api, apps/web, packages/shared)
```

Install hoists `node_modules` to the repo root. Do not `npm install` inside individual workspaces.

## 3. Running the project

Two processes, two ports.

```bash
npm run dev        # Terminal 1 — API  → http://localhost:3001
npm run dev:web    # Terminal 2 — Web  → http://localhost:3000
# or single terminal:
npm run dev:all
```

**Success looks like:**
- API logs `🚀  BookShelf API running at http://localhost:3001`
- `curl http://localhost:3001/api/health` returns `{"success":true,"data":{"status":"ok"...}}`
- Browser at `http://localhost:3000` renders the book catalogue (30 seeded books).

## 4. Project structure

- [apps/api/](apps/api/) — Express + TypeScript REST API. Entry: [apps/api/src/index.ts](apps/api/src/index.ts).
- [apps/web/](apps/web/) — React + Vite + Tailwind frontend.
- [packages/shared/](packages/shared/) — TypeScript types shared by both apps.
- [data/](data/) — JSON file data store (`books.json`, `reviews.json`, `shelves.json`). The "database".
- [apps/api/tests/](apps/api/tests/) — Jest + Supertest integration tests.
- [apps/api/mcp-server.ts](apps/api/mcp-server.ts) — standalone MCP dev tool; not part of the API runtime.

## 5. Available scripts

Run from repo root unless noted.

| Command                              | What it does                                          |
| ------------------------------------ | ----------------------------------------------------- |
| `npm run dev`                        | Start API on `:3001` with ts-node-dev hot reload      |
| `npm run dev:web`                    | Start web on `:3000` with Vite HMR                    |
| `npm run dev:all`                    | Both of the above via `concurrently`                  |
| `npm run build`                      | Build `packages/shared` then `apps/api` (tsc → dist/) |
| `npm run test`                       | Jest test suite for `apps/api`                        |
| `npm run build --workspace=apps/web` | Production build of the frontend                      |
| `npm run lint --workspace=apps/api`  | ESLint over `src/` and `tests/`                       |
| `npm run start --workspace=apps/api` | Run compiled API from `apps/api/dist/`                |

## 6. Running tests

```bash
npm run test                                       # one-shot
npm run test:watch --workspace=apps/api            # watch mode
npm run test:coverage --workspace=apps/api         # writes apps/api/coverage/
```

Tests snapshot `data/books.json` in `beforeAll` and restore in `afterAll`. The API does not need to be running — Supertest hits the in-memory `app`.

## 7. API quick reference

Base URL: `http://localhost:3001`.

- `GET    /api/health` — liveness probe
- `GET    /api/books` — list all books
- `GET    /api/books/search?q=<term>` — search title/author/genre (declared before `/:id`)
- `GET    /api/books/:id` — single book by `book_xxxxxxxx` id
- `POST   /api/books` — create book (title, author, genre, year, isbn)
- `DELETE /api/books/:id` — remove a book
- `GET    /api/books/:id/reviews` — reviews for a book
- `POST   /api/books/:id/reviews` — create review (reviewer, rating 1-5, body)

Response envelope: `{ success, data, count? }` or `{ success: false, error, statusCode }`.

## 8. Environment

- **API port**: `3001`. Override with `PORT=4001 npm run dev`.
- **Web port**: `3000`, hardcoded in [apps/web/package.json](apps/web/package.json) (`vite --port 3000`).
- **CORS**: API allows all origins (dev only). No `.env` required. No secrets. No DB.
- Frontend assumes API at `http://localhost:3001` — see [apps/web/src/lib/api.ts](apps/web/src/lib/api.ts).

## 9. Common errors

1. **`EADDRINUSE :3001` (or `:3000`)** — port in use. Kill: `lsof -ti:3001 | xargs kill -9`.
2. **`Cannot find module '@bookshelf/shared'`** — workspace symlinks missing. Re-run `npm install` at repo root.
3. **`engine "node" is incompatible`** — Node <20. Fix: `nvm install 20 && nvm use 20`.
4. **Tests mutated `data/books.json`** — a test crashed before `afterAll`. Restore: `git checkout data/books.json`.
5. **Web shows `Failed to fetch` / CORS error** — API isn't running. Start `npm run dev` in a second terminal.

## 10. Adding a new endpoint

Touch these files in order:

1. [packages/shared/src/index.ts](packages/shared/src/index.ts) — add/extend types if the payload shape is new.
2. [apps/api/src/data/](apps/api/src/data/) — add a repository method (only place that touches `fs`).
3. [apps/api/src/services/](apps/api/src/services/) — business logic **and input validation**.
4. [apps/api/src/routes/](apps/api/src/routes/) — parse req, call service, send response. No validation.
5. [apps/api/src/app.ts](apps/api/src/app.ts) — mount the router if it's a new one.
6. [apps/api/tests/](apps/api/tests/) — add Supertest integration tests (AAA pattern).
7. [apps/web/src/lib/api.ts](apps/web/src/lib/api.ts) — add the client method if the frontend will call it.

Gotcha: static paths (e.g. `/search`) must be declared before dynamic ones (`/:id`) in the same router.
