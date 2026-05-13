import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../lib/api";
import type { Review } from "../lib/api";

interface Props {
  bookId: string;
  onSuccess?: (review: Review) => void;
}

export function AddReviewForm({ bookId, onSuccess }: Props) {
  const [reviewer, setReviewer] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (rating < 1 || rating > 5) {
      setError("Please pick a rating between 1 and 5 stars.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.addReview(bookId, {
        reviewer: reviewer.trim(),
        rating,
        body: body.trim(),
      });
      setSuccess(true);
      setReviewer("");
      setRating(0);
      setHover(0);
      setBody("");
      onSuccess?.(created);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add review");
    } finally {
      setSubmitting(false);
    }
  }

  const shown = hover || rating;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-cream-200 shadow-sm
                 p-5 flex flex-col gap-4"
    >
      <h3 className="font-bold text-brown-800">Leave a review</h3>

      <label className="flex flex-col gap-1 text-sm text-brown-700">
        Your name
        <input
          type="text"
          value={reviewer}
          onChange={(e) => setReviewer(e.target.value)}
          required
          maxLength={80}
          className="px-3 py-2 rounded-lg border border-cream-200 bg-cream-50
                     text-brown-800 placeholder-gray-400 focus:outline-none
                     focus:ring-2 focus:ring-forest-600 focus:border-transparent"
          placeholder="Jane Reader"
        />
      </label>

      <div className="flex flex-col gap-1 text-sm text-brown-700">
        Rating
        <div
          className="flex items-center gap-1 text-2xl select-none"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
              aria-pressed={rating === n}
              className="leading-none focus:outline-none
                         focus:ring-2 focus:ring-forest-600 rounded"
            >
              <span
                className={
                  shown >= n ? "text-amber-500" : "text-cream-200"
                }
              >
                ★
              </span>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-xs text-gray-500">{rating} / 5</span>
          )}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm text-brown-700">
        Review
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={4}
          className="px-3 py-2 rounded-lg border border-cream-200 bg-cream-50
                     text-brown-800 placeholder-gray-400 focus:outline-none
                     focus:ring-2 focus:ring-forest-600 focus:border-transparent
                     resize-y"
          placeholder="What did you think of this book?"
        />
      </label>

      {error && (
        <p
          role="alert"
          className="text-sm text-red-700 bg-red-50 border border-red-200
                     rounded-lg px-3 py-2"
        >
          ⚠️ {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="text-sm text-forest-700 bg-cream-100
                     border border-forest-600/30 rounded-lg px-3 py-2"
        >
          ✅ Review added — thanks!
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-forest-600 hover:bg-forest-700
                   text-white font-semibold rounded-lg px-4 py-2 text-sm
                   transition disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-forest-700
                   focus:ring-offset-2 focus:ring-offset-white"
      >
        {submitting ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}