import { apiNewClient } from "@/lib/axios/client";
import type { ActionItem, ActionPayload, PaginatedResponse } from "@/types";
export type { ActionItem, ActionPayload, PaginatedResponse } from "@/types";

export const actionHandler = {
  getActions: async (params: {
    page: number;
    perPage: number;
    action_name: string;
  }) => {
    const { data } = await apiNewClient.get<any>("/action", {
      params: {
        limit: params.perPage,
        page: params.page,
        action_name: params.action_name?.trim() || undefined,
        type: "page",
      },
    });

    const rawRecords = data?.data?.records ?? [];
    const totalRecords = Number(data?.data?.records_total ?? 0);
    const totalPage = data?.data?.page_total;

    const items: ActionItem[] = rawRecords.map((record: any) => ({
      id: String(record.id),
      action_code: record.action_code ?? "",
      action_name: record.action_name ?? "",
      status_code: String(record.status_code ?? "ACTIVE"),
    }));

    return {
      items,
      total: totalRecords,
      page: params.page,
      perPage: params.perPage,
      totalPages: totalPage,
    } as PaginatedResponse<ActionItem>;
  },

  createAction: async (payload: ActionPayload) => {
    const { data } = await apiNewClient.post("/action", payload);
    return data;
  },

  updateAction: async (payload: ActionPayload) => {
    const { action_code, action_name } = payload;
    const { data } = await apiNewClient.put(`/action/${action_code}`, {
      action_name,
    });
    return data;
  },

  deleteAction: async (payload: { action_code: string }) => {
    const { data } = await apiNewClient.delete(
      `/action/${payload.action_code}`,
    );
    return data;
  },
};
