import { apiNewClient } from "@/lib/axios/client";

import type { ProfileItem } from "./types";

export const profileHandler = {
  getDetail: async (): Promise<ProfileItem> => {
    const { data } = await apiNewClient.get(`/auth/profile`);
    const item = data?.data ?? data;
    return {
      id: String(item?.id ?? ""),
      username: item?.username ?? "",
      email: item?.user_email ?? item?.email ?? "",
      userTypeId: String(item?.user_type_user_type_id ?? item?.user_type_id ?? ""),
      userTypeName: item?.user_type_name ?? "",
    };
  },

  logout: async () => {
    const { data } = await apiNewClient.post("/auth/logout");
    return data;
  },

  checkPassword: async (password: string) => {
    const { data } = await apiNewClient.post(`/user/check-password`, {
      password,
    });
    return data;
  },

  changePassword: async (newPassword: string, confirmPassword: string) => {
    const { data } = await apiNewClient.post(`/user/change-password`, {
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return data;
  },
};
