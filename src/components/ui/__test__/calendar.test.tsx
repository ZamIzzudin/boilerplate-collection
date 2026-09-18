import { render, screen } from "@testing-library/react";

jest.mock("react-day-picker", () => ({
  DayPicker: ({ components, className, ...props }: any) => {
    const Root = components.Root;
    const DayButton = components.DayButton;
    return (
      <div data-testid="daypicker" className={className}>
        <Root>
          <button data-testid="prev-month">Prev</button>
          <button data-testid="next-month">Next</button>
          <DayButton
            day={{ date: new Date(2026, 5, 15) }}
            modifiers={{ selected: true, focused: false, range_start: false, range_end: false, range_middle: false }}
          >
            15
          </DayButton>
          <DayButton
            day={{ date: new Date(2026, 5, 16) }}
            modifiers={{ selected: false, focused: false, range_start: false, range_end: false, range_middle: false }}
          >
            16
          </DayButton>
        </Root>
      </div>
    );
  },
  getDefaultClassNames: () => ({
    root: "",
    months: "",
    month: "",
    nav: "",
    button_previous: "",
    button_next: "",
    month_caption: "",
    dropdowns: "",
    dropdown_root: "",
    dropdown: "",
    caption_label: "",
    table: "",
    weekdays: "",
    weekday: "",
    week: "",
    week_number_header: "",
    week_number: "",
    day: "",
    range_start: "",
    range_middle: "",
    range_end: "",
    today: "",
    outside: "",
    disabled: "",
    hidden: "",
    day_button: "",
  }),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  buttonVariants: jest.fn(() => ""),
}));

jest.mock("@phosphor-icons/react", () => ({
  CaretLeftIcon: () => null,
  CaretRightIcon: () => null,
  CaretDownIcon: () => null,
}));

import { Calendar } from "../calendar";

describe("Calendar", () => {
  it("renders the daypicker", () => {
    render(<Calendar />);
    expect(screen.getByTestId("daypicker")).toBeInTheDocument();
  });

  it("renders day buttons", () => {
    render(<Calendar />);
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("16")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Calendar className="custom-calendar" />);
    expect(screen.getByTestId("daypicker").className).toContain("custom-calendar");
  });

  it("renders with default showOutsideDays", () => {
    render(<Calendar />);
    expect(screen.getByTestId("daypicker")).toBeInTheDocument();
  });
});
