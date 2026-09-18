import { renderHook } from "@testing-library/react";
import { useIndonesianDate } from "@/hooks/use-indonesian-date";

describe("useIndonesianDate", () => {
  it("formats a valid ISO string", () => {
    const { result } = renderHook(() => useIndonesianDate("2026-06-29"));
    // default pattern "EEE, d MMMM yyyy" → abbreviated day
    expect(result.current).toBe("Sen, 29 Juni 2026");
  });

  it("formats a Date object", () => {
    const date = new Date(2026, 5, 29); // June 29, 2026
    const { result } = renderHook(() => useIndonesianDate(date));
    expect(result.current).toBe("Sen, 29 Juni 2026");
  });

  it("returns empty string for null", () => {
    const { result } = renderHook(() => useIndonesianDate(null));
    expect(result.current).toBe("");
  });

  it("returns empty string for undefined", () => {
    const { result } = renderHook(() => useIndonesianDate(undefined));
    expect(result.current).toBe("");
  });

  it("returns empty string for invalid date string", () => {
    const { result } = renderHook(() =>
      useIndonesianDate("not-a-date"),
    );
    expect(result.current).toBe("");
  });

  it("returns empty string for Date with NaN time", () => {
    const { result } = renderHook(() => useIndonesianDate(new Date("invalid")));
    expect(result.current).toBe("");
  });

  it("respects custom pattern", () => {
    const { result } = renderHook(() =>
      useIndonesianDate("2026-06-29", "d MMMM yyyy"),
    );
    expect(result.current).toBe("29 Juni 2026");
  });

  it("returns empty string for empty string input", () => {
    const { result } = renderHook(() => useIndonesianDate(""));
    expect(result.current).toBe("");
  });
});
