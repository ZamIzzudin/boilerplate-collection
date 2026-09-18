import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/app-layout";
import {
  useProfileDetail,
  useCheckPassword,
  useChangePassword,
} from "./hook";
import { profileHandler } from "./handler";
import { useAuthStore } from "@/store/auth-store";
import { usePrivilegeStore } from "@/store/privilege-store";
import { getErrorMessage } from "@/lib/error-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailFieldRow } from "@/components/ui/detail-field-row";
import { GearIcon, PasswordIcon, UserIcon } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ResetPasswordSheet from "./components/reset-password-sheet";
import { notifySuccess, notifyFailed } from "@/lib/notify";

export default function ProfilePage() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const resetPrivilege = usePrivilegeStore((state) => state.resetPrivilege);
  const { data, isLoading } = useProfileDetail();

  const checkPassword = useCheckPassword();
  const changePassword = useChangePassword();

  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isResetPasswordSubmitting =
    checkPassword.isPending || changePassword.isPending;

  const resetPasswordState = () => {
    setStep(1);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleResetPasswordOpenChange = (value: boolean) => {
    setIsResetPasswordOpen(value);
    if (!value) resetPasswordState();
  };

  const handleResetPasswordNext = async (
    e: React.ChangeEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    try {
      await checkPassword.mutateAsync(currentPassword);
      setStep(2);
    } catch (error) {
      notifyFailed({
        title: "Gagal",
        description: getErrorMessage(error, "Gagal memverifikasi kata sandi"),
      });
    }
  };

  const handleResetPasswordSubmit = async (
    e: React.ChangeEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    try {
      await changePassword.mutateAsync({ newPassword, confirmPassword });
      notifySuccess({
        title: "Berhasil",
        description: "Kata sandi baru sudah disimpan!",
      });
      resetPasswordState();
      setIsResetPasswordOpen(false);
      try {
        await profileHandler.logout();
      } catch {
        // abaikan error, lanjut pembersihan state lokal
      }
      clearAuth();
      resetPrivilege();
      navigate("/login", { replace: true });
    } catch (error) {
      notifyFailed({
        title: "Gagal",
        description: getErrorMessage(error, "Gagal mengubah kata sandi"),
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Profil Saya" description="Memuat data profil...">
        <div className="flex items-center justify-center py-10">
          <p className="text-muted-foreground">Memuat data profil...</p>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout title="Profil Saya" description="Data tidak ditemukan">
        <div className="flex items-center justify-center py-10">
          <p className="text-muted-foreground">Data profil tidak ditemukan.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <ResetPasswordSheet
        isOpen={isResetPasswordOpen}
        setIsOpen={handleResetPasswordOpenChange}
        step={step}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        showCurrentPassword={showCurrentPassword}
        showNewPassword={showNewPassword}
        showConfirmPassword={showConfirmPassword}
        isSubmitting={isResetPasswordSubmitting}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onToggleShowCurrentPassword={() => setShowCurrentPassword((v) => !v)}
        onToggleShowNewPassword={() => setShowNewPassword((v) => !v)}
        onToggleShowConfirmPassword={() => setShowConfirmPassword((v) => !v)}
        onNext={handleResetPasswordNext}
        onSubmit={handleResetPasswordSubmit}
      />

      <AppLayout
        title={`${data.username} | ${data.userTypeName}`}
        description={data.email}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="lg">
                  <GearIcon className="size-4" />
                  Pengaturan Akun
                </Button>
              }
            />
            <DropdownMenuContent className="w-auto">
              <DropdownMenuItem onClick={() => setIsResetPasswordOpen(true)}>
                <PasswordIcon className="size-4" />
                Atur Ulang Kata Sandi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      >
        <div className="grid md:grid-cols-2 gap-4 py-4 px-2">
          <Card>
            <CardHeader variant="primary" icon={<UserIcon />}>
              <CardTitle>Informasi Akun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailFieldRow label="Username" value={data.username} inline />
              <DetailFieldRow label="Email" value={data.email} inline />
              <DetailFieldRow label="Role" value={data.userTypeName} inline />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </>
  );
}
