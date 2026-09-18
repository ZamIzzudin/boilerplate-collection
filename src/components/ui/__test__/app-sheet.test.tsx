import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@phosphor-icons/react", () => ({
  XIcon: () => null,
  CaretDownIcon: () => null,
  CheckIcon: () => null,
  SpinnerGapIcon: () => null,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  buttonVariants: jest.fn(() => ""),
}));

jest.mock("@/components/confirm-action-button", () => ({
  ConfirmActionButton: ({ triggerRender, title }: any) => (
    <div data-testid="confirm-action" data-title={title}>
      {triggerRender}
    </div>
  ),
}));

jest.mock("@/components/ui/sheet", () => {
  const actual = jest.requireActual("@/components/ui/sheet");
  return {
    ...actual,
    SheetContent: ({ children, side, ...props }: any) => (
      <div data-testid="sheet-content" data-side={side} {...props}>{children}</div>
    ),
    SheetHeader: ({ children }: any) => <div data-testid="sheet-header">{children}</div>,
    SheetTitle: ({ children }: any) => <h2 data-testid="sheet-title">{children}</h2>,
    SheetDescription: ({ children }: any) => <p data-testid="sheet-desc">{children}</p>,
    SheetFooter: ({ children, className }: any) => (
      <div data-testid="sheet-footer" className={className}>{children}</div>
    ),
    SheetClose: ({ children }: any) => <button data-testid="sheet-close">{children}</button>,
  };
});

import { AppSheet } from "../app-sheet";

describe("AppSheet", () => {
  it("renders title", () => {
    render(<AppSheet title="Sheet Title">Content</AppSheet>);
    expect(screen.getAllByText("Sheet Title").length).toBeGreaterThanOrEqual(1);
  });

  it("renders description", () => {
    render(
      <AppSheet title="Title" description="Sheet description">
        Content
      </AppSheet>,
    );
    expect(screen.getByText("Sheet description")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<AppSheet title="T">Child content</AppSheet>);
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders close button with closeLabel", () => {
    render(<AppSheet title="T" closeLabel="Tutup">C</AppSheet>);
    expect(screen.getByText("Tutup")).toBeInTheDocument();
  });

  it("renders action button with actionLabel", () => {
    render(<AppSheet title="T" actionLabel="Simpan">C</AppSheet>);
    expect(screen.getByText("Simpan")).toBeInTheDocument();
  });

  it("calls onActionClick when action button is clicked", () => {
    const onAction = jest.fn();
    render(
      <AppSheet title="T" actionLabel="Save" onActionClick={onAction}>
        C
      </AppSheet>,
    );
    fireEvent.click(screen.getByText("Save"));
    expect(onAction).toHaveBeenCalled();
  });

  it("renders cancel button when cancelLabel and onCancelClick provided", () => {
    const onCancel = jest.fn();
    render(
      <AppSheet title="T" cancelLabel="Batal" onCancelClick={onCancel}>
        C
      </AppSheet>,
    );
    expect(screen.getByText("Batal")).toBeInTheDocument();
  });

  it("renders confirm dialog when confirmBeforeAction is true", () => {
    render(
      <AppSheet title="T" actionLabel="Delete" confirmBeforeAction>
        C
      </AppSheet>,
    );
    expect(screen.getByTestId("confirm-action")).toBeInTheDocument();
  });

  it("renders with custom footer", () => {
    render(
      <AppSheet title="T" footer={<div data-testid="custom-footer">Custom</div>}>
        C
      </AppSheet>,
    );
    expect(screen.getByTestId("custom-footer")).toBeInTheDocument();
  });

  it("hides footer when showFooter is false", () => {
    render(
      <AppSheet title="T" actionLabel="Save" showFooter={false}>
        C
      </AppSheet>,
    );
    expect(screen.queryByTestId("sheet-footer")).not.toBeInTheDocument();
  });

  it("passes side prop to SheetContent", () => {
    render(<AppSheet title="T" side="left">C</AppSheet>);
    expect(screen.getByTestId("sheet-content")).toHaveAttribute("data-side", "left");
  });

  it("renders close button by default", () => {
    render(<AppSheet title="T">C</AppSheet>);
    expect(screen.getByText("Batalkan")).toBeInTheDocument();
    expect(screen.getByTestId("sheet-footer")).toHaveClass("sm:grid-cols-2");
  });

  it("hides close button and two-column layout when showCloseButton is false", () => {
    render(<AppSheet title="T" actionLabel="Save" showCloseButton={false}>C</AppSheet>);
    expect(screen.queryByText("Batalkan")).not.toBeInTheDocument();
    expect(screen.getByTestId("sheet-footer")).not.toHaveClass("sm:grid-cols-2");
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
