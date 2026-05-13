---
name: scaffold-page
description: Add a new page to the BookShelf frontend following the existing CataloguePage → BookDetailPage pattern — hash routing, lib/api.ts gateway, cream/brown/forest palette, loading + error states.
---

# scaffold-page

How to add a new page to `apps/web`. Mirrors the existing `CataloguePage` → `BookDetailPage` flow.

---

## When to use

Trigger this skill when the user asks for any of:

- "add a new page that …"
- "build a detail / profile / settings page for …"
- "let the user navigate to … from the catalogue"
- any request that introduces a new top-level view with its own URL

Do NOT trigger for:
- a new component that drops into an existing page (just create it under `components/`)
- a styling tweak, a copy change, or adding a field to an existing page (direct edit)
- backend-only work (use `scaffold-endpoint` instead)

---

## File order (do not reorder)

For a new page `Foo` at the route `#/foo/:id`:

1. **`apps/web/src/lib/api.ts`** — add any new `Foo` interface(s) and the `api.getFoo(...)` / `api.addFoo(...)` calls the page needs. Reuse the existing `request<T>` helper.
2. **`apps/web/src/components/Foo<X>.tsx`** — create any new reusable building blocks the page renders (cards, forms). One concern per component.
3. **`apps/web/src/pages/FooPage.tsx`** — the page itself: header bar, loading skeleton, error banner, success state. Receives any URL params and an `onBack` (or similar) callback as props.
4. **`apps/web/src/App.tsx`** — extend the `Route` union, parse the new hash in `parseHash()`, render `<FooPage />` in the route switch, and pass `navigate` callbacks into the parent page so it can link to the new one.
5. **Parent page wiring** — if navigation enters from an existing page, add the optional callback prop on that page (mirroring `CataloguePage`'s `onSelectBook`) and forward it to whichever component triggers the navigation.
6. **`CLAUDE.md`** — only update if you introduce a new convention. New pages on their own don't require it.

If the page only renders existing data, skip step 1. If it doesn't introduce any new reusable building blocks, skip step 2.

---

## Conventions (non-negotiable)

- **Palette** — `cream-50/100/200`, `brown-600/700/800`, `forest-600/700`. Tailwind config is in `apps/web/tailwind.config.js`. Amber is allowed for star ratings; red-50/200/700 is the only error-banner palette.
- **Type imports** — `import type { Foo } from "../lib/api"` for interfaces. Vite + `verbatimModuleSyntax` errors out on plain `import { Foo }` for type-only symbols.
- **API gateway** — every fetch goes through the `api` object in `lib/api.ts`. Never call `fetch` directly from a component or page.
- **Routing** — hash-based, hand-rolled in `App.tsx`. Do NOT add `react-router-dom`. Routes are `#/`, `#/books/:id`, and any new route you add — parse them in `parseHash()` and switch in the default export.
- **Responsive grid** — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5` for catalogue-style lists. Single-column detail pages cap at `max-w-3xl mx-auto`.
- **Loading state** — animated skeleton blocks: `bg-white rounded-xl h-NN animate-pulse border border-cream-200`. Never block on a spinner alone.
- **Error state** — `<div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">⚠️ {error} — is the API server running on port 3001?</div>`. The trailing hint is the project convention because port 3001 is hardcoded.
- **Effect cleanup** — every `useEffect` that calls the API uses a local `cancelled` flag to avoid setting state on an unmounted page when the user navigates away mid-fetch.

---

## Complete example — `BookDetailPage`

The reference flow for a fetch-and-display + form page:

```tsx
// apps/web/src/pages/BookDetailPage.tsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Book, Review } from "../lib/api";
import { ReviewCard } from "../components/ReviewCard";
import { AddReviewForm } from "../components/AddReviewForm";

interface Props { bookId: string; onBack: () => void; }

export function BookDetailPage({ bookId, onBack }: Props) {
  const [book, setBook]       = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([api.getBook(bookId), api.getReviews(bookId)])
      .then(([b, r]) => { if (!cancelled) { setBook(b); setReviews(r); } })
      .catch((e)    => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(()   => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [bookId]);

  // header → loading skeleton → error banner → article + reviews + form
}
```

Routing wire-up in `App.tsx`:

```tsx
type Route = { name: "catalogue" } | { name: "book"; bookId: string };

function parseHash(): Route {
  const m = window.location.hash.match(/^#\/books\/([^/?#]+)/);
  return m ? { name: "book", bookId: decodeURIComponent(m[1]) } : { name: "catalogue" };
}

// in App: useEffect listens to "hashchange"; switch on route.name; pass navigate down
```

Parent-page handoff in `CataloguePage`:

```tsx
interface Props { onSelectBook?: (bookId: string) => void; }
// forward into <BookCard onClick={() => onSelectBook?.(book.id)} />
```

---

## Constraints — do NOT

- Do NOT add `react-router-dom`, `swr`, `react-query`, or any other routing/fetching dependency. Hash routing + the existing `api` helper are sufficient.
- Do NOT call `fetch` from a component. All HTTP goes through `apps/web/src/lib/api.ts`.
- Do NOT use `any`. Use `unknown` and narrow.
- Do NOT invent a new colour palette. Stick to cream / brown / forest.
- Do NOT use inline `style={{...}}` for layout. Tailwind classes only.
- Do NOT bypass the loading and error states. Every page that fetches has both.
- Do NOT make a child component navigate by mutating `window.location` directly — pass a callback prop down from `App.tsx` like the catalogue → detail flow does.

---

## Done checklist

Before reporting the page as complete:

- [ ] Page renders at its hash route from a fresh tab (`http://localhost:3000/#/<path>`)
- [ ] Browser back / forward works
- [ ] Loading skeleton shows before data arrives
- [ ] Error banner shows when the API is down (test by stopping `apps/api`)
- [ ] Empty state is handled (e.g. "No reviews yet — be the first.")
- [ ] All API calls go through `api` in `lib/api.ts`
- [ ] `import type` used for every interface from `lib/api.ts`
- [ ] `npm run build --workspace=apps/web` is green
- [ ] No `console.log`, no `any`, no new dependencies
