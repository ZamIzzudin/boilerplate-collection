
import { create } from "zustand";
import type { SidebarMenu, MenuFromBackend } from "@/types";

function mapBackendMenus(menus: MenuFromBackend[]): SidebarMenu[] {
  if (!menus || menus.length === 0) return [];

  const parents = menus.filter((m) => m.parentMenuId === null);

  return parents.map((parent) => ({
    code: parent.code,
    name: parent.name,
    path: parent.path,
    icon: parent.icon,
    sortOrder: parent.sortOrder,
    actions: parent.actions ?? [],
    isGroup: parent.isGroup,
    subMenus: parent?.subMenus?.map((sub) => ({
      code: sub.code,
      name: sub.name,
      path: sub.path,
      icon: sub.icon,
      sortOrder: sub.sortOrder,
      actions: sub.actions ?? [],
      subMenus: sub?.subMenus?.map((subsub) => ({
        code: subsub.code,
        name: subsub.name,
        path: subsub.path,
        icon: subsub.icon,
        sortOrder: subsub.sortOrder,
        actions: subsub.actions ?? [],
      }))
    })) || []
  } as SidebarMenu));
}

type PrivilegeState = {
  username: string | null;
  email: string | null;
  actionKeys: string[];
  menus: SidebarMenu[];
  isReady: boolean;
  isAuthorized: boolean;

  setPrivilegeFromLogin: (data: {
    user_email: string;
    menus: MenuFromBackend[];
  }) => void;
  setPrivilegeFromMe: (data: {
    user_email: string;
    menus: MenuFromBackend[];
  }) => void;
  resetPrivilege: () => void;
};

export const usePrivilegeStore = create<PrivilegeState>((set) => ({
  username: null,
  email: null,
  actionKeys: [],
  menus: [],
  isReady: false,
  isAuthorized: false,

  setPrivilegeFromLogin: ({ user_email, menus: backendMenus }) => {
    const mapped = mapBackendMenus(backendMenus);
    set({
      username: user_email?.split("@")[0] ?? "user",
      email: user_email,
      actionKeys: (backendMenus ?? []).flatMap((m) =>
        (m.actions ?? []).map((a) => a.code),
      ),
      menus: mapped,
      isReady: true,
      isAuthorized: true,
    });
  },

  setPrivilegeFromMe: ({ user_email, menus: backendMenus }) => {
    const mapped = mapBackendMenus(backendMenus);
    set({
      username: user_email?.split("@")[0] ?? "user",
      email: user_email,
      actionKeys: (backendMenus ?? []).flatMap((m) =>
        (m.actions ?? []).map((a) => a.code),
      ),
      menus: mapped,
      isReady: true,
      isAuthorized: true,
    });
  },

  resetPrivilege: () => {
    set({
      username: null,
      email: null,
      actionKeys: [],
      menus: [],
      isReady: false,
      isAuthorized: false,
    });
  },
}));
