import express from "express";
import cors from "cors";
import morgan from "morgan";

import healthRouter from "./routes/health";
import booksRouter from "./routes/books";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/health", healthRouter);
app.use("/api/books", booksRouter);

// ─── 404 & Error Handlers ────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;