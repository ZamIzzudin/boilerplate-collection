import { Link } from "react-router-dom";
import {
  ArrowLineDownIcon,
  ArrowsOutSimpleIcon,
  CaretDownIcon,
  GaugeIcon,
  ListIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { iconMap } from "@/lib/icon-map";
import type { SidebarMenu } from "@/types";

export type { SidebarMenu, SidebarSubMenu } from "@/types";

type Props = {
  collapsed: boolean;
  menuSearch: string;
  pathname: string;
  visibleMenus: SidebarMenu[];
  openMenus: Record<string, boolean>;
  onToggleCollapse: () => void;
  onMenuSearchChange: (value: string) => void;
  onToggleMenu: (menuCode: string, isOpen: boolean) => void;
};

export function AppSidebar({
  collapsed,
  menuSearch,
  pathname,
  visibleMenus,
  openMenus,
  onToggleCollapse,
  onMenuSearchChange,
  onToggleMenu,
}: Readonly<Props>) {
  return (
    <aside
      className={cn(
        "bg-[#F1F7FD] transition-all duration-200 h-dvh overflow-y-hidden sticky flex flex-col gap-3",
        collapsed ? "w-20" : "w-70 justify-evenly",
      )}
    >
      <div className="flex items-center justify-between px-5 h-15">
        {!collapsed && (
          <img
            src="/lcs_logo.png"
            alt="lcs_logo"
            className="w-full h-auto max-w-40"
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-[#6aa8e6] text-[#1876d3]"
          onClick={onToggleCollapse}
        >
          {collapsed ? (
            <ListIcon className="size-4" />
          ) : (
            <ArrowsOutSimpleIcon className="size-4" />
          )}
        </Button>
      </div>

      {!collapsed && (
        <div className="px-5">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7b929d]" />
            <input
              value={menuSearch}
              onChange={(e) => onMenuSearchChange(e.target.value)}
              placeholder="Cari menu"
              className="h-10 w-full rounded-md border border-[#dbe3ea] bg-white pl-9 pr-3 text-sm text-[#1f4878] outline-none"
            />
          </div>
        </div>
      )}

      <nav
        className={`flex flex-col overflow-y-auto ${collapsed ? "pl-3" : "px-3 pb-4 h-[calc(68vh-5rem)]"}`}
      >
        <div className="flex-1 pr-1 space-y-1 overflow-y-auto">
          {visibleMenus.map((item) => {
            const Icon = iconMap[item.icon] ?? GaugeIcon;
            const hasSubMenus = item.subMenus.length > 0;
            const parentActive = item.path
              ? pathname === item.path
              : item.subMenus.some((sub) => sub.path === pathname);
            const isOpen = openMenus[item.code] ?? parentActive;
            const isGroup = item?.isGroup;

            return (
              <div key={item.code} className="space-y-1">
                <MenuItemRenderer
                  isGroup={isGroup}
                  hasSubMenus={hasSubMenus}
                  item={item}
                  Icon={Icon}
                  collapsed={collapsed}
                  parentActive={parentActive}
                  isOpen={isOpen}
                  onToggleMenu={onToggleMenu}
                />

                {!collapsed && hasSubMenus && (isGroup || isOpen) && (
                  <div
                    key={item.code}
                    className={`space-y-1 ${isGroup ? "" : "pl-3"}`}
                  >
                    {item.subMenus.map((sub) => {
                      const SubIcon = iconMap[sub.icon] ?? GaugeIcon;
                      const subActive = sub.path
                        ? pathname === sub.path
                        : sub.subMenus.some(
                            (subsub) => subsub.path === pathname,
                          );

                      const hasSubSubMenus = sub?.subMenus?.length > 0;
                      const isSubOpen = openMenus[sub.code] ?? subActive;
                      return (
                        <div key={sub.code} className="space-y-1">
                          {hasSubSubMenus ? (
                            <button
                              type="button"
                              onClick={() =>
                                hasSubSubMenus &&
                                onToggleMenu(sub.code, isSubOpen)
                              }
                              className={cn(
                                "cursor-pointer flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[#194a7b] hover:bg-[#B6D6F7]",
                                parentActive && "bg-[#B6D6F7] font-semibold",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="size-4" />
                                {!collapsed && <span>{sub.name}</span>}
                              </div>
                              {!collapsed && hasSubSubMenus && (
                                <CaretDownIcon
                                  className={cn(
                                    "size-4 transition-transform",
                                    isSubOpen && "rotate-180",
                                  )}
                                />
                              )}
                            </button>
                          ) : (
                            <Link
                              key={sub.code}
                              to={sub?.path || ""}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#315d88] hover:bg-[#B6D6F7]",
                                subActive &&
                                  "bg-[#B6D6F7] font-medium text-[#194a7b]",
                              )}
                            >
                              <SubIcon className="size-4" />
                              <span>{sub.name}</span>
                            </Link>
                          )}

                          {sub?.subMenus?.map((subsub) => {
                            const SubIcon = iconMap[subsub.icon] ?? GaugeIcon;
                            const subsubActive = subsub.path === pathname;
                            if (!subsub.path) return null;
                            return (
                              isSubOpen && (
                                <div key={subsub.code} className="space-y-1 pl-3">
                                  <Link
                                    to={subsub.path}
                                    className={cn(
                                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#315d88] hover:bg-[#B6D6F7]",
                                      subsubActive &&
                                        "bg-[#B6D6F7] font-medium text-[#194a7b]",
                                    )}
                                  >
                                    <SubIcon className="size-4" />
                                    <span>{subsub.name}</span>
                                  </Link>
                                </div>
                              )
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {!collapsed && (
        <div className="rounded-xl bg-white p-4 text-[#2f3e4b] mx-4">
          <p className="text-base font-semibold">Butuh bantuan lebih lanjut?</p>
          <p className="mt-1 text-sm text-[#7b929d] font-light">
            Unduh panduan penggunaan aplikasi di bawah ini
          </p>
          <Button className="w-full py-5 mt-4" variant="primary">
            <ArrowLineDownIcon className="mr-2 size-4" />
            Unduh Panduan
          </Button>
        </div>
      )}
    </aside>
  );
}

function MenuItemRenderer(
  props: Readonly<{
    isGroup: boolean | undefined;
    hasSubMenus: boolean;
    item: SidebarMenu;
    Icon: React.ComponentType<{ className?: string }>;
    collapsed: boolean;
    parentActive: boolean;
    isOpen: boolean;
    onToggleMenu: (menuCode: string, isOpen: boolean) => void;
  }>,
) {
  const {
    isGroup,
    hasSubMenus,
    item,
    Icon,
    collapsed,
    parentActive,
    isOpen,
    onToggleMenu,
  } = props;

  if (isGroup) {
    return (
      <p
        className={`px-2 py-2 text-xs text-[#6f8797] ${collapsed && "hidden"}`}
      >
        {item.name}
      </p>
    );
  }

  if (hasSubMenus) {
    return (
      <button
        type="button"
        onClick={() => onToggleMenu(item.code, isOpen)}
        className={cn(
          "cursor-pointer flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[#194a7b] hover:bg-[#B6D6F7]",
          parentActive && "bg-[#B6D6F7] font-semibold",
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="size-4" />
          {!collapsed && <span>{item.name}</span>}
        </div>
        {!collapsed && (
          <CaretDownIcon
            className={cn(
              "size-4 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        )}
      </button>
    );
  }

  return (
    <Link
      to={item?.path || "/"}
      className={cn(
        "flex items-center gap-3 rounded-lg  px-3 py-2 text-sm text-[#194a7b] hover:bg-[#B6D6F7]",
        parentActive && "bg-[#B6D6F7] font-semibold",
      )}
    >
      <Icon className="size-4" />
      {!collapsed && <span>{item.name}</span>}
    </Link>
  );
}
