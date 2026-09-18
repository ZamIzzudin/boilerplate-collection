import { useEffect, useState, RefObject, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import { usePrivilegeStore } from "@/store/privilege-store";
import useCaptcha from "@/hooks/use-captcha";
import { useUserTypeOptions } from "@/hooks/use-user-type-options";
import { useLogin, useForgotPassword } from "./hook";

import { notifyFailed, notifyWarning } from "@/lib/notify";
import { getErrorMessage } from "@/lib/error-message";

import { LoginForm } from "./components/login-form";
import { ForgotPasswordForm } from "./components/forgot-password-form";

type LoginFormState = {
  email: string;
  password: string;
  confirmPassword: string;
  captcha: string;
  userTypeId: string;
};

interface IUserOpt {
  type: "mixed" | "numeric" | "alpha";
  length: 5 | 4 | 6 | 7 | 8;
  sensitive: boolean;
  width: number;
  height: number;
  fontColor: string;
  background: string;
  borderColor: string;
  borderRadius?: number;
}

const userOpt: IUserOpt = {
  type: "mixed",
  length: 5,
  sensitive: true,
  width: 140,
  height: 48,
  fontColor: "#00A7E2",
  background: "#F6FCFE",
  borderColor: "#CDD6DA",
  borderRadius: 8,
};

const initialForm: LoginFormState = {
  email: "",
  password: "",
  confirmPassword: "",
  captcha: "",
  userTypeId: "",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const setUserTypeId = useAuthStore((s) => s.setUserTypeId);
  const setPermissionVersion = useAuthStore((s) => s.setPermissionVersion);
  const setPrivilegeFromLogin = usePrivilegeStore(
    (s) => s.setPrivilegeFromLogin,
  );

  const { mutate: handleLogin, isPending: loginPending } = useLogin();
  const { mutate: handleForgotPassword, isPending: forgotPasswordPending } =
    useForgotPassword();

  const loading = loginPending || forgotPasswordPending;

  const [form, setForm] = useState<LoginFormState>(initialForm);
  const [formType, setFormType] = useState<"login" | "forgot-password">(
    "login",
  );
  const captchaRef = useRef<HTMLDivElement | null>(null);
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: "",
    userTypeId: "",
  });
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function resetForm() {
    setFormErrors({});
    setForm(initialForm);
  }

  useEffect(() => {
    resetForm();
  }, []);

  useEffect(() => {
    if (formType === "forgot-password") return;
    setForgotPasswordSuccess(false);
  }, [formType]);

  const { gen, validate } = useCaptcha(
    captchaRef as RefObject<HTMLElement>,
    userOpt,
  ) as {
    gen: () => void;
    validate: (value: string) => boolean;
  };

  const {
    options: loginTypeOptions,
    loading: loginTypeLoading,
    search: loginTypeSearch,
    setSearch: setLoginTypeSearch,
    loadMore: loadMoreLoginTypes,
  } = useUserTypeOptions();

  useEffect(() => {
    if (formType === "forgot-password") {
      setLoginTypeSearch("");
    }
  }, [formType, setLoginTypeSearch]);

  useEffect(() => {
    if (!captchaRef.current) return;

    const initCaptcha = () => {
      const canvas = captchaRef.current?.querySelector("canvas");
      if (!canvas && gen) {
        gen();
      }
    };

    initCaptcha();

    const fallbackTimer = setTimeout(() => {
      if (!captchaRef.current?.querySelector("canvas")) {
        gen();
      }
    }, 50);

    return () => clearTimeout(fallbackTimer);
  }, [gen]);

  function onLogin() {
    const payload = {
      email: form.email,
      password: form.password,
      userTypeId: form.userTypeId,
    };

    handleLogin(payload, {
      onSuccess: (res) => {
        if (res.status === 110) {
          gen();
          notifyWarning({
            title: "Proses verifikasi akun sedang dilakukan",
            description: res.message,
          });
        } else {
          const { user_email, menus } = res.data;
          if (res.perm_version) {
            setPermissionVersion(res.perm_version);
          }
          setAuthenticated();
          setUser({
            id: res.data.id,
            name: res.data.user_email,
            email: res.data.user_email,
            userTypeId: res.data.user_type_user_type_id,
            userTypeName: res.data.user_type_name,
          });
          setUserTypeId(Number(res.data.user_type_user_type_id ?? 0));
          setPrivilegeFromLogin({ user_email, menus });
          navigate("/dashboard", { replace: true });
        }
      },
      onError: (error: any) => {
        gen();
        const apiErrors = error?.response?.data?.errors;
        if (apiErrors && typeof apiErrors === "object") {
          setFormErrors(apiErrors);
        } else {
          notifyFailed({
            title: "Gagal melakukan login",
            description: getErrorMessage(error, "Terjadi kesalahan saat login"),
          });
        }
      },
    });
  }

  function onForgotPassword(email: string, userTypeId: string) {
    handleForgotPassword(
      { email, userTypeId: userTypeId },
      {
        onSuccess: (response: any) => {
          if (response?.status === 0) {
            setForgotPasswordSuccess(true);
          } else {
            notifyFailed({
              title: "Gagal mengirim email lupa password",
              description:
                response?.message || "Terjadi kesalahan saat mengirim email",
            });
          }
        },
        onError: (error: any) => {
          const apiErrors = error?.response?.data?.errors;
          if (apiErrors && typeof apiErrors === "object") {
            setFormErrors(apiErrors);
          } else {
            notifyFailed({
              title: "Gagal mengirim email lupa password",
              description: getErrorMessage(
                error,
                "Terjadi kesalahan saat mengirim email",
              ),
            });
          }
        },
      },
    );
  }

  return (
    <div className="h-screen bg-muted/40 grid md:grid-cols-2 overflow-hidden">
      <div className="p-4 h-screen flex w-full">
        <div
          style={{
            background:
              "url(/illustrasi_login.svg), linear-gradient(163deg,rgba(246, 250, 254, 1) 0%, rgba(209, 230, 250, 1) 35%, rgba(163, 205, 245, 1) 100%)",
            backgroundRepeat: "no-repeat, no-repeat",
            backgroundPosition: "center, center",
            backgroundSize: "contain, cover",
          }}
          className="items-center justify-center py-28 px-20 rounded-xl hidden md:flex w-full"
        >
          <div className="flex flex-col flex-1 h-full gap-5">
            <img
              src="/lcs_logo.png"
              alt="lcs_logo"
              className="max-w-50 w-full h-auto"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-4">
        <div className="w-full h-screen flex items-center">
          {formType === "login" && (
            <div className="flex flex-col w-[90%] md:w-[70%] gap-5 text-black mx-auto">
              <LoginForm
                form={form}
                setForm={setForm}
                userTypeOptions={loginTypeOptions}
                userTypeLoading={loginTypeLoading}
                userTypeSearch={loginTypeSearch}
                setUserTypeSearch={setLoginTypeSearch}
                loadMoreUserTypes={loadMoreLoginTypes}
                loading={loading}
                captchaRef={captchaRef}
                onSubmit={onLogin}
                gen={gen}
                validate={validate}
                formType={formType}
                setFormType={setFormType}
                resetForm={resetForm}
                formErrors={formErrors}
              />
            </div>
          )}
          {formType === "forgot-password" && (
            <div className="flex flex-col w-[90%] md:w-[70%] gap-5 text-black mx-auto">
              <ForgotPasswordForm
                form={forgotPasswordForm}
                setForm={setForgotPasswordForm}
                loading={loading}
                isSuccess={forgotPasswordSuccess}
                onSubmit={onForgotPassword}
                setFormType={setFormType}
                userTypeOptions={loginTypeOptions}
                userTypeLoading={loginTypeLoading}
                userTypeSearch={loginTypeSearch}
                setUserTypeSearch={setLoginTypeSearch}
                loadMoreUserTypes={loadMoreLoginTypes}
                formErrors={formErrors}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
