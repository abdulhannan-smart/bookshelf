API responses use `{ success: true, data, count? }` on success and `{ success: false, error, statusCode }` on error — never invent another shape.
Validation belongs in `apps/api/src/services/*.ts`, never in routes; routes are a thin try/catch that ends in `next(err)`.
Throw errors with a `statusCode` property via a `createHttpError(message, status)` helper; the `errorHandler` middleware renders the response.
Only `apps/api/src/data/*.ts` may touch `fs`; routes and services go through a repository, never `fs` directly.
JSON files in `/data` are the data store — do not add a database, ORM, or migration framework.
Do not add npm dependencies without a clear reason; prefer hand-rolled solutions when small.
In `apps/web`, use `import type` for interfaces from `src/lib/api.ts` — Vite + `verbatimModuleSyntax` requires it.
All frontend API calls go through `apps/web/src/lib/api.ts`; never `fetch` directly from a component.
Never use `any`; use `unknown` and narrow.
No `console.log` in committed code; the only `console.error` allowed is inside `errorHandler`.
In Express routers, declare literal paths like `/search` before parameterised paths like `/:id`, or the parameter wins.
