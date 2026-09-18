import { describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import FormSheet, { type MenuForm } from "../form-sheet";
import type { Access } from "@/types";

// Mock imports
jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div data-testid="sheet" data-open={open}>
      <button
        type="button"
        data-testid="sheet-close-trigger"
        onClick={() => onOpenChange && onOpenChange(false)}
      >
        Toggle
      </button>
      {children}
    </div>
  ),
  SheetTrigger: ({ children, render, onClick }: any) => (
    <button
      type="button"
      data-testid="sheet-trigger"
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
      }}
    >
      {typeof render === 'function' ? render({ children }) : render}
      {typeof render !== 'function' && children}
    </button>
  ),
}));

jest.mock("@/components/ui/app-sheet", () => ({
  AppSheet: ({
    children,
    title,
    description,
    actionLabel,
    actionDisabled,
    actionForm,
    actionType,
  }: any) => (
    <div data-testid="app-sheet">
      <div data-testid="sheet-title">{title}</div>
      <div data-testid="sheet-description">{description}</div>
      <form data-testid={actionForm}>
        {children}
        <button
          type={actionType}
          form={actionForm}
          disabled={actionDisabled}
          data-testid="sheet-submit"
        >
          {actionLabel}
        </button>
      </form>
    </div>
  ),
}));

jest.mock("@/components/ui/form-field", () => ({
  FormField: ({
    id,
    label,
    value,
    onChange,
    type,
    options,
    placeholder,
    required,
    multipleValue,
    onMultipleChange,
    checked,
  }: any) => (
    <div data-testid={`form-field-${id}`}>
      <label htmlFor={id}>{label}</label>
      {type === "select" ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e)}
          required={required}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "multi-select" ? (
        <select
          id={id}
          multiple
          value={multipleValue}
          onChange={(e: any) =>
            onMultipleChange(Array.from(e.target.selectedOptions, (o: any) => o.value))
          }
        >
          {options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "number" ? (
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e)}
          required={required}
        />
      ) : type === "checkbox" ? (
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e)}
        />
      ) : type === "icon" ? (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e)}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e)}
          required={required}
        />
      )}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button data-testid={`button-${variant}`} onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock("@phosphor-icons/react", () => ({
  PlusIcon: () => <span data-testid="plus-icon">+</span>,
}));

