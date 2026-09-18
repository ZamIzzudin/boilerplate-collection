import * as React from "react";
import { cn } from "@/lib/utils";
import { FieldWrapper, type FormFieldOption } from "./types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type MultiSelectFieldProps = Readonly<{
  label: string;
  id: string;
  required?: boolean;
  helperText?: string;
  error?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  options: FormFieldOption[];
  multipleValue: string[];
  placeholder?: string;
  disabled?: boolean;
  onMultipleChange?: (value: string[]) => void;
}>;

export function MultiSelectField({
  label,
  id,
  required,
  helperText,
  error,
  className,
  inputClassName,
  options,
  multipleValue,
  placeholder,
  disabled,
  onMultipleChange,
}: MultiSelectFieldProps) {
  const toggleOption = (value: string[]) => {
    if (!onMultipleChange) return;
    onMultipleChange(value);
  };

  const selectedLabels = multipleValue
    .map((v) => options.find((o) => o.value === v)?.label ?? v)
    .join(", ");

  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      helperText={helperText}
      error={error}
      className={className}
    >
      <Select
        multiple
        items={options.map((option) => ({
          label: option.label,
          value: option.value,
        }))}
        value={multipleValue}
        disabled={disabled}
        onValueChange={toggleOption}
      >
        <SelectTrigger
          id={id}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-10 w-full py-5",
            multipleValue.length === 0 && "text-gray-400",
            inputClassName,
          )}
        >
          {selectedLabels || placeholder || "Pilih opsi"}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={false}
              >
                <span className="flex items-center gap-2">{option.label}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}
