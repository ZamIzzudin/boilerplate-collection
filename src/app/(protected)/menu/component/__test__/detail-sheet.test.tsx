import { describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import DetailSheet from "../detail-sheet";
import type { MenuItem } from "../handler";
import type { DetailAccess } from "@/types";

// Mock imports
jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div data-testid="sheet" data-open={open}>
      <button
        data-testid="close-sheet"
        onClick={() => onOpenChange(false)}
      >
        Close
      </button>
      {children}
    </div>
  ),
  SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: any) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: any) => <div data-testid="sheet-title">{children}</div>,
  SheetDescription: ({ children }: any) => <div data-testid="sheet-description">{children}</div>,
  SheetFooter: ({ children }: any) => <div data-testid="sheet-footer">{children}</div>,
  SheetClose: ({ render }: any) => (
    typeof render === 'function' ? render({ children: <span data-testid="sheet-close">Close</span> }) : <button data-testid="sheet-close">Close</button>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid={`button-${props.variant || "default"}`} onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/confirm-action-button", () => ({
  ConfirmActionButton: ({ triggerRender, onConfirm }: any) => (
    <>
      {triggerRender}
      <button
        data-testid="confirm-delete"
        onClick={() => onConfirm()}
      >
        Confirm
      </button>
    </>
  ),
}));

jest.mock("@phosphor-icons/react", () => ({
  XIcon: () => <span data-testid="x-icon">X</span>,
}));

describe("DetailSheet", () => {
  const mockSelectedItem: MenuItem = {
    id: "1",
    menu_code: "MENU1",
    menu_name: "Test Menu",
    parent_code: null,
    icon: "test-icon",
    slug: "/test-menu",
    order: 1,
    actions: [],
  };

  const mockAccess: DetailAccess = {
    canViewDetail: true,
    canEdit: true,
    canDelete: true,
  };

  const defaultProps = {
    selected: mockSelectedItem,
    access: mockAccess,
    isOpen: true,
    setIsOpen: jest.fn(),
    handleDelete: jest.fn(),
    handleEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render detail sheet when open", () => {
    render(<DetailSheet {...defaultProps} />);

    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("sheet-content")).toBeInTheDocument();
    expect(screen.getByTestId("sheet-header")).toBeInTheDocument();
  });

  it("should display menu details correctly", () => {
    render(<DetailSheet {...defaultProps} />);

    expect(screen.getByText("Detail Menu")).toBeInTheDocument();
    expect(screen.getByText("Test Menu")).toBeInTheDocument();
    expect(screen.getByText("MENU1")).toBeInTheDocument();
    expect(screen.getByText("/test-menu")).toBeInTheDocument();
    expect(screen.getByText("test-icon")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument(); // parent_code is null
  });

  it("should display parent code when available", () => {
    const itemWithParent: MenuItem = {
      ...mockSelectedItem,
      parent_code: "PARENT1",
    };

    render(<DetailSheet {...defaultProps} selected={itemWithParent} />);

    expect(screen.getByText("PARENT1")).toBeInTheDocument();
  });

  it("should display delete button when canDelete is true", () => {
    render(<DetailSheet {...defaultProps} />);

    expect(screen.getByTestId("button-warning-outline")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should not display delete button when canDelete is false", () => {
    const accessWithoutDelete: DetailAccess = {
      ...mockAccess,
      canDelete: false,
    };

    render(<DetailSheet {...defaultProps} access={accessWithoutDelete} />);

    expect(screen.queryByTestId("button-warning-outline")).not.toBeInTheDocument();
  });

  it("should display edit button when canEdit is true", () => {
    render(<DetailSheet {...defaultProps} />);

    expect(screen.getByTestId("button-primary")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("should not display edit button when canEdit is false", () => {
    const accessWithoutEdit: DetailAccess = {
      ...mockAccess,
      canEdit: false,
    };

    render(<DetailSheet {...defaultProps} access={accessWithoutEdit} />);

    expect(screen.queryByTestId("button-primary")).not.toBeInTheDocument();
  });

  it("should call handleDelete when delete is confirmed", async () => {
    const handleDelete = jest.fn();
    render(<DetailSheet {...defaultProps} handleDelete={handleDelete} />);

    const confirmButton = screen.getByTestId("confirm-delete");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(handleDelete).toHaveBeenCalled();
    });
  });

  it("should call handleEdit when edit button is clicked", () => {
    const handleEdit = jest.fn();
    render(<DetailSheet {...defaultProps} handleEdit={handleEdit} />);

    const editButton = screen.getByTestId("button-primary");
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalled();
  });

  it("should call setIsOpen when close button is clicked", () => {
    const setIsOpen = jest.fn();
    render(<DetailSheet {...defaultProps} setIsOpen={setIsOpen} />);

    const closeButton = screen.getByTestId("close-sheet");
    fireEvent.click(closeButton);

    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it("should not display delete button when selected is null", () => {
    render(<DetailSheet {...defaultProps} selected={null} />);

    expect(screen.queryByTestId("button-warning-outline")).not.toBeInTheDocument();
    expect(screen.queryByTestId("confirm-delete")).not.toBeInTheDocument();
  });

  it("should display placeholder values when selected is null", () => {
    render(<DetailSheet {...defaultProps} selected={null} />);

    // Multiple fields fall back to "-" when selected is null (title, slug, parent menu).
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("should not render when isOpen is false", () => {
    render(<DetailSheet {...defaultProps} isOpen={false} />);

    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "false");
  });
});
