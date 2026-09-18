import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = jest.fn();
const mockClearAuth = jest.fn();
const mockResetPrivilege = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

jest.mock("../hook", () => ({
  useProfileDetail: jest.fn(),
  useCheckPassword: jest.fn(),
  useChangePassword: jest.fn(),
}));

jest.mock("../handler", () => ({
  profileHandler: {
    getDetail: jest.fn(),
    logout: jest.fn(),
    checkPassword: jest.fn(),
    changePassword: jest.fn(),
  },
}));

jest.mock("@/store/auth-store", () => ({
  useAuthStore: (selector: any) => selector({ clearAuth: mockClearAuth }),
}));

jest.mock("@/store/privilege-store", () => ({
  usePrivilegeStore: (selector: any) =>
    selector({ resetPrivilege: mockResetPrivilege }),
}));

jest.mock("@/lib/notify", () => ({
  notifySuccess: jest.fn(),
  notifyFailed: jest.fn(),
}));

jest.mock("@/lib/error-message", () => ({
  getErrorMessage: jest.fn((_error: any, fallback: string) => fallback),
}));

jest.mock("@/components/app-layout", () => ({
  AppLayout: ({ children, title, actions }: any) => (
    <div data-testid="app-layout">
      <span data-testid="layout-title">{title}</span>
      {actions}
      {children}
    </div>
  ),
}));

jest.mock("@phosphor-icons/react", () => ({
  GearIcon: () => null,
  PasswordIcon: () => null,
  UserIcon: () => null,
  EyeIcon: () => null,
  EyeSlashIcon: () => null,
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

jest.mock("@/components/ui/detail-field-row", () => ({
  DetailFieldRow: ({ label, value }: any) => (
    <div data-testid={`field-${label}`}>
      {label}: {value}
    </div>
  ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuTrigger: ({ children, render: renderProp }: any) => (
    <div>{renderProp ?? children}</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  SheetTrigger: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/app-sheet", () => ({
  AppSheet: ({ title, children }: any) => (
    <div data-testid="app-sheet">
      <span data-testid="app-sheet-title">{title}</span>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/form-field", () => ({
  FormField: ({ id, value, onChange }: any) => (
    <input data-testid={id} id={id} value={value ?? ""} onChange={onChange} />
  ),
}));

import ProfilePage from "../page";
import { useProfileDetail, useCheckPassword, useChangePassword } from "../hook";
import { profileHandler } from "../handler";
import { notifySuccess, notifyFailed } from "@/lib/notify";

const mockUseProfileDetail = useProfileDetail as jest.Mock;
const mockUseCheckPassword = useCheckPassword as jest.Mock;
const mockUseChangePassword = useChangePassword as jest.Mock;
const h = profileHandler as jest.Mocked<typeof profileHandler>;

const mockProfileData = {
  id: "1",
  username: "johndoe",
  email: "john@test.com",
  userTypeId: "1",
  userTypeName: "Superadmin",
};

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  );
}

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProfileDetail.mockReturnValue({
      data: mockProfileData,
      isLoading: false,
    });
    mockUseCheckPassword.mockReturnValue({
      mutateAsync: (password: string) => h.checkPassword(password),
      isPending: false,
    });
    mockUseChangePassword.mockReturnValue({
      mutateAsync: ({
        newPassword,
        confirmPassword,
      }: {
        newPassword: string;
        confirmPassword: string;
      }) => h.changePassword(newPassword, confirmPassword),
      isPending: false,
    });
  });

  it("shows loading state", () => {
    mockUseProfileDetail.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText("Memuat data profil...")).toBeInTheDocument();
  });

  it("shows not found when data is null", () => {
    mockUseProfileDetail.mockReturnValue({ data: undefined, isLoading: false });
    renderPage();
    expect(screen.getByText("Data profil tidak ditemukan.")).toBeInTheDocument();
  });

  it("renders profile with username and role", () => {
    renderPage();
    expect(screen.getByTestId("layout-title")).toHaveTextContent("johndoe");
    expect(screen.getByTestId("layout-title")).toHaveTextContent("Superadmin");
  });

  it("opens reset password sheet from account settings menu", () => {
    renderPage();
    expect(screen.queryByTestId("current-password")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Atur Ulang Kata Sandi" }));
    expect(screen.getByTestId("current-password")).toBeInTheDocument();
  });

  it("verifies current password before advancing to the change step", async () => {
    h.checkPassword.mockResolvedValue({} as any);
    const { container } = renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Atur Ulang Kata Sandi" }));
    fireEvent.change(screen.getByTestId("current-password"), {
      target: { value: "secret" },
    });
    fireEvent.submit(container.querySelector("#verify-password-form")!);

    await waitFor(() => expect(h.checkPassword).toHaveBeenCalledWith("secret"));
    await waitFor(() =>
      expect(screen.getByTestId("new-password")).toBeInTheDocument(),
    );
    expect(screen.getByTestId("confirm-password")).toBeInTheDocument();
  });

  it("shows failure notification when current password is wrong", async () => {
    h.checkPassword.mockRejectedValue(new Error("bad"));
    const { container } = renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Atur Ulang Kata Sandi" }));
    fireEvent.change(screen.getByTestId("current-password"), {
      target: { value: "wrong" },
    });
    fireEvent.submit(container.querySelector("#verify-password-form")!);

    await waitFor(() => expect(notifyFailed).toHaveBeenCalled());
    expect(screen.getByTestId("current-password")).toBeInTheDocument();
  });

  it("changes password, logs out and navigates to login", async () => {
    h.checkPassword.mockResolvedValue({} as any);
    h.changePassword.mockResolvedValue({} as any);
    h.logout.mockResolvedValue({} as any);
    const { container } = renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Atur Ulang Kata Sandi" }));
    fireEvent.change(screen.getByTestId("current-password"), {
      target: { value: "secret" },
    });
    fireEvent.submit(container.querySelector("#verify-password-form")!);

    await waitFor(() =>
      expect(screen.getByTestId("new-password")).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByTestId("new-password"), {
      target: { value: "Newpass123!" },
    });
    fireEvent.change(screen.getByTestId("confirm-password"), {
      target: { value: "Newpass123!" },
    });
    fireEvent.submit(container.querySelector("#reset-password-form")!);

    await waitFor(() =>
      expect(h.changePassword).toHaveBeenCalledWith("Newpass123!", "Newpass123!"),
    );
    expect(notifySuccess).toHaveBeenCalled();
    expect(h.logout).toHaveBeenCalled();
    expect(mockClearAuth).toHaveBeenCalled();
    expect(mockResetPrivilege).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});
