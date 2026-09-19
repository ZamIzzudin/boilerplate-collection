import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handler } from "./handler";
import type { LoginPayload } from "./types";

const LOGIN_QUERY_KEY = ["login"] as const;

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => handler.login(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LOGIN_QUERY_KEY });
    },
  });
};
