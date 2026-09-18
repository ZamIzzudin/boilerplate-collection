import { apiNewClient } from "@/lib/axios/client";
import { decrypt, encrypt } from "@/lib/crypto";

type TokenData = {
  email: string;
  token: string;
};
export type ResetPasswordPayload = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ValidTokenPayload = {
  token: string;
};

export const handler = {
  resetPassword: async (payload: ResetPasswordPayload) => {
    const tokenData = decrypt<TokenData>(payload.token);
    const bodyPayload = {
      email: tokenData.email,
      token: tokenData.token,
      new_password: payload.password,
      confirm_password: payload.confirmPassword,
    };

    const { data } = await apiNewClient.post("/user/reset-password", {
      data: encrypt(bodyPayload),
    });
    return data;
  },
};
