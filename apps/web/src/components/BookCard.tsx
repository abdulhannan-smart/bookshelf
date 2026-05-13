import { Link } from "react-router-dom";
import type { Book } from "../lib/api";

const GENRE_COLOURS: Record<string, string> = {
  Technology: "bg-blue-100 text-blue-800",
  Fiction:    "bg-purple-100 text-purple-800",
  Science:    "bg-green-100 text-green-800",
  History:    "bg-yellow-100 text-yellow-800",
  "Self-Help": "bg-orange-100 text-orange-800",
};

interface Props {
  book: Book;
}

export function BookCard({ book }: Props) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="group block rounded-xl focus:outline-none focus-visible:ring-2
                 focus-visible:ring-forest-600 focus-visible:ring-offset-2"
    >
      <div
        className="bg-white rounded-xl shadow-sm border border-cream-200 p-5
                    group-hover:shadow-md group-hover:-translate-y-0.5 transition-all
                    duration-200 flex flex-col gap-3 h-full"
      >
        {/* Cover placeholder */}
        <div
          className="w-full h-40 bg-cream-100 rounded-lg flex items-center
                      justify-center text-4xl select-none"
        >
          📖
        </div>

        {/* Genre badge */}
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit
                        ${GENRE_COLOURS[book.genre] ?? "bg-gray-100 text-gray-700"}`}
        >
          {book.genre}
        </span>

        {/* Title */}
        <h2 className="font-bold text-brown-800 text-base leading-snug line-clamp-2">
          {book.title}
        </h2>

        {/* Author */}
        <p className="text-sm text-brown-600">{book.author}</p>

        {/* Year */}
        <p className="text-xs text-gray-400 mt-auto">{book.year}</p>
      </div>
    </Link>
  );
}