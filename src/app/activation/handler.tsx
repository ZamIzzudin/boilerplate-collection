import { apiNewClient } from "@/lib/axios/client";
import { decrypt, encrypt } from "@/lib/crypto";

type TokenData = {
  email: string;
  token: string;
};

export type UserActivationPayload = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ValidTokenPayload = {
  token: string;
};

export const handler = {
  userActivation: async (payload: UserActivationPayload) => {
    const tokenData = decrypt<TokenData>(payload.token);
    const bodyPayload = {
      email: tokenData.email,
      token: tokenData.token,
      new_password: payload.password,
      confirm_password: payload.confirmPassword,
    };

    const { data } = await apiNewClient.post("/user/activation", {
      data: encrypt(bodyPayload),
    });
    return data;
  },
  validToken: async (payload: ValidTokenPayload) => {
    const tokenData = decrypt<TokenData>(payload.token);
    const bodyPayload = {
      email: tokenData.email,
      token: tokenData.token,
      action: "activation",
    };

    const { data } = await apiNewClient.post("/user/valid-token", {
      data: encrypt(bodyPayload),
    });
    return data;
  },
};
