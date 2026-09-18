import { useMutation } from "@tanstack/react-query";
import { UserActivationPayload, handler } from "./handler";

export const useUserActivation = () => {
  return useMutation({
    mutationFn: (payload: UserActivationPayload) =>
      handler.userActivation(payload),
  });
};
