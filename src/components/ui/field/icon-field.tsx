import * as React from "react";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "./types";
import { iconMap } from "@/lib/icon-map";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IconFieldProps = Readonly<{
  label: string;
  id: string;
  required?: boolean;
  helperText?: string;
  error?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  value?: string | number | readonly string[];
  name?: string;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}>;

export function IconField({
  label,
  id,
  required,
  helperText,
  error,
  className,
  inputClassName,
  placeholder,
  value,
  name,
  disabled,
  onChange,
}: IconFieldProps) {
  const iconEntries = Object.entries(iconMap);

  let selectValue: string | null | undefined;
  if (value === undefined) {
    selectValue = undefined;
  } else if (typeof value === "string" && value !== "") {
    selectValue = value;
  } else {
    selectValue = null;
  }

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
        items={iconEntries.map(([key]) => ({ label: key, value: key }))}
        value={selectValue}
        disabled={disabled}
        required={required}
        name={name}
        onValueChange={(val) => {
          if (typeof onChange === "function") {
            onChange({
              target: { value: val },
            } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
      >
        <SelectTrigger
          id={id}
          aria-invalid={Boolean(error)}
          className={cn("h-10 w-full py-5", inputClassName)}
        >
          <SelectValue
            placeholder={
              typeof placeholder === "string" ? placeholder : undefined
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {iconEntries.map(([key, IconComp]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  <IconComp className="size-4" />
                  {key}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}
