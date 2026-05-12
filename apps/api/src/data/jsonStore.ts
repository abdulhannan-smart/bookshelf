import fs from "fs/promises";
import path from "path";

// Resolves to the /data directory at the monorepo root
const DATA_DIR = path.resolve(__dirname, "../../../../data");

/** Read and parse a JSON file from /data */
export async function readJson<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

/** Serialize and write data back to a JSON file in /data */
export async function writeJson<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}