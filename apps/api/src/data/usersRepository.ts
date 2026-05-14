import { v4 as uuidv4 } from "uuid";
import { User, CreateUserInput, UpdateUserInput } from "@bookshelf/shared";
import { readJson, writeJson } from "./jsonStore";

const FILE = "users.json";

export async function getAllUsers(): Promise<User[]> {
  return readJson<User[]>(FILE);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await getAllUsers();
  return users.find((u) => u.id === id);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const users = await getAllUsers();

  const newUser: User = {
    ...input,
    id: `user_${uuidv4().replace(/-/g, "").slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeJson(FILE, users);
  return newUser;
}

export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<User | undefined> {
  const users = await getAllUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return undefined;

  const updated: User = { ...users[index], ...input };
  users[index] = updated;
  await writeJson(FILE, users);
  return updated;
}
