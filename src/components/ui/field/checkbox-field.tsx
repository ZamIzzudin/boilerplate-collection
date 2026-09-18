import * as React from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";

type CheckboxFieldProps = Readonly<{
  label: string;
  id: string;
  helperText?: string;
  error?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  inputProps: React.ComponentProps<"input">;
}>;

export function CheckboxField({
  label,
  id,
  helperText,
  error,
  className,
  inputClassName,
  labelClassName,
  inputProps,
}: CheckboxFieldProps) {
  return (
    <Field
      orientation="horizontal"
      className={className}
      data-invalid={Boolean(error)}
    >
      <Checkbox id={id} className={inputClassName} {...inputProps} />
      <FieldContent>
        <FieldLabel htmlFor={id} className={labelClassName}>
          {label}
        </FieldLabel>
        {helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  );
}
