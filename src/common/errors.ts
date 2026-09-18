export class AppError extends Error {
  statusCode: number;
  status: number;
  errors?: Record<string, string>;

  constructor(
    message: string,
    statusCode = 400,
    errors?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.status = statusCode;
    this.errors = errors;
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(message, 403);
  }

  static notFound(message = "Not found"): AppError {
    return new AppError(message, 404);
  }

  static unprocessable(
    message = "Validation error",
    errors?: Record<string, string>,
  ): AppError {
    return new AppError(message, 422, errors);
  }
}
