
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { privilegeHandler, type RoleMappingPayload } from "./handler";

const PRIVILEGE_ROLES_QUERY_KEY = ["privilege-roles"] as const;
const privilegeMatrixQueryKey = (roleCode: string) =>
  ["privilege-matrix", roleCode] as const;

export const usePrivilegeRoles = () =>
  useQuery({
    queryKey: PRIVILEGE_ROLES_QUERY_KEY,
    queryFn: () => privilegeHandler.getRoles(),
  });

export const usePrivilegeRoleMatrix = (roleCode: string) =>
  useQuery({
    queryKey: privilegeMatrixQueryKey(roleCode),
    queryFn: () => privilegeHandler.buildMatrix(roleCode),
    enabled: Boolean(roleCode),
  });

export const useUpdateRoleMappings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RoleMappingPayload) =>
      privilegeHandler.updateRoleMappings(payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: privilegeMatrixQueryKey(String(variables.user_type_id)),
      });
    },
  });
};
