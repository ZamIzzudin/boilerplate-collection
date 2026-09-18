
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateUserPayload, UpdateUserPayload, userHandler } from "./handler";

const USER_QUERY_KEY = ["users"] as const;
const ROLE_QUERY_KEY = ["user-role-options"] as const;

export const useUsers = (params: { page: number; perPage: number; q: string }) =>
  useQuery({
    queryKey: [...USER_QUERY_KEY, params.page, params.perPage, params.q],
    queryFn: () => userHandler.getUsers(params),
  });

export const useRoleOptions = () =>
  useQuery({
    queryKey: ROLE_QUERY_KEY,
    queryFn: userHandler.getRoleOptions,
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userHandler.createUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userHandler.updateUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userHandler.deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
};
