import * as React from "react";
import { FieldWrapper } from "./types";
import { FileInput } from "@/components/ui/file-input";

type FileFieldProps = Readonly<{
  label: string;
  id: string;
  required?: boolean;
  helperText?: string;
  error?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  name?: string;
  fileAccept?: string;
  filePlaceholder?: string;
  fileValue?: File | string | null;
  fileLoading?: boolean;
  disabled?: boolean;
  onFileChange?: (file: File | null) => void;
  onFileView?: (file: File | string) => void;
}>;

export function FileField({
  label,
  id,
  required,
  helperText,
  error,
  className,
  inputClassName,
  name,
  fileAccept,
  filePlaceholder,
  fileValue,
  fileLoading,
  disabled,
  onFileChange,
  onFileView,
}: FileFieldProps) {
  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      helperText={helperText}
      error={error}
      className={className}
    >
      <FileInput
        id={id}
        name={name ?? id}
        accept={fileAccept}
        value={fileValue}
        onChange={onFileChange}
        placeholder={filePlaceholder}
        disabled={disabled}
        loading={fileLoading}
        className={inputClassName}
        onView={onFileView}
        ariaLabel={label}
      />
    </FieldWrapper>
  );
}
