import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { ProtectedLayout } from "../protected-layout";

jest.mock("@/store/auth-store", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("@/store/privilege-store", () => ({
  usePrivilegeStore: jest.fn(),
}));

jest.mock("@/components/dashboard-shell", () => ({
  DashboardShell: ({ children, email, userType, menus }: any) => (
    <div data-testid="dashboard-shell">
      <span data-testid="email">{email}</span>
      <span data-testid="user-type">{userType}</span>
      <span data-testid="menus-count">{menus?.length || 0}</span>
      {children}
    </div>
  ),
}));

import { useAuthStore } from "@/store/auth-store";
import { usePrivilegeStore } from "@/store/privilege-store";

const mockUseAuthStore = useAuthStore as jest.Mock;
const mockUsePrivilegeStore = usePrivilegeStore as jest.Mock;

const defaultAuthState = {
  isAuthenticated: false,
  user: null,
};

const defaultPrivilegeState = {
  menus: [],
  isReady: false,
  isAuthorized: false,
  resetPrivilege: jest.fn(),
};

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderWithRouter(initialPath = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/login"
          element={<div data-testid="login-page">Login</div>}
        />
        <Route path="/dashboard" element={<ProtectedLayout />}>
          <Route
            index
            element={<div data-testid="outlet">Outlet content</div>}
          />
        </Route>
      </Routes>
      <LocationDisplay />
    </MemoryRouter>,
  );
}

function setupAuthStore(overrides: Partial<typeof defaultAuthState> = {}) {
  const state = { ...defaultAuthState, ...overrides };
  mockUseAuthStore.mockImplementation((selector?: any) =>
    selector ? selector(state) : state,
  );
}

function setupPrivilegeStore(
  overrides: Partial<typeof defaultPrivilegeState> = {},
) {
  const state = { ...defaultPrivilegeState, ...overrides };
  mockUsePrivilegeStore.mockImplementation((selector?: any) =>
    selector ? selector(state) : state,
  );
}

describe("ProtectedLayout", () => {
  beforeEach(() => jest.clearAllMocks());

  it("redirects to /login when not authenticated", () => {
    setupAuthStore({ isAuthenticated: false });
    setupPrivilegeStore();

    renderWithRouter();
    expect(screen.getByTestId("location")).toHaveTextContent("/login");
  });

  it("redirects when isReady is false", () => {
    setupAuthStore({
      isAuthenticated: true,
      user: { email: "test@test.com", userTypeName: "Operator" },
    });
    setupPrivilegeStore({ isReady: false, isAuthorized: true });

    renderWithRouter();
    expect(screen.getByTestId("location")).toHaveTextContent("/login");
  });

  it("redirects when isAuthorized is false", () => {
    setupAuthStore({
      isAuthenticated: true,
      user: { email: "test@test.com", userTypeName: "Operator" },
    });
    setupPrivilegeStore({ isReady: true, isAuthorized: false });

    renderWithRouter();
    expect(screen.getByTestId("location")).toHaveTextContent("/login");
  });

  it("redirects when user is null", () => {
    setupAuthStore({ isAuthenticated: true, user: null });
    setupPrivilegeStore({ isReady: true, isAuthorized: true });

    renderWithRouter();
    expect(screen.getByTestId("location")).toHaveTextContent("/login");
  });

  it("renders DashboardShell when fully authenticated", () => {
    setupAuthStore({
      isAuthenticated: true,
      user: { email: "test@test.com", userTypeName: "Operator" },
    });
    setupPrivilegeStore({
      menus: [{ name: "Dashboard" }],
      isReady: true,
      isAuthorized: true,
    });

    renderWithRouter();

    expect(screen.getByTestId("dashboard-shell")).toBeInTheDocument();
    expect(screen.getByTestId("email")).toHaveTextContent("test@test.com");
    expect(screen.getByTestId("user-type")).toHaveTextContent("Operator");
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
  });

  it("calls resetPrivilege when not authenticated", () => {
    const resetPrivilege = jest.fn();
    setupAuthStore({ isAuthenticated: false });
    setupPrivilegeStore({ resetPrivilege });

    renderWithRouter();
    expect(resetPrivilege).toHaveBeenCalled();
  });

  it("does not redirect when fully authenticated", () => {
    setupAuthStore({
      isAuthenticated: true,
      user: { email: "a@b.com", userTypeName: "Admin" },
    });
    setupPrivilegeStore({
      menus: [],
      isReady: true,
      isAuthorized: true,
    });

    renderWithRouter();
    expect(screen.getByTestId("dashboard-shell")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
  });
});
