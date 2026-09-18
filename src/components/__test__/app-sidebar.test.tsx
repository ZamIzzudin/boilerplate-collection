import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import type { SidebarMenu } from "@/types";

jest.mock("@phosphor-icons/react", () => ({
  ArrowLineDownIcon: () => null,
  ArrowsOutSimpleIcon: () => null,
  CaretDownIcon: () => null,
  GaugeIcon: () => null,
  ListIcon: () => null,
  MagnifyingGlassIcon: () => null,
}));

jest.mock("@/lib/icon-map", () => ({
  iconMap: {
    Users: () => null,
    Database: () => null,
  },
}));

const menus: SidebarMenu[] = [
  {
    code: "m1",
    name: "Dashboard",
    path: "/dashboard",
    icon: "Users",
    sortOrder: 0,
    actions: [],
    isGroup: false,
    subMenus: [],
  },
  {
    code: "m2",
    name: "Master",
    path: null,
    icon: "Database",
    sortOrder: 1,
    actions: [],
    isGroup: false,
    subMenus: [
      {
        code: "m2-1",
        name: "Pelabuhan",
        path: "/pelabuhan",
        icon: "Database",
        sortOrder: 0,
        actions: [],
        subMenus: [],
        isGroup: false,
      },
    ],
  },
];

const defaultProps = {
  collapsed: false,
  menuSearch: "",
  pathname: "/dashboard",
  visibleMenus: menus,
  openMenus: {},
  onToggleCollapse: jest.fn(),
  onMenuSearchChange: jest.fn(),
  onToggleMenu: jest.fn(),
};

function renderSidebar(overrides: Partial<typeof defaultProps> = {}) {
  return render(
    <MemoryRouter>
      <AppSidebar {...defaultProps} {...overrides} />
    </MemoryRouter>,
  );
}

describe("AppSidebar", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders menu names when not collapsed", () => {
    renderSidebar();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Master")).toBeInTheDocument();
  });

  it("hides menu names when collapsed", () => {
    renderSidebar({ collapsed: true });
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("renders search input when not collapsed", () => {
    renderSidebar();
    expect(screen.getByPlaceholderText("Cari menu")).toBeInTheDocument();
  });

  it("hides search input when collapsed", () => {
    renderSidebar({ collapsed: true });
    expect(screen.queryByPlaceholderText("Cari menu")).not.toBeInTheDocument();
  });

  it("calls onToggleCollapse when collapse button is clicked", () => {
    renderSidebar();
    const collapseBtn = screen.getByRole("button", { name: "" });
    fireEvent.click(collapseBtn);
    expect(defaultProps.onToggleCollapse).toHaveBeenCalled();
  });

  it("calls onMenuSearchChange when typing in search", () => {
    renderSidebar();
    fireEvent.change(screen.getByPlaceholderText("Cari menu"), {
      target: { value: "test" },
    });
    expect(defaultProps.onMenuSearchChange).toHaveBeenCalledWith("test");
  });

  it("calls onToggleMenu when menu with submenus is clicked", () => {
    renderSidebar({ openMenus: {} });
    fireEvent.click(screen.getByText("Master"));
    expect(defaultProps.onToggleMenu).toHaveBeenCalledWith("m2", false);
  });

  it("renders help section when not collapsed", () => {
    renderSidebar();
    expect(screen.getByText("Butuh bantuan lebih lanjut?")).toBeInTheDocument();
    expect(screen.getByText("Unduh Panduan")).toBeInTheDocument();
  });

  it("hides help section when collapsed", () => {
    renderSidebar({ collapsed: true });
    expect(screen.queryByText("Butuh bantuan lebih lanjut?")).not.toBeInTheDocument();
  });

  it("renders submenu items when open", () => {
    renderSidebar({ openMenus: { m2: true } });
    expect(screen.getByText("Pelabuhan")).toBeInTheDocument();
  });

  it("filters menus by search via visibleMenus prop", () => {
    // AppSidebar renders visibleMenus directly - filtering is done by parent
    const filteredMenus = menus.filter((m) => m.name === "Dashboard");
    renderSidebar({ visibleMenus: filteredMenus });
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Master")).not.toBeInTheDocument();
  });
});
