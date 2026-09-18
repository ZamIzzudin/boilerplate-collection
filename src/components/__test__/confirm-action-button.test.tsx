import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmActionButton } from "../confirm-action-button";

jest.mock("@phosphor-icons/react", () => ({
  SealCheckIcon: () => null,
  SealQuestionIcon: () => null,
  SealWarningIcon: () => null,
  XCircleIcon: () => null,
  XIcon: () => null,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open }: any) => (
    <div data-testid="alert-dialog" data-open={open}>{children}</div>
  ),
  AlertDialogAction: ({ children, onClick, disabled }: any) => (
    <button data-testid="confirm-btn" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children, ...props }: any) => (
    <button data-testid="cancel-btn" {...props}>{children}</button>
  ),
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h3>{children}</h3>,
  AlertDialogTrigger: ({ render: renderProp }: any) => renderProp,
}));

describe("ConfirmActionButton", () => {
  const defaultProps = {
    triggerLabel: "Delete",
    confirmLabel: "Yes, delete",
    loadingLabel: "Loading...",
    title: "Confirm Delete",
    description: "Are you sure?",
    onConfirm: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders trigger button with label", () => {
    render(<ConfirmActionButton {...defaultProps} />);
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("renders with controlled open state", () => {
    render(<ConfirmActionButton {...defaultProps} open={true} />);
    expect(screen.getByTestId("alert-dialog")).toHaveAttribute("data-open", "true");
  });

  it("calls onConfirm when confirm is clicked", async () => {
    render(<ConfirmActionButton {...defaultProps} open={true} />);
    fireEvent.click(screen.getByTestId("confirm-btn"));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it("renders reason textarea when reasonLabel is provided", () => {
    render(
      <ConfirmActionButton
        {...defaultProps}
        open={true}
        reasonLabel="Alasan"
        reasonPlaceholder="Masukkan alasan"
      />,
    );
    expect(screen.getByPlaceholderText("Masukkan alasan")).toBeInTheDocument();
  });

  it("does not render reason textarea by default", () => {
    render(<ConfirmActionButton {...defaultProps} open={true} />);
    expect(screen.queryByPlaceholderText("Masukkan alasan")).not.toBeInTheDocument();
  });

  it("renders custom content when provided", () => {
    render(
      <ConfirmActionButton
        {...defaultProps}
        open={true}
        content={<div data-testid="custom-content">Custom</div>}
      />,
    );
    expect(screen.getByTestId("custom-content")).toBeInTheDocument();
  });

  it("disables confirm button when confirmDisabled is true", () => {
    render(
      <ConfirmActionButton {...defaultProps} open={true} confirmDisabled />,
    );
    expect(screen.getByTestId("confirm-btn")).toBeDisabled();
  });
});
