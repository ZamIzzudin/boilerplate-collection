import * as React from "react";
import { SpinnerGapIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { FieldWrapper, type FormFieldOption } from "./types";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxEmpty,
} from "@/components/ui/combobox";

type TextFieldProps = Readonly<{
  label: string;
  id: string;
  type: string;
  required?: boolean;
  helperText?: string;
  error?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  searchable?: boolean;
  options: FormFieldOption[];
  selectLoading?: boolean;
  selectLoadingLabel?: string;
  onScrollToBottom?: () => void;
  onSearchChange?: (search: string) => void;
  addonStart?: React.ReactNode;
  addonEnd?: React.ReactNode;
  inputProps: React.ComponentProps<"input">;
}>;

export function TextField(props: TextFieldProps) {
  const { type } = props;

  if (type === "textarea") {
    return <TextAreaField {...props} />;
  }

  if (type === "select") {
    return props.searchable ? (
      <SearchableSelectField {...props} />
    ) : (
      <PlainSelectField {...props} />
    );
  }

  return (
    <FieldWrapper
      label={props.label}
      id={props.id}
      required={props.required}
      helperText={props.helperText}
      error={props.error}
      className={props.className}
    >
      <PlainInput
        type={type}
        id={props.id}
        inputClassName={props.inputClassName}
        placeholder={props.placeholder}
        error={props.error}
        addonStart={props.addonStart}
        addonEnd={props.addonEnd}
        inputProps={props.inputProps}
      />
    </FieldWrapper>
  );
}

function getSelectValue(
  value: React.ComponentProps<"input">["value"],
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === "" || value === null) return null;
  return String(value);
}

function buildResolvedOnChange(
  options: FormFieldOption[],
  onChange?: React.ChangeEventHandler<HTMLInputElement>,
) {
  return (value: string | number | null) => {
    if (typeof onChange !== "function") return;
    if (value === null) {
      onChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
      return;
    }
    const strValue = String(value);
    const matchedOption = options.find((opt) => String(opt.value) === strValue);
    const resolvedValue =
      matchedOption && typeof matchedOption.value === "number"
        ? matchedOption.value
        : strValue;
    onChange({
      target: { value: resolvedValue },
    } as React.ChangeEvent<HTMLInputElement>);
  };
}

function TextAreaField(props: TextFieldProps) {
  const {
    label,
    id,
    required,
    helperText,
    error,
    className,
    inputClassName,
    placeholder,
    inputProps,
  } = props;
  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      helperText={helperText}
      error={error}
      className={className}
    >
      <Textarea
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(inputClassName)}
        placeholder={placeholder}
        {...(inputProps as React.ComponentProps<"textarea">)}
      />
    </FieldWrapper>
  );
}

