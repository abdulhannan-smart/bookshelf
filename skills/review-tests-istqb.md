---
name: review-tests-istqb
description: Review the BookShelf project's unit and integration tests against ISTQB Foundation Level standards. Identifies gaps in test design techniques, coverage, independence, and traceability — then proposes concrete additions or rewrites.
---

# review-tests-istqb

Audit `apps/api/tests/**` (and any `apps/web` tests when present) against the ISTQB Foundation Level syllabus. Produce a written review — not a code rewrite — unless the user explicitly asks for the fixes to be applied.

---

## When to use

Trigger this skill when the user asks for any of:

- "review my tests against ISTQB"
- "audit the test suite"
- "are these tests ISTQB-compliant"
- "what test cases are missing"
- "find gaps in our test coverage" (when framed in QA terms, not just `--coverage`)

Do NOT trigger for:
- Writing brand-new tests for a new endpoint — use [scaffold-endpoint](scaffold-endpoint.md) instead.
- Running the test suite or interpreting Jest output — that's a plain Bash task.
- Frontend visual / accessibility reviews — out of scope here.

---

## Scope of the review

Read every file under `apps/api/tests/` plus any colocated `*.test.ts(x)` files under `apps/web/src/`. Map each `describe` / `it` block to:

1. The **test level** it actually belongs to (unit vs. integration vs. system).
2. The **test design technique** it applies (or fails to apply).
3. The **risk** or **requirement** it traces back to in `CLAUDE.md` (Validation Rules, Response Shape, ID Format, Data Layer Rules).

Untraceable tests — those that don't map to a documented rule or a realistic risk — are a finding, not noise.

---

## ISTQB principles to check against

Apply the seven ISTQB testing principles. For each, state whether the suite honours it and cite the file/line.

| # | Principle | What to look for in this repo |
|---|-----------|-------------------------------|
| 1 | Testing shows the presence of defects, not their absence | Are negative cases (4xx, malformed input) present, or only happy paths? |
| 2 | Exhaustive testing is impossible | Are inputs sampled by equivalence partitioning + boundary values, or do tests brute-force every value? |
| 3 | Early testing saves time and cost | Are services unit-tested directly, or only via Supertest at the HTTP layer? Pure-function logic should have unit tests independent of Express. |
| 4 | Defects cluster | Are the highest-risk areas — `booksService` validation, `/search` vs `/:id` ordering, JSON store write pattern — more heavily tested than low-risk getters? |
| 5 | Tests wear out (pesticide paradox) | Are assertions tautological (`expect(res.body).toBeDefined()`)? Do regex matchers (`/title/i`) lock in error wording without testing behaviour? |
| 6 | Testing is context-dependent | JSON-file persistence + no auth + no concurrency. Do tests respect those constraints (snapshot/restore) and avoid testing things that are explicitly out of scope per `CLAUDE.md`? |
| 7 | Absence-of-errors fallacy | Green tests ≠ correct feature. Are there contract assertions on `success`, `data`, `count`, `statusCode` shape on every response, or just status codes? |

---

## Test design techniques to verify

For each endpoint, confirm that the suite applies the relevant black-box technique. Cite which test in which file does each, and flag the ones with no coverage.

### Equivalence Partitioning (EP)
Split each input into valid and invalid partitions and require at least one test per partition.

Example for `POST /api/books` → `year`:
- Valid: integer in `[1000, CURRENT_YEAR]`
- Invalid (low): integer `< 1000`
- Invalid (high): integer `> CURRENT_YEAR`
- Invalid (type): string, `null`, `undefined`, float, `NaN`, boolean

### Boundary Value Analysis (BVA)
For every numeric/string-length rule in `CLAUDE.md` → Validation Rules, require tests at: `min-1`, `min`, `min+1`, `max-1`, `max`, `max+1`.

Currently relevant boundaries:
- `title.length` — 0, 1, 200, 201
- `year` — 999, 1000, 1001, CURRENT_YEAR-1, CURRENT_YEAR, CURRENT_YEAR+1
- `rating` — 0, 1, 2, 4, 5, 6 (plus non-integer 0.999, 5.001)

Flag any boundary that has only one side covered (e.g., `year < 1000` tested but `year = 1000` not).

### Decision Table Testing
The `addReview` service has 4 input conditions (`reviewer`, `rating`, `body`, book exists). That's a 4-condition decision table — short-circuit semantics matter (book existence is checked **before** body validation per `CLAUDE.md`). Require tests that prove the **order** of failures, not just that each fails in isolation.

### State Transition Testing
A book has implicit states: *absent → present (via POST) → present (queryable via GET / search) → absent (via DELETE, once implemented)*. Require at least one test per transition and one test for each *invalid* transition (e.g., DELETE on an already-deleted id).

### Use Case Testing
End-to-end flows from `CLAUDE.md`:
- "Add a book, fetch it by id, review it, list its reviews."
- "Search returns the new book by title, author, and genre."
Each scripted flow is one ISTQB use case — flag if any documented user-facing flow has no corresponding test.

### Error Guessing / Exploratory inputs
Already partially present in `search.test.ts` (regex metacharacters, SQL/XSS payloads, emoji). Check that the same payloads are tried against `POST` bodies, not just query strings.

---

## Test levels — assign each file

| File | Expected level | Smell |
|------|----------------|-------|
| `booksRepository.test.ts` | **Component / unit** — hits `fs` directly. Acceptable here because the repo *is* the I/O boundary. | If it asserts HTTP status codes, it's been mislabelled. |
| `books.test.ts`, `search.test.ts`, `health.test.ts` | **Integration / component-integration** — Supertest against the assembled Express app. | If they import the service directly and bypass the router, downgrade to unit. |
| Anything that boots a server on a port | **System** — should not exist in this repo. Tests must import `app` from `src/app.ts`, never bind a port. |

