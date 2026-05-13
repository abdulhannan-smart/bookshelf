import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

// This file lives at apps/api/mcp-server.ts — project root is two levels up.
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const BOOKS_FILE = path.join(PROJECT_ROOT, "data", "books.json");
const REVIEWS_FILE = path.join(PROJECT_ROOT, "data", "reviews.json");

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  isbn: string;
  description: string;
  coverUrl: string | null;
  addedAt: string;
}

interface Review {
  id: string;
  bookId: string;
  reviewer: string;
  rating: number;
  body: string;
  createdAt: string;
}

async function readBooks(): Promise<Book[]> {
  const raw = await fs.readFile(BOOKS_FILE, "utf-8");
  return JSON.parse(raw) as Book[];
}

async function readReviews(): Promise<Review[]> {
  const raw = await fs.readFile(REVIEWS_FILE, "utf-8");
  return JSON.parse(raw) as Review[];
}

function asJson(payload: unknown) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify(payload, null, 2) },
    ],
  };
}

const server = new McpServer({
  name: "bookshelf",
  version: "0.1.0",
});

// ─── query_books ─────────────────────────────────────────────────────────────
server.tool(
  "query_books",
  "Search the BookShelf catalogue by a free-text term. Matches case-insensitively against book title, author, and genre and returns the full Book records for every partial match. Call this whenever the user asks for books on a topic, by an author, or in a genre (e.g. \"books about distributed systems\", \"anything by Orwell\", \"science books\"). Returns an empty array when nothing matches — that is not an error.",
  {
    search: z
      .string()
      .describe("Free-text query matched against title, author, and genre."),
  },
  async ({ search }) => {
    const books = await readBooks();
    const q = search.toLowerCase().trim();
    const results = q
      ? books.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.genre.toLowerCase().includes(q)
        )
      : books;
    return asJson({ count: results.length, results });
  }
);

// ─── get_book_stats ──────────────────────────────────────────────────────────
server.tool(
  "get_book_stats",
  "Return aggregate statistics about the BookShelf catalogue: total number of books, a per-genre count breakdown, and the most recently added book (by addedAt). Call this when the user asks \"how many books do we have\", \"what's the genre split\", or \"what was added last\".",
  {},
  async () => {
    const books = await readBooks();

    const byGenre: Record<string, number> = {};
    for (const b of books) {
      byGenre[b.genre] = (byGenre[b.genre] ?? 0) + 1;
    }

    const mostRecent =
      books.length === 0
        ? null
        : books.reduce((latest, b) =>
            new Date(b.addedAt) > new Date(latest.addedAt) ? b : latest
          );

    return asJson({ total: books.length, byGenre, mostRecent });
  }
);

// ─── get_reviews_for_book ────────────────────────────────────────────────────
server.tool(
  "get_reviews_for_book",
  "Return every review stored for a single book, identified by its BookShelf id (e.g. 'book_001'). Returns an empty array if the book exists but has no reviews. Call this when the user asks what people thought of a specific book, or wants to see the reviews on a book they just looked up.",
  {
    bookId: z
      .string()
      .describe("The BookShelf book id, e.g. 'book_001' or 'book_a1b2c3d4'."),
  },
  async ({ bookId }) => {
    const reviews = await readReviews();
    const matched = reviews.filter((r) => r.bookId === bookId);
    return asJson({ bookId, count: matched.length, reviews: matched });
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("[bookshelf-mcp] failed to start:", err);
  process.exit(1);
});
