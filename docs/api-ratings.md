# Ratings API

## GET /api/books/:id/ratings

Aggregates the reviews stored for a single book and returns the average rating, total review count, and a per-star breakdown (1 through 5).

### URL parameters

| Name | Type   | Description                                                                 |
| ---- | ------ | --------------------------------------------------------------------------- |
| `id` | string | Book id in the form `book_` + 8 hex chars (e.g. `book_a1b2c3d4`). Required. |

### Success — `200 OK`

```json
{
  "success": true,
  "data": {
    "average": 3.67,
    "total": 12,
    "breakdown": { "1": 1, "2": 1, "3": 2, "4": 5, "5": 3 }
  }
}
```

Fields inside `data`:

| Field       | Type                       | Notes                                                                                   |
| ----------- | -------------------------- | --------------------------------------------------------------------------------------- |
| `average`   | `number \| null`           | Arithmetic mean of all ratings, rounded to 2 decimal places. `null` when `total` is 0.  |
| `total`     | `number`                   | Number of reviews for the book.                                                         |
| `breakdown` | `{ "1"–"5": number }`      | Count of reviews at each star value. All five keys are always present, including zero buckets. |

When the book exists but has no reviews:

```json
{
  "success": true,
  "data": {
    "average": null,
    "total": 0,
    "breakdown": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
  }
}
```

Note: this endpoint is an aggregate, not a list — the top-level response has no `count` field.

### Errors

#### `404 Not Found` — book id does not exist

```json
{
  "success": false,
  "error": "Book with id 'book_does_not_exist' not found",
  "statusCode": 404
}
```

The `'<id>'` segment of the message echoes whatever was supplied in the URL.

#### `500 Internal Server Error` — unhandled failure (e.g. corrupt `reviews.json`)

```json
{
  "success": false,
  "error": "Internal Server Error",
  "statusCode": 500
}
```

The underlying error message is never leaked to the client; it is logged server-side as `[Error] …`.

### Usage note

`average` is `null` — not `0` — when a book has no reviews. Treat the two as distinct: `null` means "no data yet," `0` is not a value this endpoint can return (ratings are constrained to 1–5). Frontends rendering a star widget should branch on `total === 0` (or `average === null`) and show an empty state rather than a zero-star rating.
