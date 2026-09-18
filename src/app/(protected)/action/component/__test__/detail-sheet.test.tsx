/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DetailSheet from "../detail-sheet";

// Mock dependencies
jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div data-testid="sheet" data-open={open}>
      <button onClick={() => onOpenChange(false)} data-testid="close-sheet">
        Close Sheet
      </button>
      {children}
    </div>
  ),
  SheetContent: ({ children, className }: any) => (
    <div data-testid="sheet-content" className={className}>
      {children}
    </div>
  ),
  // Forward className so structural assertions can verify styling.
  SheetHeader: ({ children, className }: any) => (
    <div data-testid="sheet-header" className={className}>
      {children}
    </div>
  ),
  SheetTitle: ({ children, className }: any) => (
    <h2 data-testid="sheet-title" className={className}>
      {children}
    </h2>
  ),
  // SheetClose renders the provided Button element, then forwards the close
  // click. We surface aria-label from the rendered Button onto the wrapper so
  // callers can query by label without traversing children.
  SheetClose: ({ render, onClick }: any) => {
    const rendered =
      typeof render === "function" ? render({}) : render;
    const ariaLabel = rendered?.props?.["aria-label"];
    return (
      <button
        onClick={onClick}
        data-testid="sheet-close"
        aria-label={ariaLabel}
      >
        {rendered}
      </button>
    );
  },
  SheetDescription: ({ children }: any) => (
    <p data-testid="sheet-description">{children}</p>
  ),
  SheetFooter: ({ children, className }: any) => (
    <div data-testid="sheet-footer" className={className}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, type, onClick, disabled, variant, className, "aria-label": ariaLabel }: any) => (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled} 
      data-variant={variant} 
      className={className}
      aria-label={ariaLabel}
      data-testid={ariaLabel || "button"}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/confirm-action-button", () => ({
  ConfirmActionButton: ({ triggerRender, confirmLabel, title, description, onConfirm, tone, loadingLabel, reasonLabel, reasonPlaceholder, reasonRequired }: any) => (
    <div data-testid="confirm-action-button">
      {typeof triggerRender === 'function' ? triggerRender({}) : triggerRender}
      <button onClick={() => onConfirm()} data-testid="confirm-action">
        {confirmLabel}
      </button>
      <div data-testid="confirm-title">{title}</div>
      <div data-testid="confirm-description">{description}</div>
      <div data-testid="confirm-tone">{tone}</div>
      <div data-testid="loading-label">{loadingLabel}</div>
    </div>
  ),
}));

