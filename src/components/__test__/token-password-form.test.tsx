import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TokenPasswordForm } from "../token-password-form";

jest.mock("@phosphor-icons/react", () => ({
  EyeIcon: () => null,
  EyeSlashIcon: () => null,
  InfoIcon: () => null,
}));

jest.mock("@/components/ui/form-field", () => ({
  FormField: ({ id, label, type, onChange, onBlur, error, ...props }: any) => (
    <div data-testid={`field-${id}`}>
      <label>{label}</label>
      <input
        data-testid={`input-${id}`}
        type={type === "password" || type === "text" ? "password" : type}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
      />
      {error && <p data-testid={`error-${id}`}>{error}</p>}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/alert-message", () => ({
  AlertMessage: ({ open, title }: any) =>
    open ? <div data-testid="alert">{title}</div> : null,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("@/hooks/use-token-validation", () => ({
  useValidToken: () => ({
    mutate: jest.fn(),
  }),
}));

jest.mock("@/lib/crypto", () => ({
  decrypt: jest.fn().mockReturnValue({ id: "123", email: "test@example.com" }),
}));

jest.mock("@/lib/utils", () => ({
  maskEmail: jest.fn().mockReturnValue("t***t@example.com"),
}));

jest.mock("@/lib/error-message", () => ({
  getErrorMessage: jest.fn().mockReturnValue("Error message"),
}));

import { useNavigate, useParams } from "react-router-dom";

const mockNavigate = useNavigate as jest.Mock;
const mockUseParams = useParams as jest.Mock;

const defaultProps = {
  title: "Reset Password",
  buttonText: "Simpan",
  alertTitle: "Berhasil",
  alertDescription: "Password berhasil diubah",
  action: "reset_password",
  onSubmit: jest.fn().mockResolvedValue(undefined),
};

function renderForm(overrides: Partial<typeof defaultProps> = {}) {
  mockNavigate.mockReturnValue(jest.fn());
  mockUseParams.mockReturnValue({ token: "encrypted-token" });

  return render(
    <MemoryRouter initialEntries={["/reset-password/encrypted-token"]}>
      <TokenPasswordForm {...defaultProps} {...overrides} />
    </MemoryRouter>,
  );
}

describe("TokenPasswordForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders title", () => {
    renderForm();
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
  });

  it("renders masked email", () => {
    renderForm();
    expect(screen.getByText("t***t@example.com")).toBeInTheDocument();
  });

  it("renders password and confirm password fields", () => {
    renderForm();
    expect(screen.getByTestId("field-password")).toBeInTheDocument();
    expect(screen.getByTestId("field-confirmPassword")).toBeInTheDocument();
  });

  it("renders submit button with buttonText", () => {
    renderForm();
    expect(screen.getByText("Simpan")).toBeInTheDocument();
  });
});
