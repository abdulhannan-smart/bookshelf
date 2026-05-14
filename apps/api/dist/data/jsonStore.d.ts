/** Read and parse a JSON file from /data */
export declare function readJson<T>(filename: string): Promise<T>;
/** Serialize and write data back to a JSON file in /data */
export declare function writeJson<T>(filename: string, data: T): Promise<void>;
