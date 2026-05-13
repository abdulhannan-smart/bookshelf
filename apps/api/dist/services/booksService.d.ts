import { Book, CreateBookInput } from "@bookshelf/shared";
export declare function listBooks(): Promise<Book[]>;
export declare function findBook(id: string): Promise<Book>;
export declare function searchBooks(query: string): Promise<Book[]>;
export declare function addBook(input: CreateBookInput): Promise<Book>;
export declare function deleteBook(id: string): Promise<Book>;
