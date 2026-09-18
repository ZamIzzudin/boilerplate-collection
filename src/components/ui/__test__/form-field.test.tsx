import { render, screen } from "@testing-library/react";

jest.mock("@/components/ui/field/text-field", () => ({
  TextField: (props: any) => (
    <div data-testid={`text-field-${props.id}`} data-type={props.type}>
      {props.label}
    </div>
  ),
}));
jest.mock("@/components/ui/field/checkbox-field", () => ({
  CheckboxField: (props: any) => (
    <div data-testid={`checkbox-field-${props.id}`}>{props.label}</div>
  ),
}));
jest.mock("@/components/ui/field/date-field", () => ({
  DateField: (props: any) => (
    <div data-testid={`date-field-${props.id}`}>{props.label}</div>
  ),
}));
jest.mock("@/components/ui/field/radio-field", () => ({
  RadioField: (props: any) => (
    <div data-testid={`radio-field-${props.id}`}>{props.label}</div>
  ),
}));
jest.mock("@/components/ui/field/file-field", () => ({
  FileField: (props: any) => (
    <div data-testid={`file-field-${props.id}`}>{props.label}</div>
  ),
}));
jest.mock("@/components/ui/field/icon-field", () => ({
  IconField: (props: any) => (
    <div data-testid={`icon-field-${props.id}`}>{props.label}</div>
  ),
}));
jest.mock("@/components/ui/field/multi-select-field", () => ({
  MultiSelectField: (props: any) => (
    <div data-testid={`multi-select-field-${props.id}`}>{props.label}</div>
  ),
}));

import { FormField } from "../form-field";

describe("FormField", () => {
  it("renders TextField for text type", () => {
    render(<FormField label="Name" id="name" type="text" />);
    expect(screen.getByTestId("text-field-name")).toBeInTheDocument();
  });

  it("renders TextField for password type", () => {
    render(<FormField label="Pass" id="pass" type="password" />);
    expect(screen.getByTestId("text-field-pass")).toBeInTheDocument();
  });

  it("renders TextField for email type", () => {
    render(<FormField label="Email" id="email" type="email" />);
    expect(screen.getByTestId("text-field-email")).toBeInTheDocument();
  });

  it("renders TextField for number type", () => {
    render(<FormField label="Num" id="num" type="number" />);
    expect(screen.getByTestId("text-field-num")).toBeInTheDocument();
  });

  it("renders TextField for textarea type", () => {
    render(<FormField label="Bio" id="bio" type="textarea" />);
    expect(screen.getByTestId("text-field-bio")).toBeInTheDocument();
  });

  it("renders TextField for select type", () => {
    render(<FormField label="Role" id="role" type="select" options={[]} />);
    expect(screen.getByTestId("text-field-role")).toBeInTheDocument();
  });

  it("renders DateField for date type", () => {
    render(<FormField label="Date" id="date" type="date" />);
    expect(screen.getByTestId("date-field-date")).toBeInTheDocument();
  });

  it("renders CheckboxField for checkbox type", () => {
    render(<FormField label="Accept" id="accept" type="checkbox" />);
    expect(screen.getByTestId("checkbox-field-accept")).toBeInTheDocument();
  });

  it("renders RadioField for radio type", () => {
    render(<FormField label="Choice" id="choice" type="radio" options={[]} />);
    expect(screen.getByTestId("radio-field-choice")).toBeInTheDocument();
  });

  it("renders FileField for file type", () => {
    render(<FormField label="Upload" id="upload" type="file" />);
    expect(screen.getByTestId("file-field-upload")).toBeInTheDocument();
  });

  it("renders IconField for icon type", () => {
    render(<FormField label="Icon" id="icon" type="icon" />);
    expect(screen.getByTestId("icon-field-icon")).toBeInTheDocument();
  });

  it("renders MultiSelectField for multi-select type", () => {
    render(
      <FormField
        label="Colors"
        id="colors"
        type="multi-select"
        options={[]}
        multipleValue={[]}
      />,
    );
    expect(screen.getByTestId("multi-select-field-colors")).toBeInTheDocument();
  });

  it("renders nothing when hidden is true", () => {
    const { container } = render(
      <FormField label="Hidden" id="hidden" type="text" hidden />,
    );
    expect(container.innerHTML).toBe("");
  });
});
