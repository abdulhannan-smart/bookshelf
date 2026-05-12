import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message = statusCode === 500 ? "Internal Server Error" : err.message;

  if (statusCode === 500) {
    console.error("[Error]", err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: "Route not found",
    statusCode: 404,
  });
}