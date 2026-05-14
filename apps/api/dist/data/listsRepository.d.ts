import { ReadingList, CreateReadingListInput } from "@bookshelf/shared";
export declare function getAllLists(): Promise<ReadingList[]>;
export declare function getListById(id: string): Promise<ReadingList | undefined>;
export declare function createList(input: CreateReadingListInput): Promise<ReadingList>;
export declare function deleteList(id: string): Promise<boolean>;
export declare function addBookToList(id: string, bookId: string): Promise<ReadingList | undefined>;
export declare function removeBookFromList(id: string, bookId: string): Promise<ReadingList | undefined>;
