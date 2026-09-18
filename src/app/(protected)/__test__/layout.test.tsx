import { render, screen } from "@testing-library/react";
import ProtectedLayout from "../layout";

describe("ProtectedLayout", () => {
  it("renders children", () => {
    render(
      <ProtectedLayout>
        <div data-testid="child">Protected content</div>
      </ProtectedLayout>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <ProtectedLayout>
        <div data-testid="child1">One</div>
        <div data-testid="child2">Two</div>
      </ProtectedLayout>,
    );
    expect(screen.getByTestId("child1")).toBeInTheDocument();
    expect(screen.getByTestId("child2")).toBeInTheDocument();
  });

  it("renders string children", () => {
    render(<ProtectedLayout>Protected text</ProtectedLayout>);
    expect(screen.getByText("Protected text")).toBeInTheDocument();
  });
});
