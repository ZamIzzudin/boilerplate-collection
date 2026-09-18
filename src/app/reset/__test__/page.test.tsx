import { render, screen, act } from "@testing-library/react";
import { useResetPassword } from "../hook";
import { notifyFailed } from "@/lib/notify";
import { getErrorMessage } from "@/lib/error-message";
import ResetPasswordPage from "../page";

jest.mock("../hook", () => ({
  useResetPassword: jest.fn(),
}));

jest.mock("@/lib/notify", () => ({
  notifyFailed: jest.fn(),
}));

jest.mock("@/lib/error-message", () => ({
  getErrorMessage: jest.fn(() => "parsed error"),
}));

jest.mock("@/components/token-password-form", () => ({
  TokenPasswordForm: ({ title, buttonText, alertTitle, alertDescription, action, onSubmit }: any) => {
    const handleSuccess = () => onSubmit("tok", "pass", "cpass");
    const handleError = async () => {
      try {
        await onSubmit("tok", "bad", "bad");
      } catch {
        // swallow to prevent unhandled rejection leaking between tests
      }
    };
    return (
      <div data-testid="token-password-form">
        <span data-testid="title">{title}</span>
        <span data-testid="button-text">{buttonText}</span>
        <span data-testid="alert-title">{alertTitle}</span>
        <span data-testid="alert-description">{alertDescription}</span>
        <span data-testid="action">{action}</span>
        <button data-testid="submit-btn" onClick={handleSuccess}>
          Submit
        </button>
        <button data-testid="submit-error-btn" onClick={handleError}>
          Submit Error
        </button>
      </div>
    );
  },
}));

const mockedUseResetPassword = useResetPassword as jest.Mock;

describe("ResetPasswordPage", () => {
  let mockMutateAsync: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync = jest.fn();
    mockedUseResetPassword.mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
    (getErrorMessage as jest.Mock).mockReturnValue("parsed error");
    (notifyFailed as jest.Mock).mockClear();
  });

  it("render TokenPasswordForm dengan props yang benar", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByTestId("title")).toHaveTextContent("Atur Ulang Kata Sandi");
    expect(screen.getByTestId("button-text")).toHaveTextContent("Atur Ulang Kata Sandi");
    expect(screen.getByTestId("alert-title")).toHaveTextContent("Kata sandi akun Anda sudah diatur ulang!");
    expect(screen.getByTestId("alert-description")).toHaveTextContent("Lakukan proses log in untuk mengakses akun SITOLAUT Anda");
    expect(screen.getByTestId("action")).toHaveTextContent("reset");
  });

  it("memanggil mutateAsync dengan payload yang benar saat submit", async () => {
    mockMutateAsync.mockResolvedValue(undefined);

    render(<ResetPasswordPage />);

    await act(async () => {
      screen.getByTestId("submit-btn").click();
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      token: "tok",
      password: "pass",
      confirmPassword: "cpass",
    });
  });

  it("notifyFailed dipanggil saat mutateAsync gagal", async () => {
    const error = new Error("API error");
    mockMutateAsync.mockRejectedValue(error);

    render(<ResetPasswordPage />);

    await act(async () => {
      screen.getByTestId("submit-error-btn").click();
    });

    expect(notifyFailed).toHaveBeenCalledWith({
      title: "Gagal mengatur ulang kata sandi",
      description: "parsed error",
    });
    expect(getErrorMessage).toHaveBeenCalledWith(
      error,
      "Terjadi kesalahan saat mengatur ulang kata sandi",
    );
  });

  it("error dilempar ulang setelah notifyFailed dipanggil", async () => {
    const error = new Error("some error");
    mockMutateAsync.mockRejectedValue(error);

    render(<ResetPasswordPage />);

    await act(async () => {
      screen.getByTestId("submit-error-btn").click();
    });

    expect(notifyFailed).toHaveBeenCalled();
  });

  it("tidak memanggil notifyFailed saat submit berhasil", async () => {
    mockMutateAsync.mockResolvedValue(undefined);

    render(<ResetPasswordPage />);

    await act(async () => {
      screen.getByTestId("submit-btn").click();
    });

    expect(notifyFailed).not.toHaveBeenCalled();
  });
});
