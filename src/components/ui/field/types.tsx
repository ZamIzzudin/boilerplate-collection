import type * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

export type FormFieldType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "date"
  | "time"
  | "month"
  | "datetime-local"
  | "textarea"
  | "select"
  | "multi-select"
  | "checkbox"
  | "radio"
  | "file"
  | "icon";

export type FormFieldOption = {
  label: string;
  value: string | number;
};

export type FieldWrapperProps = Readonly<{
  label: string;
  id: string;
  required?: boolean;
  helperText?: string;
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}>;

export function FieldWrapper({
  label,
  id,
  required,
  helperText,
  error,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <Field className={className} data-invalid={Boolean(error)}>
      <FieldLabel className="font-normal" htmlFor={id}>
        {label}
        {required ? <span className="-ml-1 text-red-500">*</span> : null}
      </FieldLabel>
      {helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
      {children}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
