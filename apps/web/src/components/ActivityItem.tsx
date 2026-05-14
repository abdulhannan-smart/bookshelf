import type { Activity } from "../lib/api";

interface Props {
  activity: Activity;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StarRating({ value }: { value: number }) {
  return (
    <span
      role="img"
      aria-label={`${value} out of 5 stars`}
      className="text-sm leading-none tracking-wide select-none"
    >
      <span className="text-amber-500">{"★".repeat(value)}</span>
      <span className="text-cream-200">
        {"★".repeat(Math.max(0, 5 - value))}
      </span>
    </span>
  );
}

export function ActivityItem({ activity }: Props) {
  const date = formatDate(activity.at);

  if (activity.type === "review") {
    return (
      <article
        className="bg-white rounded-xl shadow-sm border border-cream-200 p-4
                   flex flex-col gap-2"
      >
        <header className="flex items-baseline justify-between gap-3">
          <h3 className="font-semibold text-brown-800 text-sm">
            📝 Reviewed{" "}
            <span className="font-mono text-xs text-brown-600">
              {activity.bookId}
            </span>
          </h3>
          <StarRating value={activity.rating} />
        </header>

        <p className="text-sm text-brown-700 leading-relaxed line-clamp-2">
          {activity.body}
        </p>

        <p className="text-xs text-gray-400 mt-1">{date}</p>
      </article>
    );
  }

  return (
    <article
      className="bg-white rounded-xl shadow-sm border border-cream-200 p-4
                 flex flex-col gap-2"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold text-brown-800 text-sm">
          📋 Created list{" "}
          <span className="text-brown-700">“{activity.name}”</span>
        </h3>
      </header>

      {activity.description && (
        <p className="text-sm text-brown-700 leading-relaxed line-clamp-2">
          {activity.description}
        </p>
      )}

      <p className="text-xs text-gray-400 mt-1">{date}</p>
    </article>
  );
}
