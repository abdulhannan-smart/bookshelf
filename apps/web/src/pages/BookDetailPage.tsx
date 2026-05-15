import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Book, Review } from "../lib/api";
import { ReviewCard } from "../components/ReviewCard";
import { AddReviewForm } from "../components/AddReviewForm";
import { BookCard } from "../components/BookCard";

interface Props {
  bookId: string;
  onBack: () => void;
  onSelectBook?: (bookId: string) => void;
}

export function BookDetailPage({ bookId, onBack, onSelectBook }: Props) {
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setBook(null);
    setReviews([]);
    setRecommendations([]);

    Promise.all([
      api.getBook(bookId),
      api.getReviews(bookId),
      api.getRecommendations(bookId),
    ])
      .then(([b, r, recs]) => {
        if (cancelled) return;
        setBook(b);
        setReviews(r);
        setRecommendations(recs);
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
  }, [bookId]);

  return (
    <div className="min-h-screen bg-cream-50">

      {/* Header */}
      <header className="bg-white border-b border-cream-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-brown-700 hover:text-brown-800
                       hover:underline focus:outline-none
                       focus:ring-2 focus:ring-forest-600 rounded px-1"
          >
            ← Back to catalogue
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

        {loading && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl h-48 animate-pulse
                            border border-cream-200" />
            <div className="bg-white rounded-xl h-24 animate-pulse
                            border border-cream-200" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700
                          rounded-xl px-4 py-3 text-sm">
            ⚠️ {error} — is the API server running on port 3001?
          </div>
        )}

        {book && !loading && (
          <>
            {/* Book details */}
            <article className="bg-white rounded-xl border border-cream-200
                                shadow-sm p-6 flex flex-col gap-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full
                               w-fit bg-cream-100 text-brown-700">
                {book.genre}
              </span>
              <h1 className="text-2xl font-bold text-brown-800 leading-tight">
                {book.title}
              </h1>
              <p className="text-brown-700">by {book.author}</p>
              <p className="text-xs text-gray-500">
                {book.year} · ISBN {book.isbn}
              </p>
              <p className="text-brown-700 leading-relaxed mt-2">
                {book.description}
              </p>
            </article>

            {/* Reviews list */}
            <section className="flex flex-col gap-3">
              <h2 className="font-bold text-brown-800">
                Reviews ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No reviews yet — be the first.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {reviews.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>
              )}
            </section>

            {/* Add review form */}
            <AddReviewForm
              bookId={book.id}
              onSuccess={(r) => setReviews((prev) => [...prev, r])}
            />

            {/* You might also like */}
            {recommendations.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="font-bold text-brown-800">You might also like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {recommendations.map((rec) => (
                    <BookCard
                      key={rec.id}
                      book={rec}
                      onClick={() => onSelectBook?.(rec.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}