import { SubmitEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { loginSchema } from "../schemas";
import { AuthFields } from "./shared/auth-fields";
import { createBlurHandler, createChangeHandler } from "@/lib/validation";

export type AuthFormType = "login" | "forgot-password";

interface LoginFormProps {
  form: {
    email: string;
    password: string;
    captcha: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      email: string;
      password: string;
      confirmPassword: string;
      captcha: string;
    }>
  >;
  loading: boolean;
  captchaRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (e: SubmitEvent<HTMLFormElement>) => void;
  gen: () => void;
  validate: (value: string) => boolean;
  formType: AuthFormType;
  setFormType: React.Dispatch<React.SetStateAction<AuthFormType>>;
  resetForm: () => void;
  formErrors?: Record<string, string>;
}

export function LoginForm({
  form,
  setForm,
  loading,
  captchaRef,
  onSubmit,
  gen,
  validate,
  formType,
  setFormType,
  resetForm,
  formErrors = {},
}: Readonly<LoginFormProps>) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mergedErrors = { ...formErrors, ...fieldErrors };

  const handleFieldChange = createChangeHandler(setForm, setFieldErrors);

  const handleBlur = createBlurHandler(loginSchema, setFieldErrors);

  const handleRefresh = () => {
    if (captchaRef.current && gen) {
      try {
        gen();
        setTimeout(() => {
          if (
            captchaRef.current &&
            !captchaRef.current.querySelector("canvas")
          ) {
            gen();
          }
        }, 100);
      } catch (error) {
        console.error("Captcha refresh error:", error);
      }
    }
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const err of result.error.issues) {
        const key = String(err.path[0]);
        errors[key] = err.message;
      }
      setFieldErrors(errors);
      return;
    }

    // CAPTCHA: enable kembali dengan uncomment blok di bawah
    // if (!validate(form.captcha)) {
    //   setFieldErrors({ captcha: "Captcha tidak sesuai" });
    //   gen();
    //   setForm((prev) => ({
    //     ...prev,
    //     captcha: "",
    //   }));
    //   return;
    // }

    onSubmit(e);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Masuk</h2>
        <p className="text-sm leading-5">
          Masukkan email dan kata sandi untuk mengakses akun Anda
        </p>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <AuthFields
          form={form}
          setForm={setForm}
          fieldErrors={mergedErrors}
          setFormType={setFormType}
          resetForm={resetForm}
          showPasswordField
          showForgotPasswordButton
          handleFieldChange={handleFieldChange}
          handleBlur={handleBlur}
        />

        <div className="flex justify-between mt-8">
          <Button
            type="submit"
            className="w-full p-5"
            disabled={loading}
            variant="primary"
          >
            {loading ? "Loading..." : "Log In"}
          </Button>
        </div>
      </form>
    </>
  );
}
