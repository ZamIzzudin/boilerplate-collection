import * as React from "react";
import { cn } from "@/lib/utils";
import { FieldWrapper, type FormFieldOption } from "./types";

type RadioFieldProps = Readonly<{
  label: string;
  id: string;
  required?: boolean;
  helperText?: string;
  error?: React.ReactNode;
  className?: string;
  options: FormFieldOption[];
  radioValue?: string;
  radioDirection?: "horizontal" | "vertical";
  name?: string;
  disabled?: boolean;
  onRadioChange?: (value: string | number) => void;
}>;

export function RadioField({
  label,
  id,
  required,
  helperText,
  error,
  className,
  options,
  radioValue,
  radioDirection = "horizontal",
  name,
  disabled,
  onRadioChange,
}: RadioFieldProps) {
  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      helperText={helperText}
      error={error}
      className={className}
    >
      <div
        className={cn(
          "flex gap-6 py-2",
          radioDirection === "vertical" ? "flex-col" : "flex-row flex-wrap",
        )}
        data-slot="radio-group"
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            <input
              type="radio"
              name={name ?? id}
              value={option.value}
              checked={radioValue === option.value}
              disabled={disabled}
              onChange={() => onRadioChange?.(option.value)}
              className="aspect-square h-4 w-4 shrink-0 rounded-full border border-primary text-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {option.label}
          </label>
        ))}
      </div>
    </FieldWrapper>
  );
}
