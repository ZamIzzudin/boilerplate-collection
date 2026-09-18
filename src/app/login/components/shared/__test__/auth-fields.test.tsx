import { render, screen } from "@testing-library/react";
import { AuthFields } from "../auth-fields";

jest.mock("@/components/ui/form-field", () => ({
  FormField: ({ id, label, error, ...props }: any) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} data-testid={id} {...props} />
      {error && <p data-testid={`${id}-error`}>{error}</p>}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@phosphor-icons/react", () => ({
  EyeIcon: () => <span data-testid="eye-icon" />,
  EyeSlashIcon: () => <span data-testid="eye-slash-icon" />,
}));

const defaultProps = {
  form: { email: "", password: "", userTypeId: "" },
  setForm: jest.fn(),
  fieldErrors: {},
  handleFieldChange: jest.fn(),
  handleBlur: jest.fn(),
};

describe("AuthFields", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders user type selector", () => {
    render(<AuthFields {...defaultProps} />);
    expect(screen.getByTestId("userTypeId")).toBeInTheDocument();
  });

  it("renders email field", () => {
    render(<AuthFields {...defaultProps} />);
    expect(screen.getByTestId("email")).toBeInTheDocument();
  });

  it("does not render password field by default", () => {
    render(<AuthFields {...defaultProps} />);
    expect(screen.queryByTestId("password")).not.toBeInTheDocument();
  });

  it("renders password field when showPasswordField is true", () => {
    render(<AuthFields {...defaultProps} showPasswordField={true} />);
    expect(screen.getByTestId("password")).toBeInTheDocument();
  });

  it("renders forgot password button when showForgotPasswordButton is true", () => {
    render(
      <AuthFields
        {...defaultProps}
        showPasswordField={true}
        showForgotPasswordButton={true}
        setFormType={jest.fn()}
      />,
    );
    expect(screen.getByText("Atur ulang disini")).toBeInTheDocument();
  });

  it("does not render forgot password button by default", () => {
    render(<AuthFields {...defaultProps} showPasswordField={true} />);
    expect(screen.queryByText("Atur ulang disini")).not.toBeInTheDocument();
  });

  it("displays field errors", () => {
    render(
      <AuthFields
        {...defaultProps}
        fieldErrors={{ email: "Email is required" }}
      />,
    );
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("passes userTypeOptions to FormField", () => {
    const options = [{ value: "1", label: "Operator" }];
    render(<AuthFields {...defaultProps} userTypeOptions={options} />);
    expect(screen.getByTestId("userTypeId")).toBeInTheDocument();
  });

  it("passes userTypeLoading to FormField", () => {
    render(<AuthFields {...defaultProps} userTypeLoading={true} />);
    expect(screen.getByTestId("userTypeId")).toBeInTheDocument();
  });

  it("passes minLength to password field", () => {
    render(
      <AuthFields {...defaultProps} showPasswordField={true} minLength={8} />,
    );
    expect(screen.getByTestId("password")).toHaveAttribute("minLength", "8");
  });
});