import type {
  PaginatedResponse,
  PaginatedDataResponse,
  Access,
  DetailAccess,
  ActiveSheet,
  ActiveSheetWithApproval,
  SelectOption,
} from "../api";

describe("api types", () => {
  it("exports PaginatedResponse type", () => {
    const data: PaginatedResponse<string> = {
      items: ["a"], total: 1, page: 1, perPage: 10, totalPages: 1,
    };
    expect(data.items).toHaveLength(1);
  });

  it("exports PaginatedDataResponse type", () => {
    const data: PaginatedDataResponse<string> = { data: ["a"], total: 1 };
    expect(data.data).toHaveLength(1);
  });

  it("exports Access type", () => {
    const access: Access = { canAdd: true, canEdit: false, canEditRoom: true, canDeleteRoom: true };
    expect(access.canAdd).toBe(true);
    expect(access.canEditRoom).toBe(true);
    expect(access.canDeleteRoom).toBe(true);
  });

  it("exports DetailAccess type", () => {
    const access: DetailAccess = {
      canEdit: true, canDelete: false, canActive: true,
      canDownload: false, canResetPassword: true,
      canEditRoom: true, canDeleteRoom: true,
    };
    expect(access.canEdit).toBe(true);
    expect(access.canEditRoom).toBe(true);
    expect(access.canDeleteRoom).toBe(true);
  });

  it("exports ActiveSheet type", () => {
    const sheet: ActiveSheet = "FORM";
    expect(sheet).toBe("FORM");
  });

  it("exports ActiveSheetWithApproval type", () => {
    const sheet: ActiveSheetWithApproval = "APPROVAL";
    expect(sheet).toBe("APPROVAL");
  });

  it("exports SelectOption type", () => {
    const option: SelectOption = { label: "Test", value: "test" };
    expect(option.label).toBe("Test");
  });
});
