import axios from "axios";

type ErrorResponseShape = {
  message?: string;
  error?: string;
  errors?: string[] | Record<string, string | string[]>;
  data?: {
    message?: string;
    error?: string;
  };
};

const pickFirstError = (
  errors?: string[] | Record<string, string | string[]>,
) => {
  if (!errors) return undefined;
  if (Array.isArray(errors)) return errors[0];

  const firstValue = Object.values(errors)[0];
  if (Array.isArray(firstValue)) return firstValue[0];
  return firstValue;
};

const collectAllErrors = (
  errors?: string[] | Record<string, string | string[]>,
) => {
  if (!errors) return undefined;
  if (Array.isArray(errors)) return errors.filter(Boolean).join("\n");

  const messages = Object.values(errors).flatMap((val) => {
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === "string" && val.trim()) return [val.trim()];
    return [];
  });

  return messages.length > 0 ? messages.join("\n") : undefined;
};

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ErrorResponseShape | string | undefined;

    if (typeof data === "string" && data.trim()) return data;

    if (data && typeof data === "object") {

      const detailedErrors = collectAllErrors(data.errors);
      if (detailedErrors) {
        return detailedErrors;
      }

      return (
        data.message ||
        data.error ||
        data.data?.message ||
        data.data?.error ||
        pickFirstError(data.errors) ||
        error.message ||
        fallback
      );
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
