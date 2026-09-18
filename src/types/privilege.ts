import type { MenuAction } from "./menu";

export type RoleOption = {
  id: string;
  code: string;
  name: string;
};

export type PrivilegeMenuFromBackend = {
  id: number;
  menu_code: string;
  menu_name: string;
  parent_code: string | null;
  icon: string | null;
  slug: string;
  order: number | null;
  status_code: string;
  actions: MenuAction[];
  isGroup: boolean;
};

export type PrivilegeEntry = {
  id: number;
  privilege_code: string;
  user_type_id: number;
  user_type_name: string;
  menu_code: string;
  menu_name: string;
  action_code: string;
  action_name: string | null;
  status_code: string;
};

export type PrivilegeInfo = {
  privilege_code: string;
  status_code: string;
};

export type MatrixRow = {
  menuId: string;
  menuCode: string;
  menuName: string;
  parentMenuId: string | null;
  isGroup: boolean;
  sortOrder: number | null;
  availableActionCodes: string[];
  checkedActionCodes: string[];
  privilegeMap: Record<string, PrivilegeInfo>;
};

export type RoleMatrix = {
  role: RoleOption;
  actions: import("./menu").ActionItem[];
  rows: MatrixRow[];
};

export type PrivilegePayload = {
  privilege_code?: string;
  menu_code: string;
  action_code: string;
  status_code: string;
};

export type RoleMappingPayload = {
  user_type_id: string;
  privileges: PrivilegePayload[];
};
