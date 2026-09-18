import { useLocation, useNavigate } from "react-router-dom";
import { SignOutIcon, UserCircleIcon, UserIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { apiNewClient } from "@/lib/axios/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppSidebar } from "@/components/app-sidebar";
import type { SidebarMenu } from "@/types";
import { usePrivilegeStore } from "@/store/privilege-store";
import { useAuthStore } from "@/store/auth-store";
import { ACTION_CODES } from "@/lib/action-codes";
import { useProfileImage } from "@/hooks/use-profile-image";

type Props = {
  email: string;
  userType: string;
  menus: SidebarMenu[];
  children: React.ReactNode;
};

export function DashboardShell({
  email,
  userType,
  menus,
  children,
}: Readonly<Props>) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const resetPrivilege = usePrivilegeStore((state) => state.resetPrivilege);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [menuSearch, setMenuSearch] = useState("");
  const { data: profileImage } = useProfileImage(user?.id);

  const onLogout = async () => {
    try {
      await apiNewClient.post("/auth/logout");
    } catch {
      // ignore errors, proceed with local cleanup
    }
    clearAuth();
    resetPrivilege();
    new Array(5).forEach(() =>
      globalThis.window.history.pushState(null, "", "/login"),
    );
    navigate("/login", { replace: true });
  };

  const onOpenProfile = () => {
    navigate("/profile");
  };

  const hasAction = (
    actions: { code: string; name: string }[],
    actionCode: string,
  ) => actions.some((a) => a.code === actionCode);
  const visibleMenus = menus
    .map((item) => ({
      ...item,
      subMenus: item.subMenus.filter((sub) =>
        hasAction(sub.actions, ACTION_CODES.LIST),
      ),
    }))
    .filter(
      (item) =>
        hasAction(item.actions, ACTION_CODES.LIST) || item.subMenus.length > 0,
    )
    .filter((item) => {
      if (!menuSearch.trim()) return true;
      const query = menuSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.subMenus.some((sub) => sub.name.toLowerCase().includes(query))
      );
    });

  const currentMenuLabel = useMemo(() => {
    for (const menu of menus) {
      const activeSub = menu.subMenus.find((sub) => sub.path === pathname);
      if (activeSub) return `${menu.name} / ${activeSub.name}`;
      if (menu.path === pathname) return menu.name;
    }

    return "Dashboard";
  }, [menus, pathname]);

  return (
    <div className="flex max-h-screen bg-muted/40 overflow-hidden">
      <AppSidebar
        collapsed={collapsed}
        menuSearch={menuSearch}
        pathname={pathname}
        visibleMenus={visibleMenus}
        openMenus={openMenus}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        onMenuSearchChange={setMenuSearch}
        onToggleMenu={(menuCode) =>
          setOpenMenus((prev) => ({
            ...prev,
            [menuCode]: prev[menuCode] === undefined ? false : !prev[menuCode],
          }))
        }
      />
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center justify-between gap-3 px-6 bg-on-primary">
          <div>
            <span className="text-sm font-medium">{currentMenuLabel}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[#e2eef9]"
                />
              }
            >
              <Avatar>
                {profileImage ? (
                  <AvatarImage src={profileImage} alt={email} />
                ) : (
                  <AvatarFallback className="bg-primary-container">
                    <UserIcon size={20} className="text-on-primary-container" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-left text-sm">
                <p className="font-medium">{email}</p>
                <p className="text-gray-400">{userType}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onOpenProfile}>
                <UserCircleIcon className="size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onLogout}>
                <SignOutIcon className="size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
