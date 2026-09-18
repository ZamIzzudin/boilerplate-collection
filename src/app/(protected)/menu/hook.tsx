import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MenuPayload, menuHandler } from "./handler";

const MENUS_QUERY_KEY = ["menus"] as const;
const MENU_ACTIONS_QUERY_KEY = ["menu-actions"] as const;

const PRIVILEGE_QUERY_KEYS = [["privilege-me"], ["privileges-me"]] as const;

export const useMenus = (params: {
  limit: number;
  page: number;
  menu_name: string;
}) =>
  useQuery({
    queryKey: [...MENUS_QUERY_KEY, params.limit, params.page, params.menu_name],
    queryFn: () => menuHandler.getMenus(params),
  });

export const useAllMenus = () =>
  useQuery({
    queryKey: [...MENUS_QUERY_KEY, "all"],
    queryFn: () => menuHandler.getAllMenus(),
  });

export const useMenuActions = () =>
  useQuery({
    queryKey: MENU_ACTIONS_QUERY_KEY,
    queryFn: () => menuHandler.getActions(),
  });

export const useCreateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MenuPayload) => menuHandler.createMenu(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MENUS_QUERY_KEY });
      await Promise.all(
        PRIVILEGE_QUERY_KEYS.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
  });
};

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload }: { payload: MenuPayload }) =>
      menuHandler.updateMenu(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MENUS_QUERY_KEY });
      await Promise.all(
        PRIVILEGE_QUERY_KEYS.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
  });
};

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { menu_code: string }) =>
      menuHandler.deleteMenu(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MENUS_QUERY_KEY });
      await Promise.all(
        PRIVILEGE_QUERY_KEYS.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
  });
};
