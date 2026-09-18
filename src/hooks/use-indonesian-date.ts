import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Hook to format date value (Date object or ISO date string) into Indonesian formatted date.
 * Example display output: "Sen, 29 Juni 2026"
 */
export function useIndonesianDate(
  dateValue: string | Date | null | undefined,
  pattern: string = "EEE, d MMMM yyyy"
) {
  return useMemo(() => {
    if (!dateValue) return "";
    try {
      const parsedDate = typeof dateValue === "string" ? parseISO(dateValue) : dateValue;
      if (Number.isNaN(parsedDate.getTime())) return "";
      return format(parsedDate, pattern, { locale: id });
    } catch {
      return "";
    }
  }, [dateValue, pattern]);
}
