import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { apiNewClient } from "@/lib/axios/client";
import { useAuthStore } from "@/store/auth-store";
import { usePrivilegeStore } from "@/store/privilege-store";
import { ProtectedLayout } from "@/layouts/protected-layout";

import LoginPage from "@/app/login/page";
import ActivationPage from "@/app/activation/page";
import DashboardPage from "@/app/(protected)/dashboard/page";
import UserPage from "@/app/(protected)/user/page";
import RolePage from "@/app/(protected)/role/page";
import ActionPage from "@/app/(protected)/action/page";
import MenuPage from "@/app/(protected)/menu/page";
import PrivilegePage from "@/app/(protected)/privilege/page";
import ProfilePage from "@/app/(protected)/profile/page";
import DungeonPage from "@/pages/dungeon-page";
import NotFoundPage from "@/pages/not-found-page";

function PublicLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function AppBootstrap({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isLoading, setIsLoading] = useState(true);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const setPermissionVersion = useAuthStore((s) => s.setPermissionVersion);
  const setPrivilegeFromMe = usePrivilegeStore((s) => s.setPrivilegeFromMe);
  const setUserTypeId = useAuthStore((s) => s.setUserTypeId);

  useEffect(() => {
    apiNewClient
      .get("/auth/me")
      .then(({ data, headers }: any) => {
        const me = data.data ?? data;
        if (me?.user_email) {
          const permVersion = headers?.["x-perm-version"] as string | undefined;
          if (permVersion) {
            setPermissionVersion(permVersion);
          }
          setUser({
            id: me?.id,
            name: me?.user_email,
            email: me?.user_email,
            userTypeId: me?.user_type_user_type_id,
            userTypeName: me?.user_type_name,
          });
          setAuthenticated();
          setUserTypeId(me.user_type_user_type_id);
          setPrivilegeFromMe({
            user_email: me.user_email,
            menus: me.menus ?? [],
          });
        } else {
          clearAuth();
        }
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [clearAuth, setAuthenticated, setPermissionVersion, setPrivilegeFromMe, setUser, setUserTypeId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryProvider>
      <AppBootstrap>
        <Routes>
          {/* Playground komponen — selalu bisa diakses, login maupun tidak. */}
          <Route path="/dungeon" element={<DungeonPage />} />

          <Route element={<PublicLayout />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/activation/:token" element={<ActivationPage />} />
          </Route>

          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/user" element={<UserPage />} />
            <Route path="/role" element={<RolePage />} />
            <Route path="/action" element={<ActionPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/privilege" element={<PrivilegePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppBootstrap>
      <Toaster richColors position="top-right" />
    </QueryProvider>
  );
}
