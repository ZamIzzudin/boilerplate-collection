import { useMutation } from "@tanstack/react-query";
import { apiNewClient } from "@/lib/axios/client";
import { decrypt, encrypt } from "@/lib/crypto";

type ValidTokenPayload = { token: string; action: string };

const validateToken = async (payload: ValidTokenPayload) => {
  const tokenData = decrypt<{ email: string; token: string }>(
    payload.token,
  ) as { email: string; token: string };
  const bodyPayload = {
    email: tokenData.email,
    token: tokenData.token,
    action: payload.action,
  };

  const { data } = await apiNewClient.post("/user/valid-token", {
    data: encrypt(bodyPayload),
  });
  return data;
};

export const useValidToken = () => {
  return useMutation({ mutationFn: validateToken });
};
