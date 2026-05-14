import {
  User,
  CreateUserInput,
  UpdateUserInput,
  Genre,
  Review,
  ReadingList,
} from "@bookshelf/shared";
import * as repo from "../data/usersRepository";
import * as reviewsRepo from "../data/reviewsRepository";
import * as listsRepo from "../data/listsRepository";

const VALID_GENRES: Genre[] = [
  "Technology",
  "Fiction",
  "Science",
  "History",
  "Self-Help",
];

export async function findUser(id: string): Promise<User> {
  const user = await repo.getUserById(id);
  if (!user) {
    const err = new Error(`User with id '${id}' not found`);
    (err as any).statusCode = 404;
    throw err;
  }
  return user;
}

export async function addUser(input: CreateUserInput): Promise<User> {
  const { displayName, avatarUrl, favouriteGenres } = input;

  if (!displayName?.trim()) {
    const err = new Error("'displayName' is required");
    (err as any).statusCode = 400;
    throw err;
  }
  if (displayName.trim().length > 100) {
    const err = new Error("'displayName' must be 100 characters or fewer");
    (err as any).statusCode = 400;
    throw err;
  }
  if (
    avatarUrl !== undefined &&
    avatarUrl !== null &&
    typeof avatarUrl !== "string"
  ) {
    const err = new Error("'avatarUrl' must be a string or null");
    (err as any).statusCode = 400;
    throw err;
  }
  if (favouriteGenres !== undefined) {
    if (!Array.isArray(favouriteGenres)) {
      const err = new Error("'favouriteGenres' must be an array");
      (err as any).statusCode = 400;
      throw err;
    }
    for (const g of favouriteGenres) {
      if (!VALID_GENRES.includes(g as Genre)) {
        const err = new Error(
          `'favouriteGenres' contains invalid genre '${g}'`
        );
        (err as any).statusCode = 400;
        throw err;
      }
    }
  }

  return repo.createUser({
    displayName: displayName.trim(),
    avatarUrl: avatarUrl ?? null,
    favouriteGenres: favouriteGenres ?? [],
  });
}

export async function editUser(
  id: string,
  input: UpdateUserInput
): Promise<User> {
  const existing = await repo.getUserById(id);
  if (!existing) {
    const err = new Error(`User with id '${id}' not found`);
    (err as any).statusCode = 404;
    throw err;
  }

  const { displayName, avatarUrl, favouriteGenres } = input;

  if (displayName !== undefined) {
    if (!displayName?.trim()) {
      const err = new Error("'displayName' is required");
      (err as any).statusCode = 400;
      throw err;
    }
    if (displayName.trim().length > 100) {
      const err = new Error("'displayName' must be 100 characters or fewer");
      (err as any).statusCode = 400;
      throw err;
    }
  }
  if (
    avatarUrl !== undefined &&
    avatarUrl !== null &&
    typeof avatarUrl !== "string"
  ) {
    const err = new Error("'avatarUrl' must be a string or null");
    (err as any).statusCode = 400;
    throw err;
  }
  if (favouriteGenres !== undefined) {
    if (!Array.isArray(favouriteGenres)) {
      const err = new Error("'favouriteGenres' must be an array");
      (err as any).statusCode = 400;
      throw err;
    }
    for (const g of favouriteGenres) {
      if (!VALID_GENRES.includes(g as Genre)) {
        const err = new Error(
          `'favouriteGenres' contains invalid genre '${g}'`
        );
        (err as any).statusCode = 400;
        throw err;
      }
    }
  }

  const patch: UpdateUserInput = {};
  if (displayName !== undefined) patch.displayName = displayName.trim();
  if (avatarUrl !== undefined) patch.avatarUrl = avatarUrl;
  if (favouriteGenres !== undefined) patch.favouriteGenres = favouriteGenres;

  const updated = await repo.updateUser(id, patch);
  return updated!;
}

export async function getActivity(
  id: string
): Promise<{ reviews: Review[]; listUpdates: ReadingList[] }> {
  const user = await repo.getUserById(id);
  if (!user) {
    const err = new Error(`User with id '${id}' not found`);
    (err as any).statusCode = 404;
    throw err;
  }

  const [reviews, listUpdates] = await Promise.all([
    reviewsRepo.getReviewsByUserId(id),
    listsRepo.getListsByUserId(id),
  ]);

  return { reviews, listUpdates };
}