Pure services (`booksService.ts`, `reviewsService.ts`) currently have **zero unit-level coverage** — every assertion goes through Supertest. Flag this as a gap unless the user has explicitly chosen integration-only.

---

## Test independence & repeatability

Verify each of these structural rules. Each violation is a finding.

- **AAA structure** — Arrange, Act, Assert visually separated. Multiple `expect`s in one `it` are fine if they assert one behaviour; flag if they assert unrelated behaviours.
- **No order dependency** — Re-run with `--randomize` (or shuffle `it` blocks mentally). Any test that depends on a sibling having run first is a finding. The `beforeAll` snapshot in `books.test.ts` makes the **file** repeatable, but a test that asserts `count === 30` *after* another test has POSTed a new book inside the same run is order-dependent.
- **Seed restoration** — `beforeAll` reads, `afterAll` writes back. Any test file that mutates `data/*.json` without this pattern is a finding. (`reviews.json` is the next likely offender once review tests exist.)
- **No shared mutable state** — module-level `let` variables that accumulate across `it`s are findings unless reset in `beforeEach`.
- **No real network / clock** — `new Date()` inside an assertion is fine; assertions like `expect(addedAt).toBe("2026-05-14...")` are flaky. Recommend `expect.stringMatching(/^\d{4}-/)` or freeze the clock.

---

## Coverage that ISTQB cares about (and that `--coverage` won't tell you)

`jest --coverage` reports statement / branch / function / line coverage. ISTQB also expects:

- **Requirements coverage** — every rule in `CLAUDE.md` → Validation Rules has at least one positive and one negative test. Build a table: requirement → test id → pass/fail.
- **Risk coverage** — every item in `CLAUDE.md` → Known Limitations is either tested (proving the limit) or explicitly out of scope. E.g., "concurrent writes can lose data" — fine to skip, but the suite should not falsely claim concurrency safety.
- **Path coverage of validation chains** — the service has 7 sequential guards in `addBook`. Each guard is a branch; assert that hitting guard *N* leaves guards *N+1..7* unexercised by checking the error message names the *first* failing field.

---

## Naming, traceability, maintainability

ISTQB syllabus 4.x emphasises that tests are documentation. Apply these checks:

- Test names start with the **expected behaviour**, not the implementation detail. `it("returns 400 when title exceeds 200 characters")` is good. `it("title check")` is not.
- Each `describe` corresponds to one Subject Under Test (one endpoint, one service function, one repository function). Mixed-subject `describe`s are a finding.
- Hard-coded ids (`book_001`) tie tests to seed data. Acceptable in this repo (seed is documented), but flag if the same magic id appears in >3 files — extract to a constant.
- Error-message regexes (`/not found/i`, `/title/i`) are tolerable, but `toBe("...")` against exact wording is brittle — flag and recommend regex.

---

## Output format

Produce a **single Markdown report**, printed to chat (do not write a new file unless the user asks). Use exactly these headings, in this order:

```
## ISTQB Test Review — BookShelf

### 1. Summary
One paragraph. Overall verdict: which principles are honoured, which are not.

### 2. Findings by ISTQB principle
For each of the seven principles, one bullet:
- Honoured / Partially / Not honoured — citing files and line ranges.

### 3. Missing test design techniques
Table: Endpoint / Technique / Existing coverage / Missing cases.

### 4. Boundary value gaps
Table: Field / Boundary / Tested? / Test file:line OR "missing".

### 5. Test level mismatches
Which tests are at the wrong level, and where they should move.

### 6. Independence & repeatability issues
File:line list of order-dependent, shared-state, or non-restoring tests.

### 7. Requirements traceability matrix
Table: CLAUDE.md rule / Positive test / Negative test / Status.

### 8. Recommended additions (prioritised)
Numbered list, P0 → P3, each with: test name, file it belongs in, ISTQB technique it satisfies.

### 9. Recommended deletions / rewrites
Bullets — tautological asserts, brittle equality checks, mislabelled levels.
```

Keep the report under ~400 lines. Cite `file_path:line` in clickable Markdown link form for every finding so the user can jump straight to it.

---

## Constraints — do NOT

- Do NOT rewrite or add tests as part of the review. Producing the report IS the deliverable. Offer a follow-up: *"Want me to apply findings 1, 3, and 7 as P0?"*
- Do NOT recommend adding tests for behaviour that contradicts `CLAUDE.md` → What NOT To Do. Example: do not propose tests for concurrent-write safety, pagination, or auth — those are out of scope by design.
- Do NOT mark a test as "missing" if the underlying feature is in `CLAUDE.md` → Planned Endpoints and not yet implemented. Note it as *pending implementation* instead.
- Do NOT cite the ISTQB syllabus by chapter number — it dates the review. Cite by concept name (e.g., "Boundary Value Analysis"), not "§4.3.2".
- Do NOT change `jest.config.js` or `tsconfig.json` as part of the review.
- Do NOT recommend mocking the JSON store. Tests must hit real files — this matches the project's existing pattern and is intentional per `CLAUDE.md` → Data Layer Rules.

---

## Done checklist

Before delivering the review:

- [ ] Every test file under `apps/api/tests/` has been read end-to-end.
- [ ] Every validation rule in `CLAUDE.md` appears in the traceability matrix.
- [ ] Every finding cites `file:line` as a Markdown link.
- [ ] Recommended additions are prioritised P0–P3 and tagged with the ISTQB technique they satisfy.
- [ ] No new files written, no test code changed, no `jest.config.js` edits.
- [ ] Report fits in one chat message (under ~400 lines).