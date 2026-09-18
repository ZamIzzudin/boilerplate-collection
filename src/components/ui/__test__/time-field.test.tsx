/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { TimeField } from "../field/time-field";

jest.mock("@/components/ui/field/types", () => ({
  FieldWrapper: ({ children }: any) => (
    <div data-testid="field-wrapper">{children}</div>
  ),
}));

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ render }: any) => <div>{render}</div>,
  PopoverContent: ({ children }: any) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@phosphor-icons/react", () => ({
  ClockIcon: () => <span data-testid="clock-icon" />,
}));

const renderTimeField = (props: any = {}) =>
  render(
    <TimeField label="Jam" id="jam" value="" onChange={() => {}} {...props} />,
  );

const getItem = (value: string, part: "hour" | "minute") =>
  screen.getAllByRole("button").find(
    (el) => el.getAttribute("data-part") === part && el.textContent === value,
  );

describe("TimeField", () => {
  it("menampilkan satu field trigger berisi nilai HH:MM", () => {
    renderTimeField({ value: "14:07" });
    expect(screen.getByText("14:07")).toBeInTheDocument();
  });

  it("men-disable jam sebelum start_time", () => {
    renderTimeField({ start_time: "14:30" });

    expect(getItem("13", "hour")?.hasAttribute("disabled")).toBe(true);
    expect(getItem("14", "hour")?.hasAttribute("disabled")).toBe(false);
    expect(getItem("15", "hour")?.hasAttribute("disabled")).toBe(false);
    expect(getItem("23", "hour")?.hasAttribute("disabled")).toBe(false);
  });

  it("men-disable jam setelah end_time", () => {
    renderTimeField({ end_time: "16:00" });

    expect(getItem("15", "hour")?.hasAttribute("disabled")).toBe(false);
    expect(getItem("16", "hour")?.hasAttribute("disabled")).toBe(false);
    expect(getItem("17", "hour")?.hasAttribute("disabled")).toBe(true);
    expect(getItem("00", "hour")?.hasAttribute("disabled")).toBe(false);
  });

  it("men-disable menit sebelum start menit saat jam = start hour", () => {
    renderTimeField({ start_time: "14:30", value: "14:40" });

    // jam 14 dipilih → menit < 30 di-disable
    expect(getItem("20", "minute")?.hasAttribute("disabled")).toBe(true);
    expect(getItem("30", "minute")?.hasAttribute("disabled")).toBe(false);
    expect(getItem("59", "minute")?.hasAttribute("disabled")).toBe(false);
    // nilai tersimpan 14:40 tetap boleh dipilih
    expect(getItem("40", "minute")?.hasAttribute("disabled")).toBe(false);
  });

  it("men-disable menit setelah end menit saat jam = end hour", () => {
    renderTimeField({ end_time: "16:00", value: "16:20" });

    expect(getItem("00", "minute")?.hasAttribute("disabled")).toBe(false);
    expect(getItem("30", "minute")?.hasAttribute("disabled")).toBe(true);
    expect(getItem("59", "minute")?.hasAttribute("disabled")).toBe(true);
    // nilai tersimpan 16:20 tetap boleh dipilih
    expect(getItem("20", "minute")?.hasAttribute("disabled")).toBe(false);
  });

  it("nilai tersimpan tidak di-disable meski di luar batas (data lama tetap bisa disubmit)", () => {
    renderTimeField({ start_time: "14:30", value: "13:10" });

    // jam 13 sebenarnya sebelum start (14) tapi karena tersimpan, tidak di-disable
    expect(getItem("13", "hour")?.hasAttribute("disabled")).toBe(false);
    // menit 10 pada jam 13 tidak di-disable (jam bukan start hour)
    expect(getItem("10", "minute")?.hasAttribute("disabled")).toBe(false);
  });

  it("menit bebas saat jam bukan start/end hour", () => {
    renderTimeField({ start_time: "14:30", end_time: "16:00", value: "15:00" });

    expect(getItem("01", "minute")?.hasAttribute("disabled")).toBe(false);
    expect(getItem("30", "minute")?.hasAttribute("disabled")).toBe(false);
    expect(getItem("59", "minute")?.hasAttribute("disabled")).toBe(false);
  });
});
