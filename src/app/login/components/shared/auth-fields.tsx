import { Dispatch, SetStateAction, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

interface AuthFieldsProps {
  form: {
    email: string;
    password: string;
  };
  setForm: Dispatch<
    SetStateAction<{
      email: string;
      password: string;
      confirmPassword: string;
      captcha: string;
    }>
  >;
  fieldErrors: Record<string, string>;
  showPasswordField?: boolean;
  minLength?: number;
  handleFieldChange: (field: any, value: any) => void;
  handleBlur: (field: any, value: unknown) => void;
}

export function AuthFields({
  form,
  setForm,
  fieldErrors,
  showPasswordField = false,
  minLength,
  handleFieldChange,
  handleBlur,
}: Readonly<AuthFieldsProps>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <FormField
        id="email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => handleFieldChange("email", e.target.value)}
        onBlur={() => handleBlur("email", form.email)}
        required
        placeholder="Masukkan email"
        error={fieldErrors.email}
      />

      {showPasswordField && (
        <FormField
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) => handleFieldChange("password", e.target.value)}
          onBlur={() => handleBlur("password", form.password)}
          required
          placeholder="Masukkan kata sandi"
          minLength={minLength}
          error={fieldErrors.password}
          addonEnd={
            <Button
              type="button"
              variant="ghost"
              size="icon"
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
      )}
    </>
  );
}
