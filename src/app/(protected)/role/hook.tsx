
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RolePayload, RoleListParams, roleHandler } from "./handler";

const ROLES_QUERY_KEY = ["roles"] as const;

export const useRoles = (params: RoleListParams) =>
  useQuery({
    queryKey: [...ROLES_QUERY_KEY, params.page, params.limit, params.name, params.category],
    queryFn: () => roleHandler.getRoles(params),
  });

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RolePayload) => roleHandler.createRole(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RolePayload }) =>
      roleHandler.updateRole(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleHandler.deleteRole(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
};
