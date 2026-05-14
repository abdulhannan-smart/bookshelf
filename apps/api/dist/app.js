"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const health_1 = __importDefault(require("./routes/health"));
const books_1 = __importDefault(require("./routes/books"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const lists_1 = __importDefault(require("./routes/lists"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// ─── Global Middleware ────────────────────────────────────────────────────────
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/health", health_1.default);
app.use("/api/books", books_1.default);
app.use("/api/books", reviews_1.default);
app.use("/api/lists", lists_1.default);
// ─── 404 & Error Handlers ────────────────────────────────────────────────────
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map