import { TokenPasswordForm } from "@/components/token-password-form";
import { useResetPassword } from "./hook";
import { notifyFailed } from "@/lib/notify";
import { getErrorMessage } from "@/lib/error-message";

export default function ResetPasswordPage() {
  const { mutateAsync: handleResetPassword } = useResetPassword();

  const handleSubmit = async (
    token: string,
    password: string,
    confirmPassword: string,
  ) => {
    try {
      await handleResetPassword({ token, password, confirmPassword });
    } catch (error) {
      notifyFailed({
        title: "Gagal mengatur ulang kata sandi",
        description: getErrorMessage(
          error,
          "Terjadi kesalahan saat mengatur ulang kata sandi",
        ),
      });
      throw error;
    }
  };

  return (
    <TokenPasswordForm
      title="Atur Ulang Kata Sandi"
      buttonText="Atur Ulang Kata Sandi"
      alertTitle="Kata sandi akun Anda sudah diatur ulang!"
      alertDescription="Lakukan proses log in untuk mengakses akun SITOLAUT Anda"
      action="reset"
      onSubmit={handleSubmit}
    />
  );
}