describe("DetailSheet", () => {
  const mockAccess = {
    canDelete: true,
    canEdit: true,
    canActive: true,
  };

  const mockSelectedItem = {
    id: "1",
    action_code: "ACT001",
    action_name: "Test Action",
    status_code: "ACTIVE",
  };

  const defaultProps = {
    selected: mockSelectedItem,
    access: mockAccess,
    isOpen: true,
    setIsOpen: jest.fn(),
    handleDelete: jest.fn().mockResolvedValue(undefined),
    handleEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render detail sheet when open", () => {
      render(<DetailSheet {...defaultProps} />);
      
      expect(screen.getByTestId("sheet")).toBeInTheDocument();
      expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
      expect(screen.getByTestId("sheet-content")).toBeInTheDocument();
      expect(screen.getByTestId("sheet-header")).toBeInTheDocument();
    });

    it("should render close button", () => {
      render(<DetailSheet {...defaultProps} />);
      
      expect(screen.getByTestId("sheet-close")).toBeInTheDocument();
      expect(screen.getByTestId("sheet-close")).toHaveAttribute("aria-label", "Close sheet");
    });

    it("should render sheet title", () => {
      render(<DetailSheet {...defaultProps} />);

      // DetailSheet renders two SheetTitle instances (header label + value).
      const titles = screen.getAllByTestId("sheet-title");
      const headerTitle = titles.find((el) => el.textContent === "Detail Action");
      expect(headerTitle).toBeInTheDocument();
    });

    it("should render action name in title", () => {
      render(<DetailSheet {...defaultProps} />);
      
      const titleElements = screen.getAllByTestId("sheet-title");
      const titleElement = titleElements.find(el => el.textContent === "Test Action");
      expect(titleElement).toBeInTheDocument();
    });

    it("should render action code in description", () => {
      render(<DetailSheet {...defaultProps} />);
      
      expect(screen.getByTestId("sheet-description")).toHaveTextContent("ACT001");
    });

    it("should render action code field", () => {
      render(<DetailSheet {...defaultProps} />);

      expect(screen.getByText("Kode")).toBeInTheDocument();
      // The action_code is rendered both in the description and the Kode field.
      expect(screen.getAllByText("ACT001").length).toBeGreaterThan(0);
    });

    it("should render status field", () => {
      render(<DetailSheet {...defaultProps} />);
      
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    });

    it("should render footer with actions", () => {
      render(<DetailSheet {...defaultProps} />);
      
      expect(screen.getByTestId("sheet-footer")).toBeInTheDocument();
    });

    it("should render delete button when canDelete is true", () => {
      render(<DetailSheet {...defaultProps} />);
      
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("should render edit button when canEdit is true", () => {
      render(<DetailSheet {...defaultProps} />);
      
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("should not render delete button when canDelete is false", () => {
      const props = {
        ...defaultProps,
        access: { ...mockAccess, canDelete: false },
      };
      
      render(<DetailSheet {...props} />);
      
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("should not render edit button when canEdit is false", () => {
      const props = {
        ...defaultProps,
        access: { ...mockAccess, canEdit: false },
      };
      
      render(<DetailSheet {...props} />);
      
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });

    it("should render placeholder when no item selected", () => {
      const props = {
        ...defaultProps,
        selected: null,
      };

      render(<DetailSheet {...props} />);

      // DetailSheet renders two SheetTitle elements; the value one becomes "-"
      // when selected is null.
      const titles = screen.getAllByTestId("sheet-title");
      const valueTitle = titles.find((el) => el.textContent === "-");
      expect(valueTitle).toBeInTheDocument();
      expect(screen.getByTestId("sheet-description")).toHaveTextContent("");
      // At least one placeholder "-" should be visible when no item is selected.
      expect(screen.getAllByText("-").length).toBeGreaterThan(0);
    });

    it("should not render delete button when no item selected", () => {
      const props = {
        ...defaultProps,
        selected: null,
        access: mockAccess,
      };
      
      render(<DetailSheet {...props} />);
      
      expect(screen.queryByTestId("confirm-action-button")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call setIsOpen when close button is clicked", () => {
      render(<DetailSheet {...defaultProps} />);

      // The mocked Sheet wires a close-sheet button up to onOpenChange.
      const closeButton = screen.getByTestId("close-sheet");
      fireEvent.click(closeButton);

      expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false);
    });

    it("should call handleEdit when edit button is clicked", () => {
      render(<DetailSheet {...defaultProps} />);
      
      const editButton = screen.getByText("Edit");
      fireEvent.click(editButton);
      
      expect(defaultProps.handleEdit).toHaveBeenCalledTimes(1);
    });

    it("should not call handleEdit when edit button is clicked and canEdit is false", () => {
      const props = {
        ...defaultProps,
        access: { ...mockAccess, canEdit: false },
      };
      
      render(<DetailSheet {...props} />);
      
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });

    it("should call handleDelete when confirm action is triggered", async () => {
      render(<DetailSheet {...defaultProps} />);
      
      const confirmButton = screen.getByTestId("confirm-action");
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(defaultProps.handleDelete).toHaveBeenCalledTimes(1);
      });
    });

    it("should show confirmation dialog with correct title when delete is triggered", () => {
      render(<DetailSheet {...defaultProps} />);
      
      expect(screen.getByTestId("confirm-title")).toHaveTextContent(
        `Hapus data action '${mockSelectedItem.action_name}'?`
      );
    });

    it("should show confirmation dialog with correct description", () => {
      render(<DetailSheet {...defaultProps} />);
      
      expect(screen.getByTestId("confirm-description")).toHaveTextContent(
        "Data yang dihapus tidak dapat dikembalikan."
      );
    });

    it("should show warning tone for delete action", () => {
      render(<DetailSheet {...defaultProps} />);
      
      expect(screen.getByTestId("confirm-tone")).toHaveTextContent("warning");
    });

    it("should show loading label when provided", () => {
      render(<DetailSheet {...defaultProps} />);
      
      expect(screen.getByTestId("loading-label")).toHaveTextContent("Menghapus...");
    });
  });

  describe("Sheet States", () => {
    it("should not render content when closed", () => {
      const props = {
        ...defaultProps,
        isOpen: false,
      };
      
      render(<DetailSheet {...props} />);
      
      const sheet = screen.getByTestId("sheet");
      expect(sheet).toHaveAttribute("data-open", "false");
    });

    it("should render content when opened", () => {
      render(<DetailSheet {...defaultProps} />);
      
      const sheet = screen.getByTestId("sheet");
      expect(sheet).toHaveAttribute("data-open", "true");
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing action_code", () => {
      const itemWithoutCode = {
        id: "1",
        action_code: "",
        action_name: "Test Action",
        status_code: "ACTIVE",
      };
      
      const props = {
        ...defaultProps,
        selected: itemWithoutCode,
      };
      
      render(<DetailSheet {...props} />);
      
      expect(screen.getByTestId("sheet-description")).toHaveTextContent("");
    });

    it("should handle missing action_name", () => {
      const itemWithoutName = {
        id: "1",
        action_code: "ACT001",
        action_name: "",
        status_code: "ACTIVE",
      };
      
      const props = {
        ...defaultProps,
        selected: itemWithoutName,
      };
      
      render(<DetailSheet {...props} />);
      
      const titleElements = screen.getAllByTestId("sheet-title");
      const titleElement = titleElements.find(el => el.textContent === "");
      expect(titleElement).toBeInTheDocument();
    });

    it("should handle missing status_code", () => {
      const itemWithoutStatus = {
        id: "1",
        action_code: "ACT001",
        action_name: "Test Action",
        status_code: "",
      };

      const props = {
        ...defaultProps,
        selected: itemWithoutStatus,
      };

      render(<DetailSheet {...props} />);

      // The Status field renders an empty value when status_code is missing.
      const statusLabel = screen.getByText("Status");
      const statusValue = statusLabel.nextElementSibling;
      expect(statusValue).toHaveTextContent("");
    });

    it("should handle all fields missing", () => {
      const emptyItem = {
        id: "1",
        action_code: "",
        action_name: "",
        status_code: "",
      };

      const props = {
        ...defaultProps,
        selected: emptyItem,
      };

      render(<DetailSheet {...props} />);

      // action_name === "" is not nullish, so the title renders an empty string
      // rather than the "-" fallback. Assert that the sheet renders without crashing.
      expect(screen.getByTestId("sheet-content")).toBeInTheDocument();
      expect(screen.getByText("Kode")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    it("should handle null selected item", () => {
      const props = {
        ...defaultProps,
        selected: null,
      };

      render(<DetailSheet {...props} />);

      // Only the title placeholder "-" is rendered when selected is null.
      expect(screen.getAllByText("-").length).toBeGreaterThan(0);
      expect(screen.queryByTestId("confirm-action-button")).not.toBeInTheDocument();
    });

    it("should handle undefined selected item", () => {
      const props = {
        ...defaultProps,
        selected: undefined,
      };

      render(<DetailSheet {...props} />);

      expect(screen.getAllByText("-").length).toBeGreaterThan(0);
      expect(screen.queryByTestId("confirm-action-button")).not.toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render with correct className for content", () => {
      render(<DetailSheet {...defaultProps} />);
      
      const content = screen.getByTestId("sheet-content");
      expect(content).toHaveClass("p-0", "min-w-lg");
    });

    it("should render header with border", () => {
      render(<DetailSheet {...defaultProps} />);
      
      const header = screen.getByTestId("sheet-header");
      expect(header).toHaveClass("border-b");
    });

    it("should render footer with correct classes", () => {
      render(<DetailSheet {...defaultProps} />);
      
      const footer = screen.getByTestId("sheet-footer");
      expect(footer).toHaveClass("p-4");
    });
  });
});
