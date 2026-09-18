import { useMutation, useQuery } from "@tanstack/react-query";
import { profileHandler } from "./handler";

const PROFILE_QUERY_KEY = ["profile"] as const;

export function useProfileDetail(): {
  data: import("./types").ProfileItem | undefined;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: [...PROFILE_QUERY_KEY, "detail"],
    queryFn: () => profileHandler.getDetail(),
  });

  return { data, isLoading };
}

export function useCheckPassword() {
  return useMutation({
    mutationFn: (password: string) => profileHandler.checkPassword(password),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      newPassword,
      confirmPassword,
    }: {
      newPassword: string;
      confirmPassword: string;
    }) =>
      profileHandler.changePassword(newPassword, confirmPassword),
  });
}
