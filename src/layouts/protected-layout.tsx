import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAuthStore } from "@/store/auth-store";
import { usePrivilegeStore } from "@/store/privilege-store";
import { usePermissionEvents } from "@/hooks/use-permission-events";

export function ProtectedLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { menus, isReady, isAuthorized, resetPrivilege } = usePrivilegeStore(
    (state) => state,
  );
  const { user } = useAuthStore();

  usePermissionEvents();

  useEffect(() => {
    if (!isAuthenticated) {
      resetPrivilege();
    }
  }, [isAuthenticated, resetPrivilege]);

  if (!isAuthenticated || !isReady || !isAuthorized || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardShell
      email={user.email}
      userType={user.userTypeName}
      menus={menus}
    >
      <Outlet />
    </DashboardShell>
  );
}
