import { render, screen } from "@testing-library/react";
import LoginPage from "../page";

jest.mock("@/app/login/page", () => ({
  __esModule: true,
  default: () => <div data-testid="login-form">LoginForm</div>,
}));

describe("LoginPage", () => {
  it("renders LoginForm component", () => {
    render(<LoginPage />);
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("renders the login form text", () => {
    render(<LoginPage />);
    expect(screen.getByText("LoginForm")).toBeInTheDocument();
  });
});
