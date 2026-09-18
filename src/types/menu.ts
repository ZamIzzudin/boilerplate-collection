export type MenuAction = {
  code: string;
  name: string;
  mapping_menu_code?: string;
};

export type SidebarSubMenu = {
  code: string;
  name: string;
  path: string | null;
  icon: string;
  sortOrder: number;
  actions: MenuAction[];
  isGroup: boolean;
  subMenus: SidebarSubMenu[];
};

export type SidebarMenu = {
  code: string;
  name: string;
  path: string | null;
  icon: string;
  sortOrder: number;
  actions: MenuAction[];
  subMenus: SidebarSubMenu[];
  isGroup: boolean;
};

export type MenuFromBackend = {
  id: string;
  code: string;
  name: string;
  path: string | null;
  icon: string;
  sortOrder: number;
  parentMenuId: string | null;
  actions: MenuAction[];
  subMenus: SidebarSubMenu[];
  isGroup: boolean;
};

export type MenuItem = {
  id: string;
  menu_code: string;
  menu_name: string;
  parent_code: string | null;
  icon: string;
  slug: string;
  order: number;
  actions: MenuAction[];
  isGroup: boolean;
};

export type MenuPayload = {
  menu_code?: string;
  menu_name: string;
  parent_code: string | null;
  icon: string;
  slug: string;
  order: number;
  action?: {
    mapping_menu_code?: string;
    action_code?: string;
    status_code?: string;
  }[];
  is_group: boolean;
};

export type ActionItem = {
  id: string;
  action_code: string;
  action_name: string;
  status_code: string;
};

export type ActionPayload = {
  action_code?: string;
  action_name: string;
};

export type SidebarMenuList = {
  path: string | null;
  actions?: { code: string }[];
  subMenus?: any[];
};
