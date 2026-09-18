import * as React from "react";
import { CalendarIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FieldWrapper } from "./types";
import { useIndonesianDate } from "@/hooks/use-indonesian-date";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface DateFieldProps {
  label: string;
  id: string;
  required?: boolean;
  helperText?: string;
  error?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  value?: string | Date;
  disabled?: boolean;
  output_date?: string | ((dateStr: string) => void);
  start_date?: string | Date;
  end_date?: string | Date;
  onChange?: (e: any) => void;
  name?: string;
}

export function DateField({
  label,
  id,
  required,
  helperText,
  error,
  className,
  inputClassName,
  placeholder = "Pilih tanggal",
  value,
  disabled,
  output_date = "yyyy-MM-dd",
  start_date,
  end_date,
  onChange,
  name,
}: Readonly<DateFieldProps>) {
  const parseDate = (
    val: string | Date | undefined | null,
  ): Date | undefined => {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    // Check if simple string is parseable
    try {
      const parsed = parseISO(val);
      if (!Number.isNaN(parsed.getTime())) return parsed;
      const fallback = new Date(val);
      return Number.isNaN(fallback.getTime()) ? undefined : fallback;
    } catch {
      return undefined;
    }
  };

  const selectedDate = parseDate(value);
  const minDate = parseDate(start_date);
  const maxDate = parseDate(end_date);

  const [open, setOpen] = React.useState(false);
  const [isTouched, setIsTouched] = React.useState(false);

  // Format using hooks for display
  const displayDateStr = useIndonesianDate(selectedDate);

  const handleOpenChange = (openState: boolean) => {
    setOpen(openState);
    if (!openState) {
      setIsTouched(true);
    }
  };

  const handleSelect = (date: Date | undefined) => {
    setOpen(false);
    setIsTouched(true);
    if (!date) return;

    // Use output_date string pattern, or fallback to default
    const formatPattern =
      typeof output_date === "string" ? output_date : "yyyy-MM-dd";
    let formatted = "";
    try {
      formatted = format(date, formatPattern);
    } catch {
      // Fallback manual formatting
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      formatted = `${yyyy}-${mm}-${dd}`;
    }

    if (typeof output_date === "function") {
      output_date(formatted);
    }

    if (onChange) {
      onChange({
        target: {
          value: formatted,
          id,
          name,
        },
      });
    }
  };

  const disabledDays = (date: Date) => {
    if (minDate) {
      const checkDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const minCheck = new Date(
        minDate.getFullYear(),
        minDate.getMonth(),
        minDate.getDate(),
      );
      if (checkDate < minCheck) return true;
    }
    if (maxDate) {
      const checkDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const maxCheck = new Date(
        maxDate.getFullYear(),
        maxDate.getMonth(),
        maxDate.getDate(),
      );
      if (checkDate > maxCheck) return true;
    }
    return false;
  };

  const isDataEmpty = !value;
  const computedError =
    error ||
    (required && isTouched && isDataEmpty
      ? `${label} tidak boleh kosong`
      : undefined);
  const errorElement = computedError ? (
    <span className="text-danger">{computedError}</span>
  ) : undefined;

  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      helperText={helperText}
      error={errorElement}
      className={className}
    >
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal h-10 border hover:bg-gray-50/50 px-3 rounded-lg shadow-xs",
                computedError ? "border-danger" : "border-gray-200",
                selectedDate ? "text-black" : "text-muted-foreground",
                disabled && "bg-input/50 opacity-50 cursor-not-allowed",
                inputClassName,
              )}
            >
              <CalendarIcon
                className={cn(
                  "mr-2 size-4 shrink-0",
                  computedError ? "text-danger" : "text-gray-500",
                )}
              />
              <span className="truncate">
                {selectedDate ? displayDateStr : placeholder}
              </span>
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={disabledDays}
          />
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}
