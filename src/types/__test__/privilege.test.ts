import type {
  RoleOption,
  PrivilegeMenuFromBackend,
  PrivilegeEntry,
  MatrixRow,
  RoleMatrix,
  PrivilegePayload,
  PrivilegeInfo,
  RoleMappingPayload,
} from "../privilege";

describe("privilege types", () => {
  it("exports RoleOption type", () => {
    const role: RoleOption = { id: "1", code: "ADM", name: "Admin" };
    expect(role.code).toBe("ADM");
  });

  it("exports PrivilegeMenuFromBackend type", () => {
    const menu: PrivilegeMenuFromBackend = {
      id: 1, menu_code: "m1", menu_name: "M1", parent_code: null,
      icon: "icon", slug: "m1", order: 1, status_code: "active",
      actions: [], isGroup: false,
    };
    expect(menu.menu_code).toBe("m1");
  });

  it("exports PrivilegeEntry type", () => {
    const entry: PrivilegeEntry = {
      id: 1, privilege_code: "p1", user_type_id: 1, user_type_name: "Admin",
      menu_code: "m1", menu_name: "M1", action_code: "read",
      action_name: "Read", status_code: "active",
    };
    expect(entry.privilege_code).toBe("p1");
  });

  it("exports PrivilegeInfo type", () => {
    const info: PrivilegeInfo = { privilege_code: "p1", status_code: "active" };
    expect(info.privilege_code).toBe("p1");
  });

  it("exports MatrixRow type", () => {
    const row: MatrixRow = {
      menuId: "1", menuCode: "m1", menuName: "M1", parentMenuId: null,
      isGroup: false, sortOrder: 1, availableActionCodes: ["read"],
      checkedActionCodes: ["read"], privilegeMap: {},
    };
    expect(row.menuCode).toBe("m1");
  });

  it("exports RoleMatrix type", () => {
    const matrix: RoleMatrix = {
      role: { id: "1", code: "ADM", name: "Admin" },
      actions: [],
      rows: [],
    };
    expect(matrix.role.code).toBe("ADM");
  });

  it("exports PrivilegePayload type", () => {
    const payload: PrivilegePayload = {
      menu_code: "m1", action_code: "read", status_code: "active",
    };
    expect(payload.menu_code).toBe("m1");
  });

  it("exports RoleMappingPayload type", () => {
    const payload: RoleMappingPayload = {
      user_type_id: "1", privileges: [],
    };
    expect(payload.user_type_id).toBe("1");
  });
});
