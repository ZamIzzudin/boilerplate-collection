import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActionPayload, actionHandler } from "./handler";

const ACTIONS_QUERY_KEY = ["actions"] as const;

export const useActions = (params: {
  page: number;
  perPage: number;
  action_name: string;
}) =>
  useQuery({
    queryKey: [
      ...ACTIONS_QUERY_KEY,
      params.page,
      params.perPage,
      params.action_name,
    ],
    queryFn: () => actionHandler.getActions(params),
  });

export const useCreateAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActionPayload) => actionHandler.createAction(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACTIONS_QUERY_KEY });
    },
  });
};

export const useUpdateAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActionPayload) => actionHandler.updateAction(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACTIONS_QUERY_KEY });
    },
  });
};

export const useDeleteAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { action_code: string }) =>
      actionHandler.deleteAction(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACTIONS_QUERY_KEY });
    },
  });
};
