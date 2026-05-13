import { useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { CreateReviewPayload } from "../lib/api";

interface Props {
  bookId: string;
  onSuccess?: () => void;
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-brown-700">Rating</span>
      <div
        className="flex gap-1"
        role="radiogroup"
        aria-label="Rating from 1 to 5 stars"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={`text-2xl leading-none p-1 rounded-md transition-colors
              focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-1
              ${n <= display ? "text-amber-600" : "text-cream-200"}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export function AddReviewForm({ bookId, onSuccess }: Props) {
  const [reviewer, setReviewer] = useState("");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!reviewer.trim()) {
      setMessage({ type: "err", text: "Please enter your name." });
      return;
    }
    if (rating < 1 || rating > 5) {
      setMessage({ type: "err", text: "Please choose a rating from 1 to 5 stars." });
      return;
    }
    if (!body.trim()) {
      setMessage({ type: "err", text: "Please write a review." });
      return;
    }

    const payload: CreateReviewPayload = {
      reviewer: reviewer.trim(),
      rating,
      body: body.trim(),
    };

    setSubmitting(true);
    try {
      await api.addReview(bookId, payload);
      setReviewer("");
      setRating(0);
      setBody("");
      setMessage({ type: "ok", text: "Thanks — your review was posted." });
      onSuccess?.();
    } catch (err) {
      const text = err instanceof Error ? err.message : "Something went wrong.";
      setMessage({ type: "err", text });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="bg-white rounded-xl shadow-sm border border-cream-200 p-6
                 mt-8"
    >
      <h2 className="text-lg font-bold text-brown-800 mb-4">Add a review</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="reviewer" className="block text-xs font-medium text-brown-700 mb-1">
            Your name
          </label>
          <input
            id="reviewer"
            type="text"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            autoComplete="name"
            className="w-full rounded-lg border border-cream-200 px-3 py-2 text-sm
                       text-brown-800 bg-cream-50 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-forest-600
                       focus:border-transparent"
            placeholder="e.g. Jordan Lee"
            disabled={submitting}
          />
        </div>

        <StarPicker value={rating} onChange={setRating} />

        <div>
          <label htmlFor="review-body" className="block text-xs font-medium text-brown-700 mb-1">
            Review
          </label>
          <textarea
            id="review-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-cream-200 px-3 py-2 text-sm
                       text-brown-800 bg-cream-50 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-forest-600
                       focus:border-transparent resize-y min-h-[100px]"
            placeholder="What did you think of this book?"
            disabled={submitting}
          />
        </div>

        {message && (
          <div
            role="status"
            className={
              message.type === "ok"
                ? "rounded-lg border border-forest-600/30 bg-cream-100 px-3 py-2 text-sm text-brown-800"
                : "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            }
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-lg bg-forest-700 text-white text-sm font-semibold
                     px-5 py-2.5 shadow-sm hover:bg-forest-600 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Posting…" : "Post review"}
        </button>
      </form>
    </section>
  );
}
