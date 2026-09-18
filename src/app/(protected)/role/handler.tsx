import { apiNewClient } from "@/lib/axios/client";
import type { RegisterRoleOption, RoleListParams, RolePayload } from "./types";

export type {
  RoleItem,
  RegisterRoleOption,
  RoleListParams,
  RolePayload,
} from "./types";

function mapRoleItem(item: any): RegisterRoleOption {
  return {
    id: String(item.value ?? item.id),
    name: item.user_type_name ?? "",
    category: item.user_type_show_on_register ?? false,
  };
}

export const roleHandler = {
  getRoles: async (params: RoleListParams): Promise<RegisterRoleOption[]> => {
    try {
      const { data: response } = await apiNewClient.get("/user-type", {
        params: {
          type: "list",
          page: params.page,
          limit: params.limit,
          user_type_name: params.name || undefined,
          ...(params.category
            ? { user_type_show_on_register: Number(params.category) === 1 }
            : {}),
        },
      });

      const res = response?.data ?? {};
      const records = res?.records ?? [];

      return records.map(mapRoleItem);
    } catch {
      return [];
    }
  },

  createRole: async (payload: RolePayload) => {
    const { data } = await apiNewClient.post("/roles", payload);
    return data?.data ?? data;
  },

  updateRole: async (id: string, payload: RolePayload) => {
    const { data } = await apiNewClient.put(`/roles/${id}`, payload);
    return data?.data ?? data;
  },

  deleteRole: async (id: string) => {
    const { data } = await apiNewClient.delete(`/roles/${id}`);
    return data?.data ?? data;
  },
};
