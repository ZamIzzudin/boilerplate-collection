import { useMutation } from "@tanstack/react-query";
import { ResetPasswordPayload, handler } from "./handler";

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      handler.resetPassword(payload),
  });
};
