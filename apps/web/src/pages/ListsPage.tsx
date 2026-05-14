import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { List } from "../lib/api";
import { ListCard } from "../components/ListCard";

interface Props {
  onBack?: () => void;
  onSelectList?: (listId: string) => void;
}

export function ListsPage({ onBack, onSelectList }: Props = {}) {
  const [lists, setLists]     = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    api.getLists()
      .then(setLists)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
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
              <p className="text-xs text-gray-500">Reading lists</p>
            </div>
          </div>
          <nav className="sm:ml-auto flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={onBack}
              className="text-brown-700 hover:text-brown-800 hover:underline
                         focus:outline-none focus:ring-2 focus:ring-forest-600
                         rounded px-1"
            >
              ← Catalogue
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Status line */}
        <p className="text-sm text-gray-500 mb-6">
          {loading
            ? "Loading lists…"
            : `${lists.length} ${lists.length === 1 ? "list" : "lists"}`}
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
        {!loading && !error && lists.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🗂️</p>
            <p className="text-lg font-medium">No reading lists yet</p>
            <p className="text-sm mt-1">Create one to start curating books</p>
          </div>
        )}

        {/* List grid */}
        {!loading && lists.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onClick={() => onSelectList?.(list.id)}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
