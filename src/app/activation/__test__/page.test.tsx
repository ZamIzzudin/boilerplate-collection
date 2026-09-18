import { render, screen, act } from "@testing-library/react";
import { useUserActivation } from "../hook";
import { notifyFailed } from "@/lib/notify";
import { getErrorMessage } from "@/lib/error-message";
import ActivationPage from "../page";

jest.mock("../hook", () => ({
  useUserActivation: jest.fn(),
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

const mockedUseUserActivation = useUserActivation as jest.Mock;

describe("ActivationPage", () => {
  let mockMutateAsync: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync = jest.fn();
    mockedUseUserActivation.mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
    (getErrorMessage as jest.Mock).mockReturnValue("parsed error");
    (notifyFailed as jest.Mock).mockClear();
  });

  it("render TokenPasswordForm dengan props yang benar", () => {
    render(<ActivationPage />);

    expect(screen.getByTestId("title")).toHaveTextContent("Aktivasi Akun NUTECH BOILERPLATE");
    expect(screen.getByTestId("button-text")).toHaveTextContent("Simpan Kata Sandi");
    expect(screen.getByTestId("alert-title")).toHaveTextContent("Kata sandi akun Anda sudah disimpan!");
    expect(screen.getByTestId("alert-description")).toHaveTextContent("Lakukan proses log in untuk mengakses akun NUTECH BOILERPLATE Anda");
    expect(screen.getByTestId("action")).toHaveTextContent("activation");
  });

  it("memanggil mutateAsync dengan payload yang benar saat submit", async () => {
    mockMutateAsync.mockResolvedValue(undefined);

    render(<ActivationPage />);

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

    render(<ActivationPage />);

    await act(async () => {
      screen.getByTestId("submit-error-btn").click();
    });

    expect(notifyFailed).toHaveBeenCalledWith({
      title: "Gagal mengaktifkan akun",
      description: "parsed error",
    });
    expect(getErrorMessage).toHaveBeenCalledWith(
      error,
      "Terjadi kesalahan saat mengaktifkan akun",
    );
  });

  it("error dilempar ulang setelah notifyFailed dipanggil", async () => {
    const error = new Error("some error");
    mockMutateAsync.mockRejectedValue(error);

    render(<ActivationPage />);

    await act(async () => {
      screen.getByTestId("submit-error-btn").click();
    });

    expect(notifyFailed).toHaveBeenCalled();
  });

  it("tidak memanggil notifyFailed saat submit berhasil", async () => {
    mockMutateAsync.mockResolvedValue(undefined);

    render(<ActivationPage />);

    await act(async () => {
      screen.getByTestId("submit-btn").click();
    });

    expect(notifyFailed).not.toHaveBeenCalled();
  });
});
