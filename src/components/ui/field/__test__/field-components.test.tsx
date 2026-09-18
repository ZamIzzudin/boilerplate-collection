import { render, screen, fireEvent } from "@testing-library/react";
import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

jest.mock("@phosphor-icons/react", () => ({
  CalendarIcon: () => null,
  SpinnerGapIcon: () => null,
}));

jest.mock("@/components/ui/field", () => {
  const actual = jest.requireActual("@/components/ui/field");
  return { ...actual };
});

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({ id, placeholder, ...props }: any) => (
    <textarea data-testid={`textarea-${id}`} placeholder={placeholder} {...props} />
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ id, type, placeholder, ...props }: any) => (
    <input data-testid={`input-${id}`} type={type} placeholder={placeholder} {...props} />
  ),
}));

jest.mock("@/components/ui/input-group", () => ({
  InputGroup: ({ children, ...props }: any) => <div data-testid="input-group" {...props}>{children}</div>,
  InputGroupAddon: ({ children }: any) => <div>{children}</div>,
  InputGroupInput: ({ id, type, placeholder, ...props }: any) => (
    <input data-testid={`input-group-input-${id}`} type={type} placeholder={placeholder} {...props} />
  ),
  InputGroupText: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, ...props }: any) => <div data-testid="select" {...props}>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectGroup: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children, id, ...props }: any) => (
    <div data-testid={`select-trigger-${id}`} {...props}>{children}</div>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock("@/components/ui/combobox", () => ({
  Combobox: ({ children }: any) => <div data-testid="combobox">{children}</div>,
  ComboboxContent: ({ children }: any) => <div>{children}</div>,
  ComboboxInput: ({ id, placeholder }: any) => (
    <input data-testid={`combobox-input-${id}`} placeholder={placeholder} />
  ),
  ComboboxItem: ({ children }: any) => <div>{children}</div>,
  ComboboxList: ({ children }: any) => <div>{children}</div>,
  ComboboxEmpty: () => null,
}));

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ id, ...props }: any) => (
    <input data-testid={`checkbox-${id}`} type="checkbox" {...props} />
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock("@/components/ui/calendar", () => ({
  Calendar: () => <div data-testid="calendar" />,
}));

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
  PopoverTrigger: ({ render: renderProp }: any) => renderProp,
}));

jest.mock("@/components/ui/file-input", () => ({
  FileInput: ({ id, placeholder }: any) => (
    <div data-testid={`file-input-${id}`}>{placeholder}</div>
  ),
}));

jest.mock("@/lib/icon-map", () => ({
  iconMap: {
    Users: () => null,
    Database: () => null,
  },
}));

jest.mock("@/hooks/use-indonesian-date", () => ({
  useIndonesianDate: (date: any) => (date ? "15 Juni 2026" : ""),
}));

import { FieldWrapper } from "../types";
import { TextField } from "../text-field";
import { CheckboxField } from "../checkbox-field";
import { DateField } from "../date-field";
import { RadioField } from "../radio-field";
import { FileField } from "../file-field";
import { IconField } from "../icon-field";
import { MultiSelectField } from "../multi-select-field";

