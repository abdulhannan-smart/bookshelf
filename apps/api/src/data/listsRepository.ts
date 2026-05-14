import { v4 as uuidv4 } from "uuid";
import { ReadingList, CreateReadingListInput } from "@bookshelf/shared";
import { readJson, writeJson } from "./jsonStore";

const FILE = "lists.json";

export async function getAllLists(): Promise<ReadingList[]> {
  return readJson<ReadingList[]>(FILE);
}

export async function getListById(id: string): Promise<ReadingList | undefined> {
  const lists = await getAllLists();
  return lists.find((l) => l.id === id);
}

export async function getListsByUserId(userId: string): Promise<ReadingList[]> {
  const lists = await getAllLists();
  return lists.filter((l) => l.userId === userId);
}

export async function createList(
  input: CreateReadingListInput
): Promise<ReadingList> {
  const lists = await getAllLists();

  const newList: ReadingList = {
    ...input,
    id: `list_${uuidv4().replace(/-/g, "").slice(0, 8)}`,
    bookIds: [],
    createdAt: new Date().toISOString(),
  };

  lists.push(newList);
  await writeJson(FILE, lists);
  return newList;
}

export async function deleteList(id: string): Promise<boolean> {
  const lists = await getAllLists();
  const index = lists.findIndex((l) => l.id === id);
  if (index === -1) return false;

  lists.splice(index, 1);
  await writeJson(FILE, lists);
  return true;
}

export async function addBookToList(
  id: string,
  bookId: string
): Promise<ReadingList | undefined> {
  const lists = await getAllLists();
  const list = lists.find((l) => l.id === id);
  if (!list) return undefined;

  if (!list.bookIds.includes(bookId)) {
    list.bookIds.push(bookId);
    await writeJson(FILE, lists);
  }
  return list;
}

export async function removeBookFromList(
  id: string,
  bookId: string
): Promise<ReadingList | undefined> {
  const lists = await getAllLists();
  const list = lists.find((l) => l.id === id);
  if (!list) return undefined;

  const index = list.bookIds.indexOf(bookId);
  if (index !== -1) {
    list.bookIds.splice(index, 1);
    await writeJson(FILE, lists);
  }
  return list;
}
