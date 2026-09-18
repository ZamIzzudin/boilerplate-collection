import * as React from "react";
import type { FormFieldType, FormFieldOption } from "./field/types";
import { FileField } from "./field/file-field";
import { CheckboxField } from "./field/checkbox-field";
import { MultiSelectField } from "./field/multi-select-field";
import { RadioField } from "./field/radio-field";
import { IconField } from "./field/icon-field";
import { TextField } from "./field/text-field";
import { DateField } from "./field/date-field";
import { TimeField } from "./field/time-field";

type FormFieldProps = {
  label: string;
  id: string;
  type?: FormFieldType;
  hidden?: boolean;
  helperText?: string;
  error?: React.ReactNode;
  options?: FormFieldOption[];
  selectLoading?: boolean;
  selectLoadingLabel?: string;
  onScrollToBottom?: () => void;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  addonStart?: React.ReactNode;
  addonEnd?: React.ReactNode;
  radioDirection?: "horizontal" | "vertical";
  fileAccept?: string;
  filePlaceholder?: string;
  fileValue?: File | string | null;
  fileLoading?: boolean;
  onFileChange?: (file: File | null) => void;
  onFileView?: (file: File | string) => void;
  multipleValue?: string[];
  onMultipleChange?: (value: string[]) => void;
  radioValue?: string;
  onRadioChange?: (value: string | number) => void;
  placeholder?: string;
  searchable?: boolean;
  loading?: boolean;
  onSearchChange?: (search: string) => void;
  output_date?: string | ((dateStr: string) => void);
  start_date?: string | Date;
  end_date?: string | Date;
  start_time?: string;
  end_time?: string;
} & Omit<React.ComponentProps<"input">, "type"> &
  Omit<React.ComponentProps<"textarea">, "type"> &
  Omit<React.ComponentProps<"select">, "type">;

function FormField({
  type = "text",
  hidden = false,
  options = [],
  selectLoading,
  selectLoadingLabel = "Memuat data...",
  loading,
  className,
  inputClassName,
  labelClassName,
  addonStart,
  addonEnd,
  radioDirection = "horizontal",
  multipleValue = [],
  searchable = false,
  ...props
}: FormFieldProps) {
  const isSelectLoading = selectLoading ?? loading ?? false;
  if (hidden) return null;

  if (type === "file") {
    return (
      <FileField
        label={props.label}
        id={props.id}
        required={props.required}
        helperText={props.helperText}
        error={props.error}
        className={className}
        inputClassName={inputClassName}
        name={props.name}
        fileAccept={props.fileAccept}
        filePlaceholder={props.filePlaceholder}
        fileValue={props.fileValue}
        fileLoading={props.fileLoading}
        disabled={props.disabled}
        onFileChange={props.onFileChange}
        onFileView={props.onFileView}
      />
    );
  }

  if (type === "checkbox") {
    return (
      <CheckboxField
        label={props.label}
        id={props.id}
        helperText={props.helperText}
        error={props.error}
        className={className}
        inputClassName={inputClassName}
        labelClassName={labelClassName}
        inputProps={props}
      />
    );
  }

  if (type === "multi-select") {
    return (
      <MultiSelectField
        label={props.label}
        id={props.id}
        required={props.required}
        helperText={props.helperText}
        error={props.error}
        className={className}
        inputClassName={inputClassName}
        options={options}
        multipleValue={multipleValue}
        placeholder={props.placeholder}
        disabled={props.disabled}
        onMultipleChange={props.onMultipleChange}
      />
    );
  }

  if (type === "radio") {
    return (
      <RadioField
        label={props.label}
        id={props.id}
        required={props.required}
        helperText={props.helperText}
        error={props.error}
        className={className}
        options={options}
        radioValue={props.radioValue}
        radioDirection={radioDirection}
        name={props.name}
        disabled={props.disabled}
        onRadioChange={props.onRadioChange}
      />
    );
  }

  if (type === "icon") {
    return (
      <IconField
        label={props.label}
        id={props.id}
        required={props.required}
        helperText={props.helperText}
        error={props.error}
        className={className}
        inputClassName={inputClassName}
        placeholder={props.placeholder}
        value={props.value}
        name={props.name}
        disabled={props.disabled}
        onChange={props.onChange}
      />
    );
  }
  if (type === "date") {
    return (
      <DateField
        label={props.label}
        id={props.id}
        required={props.required}
        helperText={props.helperText}
        error={props.error}
        className={className}
        inputClassName={inputClassName}
        placeholder={props.placeholder}
        value={props.value as string | Date | undefined}
        disabled={props.disabled}
        output_date={props.output_date}
        start_date={props.start_date}
        end_date={props.end_date}
        onChange={props.onChange}
        name={props.name}
      />
    );
  }

  if (type === "time") {
    return (
      <TimeField
        label={props.label}
        id={props.id}
        required={props.required}
        helperText={props.helperText}
        error={props.error}
        className={className}
        inputClassName={inputClassName}
        placeholder={props.placeholder}
        value={props.value as string | undefined}
        disabled={props.disabled}
        start_time={props.start_time}
        end_time={props.end_time}
        onChange={props.onChange}
        name={props.name}
      />
    );
  }

  return (
    <TextField
      label={props.label}
      id={props.id}
      type={type}
      required={props.required}
      helperText={props.helperText}
      error={props.error}
      className={className}
      inputClassName={inputClassName}
      placeholder={props.placeholder}
      searchable={searchable}
      options={options}
      selectLoading={isSelectLoading}
      selectLoadingLabel={selectLoadingLabel}
      onScrollToBottom={props.onScrollToBottom}
      onSearchChange={props.onSearchChange}
      addonStart={addonStart}
      addonEnd={addonEnd}
      inputProps={props}
    />
  );
}

export { FormField };
