import { z } from "zod";
import axios from "axios";
export const SAFE_CHAR_REGEX = /^[A-Za-z0-9\s.,!?(){}[\]/:\-_%&@#+*=]+$/;

export const requiredString = (label: string) =>
  z.string().min(1, `${label} wajib diisi`);

export const noSpace = (label: string) =>
  z
    .string()
    .transform((val) => val.replaceAll(/\s+/g, ""))
    .refine((val) => val.length > 0, {
      message: `${label} wajib diisi`,
    });

export const safeString = (label: string) =>
  requiredString(label).regex(
    SAFE_CHAR_REGEX,
    `${label} mengandung karakter yang tidak diizinkan`,
  );

export const numericString = (label: string) =>
  requiredString(label).refine((val) => !Number.isNaN(Number(val)), {
    message: `${label} harus berupa angka`,
  });

export const passwordField = (label: string) =>
  z
    .string()
    .min(1, `${label} wajib diisi`)
    .min(8, `${label} minimal 8 karakter`)
    .regex(/\d/, `${label} harus mengandung angka`)
    .regex(/[A-Z]/, `${label} harus mengandung huruf besar`)
    .regex(/[a-z]/, `${label} harus mengandung huruf kecil`)
    .regex(
      /[!@#$%^&*]/,
      `${label} harus mengandung karakter khusus (!@#$%^&*)`,
    );

function unwrapZodSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  let current: z.ZodTypeAny = schema;
  let currentObj = current as unknown as Record<string, unknown>;
  while (currentObj?.["_def"]) {
    const def = currentObj["_def"] as Record<string, unknown>;
    if (def["schema"]) {
      current = def["schema"] as z.ZodTypeAny;
    } else if (def["innerType"]) {
      current = def["innerType"] as z.ZodTypeAny;
    } else {
      break;
    }
    currentObj = current as unknown as Record<string, unknown>;
  }
  return current;
}

function getNestedSchema(schema: z.ZodTypeAny, pathSegments: string[]): z.ZodTypeAny | undefined {
  let current: z.ZodTypeAny | undefined = schema;
  for (const segment of pathSegments) {
    if (!current) return undefined;

    current = unwrapZodSchema(current);

    if (!current) return undefined;

    const currentObj = current as unknown as Record<string, unknown>;
    if ("shape" in currentObj && currentObj.shape) {
      current = (currentObj.shape as Record<string, z.ZodTypeAny>)[segment];
    } else if ("element" in currentObj && currentObj.element) {
      current = currentObj.element as z.ZodTypeAny;
    } else {
      return undefined;
    }
  }
  return current;
}

export function createBlurHandler<T extends Record<string, unknown>>(
  schema: z.ZodTypeAny,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
) {
  return (field: keyof T, value: unknown) => {
    const fieldStr = field as string;
    const pathSegments = fieldStr.split(".");

    const currentSchema = unwrapZodSchema(schema);

    let fieldSchema: z.ZodTypeAny | undefined;
    if (pathSegments.length > 1) {
      fieldSchema = getNestedSchema(currentSchema, pathSegments);
    } else {
      const currentObj = currentSchema as unknown as Record<string, unknown>;
      fieldSchema = currentObj?.shape
        ? (currentObj.shape as Record<string, z.ZodTypeAny>)[fieldStr]
        : undefined;
    }

    if (!fieldSchema) {
      return;
    }

    let parsedValue: any = "";
    if (value !== undefined && value !== null) {
      if (typeof value === "object") {
        parsedValue = value;
      } else if (typeof value === "string") {
        parsedValue = value;
      } else if (typeof value === "number" || typeof value === "boolean") {
        parsedValue = String(value);
      }
    }

    const result = fieldSchema.safeParse(parsedValue);

    if (result.success) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldStr];
        return next;
      });
    } else {
      setErrors((prev) => ({
        ...prev,
        [field]: result.error.issues[0]?.message ?? "",
      }));
    }
  };
}

export function createDetailBlurHandler(
  detailSchema: z.ZodTypeAny,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  prefix: string,
) {
  return (index: number, fieldName: string, detailData: Record<string, unknown>) => {
    const errorKey = `${prefix}.${index}.${fieldName}`;

    const result = detailSchema.safeParse(detailData);

    if (result.success) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    } else {
      const fieldIssue = result.error.issues.find(
        (issue) => issue.path.includes(fieldName),
      );

      if (fieldIssue) {
        setErrors((prev) => ({
          ...prev,
          [errorKey]: fieldIssue.message,
        }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[errorKey];
          return next;
        });
      }
    }
  };
}

export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    fieldErrors[path] = issue.message;
  }
  return fieldErrors;
}

function mapApiErrors(
  apiErrors: Record<string, unknown>,
  fieldMapping?: Record<string, any>,
): Record<string, string> {
  const mappedErrors: Record<string, string> = {};
  for (const [key, val] of Object.entries(apiErrors)) {
    const mappedKey = String(fieldMapping?.[key] ?? key);
    const message = Array.isArray(val) ? val[0] : String(val);
    mappedErrors[mappedKey] = message;
  }
  return mappedErrors;
}

export function handleApiValidationError<T extends Record<string, unknown>>(
  error: unknown,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  fieldMapping?: Record<string, keyof T>,
): Record<string, string> | null {
  if (!axios.isAxiosError(error) || !error.response?.data) {
    return null;
  }

  const responseData = error.response.data;
  if (
    !responseData ||
    typeof responseData !== "object" ||
    !("errors" in responseData)
  ) {
    return null;
  }

  const apiErrors = responseData.errors;
  if (!apiErrors || typeof apiErrors !== "object") {
    return null;
  }

  const mappedErrors = mapApiErrors(
    apiErrors as unknown as Record<string, unknown>,
    fieldMapping,
  );
  setErrors(mappedErrors);
  return mappedErrors;
}

export function createChangeHandler<T extends Record<string, any>>(
  setForm: React.Dispatch<React.SetStateAction<T>>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
) {
  return (field: keyof T, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      const fieldStr = String(field);
      if (!prev[fieldStr]) return prev;
      const next = { ...prev };
      delete next[fieldStr];
      return next;
    });
  };
}
