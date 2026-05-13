"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
app_1.default.listen(PORT, () => {
    console.log(`🚀  BookShelf API running at http://localhost:${PORT}`);
    console.log(`    Health: http://localhost:${PORT}/api/health`);
    console.log(`    Books:  http://localhost:${PORT}/api/books`);
});
//# sourceMappingURL=index.js.map