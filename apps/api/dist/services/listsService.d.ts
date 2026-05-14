import { ReadingList, ReadingListWithBooks, CreateReadingListInput, ReadingListBookAction } from "@bookshelf/shared";
export declare function listLists(): Promise<ReadingList[]>;
export declare function findList(id: string): Promise<ReadingListWithBooks>;
export declare function addList(input: CreateReadingListInput): Promise<ReadingList>;
export declare function removeList(id: string): Promise<void>;
export declare function updateBookMembership(id: string, bookId: string, action: ReadingListBookAction): Promise<ReadingList>;
