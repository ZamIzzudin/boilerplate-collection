import { buildMenuTree } from "@/modules/menu/menu.tree";

const menus = [
  {
    id: "m1",
    code: "MNU_DASHBOARD",
    name: "Dashboard",
    parentCode: null,
    icon: "LayoutDashboard",
    slug: "/dashboard",
    order: 1,
    isGroup: false,
    statusCode: "ACTIVE",
  },
  {
    id: "m2",
    code: "MNU_USER",
    name: "User",
    parentCode: null,
    icon: "Users",
    slug: "/user",
    order: 2,
    isGroup: false,
    statusCode: "ACTIVE",
  },
  {
    id: "m3",
    code: "MNU_HIDDEN",
    name: "Hidden",
    parentCode: null,
    icon: null,
    slug: "/hidden",
    order: 3,
    isGroup: false,
    statusCode: "ACTIVE",
  },
] as never[];

const actions = [
  { id: "a1", code: "ACT_LIST", name: "List" },
  { id: "a2", code: "ACT_ADD", name: "Add" },
] as never[];

const menuActions = [
  { id: "ma1", menuCode: "MNU_DASHBOARD", actionCode: "ACT_LIST", statusCode: "ACTIVE" },
  { id: "ma2", menuCode: "MNU_USER", actionCode: "ACT_LIST", statusCode: "ACTIVE" },
  { id: "ma3", menuCode: "MNU_USER", actionCode: "ACT_ADD", statusCode: "ACTIVE" },
  { id: "ma4", menuCode: "MNU_HIDDEN", actionCode: "ACT_LIST", statusCode: "ACTIVE" },
] as never[];

describe("buildMenuTree", () => {
  it("returns only menus with allowed active privileges", () => {
    const privileges = [
      { menuCode: "MNU_DASHBOARD", actionCode: "ACT_LIST", statusCode: "ACTIVE" },
      { menuCode: "MNU_USER", actionCode: "ACT_LIST", statusCode: "ACTIVE" },
    ] as never[];

    const tree = buildMenuTree({ menus, menuActions, actions, privileges });

    expect(tree.map((menu) => menu.code)).toEqual(["MNU_DASHBOARD", "MNU_USER"]);
    expect(tree[1].actions).toEqual([
      { code: "ACT_LIST", name: "List" },
    ]);
  });

  it("ignores non-active privileges", () => {
    const privileges = [
      { menuCode: "MNU_USER", actionCode: "ACT_LIST", statusCode: "DELETE" },
    ] as never[];

    const tree = buildMenuTree({ menus, menuActions, actions, privileges });
    expect(tree).toEqual([]);
  });

  it("returns an empty tree when there are no privileges", () => {
    const tree = buildMenuTree({ menus, menuActions, actions, privileges: [] });
    expect(tree).toEqual([]);
  });
});
