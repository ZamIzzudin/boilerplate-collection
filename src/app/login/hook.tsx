import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handler } from "./handler";
import type { LoginPayload, ForgotPasswordPayload } from "./types";

const LOGIN_QUERY_KEY = ["login"] as const;
const FORGOT_PASSWORD_QUERY_KEY = ["forgot-password"] as const;

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => handler.login(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LOGIN_QUERY_KEY });
    },
  });
};

export const useForgotPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      handler.forgotPassword(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: FORGOT_PASSWORD_QUERY_KEY,
      });
    },
  });
};
