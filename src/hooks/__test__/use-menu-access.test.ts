import { renderHook } from "@testing-library/react";
import { useMenuAccess } from "@/hooks/use-menu-access";
import { ACTION_CODES } from "@/lib/action-codes";
import type { SidebarMenuList } from "@/types/menu";

const mockUsePrivilegeStore = jest.fn();

jest.mock("@/store/privilege-store", () => ({
  usePrivilegeStore: (selector: (state: { menus: SidebarMenuList[] }) => unknown) =>
    selector({ menus: mockUsePrivilegeStore() }),
}));

function makeMenu(
  path: string,
  actions: { code: string }[],
  subMenus?: SidebarMenuList[],
): SidebarMenuList {
  return { path, actions, subMenus } as unknown as SidebarMenuList;
}

describe("useMenuAccess", () => {
  beforeEach(() => {
    mockUsePrivilegeStore.mockReturnValue([]);
  });

  it("returns isLoading false", () => {
    const { result } = renderHook(() => useMenuAccess("/some-path"));
    expect(result.current.isLoading).toBe(false);
  });

  it("returns all false when no matching menu path", () => {
    mockUsePrivilegeStore.mockReturnValue([
      makeMenu("/other", [{ code: ACTION_CODES.LIST }]),
    ]);

    const { result } = renderHook(() => useMenuAccess("/nonexistent"));

    expect(result.current.canView).toBe(false);
    expect(result.current.canViewDetail).toBe(false);
    expect(result.current.canAdd).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canActive).toBe(false);
    expect(result.current.canDownload).toBe(false);
  });

  it("returns correct flags for matching menu with all actions", () => {
    const allActions = Object.values(ACTION_CODES).map((code) => ({ code }));
    mockUsePrivilegeStore.mockReturnValue([makeMenu("/master", allActions)]);

    const { result } = renderHook(() => useMenuAccess("/master"));

    expect(result.current.canView).toBe(true);
    expect(result.current.canViewDetail).toBe(true);
    expect(result.current.canAdd).toBe(true);
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.canActive).toBe(true);
    expect(result.current.canDownload).toBe(true);
  });

  it("normalizes path by removing leading slash (case-insensitive)", () => {
    mockUsePrivilegeStore.mockReturnValue([
      makeMenu("/MyPath", [{ code: ACTION_CODES.LIST }, { code: ACTION_CODES.ADD }]),
    ]);

    const { result } = renderHook(() => useMenuAccess("/mypath"));
    expect(result.current.canView).toBe(true);
    expect(result.current.canAdd).toBe(true);
  });

  it("normalizes menu path with leading slash", () => {
    mockUsePrivilegeStore.mockReturnValue([
      makeMenu("MyPath", [{ code: ACTION_CODES.DELETE }]),
    ]);

    const { result } = renderHook(() => useMenuAccess("/myPath"));
    expect(result.current.canDelete).toBe(true);
  });

  it("finds action codes in nested subMenus", () => {
    const parentMenu = makeMenu("/parent", [], [
      makeMenu("/child", [{ code: ACTION_CODES.EDIT }, { code: ACTION_CODES.VIEW }]),
    ]);
    mockUsePrivilegeStore.mockReturnValue([parentMenu]);

    const { result } = renderHook(() => useMenuAccess("/child"));
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canViewDetail).toBe(true);
  });

  it("finds action codes in deeply nested subMenus", () => {
    const deepMenu = makeMenu("/root", [], [
      makeMenu("/mid", [], [
        makeMenu("/deep", [{ code: ACTION_CODES.ACTIVE_TOGGLE }]),
      ]),
    ]);
    mockUsePrivilegeStore.mockReturnValue([deepMenu]);

    const { result } = renderHook(() => useMenuAccess("/deep"));
    expect(result.current.canActive).toBe(true);
  });

  it("each permission flag maps to its correct ACTION_CODE", () => {
    const mapping: [keyof ReturnType<typeof useMenuAccess>, string][] = [
      ["canView", ACTION_CODES.LIST],
      ["canViewDetail", ACTION_CODES.VIEW],
      ["canAdd", ACTION_CODES.ADD],
      ["canEdit", ACTION_CODES.EDIT],
      ["canDelete", ACTION_CODES.DELETE],
      ["canActive", ACTION_CODES.ACTIVE_TOGGLE],
      ["canDownload", ACTION_CODES.DOWNLOAD],
    ];

    for (const [prop, code] of mapping) {
      mockUsePrivilegeStore.mockReturnValue([makeMenu("/test", [{ code }])]);
      const { result, unmount } = renderHook(() => useMenuAccess("/test"));
      expect(result.current[prop]).toBe(true);
      unmount();
    }
  });

  it("handles menu with undefined or null path gracefully", () => {
    const menuWithoutPath = { path: undefined, actions: [{ code: ACTION_CODES.DELETE }] } as unknown as SidebarMenuList;
    mockUsePrivilegeStore.mockReturnValue([menuWithoutPath]);

    const { result } = renderHook(() => useMenuAccess("/test"));
    expect(result.current.canDelete).toBe(false);
  });

  it("returns empty actions set when menu.actions is undefined", () => {
    const menu = { path: "/no-actions", subMenus: [] } as unknown as SidebarMenuList;
    mockUsePrivilegeStore.mockReturnValue([menu]);

    const { result } = renderHook(() => useMenuAccess("/no-actions"));
    expect(result.current.canView).toBe(false);
    expect(result.current.canAdd).toBe(false);
  });

  it("returns empty when menus list is empty", () => {
    mockUsePrivilegeStore.mockReturnValue([]);
    const { result } = renderHook(() => useMenuAccess("/anything"));
    expect(result.current.canView).toBe(false);
  });

  it("does not match when menu path is different (case-sensitive after normalization)", () => {
    mockUsePrivilegeStore.mockReturnValue([
      makeMenu("/Alpha", [{ code: ACTION_CODES.LIST }]),
    ]);
    // after normalization: "alpha" vs "alpha" — same
    const { result } = renderHook(() => useMenuAccess("/Alpha"));
    expect(result.current.canView).toBe(true);
  });

  it("path without leading slash matches normalized key", () => {
    mockUsePrivilegeStore.mockReturnValue([
      makeMenu("dashboard", [{ code: ACTION_CODES.VIEW }]),
    ]);
    const { result } = renderHook(() => useMenuAccess("/Dashboard"));
    expect(result.current.canViewDetail).toBe(true);
  });
});