describe("FieldWrapper (types.tsx)", () => {
  it("renders label", () => {
    render(
      <FieldWrapper label="Name" id="name">
        <input id="name" />
      </FieldWrapper>,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("renders required asterisk", () => {
    render(
      <FieldWrapper label="Email" id="email" required>
        <input id="email" />
      </FieldWrapper>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders helperText", () => {
    render(
      <FieldWrapper label="Field" id="f" helperText="Help text">
        <input id="f" />
      </FieldWrapper>,
    );
    expect(screen.getByText("Help text")).toBeInTheDocument();
  });

  it("renders error", () => {
    render(
      <FieldWrapper label="Field" id="f" error="Required field">
        <input id="f" />
      </FieldWrapper>,
    );
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <FieldWrapper label="Field" id="f">
        <input data-testid="child-input" id="f" />
      </FieldWrapper>,
    );
    expect(screen.getByTestId("child-input")).toBeInTheDocument();
  });
});

describe("TextField", () => {
  it("renders text input", () => {
    render(
      <TextField
        label="Name"
        id="name"
        type="text"
        options={[]}
        inputProps={{}}
      />,
    );
    expect(screen.getByTestId("input-name")).toBeInTheDocument();
  });

  it("renders password input", () => {
    render(
      <TextField
        label="Password"
        id="pass"
        type="password"
        options={[]}
        inputProps={{}}
      />,
    );
    expect(screen.getByTestId("input-pass")).toHaveAttribute("type", "password");
  });

  it("renders textarea", () => {
    render(
      <TextField
        label="Bio"
        id="bio"
        type="textarea"
        options={[]}
        inputProps={{}}
      />,
    );
    expect(screen.getByTestId("textarea-bio")).toBeInTheDocument();
  });

  it("renders select dropdown", () => {
    render(
      <TextField
        label="Role"
        id="role"
        type="select"
        options={[
          { label: "Admin", value: "admin" },
          { label: "User", value: "user" },
        ]}
        inputProps={{}}
      />,
    );
    expect(screen.getByTestId("select-trigger-role")).toBeInTheDocument();
  });

  it("renders searchable select (combobox)", () => {
    render(
      <TextField
        label="Search"
        id="search"
        type="select"
        searchable
        options={[{ label: "Opt", value: "opt" }]}
        inputProps={{}}
      />,
    );
    expect(screen.getByTestId("combobox")).toBeInTheDocument();
  });

  it("renders with addonStart and addonEnd", () => {
    render(
      <TextField
        label="Price"
        id="price"
        type="number"
        options={[]}
        addonStart="Rp"
        addonEnd="/kg"
        inputProps={{}}
      />,
    );
    expect(screen.getByTestId("input-group")).toBeInTheDocument();
  });

  it("passes inputProps to input", () => {
    render(
      <TextField
        label="Email"
        id="email"
        type="email"
        options={[]}
        inputProps={{ value: "test@test.com", disabled: true }}
      />,
    );
    expect(screen.getByTestId("input-email")).toHaveValue("test@test.com");
    expect(screen.getByTestId("input-email")).toBeDisabled();
  });
});

describe("CheckboxField", () => {
  it("renders checkbox with label", () => {
    render(
      <CheckboxField
        label="Accept"
        id="accept"
        inputProps={{}}
      />,
    );
    expect(screen.getByTestId("checkbox-accept")).toBeInTheDocument();
    expect(screen.getByText("Accept")).toBeInTheDocument();
  });

  it("renders helperText", () => {
    render(
      <CheckboxField
        label="Accept"
        id="accept"
        helperText="Check to agree"
        inputProps={{}}
      />,
    );
    expect(screen.getByText("Check to agree")).toBeInTheDocument();
  });

  it("renders error", () => {
    render(
      <CheckboxField
        label="Accept"
        id="accept"
        error="Required"
        inputProps={{}}
      />,
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});

describe("DateField", () => {
  it("renders with placeholder", () => {
    render(<DateField label="Date" id="date" />);
    expect(screen.getByText("Pilih tanggal")).toBeInTheDocument();
  });

  it("renders custom placeholder", () => {
    render(<DateField label="Date" id="date" placeholder="Pick date" />);
    expect(screen.getByText("Pick date")).toBeInTheDocument();
  });

  it("renders selected date display", () => {
    render(<DateField label="Date" id="date" value="2026-06-15" />);
    expect(screen.getByText("15 Juni 2026")).toBeInTheDocument();
  });

  it("renders required asterisk", () => {
    render(<DateField label="Date" id="date" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders error", () => {
    render(<DateField label="Date" id="date" error="Date required" />);
    expect(screen.getByText("Date required")).toBeInTheDocument();
  });
});

describe("RadioField", () => {
  const options = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  it("renders radio options", () => {
    render(
      <RadioField label="Choice" id="choice" options={options} />,
    );
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("renders checked radio", () => {
    render(
      <RadioField label="Choice" id="choice" options={options} radioValue="yes" />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();
  });

  it("calls onRadioChange when option is clicked", () => {
    const onChange = jest.fn();
    render(
      <RadioField label="Choice" id="choice" options={options} onRadioChange={onChange} />,
    );
    fireEvent.click(screen.getByText("No"));
    expect(onChange).toHaveBeenCalledWith("no");
  });

  it("renders vertical layout", () => {
    render(
      <RadioField label="Choice" id="choice" options={options} radioDirection="vertical" />,
    );
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });
});

describe("FileField", () => {
  it("renders file input with label", () => {
    render(
      <FileField label="Upload" id="upload" />,
    );
    expect(screen.getByTestId("file-input-upload")).toBeInTheDocument();
  });

  it("renders required asterisk", () => {
    render(<FileField label="Upload" id="upload" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders error", () => {
    render(<FileField label="Upload" id="upload" error="File required" />);
    expect(screen.getByText("File required")).toBeInTheDocument();
  });
});

describe("IconField", () => {
  it("renders select with icon options", () => {
    render(<IconField label="Icon" id="icon" />);
    expect(screen.getByTestId("select-trigger-icon")).toBeInTheDocument();
  });

  it("renders placeholder", () => {
    render(<IconField label="Icon" id="icon" placeholder="Pick icon" />);
    expect(screen.getByText("Pick icon")).toBeInTheDocument();
  });
});

describe("MultiSelectField", () => {
  const options = [
    { label: "Red", value: "red" },
    { label: "Blue", value: "blue" },
  ];

  it("renders with placeholder", () => {
    render(
      <MultiSelectField
        label="Colors"
        id="colors"
        options={options}
        multipleValue={[]}
        placeholder="Pick colors"
      />,
    );
    expect(screen.getByText("Pick colors")).toBeInTheDocument();
  });

  it("renders selected values as labels", () => {
    render(
      <MultiSelectField
        label="Colors"
        id="colors"
        options={options}
        multipleValue={["red", "blue"]}
      />,
    );
    expect(screen.getByText("Red, Blue")).toBeInTheDocument();
  });

  it("renders default placeholder when no values selected", () => {
    render(
      <MultiSelectField
        label="Colors"
        id="colors"
        options={options}
        multipleValue={[]}
      />,
    );
    expect(screen.getByText("Pilih opsi")).toBeInTheDocument();
  });
});
