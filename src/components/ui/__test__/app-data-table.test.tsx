import { render, screen, fireEvent } from "@testing-library/react";
import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

jest.mock("@phosphor-icons/react", () => ({
  CaretDownIcon: () => null,
  CaretRightIcon: () => null,
  FunnelSimpleIcon: () => null,
  ArrowBendDownRightIcon: () => null,
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectGroup: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => null,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock("@/components/ui/form-field", () => ({
  FormField: ({ id, label, value, onChange, options }: any) => (
    <div data-testid={`filter-${id}`}>
      <span>{label}</span>
      <select
        data-testid={`filter-select-${id}`}
        value={value ?? ""}
        onChange={(e) => onChange?.({ target: { value: e.target.value } })}
      >
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
}));

import { AppDataTable } from "../app-data-table";

type TestRow = { id: string; name: string; city: string };

const columns = [
  { key: "name", header: "Name", render: (row: TestRow) => row.name },
  { key: "city", header: "City", render: (row: TestRow) => row.city },
];

const rows: TestRow[] = [
  { id: "1", name: "Alice", city: "Jakarta" },
  { id: "2", name: "Bob", city: "Bandung" },
];

describe("AppDataTable", () => {
  it("renders column headers", () => {
    render(
      <AppDataTable columns={columns} rows={rows} getRowKey={(r) => r.id} />,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();
  });

  it("renders row data", () => {
    render(
      <AppDataTable columns={columns} rows={rows} getRowKey={(r) => r.id} />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Jakarta")).toBeInTheDocument();
    expect(screen.getByText("Bandung")).toBeInTheDocument();
  });

  it("renders empty text when no rows", () => {
    render(
      <AppDataTable columns={columns} rows={[]} getRowKey={(r) => r.id} />,
    );
    expect(screen.getByText("Data tidak tersedia")).toBeInTheDocument();
  });

  it("renders custom empty text", () => {
    render(
      <AppDataTable
        columns={columns}
        rows={[]}
        getRowKey={(r) => r.id}
        emptyText="No data found"
      />,
    );
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(
      <AppDataTable columns={columns} rows={[]} getRowKey={(r) => r.id} isLoading />,
    );
    expect(screen.getByText("Memuat data...")).toBeInTheDocument();
  });

  it("renders pagination when provided", () => {
    render(
      <AppDataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        pagination={{
          totalItems: 20,
          currentPage: 1,
          perPage: 5,
          perPageOptions: [5, 10],
          onPerPageChange: jest.fn(),
          onPageChange: jest.fn(),
        }}
      />,
    );
    expect(screen.getByText("dari 20 data")).toBeInTheDocument();
  });

  it("renders previous/next page buttons", () => {
    const onPageChange = jest.fn();
    render(
      <AppDataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        pagination={{
          totalItems: 20,
          currentPage: 2,
          perPage: 5,
          perPageOptions: [5],
          onPerPageChange: jest.fn(),
          onPageChange,
        }}
      />,
    );
    const prevBtn = screen.getByText("‹");
    const nextBtn = screen.getByText("›");
    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();
  });

  it("disables prev button on first page", () => {
    render(
      <AppDataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        pagination={{
          totalItems: 20,
          currentPage: 1,
          perPage: 5,
          perPageOptions: [5],
          onPerPageChange: jest.fn(),
          onPageChange: jest.fn(),
        }}
      />,
    );
    expect(screen.getByText("‹")).toBeDisabled();
  });

  it("renders expandable rows", () => {
    render(
      <AppDataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        expandable={{
          renderExpandedContent: (row: TestRow) => <div>Expanded {row.name}</div>,
        }}
      />,
    );
    const expandBtns = screen.getAllByLabelText("Expand row");
    expect(expandBtns).toHaveLength(2);
  });

  it("toggles expanded row content", () => {
    render(
      <AppDataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        expandable={{
          renderExpandedContent: (row: TestRow) => <div data-testid={`expanded-${row.id}`}>Expanded {row.name}</div>,
        }}
      />,
    );
    fireEvent.click(screen.getAllByLabelText("Expand row")[0]);
    expect(screen.getByTestId("expanded-1")).toBeInTheDocument();
  });

  it("renders actionButton outside query", () => {
    render(
      <AppDataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        actionButton={<button data-testid="action-btn">Add</button>}
      />,
    );
    expect(screen.getByTestId("action-btn")).toBeInTheDocument();
  });

  it("hides columns with hidden flag", () => {
    const colsWithHidden = [
      { key: "name", header: "Name", render: (r: TestRow) => r.name },
      { key: "city", header: "City", hidden: true, render: (r: TestRow) => r.city },
    ];
    render(
      <AppDataTable columns={colsWithHidden} rows={rows} getRowKey={(r) => r.id} />,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.queryByText("City")).not.toBeInTheDocument();
  });

  it("calls onSelectOption with value and label when select filter option is chosen", () => {
    const onSelectOption = jest.fn();
    const colsWithFilter = [
      {
        key: "name",
        header: "Name",
        render: (r: TestRow) => r.name,
        filter: {
          type: "text" as const,
        },
      },
      {
        key: "city",
        header: "City",
        render: (r: TestRow) => r.city,
        filter: {
          type: "select" as const,
          options: [
            { label: "Jakarta", value: "JKT" },
            { label: "Bandung", value: "BDG" },
          ],
          onSelectOption,
        },
      },
    ];

    render(
      <AppDataTable
        columns={colsWithFilter}
        rows={rows}
        getRowKey={(r) => r.id}
        query={{ filters: {}, onFiltersChange: jest.fn() }}
      />,
    );

    fireEvent.click(screen.getByText("Filter"));
    fireEvent.change(screen.getByTestId("filter-select-filter-city"), {
      target: { value: "BDG" },
    });

    expect(onSelectOption).toHaveBeenCalledWith("BDG", "Bandung");
  });
});
