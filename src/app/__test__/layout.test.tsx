import { render, screen } from "@testing-library/react";
import RootLayout from "../layout";

describe("RootLayout", () => {
  it("renders children", () => {
    render(
      <RootLayout>
        <div data-testid="child">Hello</div>
      </RootLayout>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <RootLayout>
        <div data-testid="child1">One</div>
        <div data-testid="child2">Two</div>
      </RootLayout>,
    );
    expect(screen.getByTestId("child1")).toBeInTheDocument();
    expect(screen.getByTestId("child2")).toBeInTheDocument();
  });

  it("renders string children", () => {
    render(<RootLayout>Text content</RootLayout>);
    expect(screen.getByText("Text content")).toBeInTheDocument();
  });

  it("renders nested elements", () => {
    render(
      <RootLayout>
        <div>
          <span data-testid="nested">Nested</span>
        </div>
      </RootLayout>,
    );
    expect(screen.getByTestId("nested")).toBeInTheDocument();
  });
});