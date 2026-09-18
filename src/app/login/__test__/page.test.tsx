import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

jest.mock("@/lib/config", () => ({
  resolveApiBaseUrl: jest.fn(() => "http://localhost:4000/"),
}));

jest.mock("@/lib/axios/client", () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
  apiNewClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock("@/hooks/use-captcha", () => ({
  __esModule: true,
  default: () => ({
    gen: jest.fn(),
    validate: jest.fn(() => true),
    isReady: true,
  }),
}));

jest.mock("@/hooks/use-user-type-options", () => ({
  useUserTypeOptions: () => ({
    options: [
      { value: "opt1", label: "Operator" },
      { value: "opt2", label: "Shipper" },
    ],
    loading: false,
    search: "",
    setSearch: jest.fn(),
    loadMore: jest.fn(),
  }),
}));

jest.mock("@/store/auth-store", () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: null,
      isAuthenticated: false,
      userTypeId: null,
      setAuthenticated: jest.fn(),
      setUser: jest.fn(),
      setUserTypeId: jest.fn(),
      setPermissionVersion: jest.fn(),
    }),
}));

jest.mock("@/store/privilege-store", () => ({
  usePrivilegeStore: (selector: any) =>
    selector({
      menus: [],
      setPrivilegeFromLogin: jest.fn(),
    }),
}));

jest.mock("@/lib/notify", () => ({
  notifyFailed: jest.fn(),
}));

jest.mock("@/lib/error-message", () => ({
  getErrorMessage: jest.fn(() => "parsed error"),
}));

jest.mock("@/lib/crypto", () => ({
  decrypt: jest.fn((v: string) => v),
  encrypt: jest.fn((v: string) => JSON.stringify(v)),
}));

jest.mock("@/components/ui/form-field", () => ({
  FormField: ({ id, label, ...props }: any) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} data-testid={id} {...props} />
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/combobox", () => ({
  Combobox: ({ onChange, ...props }: any) => (
    <select
      data-testid={props.id || "combobox"}
      onChange={(e) => onChange?.(e.target.value)}
    >
      <option value="">Pilih</option>
    </select>
  ),
}));

jest.mock("@/components/ui/alert-message", () => ({
  AlertMessage: ({ open, title, description, onConfirm }: any) =>
    open ? (
      <div data-testid="alert-message">
        <span data-testid="alert-title">{title}</span>
        <span data-testid="alert-desc">{description}</span>
        <button data-testid="alert-confirm" onClick={onConfirm}>
          OK
        </button>
      </div>
    ) : null,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginFormPage from "../page";

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginFormPage />
    </QueryClientProvider>,
  );
}

describe("LoginFormPage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the login page container", () => {
    const { container } = renderPage();
    expect(container.querySelector(".h-screen")).toBeInTheDocument();
  });

  it("has email input field", () => {
    renderPage();
    expect(screen.getByTestId("email")).toBeInTheDocument();
  });

  it("has password input field", () => {
    renderPage();
    expect(screen.getByTestId("password")).toBeInTheDocument();
  });

  it("has submit buttons", () => {
    renderPage();
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  it("renders user type selector", () => {
    renderPage();
    expect(screen.getByTestId("userTypeId")).toBeInTheDocument();
  });

  it("renders login heading text", () => {
    renderPage();
    expect(screen.getByText("Masuk")).toBeInTheDocument();
  });
});