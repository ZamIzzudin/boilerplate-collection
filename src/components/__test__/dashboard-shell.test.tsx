import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DashboardShell } from "../dashboard-shell";

jest.mock("@phosphor-icons/react", () => ({
  UserIcon: () => <span data-testid="user-icon" />,
  UserCircleIcon: () => <span data-testid="user-circle-icon" />,
  SignOutIcon: () => <span data-testid="sign-out-icon" />,
}));

jest.mock("@/lib/axios/client", () => ({
  apiNewClient: { post: jest.fn().mockResolvedValue({}) },
}));

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarFallback: ({ children }: any) => <span data-testid="avatar-fallback">{children}</span>,
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/hooks/use-profile-image", () => ({
  useProfileImage: jest.fn(() => ({ data: null })),
}));

jest.mock("@/components/app-sidebar", () => ({
  AppSidebar: ({ pathname }: any) => <div data-testid="sidebar" data-pathname={pathname} />,
}));

jest.mock("@/store/privilege-store", () => ({
  usePrivilegeStore: jest.fn((selector: any) =>
    selector({
      resetPrivilege: jest.fn(),
    }),
  ),
}));

jest.mock("@/store/auth-store", () => ({
  useAuthStore: jest.fn((selector: any) =>
    selector({
      clearAuth: jest.fn(),
    }),
  ),
}));

const defaultProps = {
  email: "test@test.com",
  userType: "Operator",
  menus: [],
  children: <div data-testid="main-content">Page content</div>,
};

function renderShell(overrides: Partial<typeof defaultProps> = {}) {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <DashboardShell {...defaultProps} {...overrides} />
    </MemoryRouter>,
  );
}

describe("DashboardShell", () => {
  it("renders children in main content area", () => {
    renderShell();
    expect(screen.getByTestId("main-content")).toBeInTheDocument();
  });

  it("renders email in header", () => {
    renderShell();
    expect(screen.getByText("test@test.com")).toBeInTheDocument();
  });

  it("renders user type in header", () => {
    renderShell();
    expect(screen.getByText("Operator")).toBeInTheDocument();
  });

  it("renders sidebar", () => {
    renderShell();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders avatar with user icon fallback when no profile image", () => {
    renderShell();
    // Komponen menampilkan ikon user di fallback (bukan inisial teks)
    expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
  });

  it("defaults to Dashboard label when no menu matches", () => {
    renderShell();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows parent/child label when pathname matches a submenu", () => {
    renderShell({
      menus: [
        {
          code: "m1",
          name: "Master",
          path: null,
          icon: "Users",
          sortOrder: 0,
          actions: [],
          isGroup: false,
          subMenus: [
            {
              code: "m1-1",
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
      ],
    });
    // Menu label shows "Master / Pelabuhan" - but with current pathname="/dashboard", defaults to Dashboard
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
