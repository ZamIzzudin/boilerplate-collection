import { apiNewClient } from "@/lib/axios/client";
import { mapRoles } from "@/lib/utils";
import type {
  RoleOption,
  ActionItem,
  PrivilegeMenuFromBackend,
  PrivilegeEntry,
  MatrixRow,
  RoleMatrix,
  RoleMappingPayload,
  PrivilegeInfo,
} from "@/types";
export type {
  RoleOption,
  ActionItem,
  PrivilegeMenuFromBackend as MenuFromBackend,
  PrivilegeEntry,
  MatrixRow,
  RoleMatrix,
  RoleMappingPayload,
} from "@/types";

import { useAuthStore } from "@/store/auth-store";

export const privilegeHandler = {
  getRoles: async (): Promise<RoleOption[]> => {
    return apiNewClient
      .get("/user-type", {
        params: { page: 1, limit: 999, type: "list" },
      })
      .then((res: any) => {
        const data = (res.data?.data?.records ?? res.data?.data ?? []) as any[];
        return mapRoles(
          data.map((r: any) => ({
            id: r.value ?? r.id,
            user_type_name: r.user_type_name,
          })),
        );
      })
      .catch(() => [] as RoleOption[]);
  },

  getMenus: async (): Promise<PrivilegeMenuFromBackend[]> => {
    return apiNewClient
      .get("/menu", { params: { type: "list", page: 1, limit: 999 } })
      .then(
        (res: any) =>
          (res.data?.data?.records ??
            res.data.data) as PrivilegeMenuFromBackend[],
      )
      .catch(() => []);
  },

  getActions: async (): Promise<ActionItem[]> => {
    return apiNewClient
      .get("/action", { params: { type: "list", page: 1, limit: 999 } })
      .then(
        (res: any) =>
          (res.data?.data?.records ?? res.data.data) as ActionItem[],
      )
      .catch(() => []);
  },

  getPrivileges: async (userTypeId: string): Promise<PrivilegeEntry[]> => {
    return apiNewClient
      .get(`/privilege/by-user-type/${userTypeId}`)
      .then(
        (res: any) =>
          (res.data?.data?.records ?? res.data.data) as PrivilegeEntry[],
      )
      .catch(() => []);
  },

  buildMatrix: async (userTypeId: string): Promise<RoleMatrix> => {
    const [menus, privileges, roles, actions] = await Promise.all([
      privilegeHandler.getMenus(),
      privilegeHandler.getPrivileges(userTypeId),
      privilegeHandler.getRoles(),
      privilegeHandler.getActions(),
    ]);

    const role = roles.find((r) => r.id === String(userTypeId)) ?? {
      id: userTypeId,
      code: userTypeId,
      name: "Unknown",
    };

    // Map privilege entries: key = menu_code, value = Set of action_code yang aktif
    // Track ALL privilege entries (ACTIVE + DELETE) for re-activation support
    const privilegeMap = new Map<string, Set<string>>();
    const privilegeInfoLookup = new Map<string, PrivilegeInfo>();
    for (const p of privileges) {
      if (!p.action_code) continue;

      // Only ACTIVE entries count as checked
      if (p.status_code === "ACTIVE") {
        if (!privilegeMap.has(p.menu_code)) {
          privilegeMap.set(p.menu_code, new Set());
        }
        privilegeMap.get(p.menu_code)!.add(p.action_code);
      }

      // Track all entries (both ACTIVE and DELETE) for re-activation / deactivation
      privilegeInfoLookup.set(`${p.menu_code}:${p.action_code}`, {
        privilege_code: p.privilege_code,
        status_code: p.status_code,
      });
    }

    // Build matrix rows from menus (only ACTIVE menus)
    const activeMenus = menus.filter((m) => m.status_code === "ACTIVE");

    const rows: MatrixRow[] = activeMenus.map((menu) => {
      const menuActionCodes = Array.from(
        privilegeMap.get(menu.menu_code) ?? [],
      );
      const rowPrivilegeMap: Record<string, PrivilegeInfo> = {};
      for (const [key, info] of privilegeInfoLookup.entries()) {
        if (key.startsWith(`${menu.menu_code}:`)) {
          const actionCode = key.split(":").slice(1).join(":");
          rowPrivilegeMap[actionCode] = info;
        }
      }

      return {
        menuId: String(menu.id),
        menuCode: menu.menu_code,
        menuName: menu.menu_name,
        parentMenuId: menu.parent_code,
        isGroup: menu?.isGroup,
        sortOrder: menu.order,
        availableActionCodes: (menu.actions ?? []).map((a) => a.code),
        checkedActionCodes: menuActionCodes,
        privilegeMap: rowPrivilegeMap,
      };
    });

    // Use all actions from /action/list (only ACTIVE)
    const activeActions = actions.filter((a) => a.status_code === "ACTIVE");

    return { role, actions: activeActions, rows };
  },

  updateRoleMappings: async (payload: RoleMappingPayload) => {
    const { data } = await apiNewClient.post("/privilege", payload);

    // Handle perm_version from response body (backup if header is missing)
    if (data?.perm_version) {
      const { permissionVersion, setPermissionVersion } =
        useAuthStore.getState();
      if (permissionVersion !== data.perm_version) {
        setPermissionVersion(data.perm_version);
      }
    }

    return data;
  },
};
