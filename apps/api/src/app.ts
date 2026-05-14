import express from "express";
import cors from "cors";
import morgan from "morgan";

import healthRouter from "./routes/health";
import booksRouter from "./routes/books";
import reviewsRouter from "./routes/reviews";
import listsRouter from "./routes/lists";
import usersRouter from "./routes/users";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/health", healthRouter);
app.use("/api/books", booksRouter);
app.use("/api/books", reviewsRouter);
app.use("/api/lists", listsRouter);
app.use("/api/users", usersRouter);

// ─── 404 & Error Handlers ────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;