import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../lib/api";
import type { Activity, UpdateUserInput, User } from "../lib/api";
import { ActivityItem } from "../components/ActivityItem";

interface Props {
  userId: string;
  onBack?: () => void;
}

const GENRES = ["Technology", "Fiction", "Science", "History", "Self-Help"];

const GENRE_COLOURS: Record<string, string> = {
  Technology: "bg-blue-100 text-blue-800",
  Fiction: "bg-purple-100 text-purple-800",
  Science: "bg-green-100 text-green-800",
  History: "bg-yellow-100 text-yellow-800",
  "Self-Help": "bg-orange-100 text-orange-800",
};

export function ProfilePage({ userId, onBack }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActivityLoading(true);
    setError(null);

    api
      .getUser(userId)
      .then(setUser)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));

    api
      .getUserActivity(userId)
      .then(setActivities)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setActivityLoading(false));
  }, [userId]);

  const stats = useMemo(() => {
    const reviews = activities.filter((a) => a.type === "review");
    const distinctBooks = new Set(
      reviews.map((a) => (a.type === "review" ? a.bookId : ""))
    );
    return {
      reviewsWritten: reviews.length,
      booksRead: distinctBooks.size,
    };
  }, [activities]);

  async function handleSave(patch: UpdateUserInput) {
    const updated = await api.updateUser(userId, patch);
    setUser(updated);
    setEditing(false);
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-cream-200 shadow-sm">
        <div
          className="max-w-6xl mx-auto px-4 py-5 flex flex-col
                        sm:flex-row sm:items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h1 className="text-xl font-bold text-brown-800">BookShelf</h1>
              <p className="text-xs text-gray-500">Reader profile</p>
            </div>
          </div>
          <nav className="sm:ml-auto flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={onBack}
              className="text-brown-700 hover:text-brown-800 hover:underline
                         focus:outline-none focus:ring-2 focus:ring-forest-600
                         rounded px-1"
            >
              ← Catalogue
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Error */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700
                          rounded-xl px-4 py-3 text-sm"
          >
            ⚠️ {error} — is the API server running on port 3001?
          </div>
        )}

        {/* Profile card — loading */}
        {loading && (
          <div
            className="bg-white rounded-xl h-48 animate-pulse
                          border border-cream-200"
          />
        )}

        {/* Profile card */}
        {!loading && user && !editing && (
          <section
            className="bg-white rounded-xl shadow-sm border border-cream-200
                       p-6 flex flex-col sm:flex-row gap-6"
          >
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-full bg-cream-100 flex items-center
                            justify-center text-4xl select-none overflow-hidden
                            border border-cream-200 shrink-0"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.displayName}'s avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span aria-hidden>👤</span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold text-brown-800 truncate">
                  {user.displayName}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="bg-forest-600 hover:bg-forest-700 text-white
                             font-semibold rounded-lg px-4 py-2 text-sm
                             transition focus:outline-none focus:ring-2
                             focus:ring-forest-700 focus:ring-offset-2
                             focus:ring-offset-white shrink-0"
                >
                  Edit
                </button>
              </div>

              {/* Genres */}
              {user.favouriteGenres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {user.favouriteGenres.map((g) => (
                    <span
                      key={g}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                  ${
                                    GENRE_COLOURS[g] ??
                                    "bg-gray-100 text-gray-700"
                                  }`}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <dl className="flex gap-6 mt-1">
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wide">
                    Reviews
                  </dt>
                  <dd className="text-lg font-bold text-brown-800">
                    {activityLoading ? "…" : stats.reviewsWritten}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wide">
                    Books read
                  </dt>
                  <dd className="text-lg font-bold text-brown-800">
                    {activityLoading ? "…" : stats.booksRead}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        )}

        {/* Edit form */}
        {!loading && user && editing && (
          <EditProfileForm
            user={user}
            onCancel={() => setEditing(false)}
            onSave={handleSave}
          />
        )}

        {/* Activity feed */}
        {!loading && user && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-brown-800">Recent activity</h2>

            {activityLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl h-24 animate-pulse
                               border border-cream-200"
                  />
                ))}
              </div>
            )}

            {!activityLoading && activities.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">🌱</p>
                <p className="text-sm">No activity yet</p>
              </div>
            )}

            {!activityLoading && activities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activities.map((a) => (
                  <ActivityItem
                    key={
                      a.type === "review"
                        ? `r-${a.reviewId}`
                        : `l-${a.listId}`
                    }
                    activity={a}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// ─── Edit form ───────────────────────────────────────────────────────────────
interface EditProps {
  user: User;
  onCancel: () => void;
  onSave: (patch: UpdateUserInput) => Promise<void>;
}

function EditProfileForm({ user, onCancel, onSave }: EditProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [genres, setGenres] = useState<string[]>(user.favouriteGenres);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleGenre(g: string) {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSave({
        displayName: displayName.trim(),
        avatarUrl: avatarUrl.trim() === "" ? null : avatarUrl.trim(),
        favouriteGenres: genres,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-cream-200 shadow-sm
                 p-6 flex flex-col gap-4"
    >
      <h2 className="text-lg font-bold text-brown-800">Edit profile</h2>

      <label className="flex flex-col gap-1 text-sm text-brown-700">
        Display name
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          maxLength={100}
          className="px-3 py-2 rounded-lg border border-cream-200 bg-cream-50
                     text-brown-800 placeholder-gray-400 focus:outline-none
                     focus:ring-2 focus:ring-forest-600 focus:border-transparent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-brown-700">
        Avatar URL
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.png"
          className="px-3 py-2 rounded-lg border border-cream-200 bg-cream-50
                     text-brown-800 placeholder-gray-400 focus:outline-none
                     focus:ring-2 focus:ring-forest-600 focus:border-transparent"
        />
      </label>

      <fieldset className="flex flex-col gap-2 text-sm text-brown-700">
        <legend className="mb-1">Favourite genres</legend>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const selected = genres.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                aria-pressed={selected}
                className={`text-xs font-semibold px-3 py-1 rounded-full border
                            transition focus:outline-none focus:ring-2
                            focus:ring-forest-600 ${
                              selected
                                ? `${
                                    GENRE_COLOURS[g] ??
                                    "bg-gray-100 text-gray-700"
                                  } border-transparent`
                                : "bg-white text-brown-700 border-cream-200 hover:bg-cream-50"
                            }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <p
          role="alert"
          className="text-sm text-red-700 bg-red-50 border border-red-200
                     rounded-lg px-3 py-2"
        >
          ⚠️ {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-forest-600 hover:bg-forest-700 text-white font-semibold
                     rounded-lg px-4 py-2 text-sm transition disabled:opacity-50
                     disabled:cursor-not-allowed focus:outline-none
                     focus:ring-2 focus:ring-forest-700 focus:ring-offset-2
                     focus:ring-offset-white"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-sm text-brown-700 hover:text-brown-800 hover:underline
                     focus:outline-none focus:ring-2 focus:ring-forest-600
                     rounded px-1 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
