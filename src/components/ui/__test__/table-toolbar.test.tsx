import { render, screen } from "@testing-library/react";

jest.mock("@phosphor-icons/react", () => ({
  FunnelSimpleIcon: () => null,
  DownloadSimpleIcon: () => null,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuTrigger: ({ render: renderProp, children }: any) => (
    <div>{renderProp ?? children}</div>
  ),
}));

import { TableToolbar } from "../table-toolbar";

describe("TableToolbar", () => {
  it("renders filter buttons", () => {
    render(
      <TableToolbar
        filters={[
          {
            key: "year",
            label: "Tahun",
            options: [
              { value: "2026", label: "2026" },
              { value: "2025", label: "2025" },
            ],
          },
        ]}
        activeFilters={{}}
        onFiltersChange={jest.fn()}
      />,
    );
    expect(screen.getByText(/Tahun/)).toBeInTheDocument();
  });

  it("shows 'Semua' when no filter is active", () => {
    render(
      <TableToolbar
        filters={[
          {
            key: "status",
            label: "Status",
            options: [{ value: "active", label: "Active" }],
          },
        ]}
        activeFilters={{}}
        onFiltersChange={jest.fn()}
      />,
    );
    expect(screen.getByText(/Semua/)).toBeInTheDocument();
  });

  it("shows active filter label", () => {
    render(
      <TableToolbar
        filters={[
          {
            key: "status",
            label: "Status",
            options: [{ value: "active", label: "Active" }],
          },
        ]}
        activeFilters={{ status: "active" }}
        onFiltersChange={jest.fn()}
      />,
    );
    expect(screen.getAllByText(/Active/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders download button when downloadOptions provided", () => {
    render(
      <TableToolbar
        activeFilters={{}}
        onFiltersChange={jest.fn()}
        downloadOptions={[{ key: "csv", label: "CSV" }]}
      />,
    );
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("does not render download button when no downloadOptions", () => {
    render(
      <TableToolbar activeFilters={{} } onFiltersChange={jest.fn()} />,
    );
    expect(screen.queryByText("Download")).not.toBeInTheDocument();
  });

  it("renders extraActions", () => {
    render(
      <TableToolbar
        activeFilters={{}}
        onFiltersChange={jest.fn()}
        extraActions={<button data-testid="extra">Extra</button>}
      />,
    );
    expect(screen.getByTestId("extra")).toBeInTheDocument();
  });

  it("renders multiple filters", () => {
    render(
      <TableToolbar
        filters={[
          { key: "year", label: "Year", options: [{ value: "2026", label: "2026" }] },
          { key: "status", label: "Status", options: [{ value: "active", label: "Active" }] },
        ]}
        activeFilters={{}}
        onFiltersChange={jest.fn()}
      />,
    );
    expect(screen.getByText(/Year/)).toBeInTheDocument();
    expect(screen.getByText(/Status/)).toBeInTheDocument();
  });
});
