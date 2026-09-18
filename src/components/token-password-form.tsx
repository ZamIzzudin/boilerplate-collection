import { SubmitEvent, useEffect, useState } from "react";
import { EyeIcon, EyeSlashIcon, InfoIcon } from "@phosphor-icons/react";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertMessage } from "@/components/ui/alert-message";
import { useNavigate, useParams } from "react-router-dom";
import { useValidToken } from "@/hooks/use-token-validation";
import { passwordSchema } from "@/lib/schemas/password";
import { decrypt } from "@/lib/crypto";
import { maskEmail } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-message";

interface TokenPasswordFormProps {
  title: string;
  buttonText: string;
  alertTitle: string;
  alertDescription: string;
  action: string;
  onSubmit: (
    token: string,
    password: string,
    confirmPassword: string,
    action: string,
  ) => Promise<void>;
}

export function TokenPasswordForm({
  title,
  buttonText,
  alertTitle,
  alertDescription,
  action,
  onSubmit,
}: Readonly<TokenPasswordFormProps>) {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { mutate: validateToken } = useValidToken();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const data = decrypt<{ id: string; email: string }>(token!) as {
    id: string;
    email: string;
  };

  useEffect(() => {
    if (!token) {
      setTokenError("Token tidak valid");
      return;
    }

    validateToken(
      { token, action },
      {
        onError: (error) => {
          setTokenError(
            getErrorMessage(error, "Token tidak valid atau sudah kedaluwarsa"),
          );
        },
      },
    );
  }, [token, validateToken]);

  const validateField = (name: string, value: string) => {
    const result = passwordSchema.safeParse({
      password,
      confirmPassword,
      [name]: value,
    });
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === name);
      return issue ? issue.message : "";
    }
    return "";
  };

  const handleBlur = (name: string, value: string) => {
    const message = validateField(name, value);
    setFieldErrors((prev) => {
      if (message) return { ...prev, [name]: message };
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const err of result.error.issues) {
        const key = String(err.path[0]);
        errors[key] = err.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(token!, password, confirmPassword, action);
      setAlertOpen(true);
    } catch {
      // Error handling done by caller via notifyFailed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen px-4 overflow-hidden">
      <div className="absolute top-10 left-10">
        <img
          src="/lcs_logo.png"
          alt="lcs_logo"
          className="w-full h-auto max-w-50"
        />
      </div>
      <div
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          backgroundImage: "url(/illustrasi_login.svg)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom",
          backgroundSize: "cover",
        }}
      />
      <div className="w-full max-w-xl">
        <Card>
          <CardContent>
            {tokenError ? (
              <div className="flex flex-col gap-5 mx-auto">
                <div className="space-y-2 text-center mb-2">
                  <InfoIcon
                    size={60}
                    className="text-primary mx-auto"
                    weight="duotone"
                  />
                  <h2 className="text-2xl font-semibold">
                    Link ini sudah tidak berlaku!
                  </h2>
                  <p className="text-sm leading-5">
                    Aktivasi akun regulator SITOLAUT sudah dilakukan. Lakukan
                    proses log in untuk mengakses akun Anda
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full p-5"
                  disabled={loading}
                  variant="primary"
                  onClick={() => navigate("/login")}
                >
                  Ke Laman Log In
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-5 mx-auto">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">{title}</h2>
                  <p className="text-sm leading-5">
                    Pastikan kata sandi baru mudah diingat, namun tetap aman
                    untuk melindungi akun SITOLAUT{" "}
                    <span className="font-semibold">
                      {maskEmail(data.email)}
                    </span>
                  </p>
                </div>
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <FormField
                    id="password"
                    label="Kata Sandi"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={(e) => handleBlur("password", e.target.value)}
                    required
                    placeholder="Masukkan kata sandi"
                    error={fieldErrors.password}
                    addonEnd={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        tabIndex={-1}
                        className="size-7 text-brand-muted"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="size-4" />
                        ) : (
                          <EyeIcon className="size-4" />
                        )}
                      </Button>
                    }
                  />
                  <FormField
                    id="confirmPassword"
                    label="Konfirmasi Kata Sandi"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={(e) =>
                      handleBlur("confirmPassword", e.target.value)
                    }
                    required
                    placeholder="Ulangi kata sandi"
                    error={fieldErrors.confirmPassword}
                    addonEnd={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        tabIndex={-1}
                        className="size-7 text-brand-muted"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="size-4" />
                        ) : (
                          <EyeIcon className="size-4" />
                        )}
                      </Button>
                    }
                  />

                  <div className="flex justify-between mt-8">
                    <Button
                      type="submit"
                      className="w-full p-5"
                      disabled={loading}
                      variant="primary"
                    >
                      {loading ? "Loading..." : buttonText}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertMessage
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title={alertTitle}
        description={alertDescription}
        tone="success"
        confirmLabel="Ke Laman Log In"
        onConfirm={() => {
          setAlertOpen(false);
          navigate("/login");
        }}
      />
    </div>
  );
}
