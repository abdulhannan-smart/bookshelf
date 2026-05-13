/**
 * Dev-only MCP server: reads monorepo `data/*.json` directly (no Express).
 * Run from `apps/api`: `npm run mcp`
 */
import fs from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Book, Review } from "@bookshelf/shared";
import * as z from "zod";

/** BookShelf monorepo root (contains `data/books.json`). */
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const BOOKS_JSON = path.join(REPO_ROOT, "data", "books.json");
const REVIEWS_JSON = path.join(REPO_ROOT, "data", "reviews.json");

async function readBooks(): Promise<Book[]> {
  const raw = await fs.readFile(BOOKS_JSON, "utf-8");
  return JSON.parse(raw) as Book[];
}

async function readReviews(): Promise<Review[]> {
  try {
    const raw = await fs.readFile(REVIEWS_JSON, "utf-8");
    return JSON.parse(raw) as Review[];
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as NodeJS.ErrnoException).code) : "";
    if (code === "ENOENT") {
      return [];
    }
    throw e;
  }
}

function filterBooksBySearch(books: Book[], search: string): Book[] {
  const q = search.toLowerCase().trim();
  if (!q) {
    return [];
  }
  return books.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q)
  );
}

type BookStatsResult = {
  total: number;
  byGenre: Record<string, number>;
  mostRecent: Book;
};

function computeBookStats(books: Book[]): BookStatsResult {
  if (books.length === 0) {
    throw new Error("No books in catalogue");
  }

  const byGenre: Record<string, number> = {};
  for (const b of books) {
    byGenre[b.genre] = (byGenre[b.genre] ?? 0) + 1;
  }

  let mostRecent = books[0];
  for (const b of books) {
    if (new Date(b.addedAt).getTime() > new Date(mostRecent.addedAt).getTime()) {
      mostRecent = b;
    }
  }

  return { total: books.length, byGenre, mostRecent };
}

function jsonResult(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
  };
}

async function main(): Promise<void> {
  const server = new McpServer({
    name: "bookshelf-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "query_books",
    {
      title: "Search BookShelf catalogue",
      description:
        "Use this when the user wants to find books in the local BookShelf JSON catalogue by keyword. " +
        "Searches title, author, and genre (case-insensitive substring match). " +
        "Prefer this over guessing titles from memory. Pass the user's search phrase in `search`.",
      inputSchema: z.object({
        search: z.string().describe("Keyword or phrase to match against title, author, or genre."),
      }),
    },
    async ({ search }) => {
      const books = await readBooks();
      const matches = filterBooksBySearch(books, search);
      return jsonResult({ count: matches.length, books: matches });
    }
  );

  server.registerTool(
    "get_book_stats",
    {
      title: "BookShelf catalogue statistics",
      description:
        "Use this when the user asks for counts, breakdown by genre, or the newest book in the local BookShelf seed data. " +
        "Reads `data/books.json` only; no parameters.",
    },
    async () => {
      const books = await readBooks();
      const stats = computeBookStats(books);
      return jsonResult(stats);
    }
  );

  server.registerTool(
    "get_reviews_for_book",
    {
      title: "Reviews for a book",
      description:
        "Use this when the user wants reviews for a specific BookShelf book id (e.g. book_001). " +
        "Returns all review rows from `data/reviews.json` where `bookId` matches.",
      inputSchema: z.object({
        bookId: z.string().describe("Book id from the catalogue, e.g. book_001."),
      }),
    },
    async ({ bookId }) => {
      const reviews = await readReviews();
      const forBook = reviews.filter((r) => r.bookId === bookId);
      return jsonResult({ bookId, count: forBook.length, reviews: forBook });
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`bookshelf MCP server failed: ${msg}\n`);
  process.exit(1);
});
