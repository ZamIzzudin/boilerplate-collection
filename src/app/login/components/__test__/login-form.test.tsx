import { render, screen } from "@testing-library/react";

jest.mock("@/lib/validation", () => ({
  createBlurHandler: () => jest.fn(),
  createChangeHandler: () => jest.fn(),
  requiredString: (label: string) => ({ min: () => ({}) }),
  passwordField: (label: string) => ({ min: () => ({}) }),
}));

jest.mock("@/lib/crypto", () => ({
  decrypt: jest.fn((v: string) => v),
  encrypt: jest.fn((v: string) => JSON.stringify(v)),
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

jest.mock("@/app/login/components/shared/auth-fields", () => ({
  AuthFields: ({ showPasswordField, showForgotPasswordButton, fieldErrors }: any) => (
    <div data-testid="auth-fields">
      {showPasswordField && <input data-testid="password-field" />}
      {showForgotPasswordButton && <button data-testid="forgot-btn">Lupa Password</button>}
      {fieldErrors?.email && <span data-testid="email-error">{fieldErrors.email}</span>}
    </div>
  ),
}));

import { LoginForm } from "../login-form";

const defaultProps = {
  form: { email: "", password: "", captcha: "" },
  setForm: jest.fn(),
  loading: false,
  captchaRef: { current: document.createElement("div") },
  onSubmit: jest.fn(),
  gen: jest.fn(),
  validate: jest.fn(() => true),
  formType: "login" as const,
  setFormType: jest.fn(),
  resetForm: jest.fn(),
  formErrors: {},
};

describe("LoginForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders login title", () => {
    render(<LoginForm {...defaultProps} />);
    expect(screen.getByText("Masuk")).toBeInTheDocument();
  });

  it("renders submit button with Log In text", () => {
    render(<LoginForm {...defaultProps} />);
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  it("shows Loading when loading is true", () => {
    render(<LoginForm {...defaultProps} loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders AuthFields component", () => {
    render(<LoginForm {...defaultProps} />);
    expect(screen.getByTestId("auth-fields")).toBeInTheDocument();
  });

  it("merges formErrors and fieldErrors", () => {
    render(
      <LoginForm
        {...defaultProps}
        formErrors={{ email: "Server error" }}
      />
    );
    expect(screen.getByTestId("email-error")).toHaveTextContent("Server error");
  });
});
