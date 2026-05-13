import type { Review } from "../lib/api";

interface Props {
  review: Review;
}

function StarRating({ value }: { value: number }) {
  return (
    <span
      role="img"
      aria-label={`${value} out of 5 stars`}
      className="text-base leading-none tracking-wide select-none"
    >
      <span className="text-amber-500">{"★".repeat(value)}</span>
      <span className="text-cream-200">{"★".repeat(Math.max(0, 5 - value))}</span>
    </span>
  );
}

export function ReviewCard({ review }: Props) {
  const date = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article
      className="bg-white rounded-xl shadow-sm border border-cream-200 p-4
                 flex flex-col gap-2"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold text-brown-800 text-sm">
          {review.reviewer}
        </h3>
        <StarRating value={review.rating} />
      </header>

      <p className="text-sm text-brown-700 leading-relaxed whitespace-pre-line">
        {review.body}
      </p>

      <p className="text-xs text-gray-400 mt-1">{date}</p>
    </article>
  );
}