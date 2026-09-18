import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ForbiddenView } from "../forbidden-view";

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("ForbiddenView", () => {
  it("renders default title", () => {
    renderWithRouter(<ForbiddenView />);
    expect(screen.getByText("Akses ditolak")).toBeInTheDocument();
  });

  it("renders custom title", () => {
    renderWithRouter(<ForbiddenView title="Custom Forbidden" />);
    expect(screen.getByText("Custom Forbidden")).toBeInTheDocument();
  });

  it("renders access denied description", () => {
    renderWithRouter(<ForbiddenView />);
    expect(
      screen.getByText(/Anda tidak memiliki action view/),
    ).toBeInTheDocument();
  });
});
