import { apiNewClient } from "@/lib/axios/client";

export type {
  LoginAction,
  LoginPayload,
  LoginResponse,
} from "@/types";

import type { LoginPayload, LoginResponse } from "./types";

export const handler = {
  login: async (
    payload: LoginPayload,
  ): Promise<LoginResponse & { perm_version?: string }> => {
    const { data, headers } = await apiNewClient.post<LoginResponse>(
      "/auth/login",
      {
        email: payload.email,
        password: payload.password,
      },
    );
    const permVersion = headers?.["x-perm-version"] as string | undefined;
    return { ...data, perm_version: permVersion };
  },
};
