jest.mock("@/lib/validation", () => ({
  createBlurHandler: () => jest.fn(),
  createChangeHandler: () => jest.fn(),
  requiredString: (label: string) => {
    const z = require("zod");
    return z.string().min(1, `${label} wajib diisi`);
  },
  passwordField: (label: string) => {
    const z = require("zod");
    return z
      .string()
      .min(8, `${label} minimal 8 karakter`)
      .regex(/\d/, `${label} harus mengandung angka`);
  },
}));

jest.mock("@/lib/utils", () => ({
  maskEmail: (email: string) => email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock("@/components/ui/form-field", () => ({
  FormField: ({ id, label, ...props }: any) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} data-testid={id} {...props} />
    </div>
  ),
}));

import { render, screen, fireEvent } from "@testing-library/react";
import { ForgotPasswordForm } from "../forgot-password-form";

const defaultProps = {
  form: { userTypeId: "", email: "" },
  setForm: jest.fn(),
  loading: false,
  isSuccess: false,
  onSubmit: jest.fn(),
  setFormType: jest.fn(),
  userTypeOptions: [],
  userTypeLoading: false,
  userTypeSearch: "",
  setUserTypeSearch: jest.fn(),
  loadMoreUserTypes: jest.fn(),
  formErrors: {},
};

describe("ForgotPasswordForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders forgot password title", () => {
    render(<ForgotPasswordForm {...defaultProps} />);
    expect(screen.getByText("Atur Ulang Kata Sandi")).toBeInTheDocument();
  });

  it("renders back to login button", () => {
    render(<ForgotPasswordForm {...defaultProps} />);
    expect(screen.getByText("Ke Laman Login")).toBeInTheDocument();
  });

  it("calls setFormType with login when back button clicked", () => {
    render(<ForgotPasswordForm {...defaultProps} />);
    fireEvent.click(screen.getByText("Ke Laman Login"));
    expect(defaultProps.setFormType).toHaveBeenCalledWith("login");
  });

  it("renders email field", () => {
    render(<ForgotPasswordForm {...defaultProps} />);
    expect(screen.getByTestId("email")).toBeInTheDocument();
  });

  it("renders user type selector", () => {
    render(<ForgotPasswordForm {...defaultProps} />);
    expect(screen.getByTestId("userTypeId")).toBeInTheDocument();
  });

  it("renders submit button with Kirim Tautan text", () => {
    render(<ForgotPasswordForm {...defaultProps} />);
    expect(screen.getByText("Kirim Tautan")).toBeInTheDocument();
  });

  it("shows Loading when loading is true", () => {
    render(<ForgotPasswordForm {...defaultProps} loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows success message when isSuccess is true", () => {
    render(<ForgotPasswordForm {...defaultProps} isSuccess={true} />);
    expect(screen.getByText(/Kami sudah mengirim Email/)).toBeInTheDocument();
  });

  it("shows back to login link in success state", () => {
    render(<ForgotPasswordForm {...defaultProps} isSuccess={true} />);
    expect(screen.getByText("Ke Laman Login")).toBeInTheDocument();
  });
});