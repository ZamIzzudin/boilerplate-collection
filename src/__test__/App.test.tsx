import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("@tanstack/react-query", () => ({
  QueryClient: jest.fn().mockImplementation(() => ({
    defaultQueryOptions: jest.fn(),
  })),
  QueryClientProvider: ({ children }: any) => <div data-testid="query-provider">{children}</div>,
  useQuery: jest.fn().mockReturnValue({ data: undefined, isLoading: false }),
}));

jest.mock("sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

jest.mock("@/lib/axios/client", () => ({
  apiNewClient: { get: jest.fn() },
}));

jest.mock("@/store/auth-store", () => ({
  useAuthStore: jest.fn((selector) => {
    const state = {
      isAuthenticated: false,
      user: null,
      clearAuth: jest.fn(),
      setAuthenticated: jest.fn(),
      setUser: jest.fn(),
      setPermissionVersion: jest.fn(),
      setUserTypeId: jest.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

jest.mock("@/store/privilege-store", () => ({
  usePrivilegeStore: jest.fn((selector) => {
    const state = {
      setPrivilegeFromMe: jest.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

jest.mock("@/components/app-layout", () => ({
  AppLayout: ({ children, title }: any) => (
    <div data-testid="app-layout">
      <span data-testid="layout-title">{title}</span>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/map", () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  MapControls: () => <div data-testid="map-controls" />,
}));

jest.mock("@/layouts/protected-layout", () => ({
  ProtectedLayout: () => <div data-testid="protected-layout" />,
}));

jest.mock("@/app/login/page", () => ({
  __esModule: true,
  default: () => <div data-testid="login-form" />,
}));

jest.mock("@/pages/dungeon-page", () => ({
  __esModule: true,
  default: () => <div data-testid="dungeon-page" />,
}));

jest.mock("@/pages/not-found-page", () => ({
  __esModule: true,
  default: () => <div data-testid="not-found" />,
}));

jest.mock("@/app/activation/page", () => ({
  __esModule: true,
  default: () => <div data-testid="activation" />,
}));

jest.mock("@/app/(protected)/dashboard/page", () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard" />,
}));

// Mock all other protected pages
const protectedPages = [
  "user/page", "role/page", "action/page", "menu/page", "privilege/page",
  "profile/page",
];

protectedPages.forEach((p) => {
  jest.mock(`@/app/(protected)/${p}`, () => ({
    __esModule: true,
    default: () => <div data-testid={`mock-${p.replace(/\//g, "-")}`} />,
  }));
});

import App from "../App";

describe("App", () => {
  it("renders without crashing", async () => {
    const { apiNewClient } = require("@/lib/axios/client");
    apiNewClient.get.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("query-provider")).toBeInTheDocument();
    });
  });

  it("renders toaster", async () => {
    const { apiNewClient } = require("@/lib/axios/client");
    apiNewClient.get.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("toaster")).toBeInTheDocument();
    });
  });

  it("shows login form on /login", async () => {
    const { apiNewClient } = require("@/lib/axios/client");
    apiNewClient.get.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("login-form")).toBeInTheDocument();
    });
  });

  it("shows not found for unknown routes", async () => {
    const { apiNewClient } = require("@/lib/axios/client");
    apiNewClient.get.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter initialEntries={["/unknown"]}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("not-found")).toBeInTheDocument();
    });
  });

  it("renders the dungeon playground without login on /dungeon", async () => {
    const { apiNewClient } = require("@/lib/axios/client");
    apiNewClient.get.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter initialEntries={["/dungeon"]}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("dungeon-page")).toBeInTheDocument();
    });
  });

  it("keeps /dungeon reachable even after login", async () => {
    const { apiNewClient } = require("@/lib/axios/client");
    apiNewClient.get.mockResolvedValue({
      data: {
        data: {
          id: "1",
          user_email: "admin@boilerplate.local",
          user_type_user_type_id: "1",
          user_type_name: "Superadmin",
        },
        menus: [],
      },
      headers: {},
    });

    render(
      <MemoryRouter initialEntries={["/dungeon"]}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("dungeon-page")).toBeInTheDocument();
    });
  });
});
