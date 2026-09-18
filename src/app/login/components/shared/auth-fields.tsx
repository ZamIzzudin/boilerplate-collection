import { Dispatch, SetStateAction, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

interface AuthFieldsProps {
  form: {
    email: string;
    password: string;
    userTypeId: string;
  };
  setForm: Dispatch<
    SetStateAction<{
      email: string;
      password: string;
      confirmPassword: string;
      captcha: string;
      userTypeId: string;
    }>
  >;
  userTypeOptions?: { label: string; value: string }[];
  userTypeLoading?: boolean;
  userTypeSearch?: string;
  setUserTypeSearch?: (value: string) => void;
  loadMoreUserTypes?: () => void;
  fieldErrors: Record<string, string>;
  setFormType?: Dispatch<SetStateAction<"forgot-password" | "login">>;
  resetForm?: () => void;
  showPasswordField?: boolean;
  showForgotPasswordButton?: boolean;
  minLength?: number;
  handleFieldChange: (field: any, value: any) => void;
  handleBlur: (field: any, value: unknown) => void;
}

export function AuthFields({
  form,
  setForm,
  userTypeOptions,
  userTypeLoading,
  userTypeSearch,
  setUserTypeSearch,
  loadMoreUserTypes,
  fieldErrors,
  setFormType,
  resetForm,
  showPasswordField = false,
  showForgotPasswordButton = false,
  minLength,
  handleFieldChange,
  handleBlur,
}: Readonly<AuthFieldsProps>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <FormField
        id="userTypeId"
        label="Jenis User"
        type="select"
        value={form.userTypeId}
        onChange={(e) => handleFieldChange("userTypeId", e.target.value)}
        options={userTypeOptions ?? []}
        placeholder="Pilih jenis user"
        searchable={Boolean(userTypeOptions)}
        selectLoading={userTypeLoading}
        selectLoadingLabel="Memuat jenis user..."
        onSearchChange={setUserTypeSearch}
        onScrollToBottom={loadMoreUserTypes}
        required
        error={fieldErrors.userTypeId}
      />

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
        <div
          className={showForgotPasswordButton ? "space-y-2 mb-4" : undefined}
        >
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
          {showForgotPasswordButton && setFormType && (
            <div className="space-x-1">
              <span className="text-sm">Lupa kata sandi?</span>
              <button
                className="font-semibold text-sm text-primary underline cursor-pointer"
                onClick={() => {
                  setFormType("forgot-password");
                  resetForm?.();
                }}
                type="button"
              >
                Atur ulang disini
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
