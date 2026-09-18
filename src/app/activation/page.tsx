import { TokenPasswordForm } from "@/components/token-password-form";
import { useUserActivation } from "./hook";
import { notifyFailed } from "@/lib/notify";
import { getErrorMessage } from "@/lib/error-message";

export default function ActivationPage() {
  const { mutateAsync: handleUserActivation } = useUserActivation();

  const handleSubmit = async (
    token: string,
    password: string,
    confirmPassword: string,
  ) => {
    try {
      await handleUserActivation({ token, password, confirmPassword });
    } catch (error) {
      notifyFailed({
        title: "Gagal mengaktifkan akun",
        description: getErrorMessage(
          error,
          "Terjadi kesalahan saat mengaktifkan akun",
        ),
      });
      throw error;
    }
  };

  return (
    <TokenPasswordForm
      title="Aktivasi Akun Regulator SITOLAUT"
      buttonText="Simpan Kata Sandi"
      alertTitle="Kata sandi akun Anda sudah disimpan!"
      alertDescription="Lakukan proses log in untuk mengakses akun Regulator SITOLAUT Anda"
      action="activation"
      onSubmit={handleSubmit}
    />
  );
}
