import * as React from "react";
import { ClockIcon } from "@phosphor-icons/react";
import { FieldWrapper } from "./types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimeFieldProps {
  label: string;
  id: string;
  required?: boolean;
  helperText?: string;
  error?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  /** "HH:MM" — opsi jam/menit sebelum waktu ini di-disable. */
  start_time?: string;
  /** "HH:MM" — opsi jam/menit setelah waktu ini di-disable. */
  end_time?: string;
  onChange?: (e: any) => void;
  name?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i));

const parseTime = (t: string | undefined): [number, number] | null => {
  if (!t) return null;
  const parts = t.split(":").map(Number);
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
    return null;
  }
  return [parts[0], parts[1]];
};

const optionClassName = (
  isActive: boolean,
  isDisabled: boolean,
): string =>
  cn(
    "w-full rounded-md px-2 py-1.5 text-sm text-center cursor-pointer transition-colors",
    isActive
      ? "bg-primary text-white font-semibold"
      : "text-gray-700 hover:bg-gray-100",
    isDisabled && "opacity-40 cursor-not-allowed",
  );

/**
 * Picker waktu satu field (meniru input type="time" native): trigger
 * menampilkan "HH:MM", saat diklik membuka popover berisi kolom Jam dan
 * Menit. Opsi yang tidak valid di-disable per-item berdasarkan start_time /
 * end_time. Nilai yang sedang tersimpan (value) TIDAK di-disable, sehingga
 * data lama tetap bisa dipertahankan/di-submit tanpa terblokir validasi.
 */
export function TimeField({
  label,
  id,
  required,
  helperText,
  error,
  className,
  inputClassName,
  placeholder = "Pilih jam",
  value,
  disabled,
  start_time,
  end_time,
  onChange,
  name,
}: Readonly<TimeFieldProps>) {
  const selected = value ?? "";
  const [selectedHour, selectedMinute] = selected
    ? selected.split(":")
    : ["", ""];
  const [open, setOpen] = React.useState(false);

  const start = React.useMemo(() => parseTime(start_time), [start_time]);
  const end = React.useMemo(() => parseTime(end_time), [end_time]);

  const emitChange = (hour: string, minute: string) => {
    if (!onChange) return;
    const resolvedHour = hour || "00";
    const resolvedMinute = minute || "00";
    onChange({
      target: {
        value: `${resolvedHour}:${resolvedMinute}`,
        id,
        name,
      },
    });
  };

  const isHourDisabled = React.useCallback(
    (h: string) => {
      // Nilai yang tersimpan selalu boleh dipilih ulang
      if (h === selectedHour) return false;
      const hourNum = Number(h);
      if (start && hourNum < start[0]) return true;
      if (end && hourNum > end[0]) return true;
      return false;
    },
    [selectedHour, start, end],
  );

  const isMinuteDisabled = React.useCallback(
    (m: string) => {
      // Nilai yang tersimpan selalu boleh dipilih ulang
      if (selectedHour && m === selectedMinute) return false;
      if (selectedHour === "") return false;
      const hourNum = Number(selectedHour);
      const minuteNum = Number(m);
      if (start && hourNum === start[0] && minuteNum < start[1]) return true;
      if (end && hourNum === end[0] && minuteNum > end[1]) return true;
      return false;
    },
    [selectedHour, selectedMinute, start, end],
  );

  const hasValue = Boolean(selected);

  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      helperText={helperText}
      error={error}
      className={className}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal h-10 border hover:bg-gray-50/50 px-3 rounded-lg shadow-xs",
                error ? "border-danger" : "border-gray-200",
                hasValue ? "text-black" : "text-muted-foreground",
                disabled && "bg-input/50 opacity-50 cursor-not-allowed",
                inputClassName,
              )}
            >
              <ClockIcon
                className={cn(
                  "mr-2 size-4 shrink-0",
                  error ? "text-danger" : "text-gray-500",
                )}
              />
              <span className="truncate">
                {hasValue ? selected : placeholder}
              </span>
            </Button>
          }
        />
        <PopoverContent className="w-auto p-2 bg-white" align="start">
          <div className="flex gap-2">
            <div className="w-16 space-y-0.5 max-h-56 overflow-y-auto pr-0.5">
              <p className="sticky top-0 bg-white text-xs font-medium text-gray-400 pb-1">
                Jam
              </p>
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  data-part="hour"
                  disabled={isHourDisabled(h)}
                  onClick={() => emitChange(h, selectedMinute)}
                  className={optionClassName(
                    selectedHour === h,
                    isHourDisabled(h),
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="w-16 space-y-0.5 max-h-56 overflow-y-auto pr-0.5">
              <p className="sticky top-0 bg-white text-xs font-medium text-gray-400 pb-1">
                Menit
              </p>
              {MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  data-part="minute"
                  disabled={isMinuteDisabled(m)}
                  onClick={() => emitChange(selectedHour, m)}
                  className={optionClassName(
                    selectedMinute === m,
                    isMinuteDisabled(m),
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}
