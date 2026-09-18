import type {
  MenuAction,
  SidebarSubMenu,
  SidebarMenu,
  MenuFromBackend,
  MenuItem,
  MenuPayload,
  ActionItem,
  ActionPayload,
} from "../menu";

describe("menu types", () => {
  it("exports MenuAction type", () => {
    const action: MenuAction = { code: "read", name: "Read" };
    expect(action.code).toBe("read");
  });

  it("exports SidebarSubMenu type", () => {
    const sub: SidebarSubMenu = {
      code: "sub", name: "Sub", path: "/sub", icon: "icon",
      sortOrder: 1, actions: [], isGroup: false, subMenus: [],
    };
    expect(sub.code).toBe("sub");
  });

  it("exports SidebarMenu type", () => {
    const menu: SidebarMenu = {
      code: "menu", name: "Menu", path: "/menu", icon: "icon",
      sortOrder: 1, actions: [], subMenus: [], isGroup: false,
    };
    expect(menu.code).toBe("menu");
  });

  it("exports MenuFromBackend type", () => {
    const menu: MenuFromBackend = {
      id: "1", code: "menu", name: "Menu", path: "/menu", icon: "icon",
      sortOrder: 1, parentMenuId: null, actions: [], subMenus: [], isGroup: false,
    };
    expect(menu.id).toBe("1");
  });

  it("exports MenuItem type", () => {
    const item: MenuItem = {
      id: "1", menu_code: "m1", menu_name: "M1",
      parent_code: null, icon: "icon", slug: "m1", order: 1,
      actions: [], isGroup: false,
    };
    expect(item.menu_code).toBe("m1");
  });

  it("exports MenuPayload type", () => {
    const payload: MenuPayload = {
      menu_name: "Test", parent_code: null, icon: "icon",
      slug: "test", order: 1, is_group: false,
    };
    expect(payload.menu_name).toBe("Test");
  });

  it("exports ActionItem type", () => {
    const item: ActionItem = {
      id: "1", action_code: "read", action_name: "Read", status_code: "active",
    };
    expect(item.action_code).toBe("read");
  });

  it("exports ActionPayload type", () => {
    const payload: ActionPayload = { action_name: "Read" };
    expect(payload.action_name).toBe("Read");
  });
});
