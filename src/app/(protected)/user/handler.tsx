import { apiNewClient } from "@/lib/axios/client";
import type { PaginatedResponse, UserItem, RoleOption, CreateUserPayload, UpdateUserPayload } from "@/types";
export type { PaginatedResponse, UserItem, RoleOption, CreateUserPayload, UpdateUserPayload } from "@/types";

export const userHandler = {
  getUsers: async (params: { page: number; perPage: number; q: string }) => {
    const { data } = await apiNewClient.get<PaginatedResponse<UserItem>>(
      "/users",
      { params },
    );
    return data;
  },

  getRoleOptions: async () => {
    const { data } = await apiNewClient.get<RoleOption[]>("/users/role-options");
    return data;
  },

  createUser: async (payload: CreateUserPayload) => {
    const { data } = await apiNewClient.post("/users", payload);
    return data;
  },

  updateUser: async (id: string, payload: UpdateUserPayload) => {
    const { data } = await apiNewClient.put(`/users/${id}`, payload);
    return data;
  },

  deleteUser: async (id: string) => {
    const { data } = await apiNewClient.delete(`/users/${id}`);
    return data;
  },
};