describe("FormSheet", () => {
  const initialForm: MenuForm = {
    menu_code: "",
    menu_name: "",
    parent_code: "",
    icon: "",
    slug: "",
    order: "0",
    actions: [],
    is_group: false,
  };

  const mockAccess: Access = {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canViewDetail: true,
  };

  const defaultProps = {
    id: null,
    isOpen: true,
    setIsOpen: jest.fn(),
    reset: jest.fn(),
    isSubmitting: false,
    canSubmit: true,
    access: mockAccess,
    form: initialForm,
    setForm: jest.fn(),
    onSubmit: jest.fn(),
    parentOptions: [
      { label: "None", value: "" },
      { label: "Parent 1", value: "PARENT1" },
    ],
    actionOptions: [
      { label: "View", value: "view" },
      { label: "Edit", value: "edit" },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render form sheet when open", () => {
    render(<FormSheet {...defaultProps} />);

    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("app-sheet")).toBeInTheDocument();
  });

  it("should display add mode title and description when id is null", () => {
    render(<FormSheet {...defaultProps} id={null} />);

    expect(screen.getByTestId("sheet-title")).toHaveTextContent("Tambah Menu");
    expect(screen.getByTestId("sheet-description")).toHaveTextContent(
      "Lengkapi informasi menu di bawah ini"
    );
  });

  it("should display edit mode title and description when id is provided", () => {
    render(<FormSheet {...defaultProps} id="MENU1" />);

    expect(screen.getByTestId("sheet-title")).toHaveTextContent("Edit Menu");
    expect(screen.getByTestId("sheet-description")).toHaveTextContent(
      "Perbarui informasi menu di bawah jika diperlukan"
    );
  });

  it("should display add button when access.canAdd is true", () => {
    render(<FormSheet {...defaultProps} access={{ ...mockAccess, canAdd: true }} />);

    expect(screen.getByTestId("sheet-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("button-primary")).toBeInTheDocument();
    // "Tambah Menu" appears both as the trigger label and as the sheet title when id is null.
    expect(screen.getAllByText("Tambah Menu").length).toBeGreaterThan(0);
  });

  it("should not display add button when access.canAdd is false", () => {
    render(<FormSheet {...defaultProps} access={{ ...mockAccess, canAdd: false }} />);

    expect(screen.queryByTestId("sheet-trigger")).not.toBeInTheDocument();
  });

  it("should display correct action label in normal state", () => {
    render(<FormSheet {...defaultProps} id="MENU1" isSubmitting={false} />);

    expect(screen.getByTestId("sheet-submit")).toHaveTextContent("Perbarui");
  });

  it("should display loading label when isSubmitting is true", () => {
    render(<FormSheet {...defaultProps} id="MENU1" isSubmitting={true} />);

    expect(screen.getByTestId("sheet-submit")).toHaveTextContent("Menyimpan...");
  });

  it("should display save label for add mode", () => {
    render(<FormSheet {...defaultProps} id={null} isSubmitting={false} />);

    expect(screen.getByTestId("sheet-submit")).toHaveTextContent("Simpan");
  });

  it("should disable submit when isSubmitting is true", () => {
    render(<FormSheet {...defaultProps} isSubmitting={true} />);

    expect(screen.getByTestId("sheet-submit")).toBeDisabled();
  });

  it("should disable submit when canSubmit is false", () => {
    render(<FormSheet {...defaultProps} canSubmit={false} />);

    expect(screen.getByTestId("sheet-submit")).toBeDisabled();
  });

  it("should call reset when sheet is closed", () => {
    const reset = jest.fn();
    const setIsOpen = jest.fn();
    render(<FormSheet {...defaultProps} reset={reset} setIsOpen={setIsOpen} />);

    // Drive the mocked Sheet's onOpenChange via the toggle button it renders.
    const toggle = screen.getByTestId("sheet-close-trigger");
    fireEvent.click(toggle);

    // The Sheet component's onOpenChange should be called with false and reset should run.
    expect(setIsOpen).toHaveBeenCalledWith(false);
    expect(reset).toHaveBeenCalled();
  });

  it("should call reset when add button is clicked", () => {
    const reset = jest.fn();
    render(
      <FormSheet {...defaultProps} access={{ ...mockAccess, canAdd: true }} reset={reset} />
    );

    const trigger = screen.getByTestId("sheet-trigger");
    fireEvent.click(trigger);

    expect(reset).toHaveBeenCalled();
  });

  it("should render all form fields", () => {
    render(<FormSheet {...defaultProps} />);

    expect(screen.getByTestId("form-field-menu-name")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-menu-parent")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-menu-actions")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-menu-icon")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-menu-slug")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-menu-order")).toBeInTheDocument();
    expect(screen.getByTestId("form-field-menu-group")).toBeInTheDocument();
  });

  it("should not render parent field when is_group is true", () => {
    const formWithGroup: MenuForm = {
      ...initialForm,
      is_group: true,
    };

    render(<FormSheet {...defaultProps} form={formWithGroup} />);

    // Parent field should not be rendered when is_group is true
    const parentField = screen.queryByTestId("form-field-menu-parent");
    expect(parentField).not.toBeInTheDocument();
  });

  it("should not render actions field when actionOptions is empty", () => {
    render(<FormSheet {...defaultProps} actionOptions={[]} />);

    const actionsField = screen.queryByTestId("form-field-menu-actions");
    expect(actionsField).not.toBeInTheDocument();
  });

  it("should return null when access can't add or edit", () => {
    const accessWithoutPermissions: Access = {
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canView: false,
      canViewDetail: false,
    };

    const { container } = render(
      <FormSheet {...defaultProps} access={accessWithoutPermissions} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render form with initial values", () => {
    const populatedForm: MenuForm = {
      menu_code: "MENU1",
      menu_name: "Test Menu",
      parent_code: "PARENT1",
      icon: "test-icon",
      slug: "/test",
      order: "5",
      actions: ["view", "edit"],
      is_group: false,
    };

    render(<FormSheet {...defaultProps} form={populatedForm} />);

    const nameInput = screen.getByTestId("form-field-menu-name").querySelector("input");
    expect(nameInput).toHaveValue("Test Menu");

    const slugInput = screen.getByTestId("form-field-menu-slug").querySelector("input");
    expect(slugInput).toHaveValue("/test");

    const orderInput = screen.getByTestId("form-field-menu-order").querySelector("input");
    expect(orderInput).toHaveValue(5);
  });
});