function SearchableSelectField(props: TextFieldProps) {
  const {
    label,
    id,
    required,
    helperText,
    error,
    className,
    inputClassName,
    placeholder,
    options,
    selectLoading,
    onScrollToBottom,
    onSearchChange,
    inputProps,
  } = props;

  const selectItems = React.useMemo(
    () =>
      options.map((option) => ({
        label: option.label,
        value: String(option.value),
      })),
    [options],
  );
  const selectValue = getSelectValue(inputProps.value);
  const selectDefaultValue = React.useMemo(
    () =>
      typeof inputProps.defaultValue === "string" ||
      typeof inputProps.defaultValue === "number"
        ? String(inputProps.defaultValue)
        : undefined,
    [inputProps.defaultValue],
  );
  const handleChange = React.useMemo(
    () => buildResolvedOnChange(options, inputProps.onChange),
    [options, inputProps.onChange],
  );

  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      helperText={helperText}
      error={error}
      className={className}
    >
      <Combobox
        items={selectItems}
        value={selectValue}
        defaultValue={selectDefaultValue}
        disabled={inputProps.disabled || selectLoading}
        isLoading={selectLoading}
        required={required}
        name={inputProps.name}
        onSearchChange={onSearchChange}
        onValueChange={handleChange}
      >
        <ComboboxInput
          id={id}
          name={inputProps.name}
          aria-invalid={Boolean(error)}
          className={cn("h-10 w-full", inputClassName)}
          placeholder={
            typeof placeholder === "string" ? placeholder : undefined
          }
          showTrigger
          onBlur={inputProps.onBlur}
        />
        <ComboboxContent>
          <ComboboxList
            onScrollToBottom={onScrollToBottom}
            isLoading={selectLoading}
          >
            <ComboboxEmpty />
            {options.map((option) => (
              <ComboboxItem key={option.value} value={option.value}>
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FieldWrapper>
  );
}

function PlainSelectField(props: TextFieldProps) {
  const {
    label,
    id,
    required,
    helperText,
    error,
    className,
    inputClassName,
    placeholder,
    options,
    selectLoading,
    selectLoadingLabel,
    onScrollToBottom,
    inputProps,
  } = props;

  const selectItems = React.useMemo(
    () =>
      options.map((option) => ({
        label: option.label,
        value: String(option.value),
      })),
    [options],
  );
  const selectValue = getSelectValue(inputProps.value);
  const selectDefaultValue = React.useMemo(
    () =>
      typeof inputProps.defaultValue === "string" ||
      typeof inputProps.defaultValue === "number"
        ? String(inputProps.defaultValue)
        : undefined,
    [inputProps.defaultValue],
  );
  const handleChange = React.useMemo(
    () => buildResolvedOnChange(options, inputProps.onChange),
    [options, inputProps.onChange],
  );

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
        items={selectItems}
        value={selectValue}
        defaultValue={selectDefaultValue}
        disabled={inputProps.disabled || selectLoading}
        required={required}
        name={inputProps.name}
        onValueChange={handleChange}
      >
        <SelectTrigger
          id={id}
          aria-invalid={Boolean(error)}
          className={cn("h-10 w-full py-5", inputClassName)}
          onBlur={
            inputProps.onBlur
              ? (e) =>
                  inputProps.onBlur!(
                    e as unknown as React.FocusEvent<HTMLInputElement>,
                  )
              : undefined
          }
        >
          {selectLoading ? (
            <span className="flex items-center gap-2 text-gray-400">
              <SpinnerGapIcon className="size-4 animate-spin" />
              {selectLoadingLabel}
            </span>
          ) : (
            <SelectValue>
              {(val: string | null) => {
                if (val == null || val === "")
                  return typeof placeholder === "string" ? placeholder : null;
                const matched = options.find(
                  (opt) => String(opt.value) === val,
                );
                return matched?.label ?? val;
              }}
            </SelectValue>
          )}
        </SelectTrigger>
        <SelectContent onScrollToBottom={onScrollToBottom}>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}

function PlainInput(
  props: Readonly<{
    type: string;
    id: string;
    inputClassName?: string;
    placeholder?: string;
    error?: React.ReactNode;
    addonStart?: React.ReactNode;
    addonEnd?: React.ReactNode;
    inputProps: React.ComponentProps<"input">;
  }>,
) {
  const {
    type,
    id,
    inputClassName,
    placeholder,
    error,
    addonStart,
    addonEnd,
    inputProps,
  } = props;

  if (addonStart || addonEnd) {
    return (
      <InputGroup className="h-10 py-0.5">
        {addonStart ? (
          <InputGroupAddon
            align="inline-start"
            className="h-10 rounded-tl rounded-bl flex"
          >
            <InputGroupText>{addonStart}</InputGroupText>
          </InputGroupAddon>
        ) : null}
        <InputGroupInput
          id={id}
          type={type}
          aria-invalid={Boolean(error)}
          className={cn("h-full py-2", inputClassName)}
          placeholder={placeholder}
          {...inputProps}
        />
        {addonEnd ? (
          <InputGroupAddon
            align="inline-end"
            className="h-10 rounded-tl rounded-bl flex"
          >
            <InputGroupText>{addonEnd}</InputGroupText>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    );
  }

  return (
    <Input
      id={id}
      type={type}
      aria-invalid={Boolean(error)}
      className={cn("h-10 py-2", inputClassName)}
      placeholder={placeholder}
      {...inputProps}
    />
  );
}
