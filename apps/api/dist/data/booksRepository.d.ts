import { Book, CreateBookInput } from "@bookshelf/shared";
export declare function getAllBooks(): Promise<Book[]>;
export declare function getBookById(id: string): Promise<Book | undefined>;
export declare function searchBooks(query: string): Promise<Book[]>;
export declare function createBook(input: CreateBookInput): Promise<Book>;
export declare function deleteBook(id: string): Promise<Book | undefined>;
