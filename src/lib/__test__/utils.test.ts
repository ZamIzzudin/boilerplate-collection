import { cn, mapRoles, formatDateID, maskEmail, formatRupiah, isImageBlob } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("handles conflicting tailwind classes", () => {
    const result = cn("px-4", "px-8");
    expect(result).toBe("px-8");
  });

  it("handles undefined and null", () => {
    const result = cn("foo", undefined, null, "bar");
    expect(result).toBe("foo bar");
  });
});

describe("mapRoles", () => {
  it("maps data to role objects", () => {
    const data = [
      { id: 1, user_type_name: "Admin" },
      { id: 2, user_type_name: "User" },
    ];
    const result = mapRoles(data);
    expect(result).toEqual([
      { id: "1", code: "1", name: "Admin" },
      { id: "2", code: "2", name: "User" },
    ]);
  });

  it("handles string ids", () => {
    const data = [{ id: "abc", user_type_name: "Test" }];
    const result = mapRoles(data);
    expect(result[0].id).toBe("abc");
    expect(result[0].code).toBe("abc");
  });

  it("handles empty array", () => {
    expect(mapRoles([])).toEqual([]);
  });
});

describe("formatDateID", () => {
  it("formats date string to Indonesian format", () => {
    const result = formatDateID("2026-06-15");
    expect(result).toBe("15 Juni 2026");
  });

  it("formats Date object", () => {
    const result = formatDateID(new Date(2026, 0, 1));
    expect(result).toBe("1 Januari 2026");
  });

  it("returns - for null", () => {
    expect(formatDateID(null)).toBe("-");
  });

  it("returns - for undefined", () => {
    expect(formatDateID(undefined)).toBe("-");
  });

  it("returns - for invalid date", () => {
    expect(formatDateID("invalid")).toBe("-");
  });

  it("includes time when withTime is true", () => {
    const result = formatDateID("2026-06-15T14:30:00", { withTime: true });
    expect(result).toMatch(/15 Juni 2026 \| \d{2}:\d{2} WIB/);
  });

  it("does not include time by default", () => {
    const result = formatDateID("2026-06-15T14:30:00");
    expect(result).not.toContain("WIB");
  });
});

describe("maskEmail", () => {
  it("masks email with long local part", () => {
    expect(maskEmail("john@example.com")).toBe("j***n@example.com");
  });

  it("masks email with short local part", () => {
    expect(maskEmail("ab@example.com")).toBe("a***@example.com");
  });

  it("masks email with single char local part", () => {
    expect(maskEmail("a@example.com")).toBe("a***@example.com");
  });
});

describe("formatRupiah", () => {
  it("formats number to rupiah", () => {
    expect(formatRupiah("1000000")).toBe("Rp1.000.000");
  });

  it("formats zero", () => {
    expect(formatRupiah("0")).toBe("Rp0");
  });

  it("returns - for null", () => {
    expect(formatRupiah(null)).toBe("-");
  });

  it("returns - for empty string", () => {
    expect(formatRupiah("")).toBe("-");
  });
});

describe("isImageBlob", () => {
  it("returns true for image blob", () => {
    const blob = new Blob([""], { type: "image/png" });
    expect(isImageBlob(blob)).toBe(true);
  });

  it("returns false for non-image blob", () => {
    const blob = new Blob([""], { type: "application/pdf" });
    expect(isImageBlob(blob)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isImageBlob(null)).toBe(false);
  });
});
