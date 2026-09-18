import { SubmitEvent, useState } from "react";
import { ArrowLeftIcon, EnvelopeOpenIcon } from "@phosphor-icons/react";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { forgotPasswordSchema } from "../schemas";
import { maskEmail } from "@/lib/utils";
import { createBlurHandler, createChangeHandler } from "@/lib/validation";

interface ForgotPasswordFormProps {
  form: {
    email: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      email: string;
    }>
  >;
  loading: boolean;
  isSuccess: boolean;
  onSubmit: (email: string) => void;
  setFormType: React.Dispatch<React.SetStateAction<"login" | "forgot-password">>;
  formErrors?: Record<string, string>;
}

export function ForgotPasswordForm({
  form,
  setForm,
  loading,
  isSuccess,
  onSubmit,
  setFormType,
  formErrors = {},
}: Readonly<ForgotPasswordFormProps>) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedEmail, setSubmittedEmail] = useState("");

  const mergedErrors = { ...formErrors, ...fieldErrors };

  const handleFieldChange = createChangeHandler(setForm, setFieldErrors);

  const handleBlur = createBlurHandler(forgotPasswordSchema, setFieldErrors);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const result = forgotPasswordSchema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const err of result.error.issues) {
        const key = String(err.path[0]);
        errors[key] = err.message;
      }
      setFieldErrors(errors);
      return;
    }

    setSubmittedEmail(form.email);
    onSubmit(form.email);
  };

  const handleBackToLogin = () => {
    setForm((prev) => ({
      ...prev,
      email: "",
    }));
    setFieldErrors({});
    setSubmittedEmail("");
    setFormType("login");
  };

  if (isSuccess) {
    return (
      <>
        <div className="flex">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="flex items-center gap-2 font-semibold text-sm text-primary underline cursor-pointer"
          >
            <ArrowLeftIcon />
            Ke Laman Login
          </button>
        </div>
        <div className="space-y-4 flex flex-col items-center text-center">
          <EnvelopeOpenIcon
            size={60}
            className="text-secondary"
            weight="duotone"
          />
          <div>
            <h2 className="text-2xl font-semibold">
              Kami sudah mengirim Email ke {maskEmail(submittedEmail)}!
            </h2>
            <p className="text-sm leading-5">
              Akses tautan dalam Email untuk mengatur kembali kata sandi akun
              NUTECH BOILERPLATE Anda
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex">
        <button
          type="button"
          onClick={handleBackToLogin}
          className="flex items-center gap-2 font-semibold text-primary text-sm cursor-pointer underline"
        >
          <ArrowLeftIcon />
          Ke Laman Login
        </button>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Atur Ulang Kata Sandi</h2>
        <p className="text-sm leading-5">
          Kami akan mengirimkan tautan pengaturan kata sandi melalui Email Anda
          yang terdaftar sebagai akun NUTECH BOILERPLATE
        </p>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <FormField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          onBlur={() => handleBlur("email", form.email)}
          required
          placeholder="Masukkan email"
          error={mergedErrors.email}
        />

        <div className="flex justify-between mt-8">
          <Button
            type="submit"
            className="w-full p-5"
            disabled={loading}
            variant="primary"
          >
            {loading ? "Loading..." : "Kirim Tautan"}
          </Button>
        </div>
      </form>
    </>
  );
}
