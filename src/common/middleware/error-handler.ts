import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/common/errors";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  void next;
  const statusCode = error?.statusCode ?? 500;
  const body: Record<string, unknown> = {
    status: statusCode,
    message: error?.message ?? "Internal server error",
  };

  if (error?.errors) body.errors = error.errors;
  if (statusCode >= 500) console.error("[ERROR]", error);

  res.status(statusCode).json(body);
};
