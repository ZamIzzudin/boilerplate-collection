import type {
  PaginatedResponse,
  PaginatedDataResponse,
  Access,
  DetailAccess,
  ActiveSheet,
  ActiveSheetWithApproval,
  SelectOption,
  AuthUser,
  Permissions,
  LoginPayload,
  LoginAction,
  LoginResponse,
  RolesMapped,
  RolesExport,
  MenuAction,
  SidebarSubMenu,
  SidebarMenu,
  MenuFromBackend,
  MenuItem,
  MenuPayload,
  ActionItem,
  ActionPayload,
  RoleOption,
  PrivilegeMenuFromBackend,
  PrivilegeEntry,
  MatrixRow,
  RoleMatrix,
  PrivilegePayload,
  PrivilegeInfo,
  RoleMappingPayload,
  UserItem,
  CreateUserPayload,
  UpdateUserPayload,
  PendingRegistration,
  CustomParamItem,
  CustomParamPayload,
  TarifStatus,
  TarifValue,
  TarifDetailItem,
  TarifItem,
  PelabuhanItem,
  PelabuhanPayload,
  TrayekItem,
  TrayekPayload,
  TrayekForm,
  TrayekFormPayload,
  GroundHoldingItem,
  GroundHoldingPayload,
  DoctorItem,
  DoctorPayload,
  ActivateUserItem,
  ActivateUserPayload,
  JadwalKapalApprovalData,
  JadwalKapalItem,
  JadwalKapalPayload,
  AnimalItem,
  AnimalPayload,
  AnimalTypeItem,
  AnimalTypePayload,
  VesselItem,
  VesselPayload,
  ContractStatus,
  ContractItem,
  ContractPayload,
  ReportingItem,
  ReportingPayload,
  BookingStatusReportItem,
  SisaQuotaReportItem,
  RealisasiVoyageReportItem,
} from "../index";

describe("index re-exports", () => {
  it("re-exports api types", () => {
    const items: PaginatedResponse<string> = { items: [], total: 0, page: 1, perPage: 10, totalPages: 0 };
    expect(items).toBeDefined();
  });

  it("re-exports auth types", () => {
    const user: AuthUser = { id: "1", name: "Test", email: "t@t.com", userTypeId: "2", userTypeName: "Admin" };
    expect(user).toBeDefined();
  });

  it("re-exports menu types", () => {
    const action: MenuAction = { code: "read", name: "Read" };
    expect(action).toBeDefined();
  });

  it("re-exports privilege types", () => {
    const role: RoleOption = { id: "1", code: "ADM", name: "Admin" };
    expect(role).toBeDefined();
  });

  it("re-exports domain types", () => {
    const tarif: TarifStatus = "active";
    expect(tarif).toBe("active");
  });
});
