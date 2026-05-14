import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { ListWithBooks } from "../lib/api";
import { BookCard } from "../components/BookCard";

interface Props {
  listId: string;
  onBack: () => void;
  onSelectBook?: (bookId: string) => void;
}

export function ListDetailPage({ listId, onBack, onSelectBook }: Props) {
  const [list, setList]       = useState<ListWithBooks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setList(null);

    api.getList(listId)
      .then((l) => {
        if (cancelled) return;
        setList(l);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [listId]);

  return (
    <div className="min-h-screen bg-cream-50">

      {/* Header */}
      <header className="bg-white border-b border-cream-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-brown-700 hover:text-brown-800
                       hover:underline focus:outline-none
                       focus:ring-2 focus:ring-forest-600 rounded px-1"
          >
            ← Back to lists
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">

        {loading && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl h-32 animate-pulse
                            border border-cream-200" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-64 animate-pulse
                                        border border-cream-200" />
              ))}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700
                          rounded-xl px-4 py-3 text-sm">
            ⚠️ {error} — is the API server running on port 3001?
          </div>
        )}

        {list && !loading && (
          <>
            {/* List header */}
            <article className="bg-white rounded-xl border border-cream-200
                                shadow-sm p-6 flex flex-col gap-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full
                               w-fit bg-cream-100 text-brown-700">
                {list.books.length} {list.books.length === 1 ? "book" : "books"}
              </span>
              <h1 className="text-2xl font-bold text-brown-800 leading-tight">
                {list.name}
              </h1>
              {list.description ? (
                <p className="text-brown-700 leading-relaxed">
                  {list.description}
                </p>
              ) : (
                <p className="text-sm italic text-gray-400">No description</p>
              )}
            </article>

            {/* Books grid */}
            <section className="flex flex-col gap-4">
              <h2 className="font-bold text-brown-800">Books in this list</h2>

              {list.books.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-5xl mb-4">📭</p>
                  <p className="text-lg font-medium">No books in this list yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {list.books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onClick={() => onSelectBook?.(book.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
