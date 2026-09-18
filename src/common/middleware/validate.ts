import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodTypeAny } from "zod";
import { AppError } from "@/common/errors";

type RequestPart = "body" | "query" | "params";

/**
 * Validate a request part with a Zod schema and replace it with the parsed value.
 * Responds with 422 + { errors: { field: message } } on failure.
 */
export const validate =
  (schema: ZodTypeAny, part: RequestPart = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[part]);
      if (part === "query") {
        // Express 5 exposes a getter-only `query`; store parsed value separately.
        Object.assign(req, { validQuery: parsed });
      } else {
        req[part] = parsed;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        for (const issue of error.issues) {
          errors[issue.path.join(".") || "_"] = issue.message;
        }
        next(AppError.unprocessable("Validation error", errors));
        return;
      }
      next(error);
    }
  };
