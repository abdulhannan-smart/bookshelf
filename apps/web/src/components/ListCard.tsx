import type { List } from "../lib/api";

interface Props {
  list: List;
  onClick?: () => void;
}

export function ListCard({ list, onClick }: Props) {
  const count = list.bookIds.length;

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-cream-200 p-5
                 hover:shadow-md hover:-translate-y-0.5 transition-all
                 duration-200 flex flex-col gap-3 text-left
                 focus:outline-none focus:ring-2 focus:ring-forest-600">

      {/* Cover placeholder */}
      <div className="w-full h-40 bg-cream-100 rounded-lg flex items-center
                      justify-center text-4xl select-none">
        🗂️
      </div>

      {/* Book count badge */}
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit
                       bg-cream-100 text-brown-700">
        {count} {count === 1 ? "book" : "books"}
      </span>

      {/* Name */}
      <h2 className="font-bold text-brown-800 text-base leading-snug line-clamp-2">
        {list.name}
      </h2>

      {/* Description */}
      <p className="text-sm text-brown-600 line-clamp-3">
        {list.description || <span className="italic text-gray-400">No description</span>}
      </p>
    </button>
  );
}
