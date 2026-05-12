import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import type {Book} from "../lib/api";
import { BookCard } from "../components/BookCard";
import { SearchBar } from "../components/SearchBar";

export function CataloguePage() {
  const [books, setBooks]         = useState<Book[]>([]);
  const [query, setQuery]         = useState("");
  const [loading, setLoading]     = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Load all books on mount
  useEffect(() => {
    api.getBooks()
      .then(setBooks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value);

    if (!value.trim()) {
      // Reset to full list
      setSearching(true);
      api.getBooks()
        .then(setBooks)
        .catch((e) => setError(e.message))
        .finally(() => setSearching(false));
      return;
    }

    setSearching(true);
    const timer = setTimeout(() => {
      api.searchBooks(value)
        .then(setBooks)
        .catch((e) => setError(e.message))
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">

      {/* Header */}
      <header className="bg-white border-b border-cream-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col
                        sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h1 className="text-xl font-bold text-brown-800">BookShelf</h1>
              <p className="text-xs text-gray-500">Your personal catalogue</p>
            </div>
          </div>
          <div className="sm:ml-auto">
            <SearchBar
              value={query}
              onChange={handleSearch}
              isSearching={searching}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Status line */}
        <p className="text-sm text-gray-500 mb-6">
          {loading
            ? "Loading books…"
            : query
            ? `${books.length} result${books.length !== 1 ? "s" : ""} for "${query}"`
            : `${books.length} books in catalogue`}
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700
                          rounded-xl px-4 py-3 mb-6 text-sm">
            ⚠️ {error} — is the API server running on port 3001?
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse
                                      border border-cream-200" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && books.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium">No books found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {/* Book grid */}
        {!loading && books.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}