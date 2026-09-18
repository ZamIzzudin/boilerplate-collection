import type { Action, Menu, MenuAction, Privilege } from "@prisma/client";

export type MenuActionDto = { code: string; name: string };

export type MenuFromBackend = {
  id: string;
  code: string;
  name: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  parentMenuId: string | null;
  isGroup: boolean;
  actions: MenuActionDto[];
  subMenus: MenuFromBackend[];
};

type BuildMenuTreeInput = {
  menus: Menu[];
  menuActions: MenuAction[];
  actions: Action[];
  privileges: Privilege[];
};

/**
 * Build the nested menu tree consumed by the frontend (`MenuFromBackend[]`),
 * keeping only menus/actions the user's role has an ACTIVE privilege for.
 */
export const buildMenuTree = ({
  menus,
  menuActions,
  actions,
  privileges,
}: BuildMenuTreeInput): MenuFromBackend[] => {
  const activePrivileges = privileges.filter((p) => p.statusCode === "ACTIVE");
  const allowed = new Set(
    activePrivileges.map((p) => `${p.menuCode}:${p.actionCode}`),
  );

  const actionNameByCode = new Map(actions.map((a) => [a.code, a.name]));
  const actionsByMenu = new Map<string, MenuActionDto[]>();

  for (const mapping of menuActions) {
    if (!allowed.has(`${mapping.menuCode}:${mapping.actionCode}`)) continue;
    if (mapping.statusCode !== "ACTIVE") continue;

    const list = actionsByMenu.get(mapping.menuCode) ?? [];
    list.push({
      code: mapping.actionCode,
      name: actionNameByCode.get(mapping.actionCode) ?? mapping.actionCode,
    });
    actionsByMenu.set(mapping.menuCode, list);
  }

  const visibleMenus = menus.filter(
    (menu) => menu.statusCode === "ACTIVE" && (actionsByMenu.get(menu.code)?.length ?? 0) > 0,
  );

  // Ensure parents of visible menus are included even without own actions.
  const byCode = new Map(menus.map((menu) => [menu.code, menu]));
  const includedCodes = new Set(visibleMenus.map((menu) => menu.code));
  for (const menu of visibleMenus) {
    let parentCode = menu.parentCode;
    while (parentCode && !includedCodes.has(parentCode)) {
      includedCodes.add(parentCode);
      parentCode = byCode.get(parentCode)?.parentCode ?? null;
    }
  }

  const included = menus.filter((menu) => includedCodes.has(menu.code));

  const toDto = (menu: Menu): MenuFromBackend => ({
    id: menu.id,
    code: menu.code,
    name: menu.name,
    path: menu.slug,
    icon: menu.icon,
    sortOrder: menu.order,
    parentMenuId: menu.parentCode,
    isGroup: menu.isGroup,
    actions: actionsByMenu.get(menu.code) ?? [],
    subMenus: [],
  });

  const dtos = new Map(included.map((menu) => [menu.code, toDto(menu)]));
  const roots: MenuFromBackend[] = [];

  for (const dto of dtos.values()) {
    if (dto.parentMenuId && dtos.has(dto.parentMenuId)) {
      dtos.get(dto.parentMenuId)!.subMenus.push(dto);
    } else {
      roots.push(dto);
    }
  }

  const sortTree = (nodes: MenuFromBackend[]): MenuFromBackend[] => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach((node) => sortTree(node.subMenus));
    return nodes;
  };

  return sortTree(roots);
};
