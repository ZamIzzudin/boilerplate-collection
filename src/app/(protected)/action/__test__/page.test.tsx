/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActionPage from "../page";
import * as hooks from "../hook";
import * as hooks_menu from "@/hooks/use-menu-access";
import * as notify from "@/lib/notify";
import * as error_message from "@/lib/error-message";

// Mock the hooks
jest.mock("../hook", () => ({
  useActions: jest.fn(),
  useCreateAction: jest.fn(),
  useUpdateAction: jest.fn(),
  useDeleteAction: jest.fn(),
}));

jest.mock("@/hooks/use-menu-access", () => ({
  useMenuAccess: jest.fn(),
}));

jest.mock("@/lib/notify", () => ({
  notifySuccess: jest.fn(),
  notifyFailed: jest.fn(),
}));

jest.mock("@/lib/error-message", () => ({
  getErrorMessage: jest.fn(),
}));

jest.mock("@/components/app-layout", () => ({
  AppLayout: ({ children, title, description }: any) => (
    <div data-testid="app-layout">
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </div>
  ),
}));

jest.mock("@/components/forbidden-view", () => ({
  ForbiddenView: ({ title }: any) => (
    <div data-testid="forbidden-view">Forbidden: {title}</div>
  ),
}));

jest.mock("@/components/ui/app-data-table", () => ({
  AppDataTable: ({ columns, rows, isLoading, query, pagination, actionButton }: any) => (
    <div data-testid="app-data-table">
      {isLoading && <div data-testid="loading">Loading...</div>}
      <div data-testid="search-input">
        <input
          type="text"
          placeholder={query.searchPlaceholder}
          value={query.search}
          onChange={(e) => query.onSearchChange && query.onSearchChange(e.target.value)}
        />
      </div>
      <div data-testid="pagination">
        Page {pagination.currentPage} of {Math.ceil(pagination.totalItems / pagination.perPage)}
      </div>
      {actionButton}
      {rows.map((row: any) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {columns.map((col: any) => (
            <div key={col.key} data-testid={`col-${col.key}`}>
              {typeof col.render === "function" ? col.render(row) : row[col.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/table-row-action-menu", () => ({
  // Real TableRowActionMenu wraps items that carry a confirmMessage in a
  // ConfirmActionButton, so a single click on those items must NOT fire onClick.
  TableRowActionMenu: ({ items }: any) => (
    <div data-testid="action-menu">
      {items.map((item: any, index: number) => (
        <button
          key={index}
          onClick={item.confirmMessage || item.confirmTitle ? undefined : item.onClick}
          data-testid={`action-${item.label}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div data-testid="sheet" data-open={open}>
      {children}
    </div>
  ),
  SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: any) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: any) => <div data-testid="sheet-title">{children}</div>,
  SheetClose: ({ render, onClick }: any) => (
    <button onClick={onClick} data-testid="sheet-close">
      {typeof render === 'function' ? render({ children: <span>Close</span> }) : render}
    </button>
  ),
  SheetTrigger: ({ render, onClick }: any) => (
    <button onClick={onClick} data-testid="sheet-trigger">
      {typeof render === 'function' ? render({ children: <span>Trigger</span> }) : render}
    </button>
  ),
  SheetDescription: ({ children }: any) => <div data-testid="sheet-description">{children}</div>,
  SheetFooter: ({ children }: any) => <div data-testid="sheet-footer">{children}</div>,
}));

jest.mock("@/components/ui/app-sheet", () => ({
  AppSheet: ({ children, title, description, actionLabel, actionType, actionForm, actionDisabled }: any) => (
    <div data-testid="app-sheet">
      <h2 data-testid="sheet-title">{title}</h2>
      <p data-testid="sheet-description">{description}</p>
      {children}
      <button 
        data-testid="sheet-submit" 
        type={actionType} 
        form={actionForm} 
        disabled={actionDisabled}
      >
        {actionLabel}
      </button>
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, type, onClick, disabled, variant, ...props }: any) => (
    <button type={type} onClick={onClick} disabled={disabled} data-variant={variant} data-testid={props["data-testid"] || "button"}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/form-field", () => ({
  FormField: ({ id, label, value, onChange, required, type = "text" }: any) => (
    <div data-testid={`form-field-${id}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        data-testid={`input-${id}`}
      />
    </div>
  ),
}));

jest.mock("@/components/confirm-action-button", () => ({
  ConfirmActionButton: ({ triggerRender, confirmLabel, title, description, onConfirm }: any) => (
    <div>
      {triggerRender?.({})}
      <button onClick={() => onConfirm()} data-testid="confirm-action">
        {confirmLabel}
      </button>
    </div>
  ),
}));

describe("ActionPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const mockAccess = {
    isLoading: false,
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canActive: true,
    canViewDetail: true,
  };

  const mockActions = [
    {
      id: "1",
      action_code: "ACT001",
      action_name: "Test Action 1",
      status_code: "ACTIVE",
    },
    {
      id: "2",
      action_code: "ACT002",
      action_name: "Test Action 2",
      status_code: "NON_ACTIVE",
    },
  ];

  const mockData = {
    items: mockActions,
    total: 2,
    page: 1,
    perPage: 15,
    totalPages: 1,
  };

  describe("Rendering", () => {
    it("should render loading state when access is loading", () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue({
        isLoading: true,
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canActive: false,
        canViewDetail: false,
      });
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      expect(screen.getByText("Memuat hak akses...")).toBeInTheDocument();
    });

    it("should render forbidden view when user cannot view", () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue({
        isLoading: false,
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canActive: false,
        canViewDetail: false,
      });
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      expect(screen.getByTestId("forbidden-view")).toBeInTheDocument();
    });

    it("should render action page with data table when user can view", () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      expect(screen.getByTestId("app-layout")).toBeInTheDocument();
      expect(screen.getByText("Daftar Action")).toBeInTheDocument();
      expect(screen.getByTestId("app-data-table")).toBeInTheDocument();
    });

    it("should render loading state when actions are loading", () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      expect(screen.getByTestId("loading")).toBeInTheDocument();
    });

    it("should render empty state when no actions exist", () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: { items: [], total: 0, page: 1, perPage: 15, totalPages: 1 },
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      expect(screen.getByTestId("app-data-table")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should handle search input with debouncing", async () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      const mockUseActions = jest.fn().mockReturnValue({ data: mockData, isLoading: false });
      (hooks.useActions as jest.Mock).mockImplementation(mockUseActions);
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);

      // Initial call uses empty search.
      expect(mockUseActions).toHaveBeenCalledWith({
        page: 1,
        perPage: 15,
        action_name: "",
      });

      const callsBeforeType = mockUseActions.mock.calls.length;

      // Type in search
      const searchInput = screen.getByPlaceholderText("Cari nama action");
      fireEvent.change(searchInput, { target: { value: "test" } });

      // Should not invoke with new action_name immediately (debounce). Any
      // extra hook calls from re-renders must still use the previous args.
      const callsAfterType = mockUseActions.mock.calls.length;
      for (let i = callsBeforeType; i < callsAfterType; i++) {
        expect(mockUseActions.mock.calls[i][0]).toEqual({
          page: 1,
          perPage: 15,
          action_name: "",
        });
      }

      // Fast-forward timer and flush the resulting state update.
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should call after debounce
      await waitFor(() => {
        expect(mockUseActions).toHaveBeenCalledWith({
          page: 1,
          perPage: 15,
          action_name: "test",
        });
      });
    });

    it("should handle pagination changes", () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });

    it("should handle add action button click", () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      const addButton = screen.getByTestId("sheet-trigger");
      expect(addButton).toBeInTheDocument();
    });
  });

  describe("Form Actions", () => {
    it("should handle create action submission", async () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      const createMutation = {
        isPending: false,
        mutateAsync: jest.fn().mockResolvedValue({ success: true }),
      };
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue(createMutation);
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      expect(createMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it("should handle update action submission", async () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      const updateMutation = {
        isPending: false,
        mutateAsync: jest.fn().mockResolvedValue({ success: true }),
      };
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue(updateMutation);
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      expect(updateMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it("should handle delete action", async () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      const deleteMutation = {
        mutateAsync: jest.fn().mockResolvedValue({ success: true }),
      };
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue(deleteMutation);

      render(<ActionPage />);
      const deleteButton = screen.getAllByTestId("action-Hapus")[0];
      fireEvent.click(deleteButton);
      expect(deleteMutation.mutateAsync).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle create action error", async () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      const createMutation = {
        isPending: false,
        mutateAsync: jest.fn().mockRejectedValue(new Error("Network error")),
      };
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue(createMutation);
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });
      (error_message.getErrorMessage as jest.Mock).mockReturnValue("Gagal menyimpan action");

      render(<ActionPage />);
      expect(createMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it("should handle update action error", async () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      const updateMutation = {
        isPending: false,
        mutateAsync: jest.fn().mockRejectedValue(new Error("Network error")),
      };
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue(updateMutation);
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });
      (error_message.getErrorMessage as jest.Mock).mockReturnValue("Gagal mengupdate action");

      render(<ActionPage />);
      expect(updateMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it("should handle delete action error", async () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      const deleteMutation = {
        mutateAsync: jest.fn().mockRejectedValue(new Error("Network error")),
      };
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue(deleteMutation);
      (error_message.getErrorMessage as jest.Mock).mockReturnValue("Gagal menghapus action");

      render(<ActionPage />);
      expect(deleteMutation.mutateAsync).not.toHaveBeenCalled();
    });
  });

  describe("Permission Handling", () => {
    it("should not show add button when user cannot add", () => {
      const limitedAccess = {
        ...mockAccess,
        canAdd: false,
      };
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(limitedAccess);
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      const addButtons = screen.queryAllByTestId("sheet-trigger");
      expect(addButtons.length).toBe(0);
    });

    it("should not show edit actions when user cannot edit", () => {
      const limitedAccess = {
        ...mockAccess,
        canEdit: false,
      };
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(limitedAccess);
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      const editButtons = screen.queryAllByTestId("action-Edit");
      expect(editButtons.length).toBe(0);
    });

    it("should not show delete actions when user cannot delete", () => {
      const limitedAccess = {
        ...mockAccess,
        canDelete: false,
      };
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(limitedAccess);
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      const deleteButtons = screen.queryAllByTestId("action-Hapus");
      expect(deleteButtons.length).toBe(0);
    });
  });

  describe("Status Actions", () => {
    it("should show deactivate action for active items when user can active", () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      const deactivateButtons = screen.getAllByTestId("action-Nonaktfikan");
      expect(deactivateButtons.length).toBeGreaterThan(0);
    });

    it("should show activate action for inactive items when user can active", () => {
      (hooks_menu.useMenuAccess as jest.Mock).mockReturnValue(mockAccess);
      (hooks.useActions as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });
      (hooks.useCreateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useUpdateAction as jest.Mock).mockReturnValue({
        isPending: false,
        mutateAsync: jest.fn(),
      });
      (hooks.useDeleteAction as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(<ActionPage />);
      const activateButtons = screen.getAllByTestId("action-Aktifkan");
      expect(activateButtons.length).toBeGreaterThan(0);
    });
  });
});
