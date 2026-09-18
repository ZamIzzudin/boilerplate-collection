import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QueryProvider } from "../query-provider";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithQuery(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <QueryProvider>{ui}</QueryProvider>
    </MemoryRouter>,
  );
}

describe("QueryProvider", () => {
  it("renders children", () => {
    renderWithQuery(
      <div data-testid="child">Inside QueryProvider</div>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    renderWithQuery(
      <>
        <div data-testid="c1">One</div>
        <div data-testid="c2">Two</div>
      </>,
    );
    expect(screen.getByTestId("c1")).toBeInTheDocument();
    expect(screen.getByTestId("c2")).toBeInTheDocument();
  });

  it("wraps with QueryClientProvider", () => {
    const inner = <div data-testid="inner" />;
    const { container } = render(
      <MemoryRouter>
        <QueryProvider>{inner}</QueryProvider>
      </MemoryRouter>,
    );
    expect(container.querySelector("[data-testid='inner']")).toBeInTheDocument();
  });
});
