import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

import { render, screen, fireEvent } from "@testing-library/react";
import ResetPasswordSheet, {
  type ResetPasswordSheetProps,
} from "../reset-password-sheet";

jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: any) => <div data-testid="sheet">{children}</div>,
}));

jest.mock("@/components/ui/app-sheet", () => ({
  AppSheet: ({
    title,
    header,
    children,
    showCloseButton,
    actionDisabled,
    actionForm,
  }: any) => (
    <div
      data-testid="app-sheet"
      data-show-close={String(showCloseButton)}
      data-action-disabled={String(actionDisabled)}
      data-action-form={actionForm}
    >
      <span data-testid="sheet-header">{header}</span>
      <span data-testid="sheet-title">{title}</span>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/form-field", () => ({
  FormField: ({ id, value, onChange, onBlur, label, addonEnd, error }: any) => (
    <label>
      {label}
      <input
        data-testid={id}
        id={id}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
      />
      {addonEnd}
      {error && <span data-testid={`${id}-error`}>{error}</span>}
    </label>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
}));

jest.mock("@phosphor-icons/react", () => ({
  EyeIcon: () => <span data-testid="eye-icon" />,
  EyeSlashIcon: () => <span data-testid="eye-slash-icon" />,
}));

const baseProps: ResetPasswordSheetProps = {
  isOpen: true,
  setIsOpen: jest.fn(),
  step: 1,
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  showCurrentPassword: false,
  showNewPassword: false,
  showConfirmPassword: false,
  isSubmitting: false,
  onCurrentPasswordChange: jest.fn(),
  onNewPasswordChange: jest.fn(),
  onConfirmPasswordChange: jest.fn(),
  onToggleShowCurrentPassword: jest.fn(),
  onToggleShowNewPassword: jest.fn(),
  onToggleShowConfirmPassword: jest.fn(),
  onNext: jest.fn(),
  onSubmit: jest.fn(),
};

function renderSheet(props: Partial<ResetPasswordSheetProps> = {}) {
  return render(<ResetPasswordSheet {...baseProps} {...props} />);
}

describe("ResetPasswordSheet", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders current password step by default", () => {
    renderSheet();
    expect(screen.getByTestId("current-password")).toBeInTheDocument();
    expect(screen.getByTestId("sheet-title")).toHaveTextContent(
      "Ubah Kata Sandi Akun SITOLAUT",
    );
    expect(screen.getByTestId("sheet-header")).toHaveTextContent(
      "Atur Ulang Kata Sandi",
    );
  });

  it("passes showCloseButton false to AppSheet", () => {
    renderSheet();
    expect(screen.getByTestId("app-sheet")).toHaveAttribute(
      "data-show-close",
      "false",
    );
  });

  it("renders new and confirm password fields on step 2", () => {
    renderSheet({ step: 2 });
    expect(screen.getByTestId("new-password")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-password")).toBeInTheDocument();
    expect(screen.getByTestId("sheet-title")).toHaveTextContent(
      "Pengaturan ulang kata sandi",
    );
  });

  it("submits verify form via onNext", () => {
    const onNext = jest.fn();
    const { container } = renderSheet({ onNext, currentPassword: "secret" });
    fireEvent.submit(container.querySelector("#verify-password-form")!);
    expect(onNext).toHaveBeenCalled();
  });

  it("submits reset form via onSubmit", () => {
    const onSubmit = jest.fn();
    const { container } = renderSheet({
      step: 2,
      onSubmit,
      newPassword: "Newpass123!",
      confirmPassword: "Newpass123!",
    });
    fireEvent.submit(container.querySelector("#reset-password-form")!);
    expect(onSubmit).toHaveBeenCalled();
  });

  it("reports current password changes", () => {
    const onCurrentPasswordChange = jest.fn();
    renderSheet({ onCurrentPasswordChange });
    fireEvent.change(screen.getByTestId("current-password"), {
      target: { value: "secret" },
    });
    expect(onCurrentPasswordChange).toHaveBeenCalledWith("secret");
  });

  it("toggles current password visibility", () => {
    const onToggleShowCurrentPassword = jest.fn();
    renderSheet({ onToggleShowCurrentPassword });
    screen.getByTestId("eye-icon").parentElement?.click();
    expect(onToggleShowCurrentPassword).toHaveBeenCalled();
  });

  it("shows error when confirm password does not match new password", () => {
    renderSheet({
      step: 2,
      newPassword: "Newpass123!",
      confirmPassword: "Different123!",
    });
    fireEvent.blur(screen.getByTestId("confirm-password"), {
      target: { value: "Different123!" },
    });
    expect(screen.getByTestId("confirm-password-error")).toHaveTextContent(
      "Kata sandi tidak sesuai",
    );
    expect(screen.getByTestId("app-sheet")).toHaveAttribute(
      "data-action-disabled",
      "true",
    );
  });

  it("does not show error when passwords match", () => {
    renderSheet({
      step: 2,
      newPassword: "Newpass123!",
      confirmPassword: "Newpass123!",
    });
    fireEvent.blur(screen.getByTestId("confirm-password"), {
      target: { value: "Newpass123!" },
    });
    expect(
      screen.queryByTestId("confirm-password-error"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("app-sheet")).toHaveAttribute(
      "data-action-disabled",
      "false",
    );
  });

  it("does not submit reset form when passwords do not match", () => {
    const onSubmit = jest.fn();
    const { container } = renderSheet({
      step: 2,
      newPassword: "Newpass123!",
      confirmPassword: "Different123!",
      onSubmit,
    });
    fireEvent.submit(container.querySelector("#reset-password-form")!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits reset form when passwords match", () => {
    const onSubmit = jest.fn();
    const { container } = renderSheet({
      step: 2,
      newPassword: "Newpass123!",
      confirmPassword: "Newpass123!",
      onSubmit,
    });
    fireEvent.submit(container.querySelector("#reset-password-form")!);
    expect(onSubmit).toHaveBeenCalled();
  });

  it("does not show mismatch error on step 1", () => {
    renderSheet({
      step: 1,
      newPassword: "Newpass123!",
      confirmPassword: "Different123!",
    });
    fireEvent.blur(screen.getByTestId("current-password"), {
      target: { value: "secret" },
    });
    expect(
      screen.queryByTestId("confirm-password-error"),
    ).not.toBeInTheDocument();
  });
});