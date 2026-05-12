interface Props {
  value: string;
  onChange: (value: string) => void;
  isSearching: boolean;
}

export function SearchBar({ value, onChange, isSearching }: Props) {
  return (
    <div className="relative w-full max-w-xl">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title, author, or genre…"
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-200
                   bg-white shadow-sm text-sm text-brown-800 placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-forest-600
                   focus:border-transparent transition"
      />
      {isSearching && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs
                         text-gray-400 animate-pulse">
          Searching…
        </span>
      )}
    </div>
  );
}