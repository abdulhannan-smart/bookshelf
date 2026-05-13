import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Book, Review } from "../lib/api";
import { ReviewCard } from "../components/ReviewCard";
import { AddReviewForm } from "../components/AddReviewForm";

export function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bookId) {
      setError("Missing book id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [b, r] = await Promise.all([api.getBook(bookId), api.getReviews(bookId)]);
      setBook(b);
      setReviews(r);
    } catch (e) {
      setBook(null);
      setReviews([]);
      setError(e instanceof Error ? e.message : "Failed to load book.");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-white border-b border-cream-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/"
            className="text-sm font-medium text-forest-700 hover:text-forest-600
                       focus:outline-none focus:underline"
          >
            ← Back to catalogue
          </Link>
          <div className="sm:ml-auto flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-brown-800">BookShelf</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading && (
          <div className="space-y-4">
            <div className="h-40 bg-white rounded-xl border border-cream-200 animate-pulse" />
            <div className="h-24 bg-white rounded-xl border border-cream-200 animate-pulse" />
          </div>
        )}

        {!loading && error && (
          <div
            className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-4 text-sm"
            role="alert"
          >
            {error}
            <p className="mt-2 text-red-700">
              Is the API running on port 3001?{" "}
              <Link to="/" className="underline font-medium">
                Return home
              </Link>
            </p>
          </div>
        )}

        {!loading && !error && book && (
          <>
            <article className="bg-white rounded-xl shadow-sm border border-cream-200 p-6 mb-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-700 mb-2">
                {book.genre}
              </p>
              <h1 className="text-2xl font-bold text-brown-800 leading-tight mb-2">
                {book.title}
              </h1>
              <p className="text-brown-600 mb-4">{book.author}</p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-brown-700 mb-4">
                <div>
                  <dt className="text-xs text-gray-500">Year</dt>
                  <dd>{book.year}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">ISBN</dt>
                  <dd className="font-mono text-xs break-all">{book.isbn}</dd>
                </div>
              </dl>
              <p className="text-sm text-brown-700 leading-relaxed border-t border-cream-100 pt-4">
                {book.description}
              </p>
            </article>

            <section>
              <h2 className="text-lg font-bold text-brown-800 mb-4">
                Reviews
                {reviews.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-brown-600">
                    ({reviews.length})
                  </span>
                )}
              </h2>

              {reviews.length === 0 ? (
                <p className="text-sm text-brown-600 bg-white rounded-xl border border-cream-200 px-4 py-6 text-center">
                  No reviews yet. Be the first to share your thoughts.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {reviews.map((r) => (
                    <li key={r.id}>
                      <ReviewCard review={r} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <AddReviewForm bookId={book.id} onSuccess={() => void load()} />
          </>
        )}
      </main>
    </div>
  );
}
