import type { Review } from "../lib/api";

interface Props {
  review: Review;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < rating
              ? "text-amber-600 drop-shadow-sm"
              : "text-cream-200"
          }
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ReviewCard({ review }: Props) {
  return (
    <article
      className="bg-white rounded-xl shadow-sm border border-cream-200 p-5
                 flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-semibold text-brown-800">{review.reviewer}</p>
        <StarRow rating={review.rating} />
      </div>
      <p className="text-sm text-brown-700 leading-relaxed whitespace-pre-wrap">
        {review.body}
      </p>
      <p className="text-xs text-brown-600 mt-auto pt-1 border-t border-cream-100">
        {formatDate(review.createdAt)}
      </p>
    </article>
  );
}
