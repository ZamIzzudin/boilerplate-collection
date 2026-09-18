import { apiNewClient } from "@/lib/axios/client";
import type { MenuItem, PaginatedResponse, MenuPayload } from "@/types";
export type {
  MenuItem,
  PaginatedResponse,
  ActionItem,
  MenuPayload,
} from "@/types";

export const menuHandler = {
  getAllMenus: async () => {
    const { data } = await apiNewClient.get<any>("/menu", {
      params: { limit: 9999, page: 1, type: "list" },
    });

    const rawRecords = data?.data?.records ?? [];
    return rawRecords.map((record: any) => ({
      id: String(record.id),
      menu_code: record.menu_code ?? "",
      menu_name: record.menu_name ?? "",
      parent_code: record.parent_code ?? null,
      icon: record.icon ?? "",
      slug: record.slug ?? "",
      order: record.order ?? 0,
      actions: record.actions ?? [],
    })) as MenuItem[];
  },

  getMenus: async (params: {
    limit: number;
    page: number;
    menu_name: string;
  }) => {
    const { data } = await apiNewClient.get<any>("/menu", {
      params: {
        limit: params.limit,
        page: params.page,
        menu_name: params.menu_name?.trim() || undefined,
        type: "page",
      },
    });

    const rawRecords = data?.data?.records ?? [];
    const totalRecords = Number(data?.data?.records_total ?? 0);
    const items: MenuItem[] = rawRecords.map((record: any) => ({
      id: String(record.id),
      menu_code: record.menu_code ?? "",
      menu_name: record.menu_name ?? "",
      parent_code: record.parent_code ?? null,
      icon: record.icon ?? "",
      slug: record.slug ?? "",
      order: record.order ?? 0,
      actions: record.actions ?? [],
    }));

    return {
      items,
      total: totalRecords,
      page: params.page,
      perPage: params.limit,
      totalPages: Math.max(1, Math.ceil(totalRecords / params.limit)),
    } as PaginatedResponse<MenuItem>;
  },

  getActions: async () => {
    const { data } = await apiNewClient.get<any>("/action", {
      params: { type: "list", page: 1, limit: 999 },
    });
    return data;
  },

  createMenu: async (payload: MenuPayload) => {
    const { data } = await apiNewClient.post("/menu", payload);
    return data;
  },

  updateMenu: async (payload: MenuPayload) => {
    const { menu_code, ...rest } = payload;
    const { data } = await apiNewClient.put(`/menu/${menu_code}`, rest);
    return data;
  },

  deleteMenu: async (payload: { menu_code: string }) => {
    const { data } = await apiNewClient.delete(`/menu/${payload.menu_code}`, {
      data: payload,
    });
    return data;
  },
};
