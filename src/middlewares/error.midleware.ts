import type { Request, Response, NextFunction } from "express";
import { configuration } from "../config/config.ts";

// Handler only status 404
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(404).json({ message: `${req.originalUrl} is Not Found` });
};

// Global handler for all error (500, etc)
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[ERROR] ${req.method} ${req.path} >> ${message}`);

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    stack: configuration.environment === "development" ? err.stack : undefined,
  });
};