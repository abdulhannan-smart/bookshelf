"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJson = readJson;
exports.writeJson = writeJson;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// Resolves to the /data directory at the monorepo root
const DATA_DIR = path_1.default.resolve(__dirname, "../../../../data");
/** Read and parse a JSON file from /data */
async function readJson(filename) {
    const filePath = path_1.default.join(DATA_DIR, filename);
    const raw = await promises_1.default.readFile(filePath, "utf-8");
    return JSON.parse(raw);
}
/** Serialize and write data back to a JSON file in /data */
async function writeJson(filename, data) {
    const filePath = path_1.default.join(DATA_DIR, filename);
    await promises_1.default.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
//# sourceMappingURL=jsonStore.js.map