import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("@/components/app-layout", () => ({
  AppLayout: ({ children, title, description }: any) => (
    <div data-testid="app-layout">
      <span data-testid="layout-title">{title}</span>
      <span data-testid="layout-description">{description}</span>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/map", () => ({
  MapContainer: ({ children }: any) => (
    <div data-testid="map-container">{children}</div>
  ),
  MapControls: () => <div data-testid="map-controls" />,
}));

import DashboardPage from "../page";

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe("DashboardPage", () => {
  it("renders the page with correct title and description", () => {
    renderPage();
    expect(screen.getByTestId("layout-title")).toHaveTextContent("Dashboard");
    expect(screen.getByTestId("layout-description")).toHaveTextContent(
      "Menampilkan ringkasan peta operasional.",
    );
  });

  it("renders the map container", () => {
    renderPage();
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("renders map controls", () => {
    renderPage();
    expect(screen.getByTestId("map-controls")).toBeInTheDocument();
  });
});
