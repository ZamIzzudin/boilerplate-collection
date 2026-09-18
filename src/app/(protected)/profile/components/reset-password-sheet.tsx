import { useState } from "react";
import type { ChangeEvent } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { Sheet } from "@/components/ui/sheet";
import { AppSheet } from "@/components/ui/app-sheet";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { verifyPasswordSchema, resetPasswordSchema } from "../schemas";
import { createBlurHandler } from "@/lib/validation";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  visible: boolean;
  error?: React.ReactNode;
  onValueChange: (value: string) => void;
  onToggleVisible: () => void;
  onBlur?: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
};

function PasswordField({
  id,
  label,
  value,
  placeholder,
  visible,
  error,
  onValueChange,
  onToggleVisible,
  onBlur,
}: Readonly<PasswordFieldProps>) {
  return (
    <FormField
      id={id}
      label={label}
      type={visible ? "text" : "password"}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      required
      error={error}
      addonEnd={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          className="size-7 text-brand-muted"
          onClick={onToggleVisible}
        >
          {visible ? (
            <EyeSlashIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </Button>
      }
    />
  );
}

export type ResetPasswordSheetProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  step: 1 | 2;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  isSubmitting: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleShowCurrentPassword: () => void;
  onToggleShowNewPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  onNext: (event: ChangeEvent<HTMLFormElement>) => void;
  onSubmit: (event: ChangeEvent<HTMLFormElement>) => void;
};

export default function ResetPasswordSheet({
  isOpen,
  setIsOpen,
  step,
  currentPassword,
  newPassword,
  confirmPassword,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  isSubmitting,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleShowCurrentPassword,
  onToggleShowNewPassword,
  onToggleShowConfirmPassword,
  onNext,
  onSubmit,
}: Readonly<ResetPasswordSheetProps>) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const schema = step === 1 ? verifyPasswordSchema : resetPasswordSchema;
  const handleBlur = createBlurHandler(schema, setFieldErrors);

  const handleConfirmPasswordBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    handleBlur("confirmPassword", e.target.value);
    const result = resetPasswordSchema.safeParse({
      newPassword,
      confirmPassword: e.target.value,
    });
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (issue) => issue.path[0] === "confirmPassword",
      );
      if (confirmError) {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: confirmError.message,
        }));
      }
    }
  };

  const handleVerifySubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const result = verifyPasswordSchema.safeParse({ currentPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const err of result.error.issues) {
        const key = String(err.path[0]);
        errors[key] = err.message;
      }
      setFieldErrors(errors);
      return;
    }

    onNext(e);
  };

  const handleResetSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const result = resetPasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const err of result.error.issues) {
        const key = String(err.path[0]);
        errors[key] = err.message;
      }
      setFieldErrors(errors);
      return;
    }

    onSubmit(e);
  };

  const title =
    step === 1
      ? "Ubah Kata Sandi Akun NUTECH BOILERPLATE"
      : "Pengaturan ulang kata sandi";
  const description =
    step === 1
      ? "Masukkan kata sandi akun Anda terlebih dahulu"
      : "Atur ulang kata sandi untuk akun Anda, pastikan kata sandi aman dan mudah diingat";

  let actionLabel = "Simpan";
  if (step === 1) {
    actionLabel = isSubmitting ? "Memverifikasi..." : "Selanjutnya";
  } else if (isSubmitting) {
    actionLabel = "Menyimpan...";
  }

  const actionForm =
    step === 1 ? "verify-password-form" : "reset-password-form";

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  const actionDisabled =
    step === 1
      ? isSubmitting || !currentPassword || hasFieldErrors
      : isSubmitting || !newPassword || !confirmPassword || hasFieldErrors;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <AppSheet
        header="Atur Ulang Kata Sandi"
        title={title}
        description={description}
        size="md"
        showCloseButton={false}
        actionLabel={actionLabel}
        actionType="submit"
        confirmBeforeAction={step === 2}
        confirmTitle="Simpan kata sandi ini untuk akun Anda?"
        confirmDescription="Setelah ini, silakan lakukan proses log in untuk dapat mengakses kembali akun Anda"
        actionForm={actionForm}
        actionDisabled={actionDisabled}
      >
        {step === 1 ? (
          <form
            id="verify-password-form"
            className="space-y-3"
            onSubmit={handleVerifySubmit}
          >
            <PasswordField
              id="current-password"
              label="Kata Sandi"
              value={currentPassword}
              placeholder="Masukkan kata sandi"
              visible={showCurrentPassword}
              error={fieldErrors.currentPassword}
              onBlur={(e) => handleBlur("currentPassword", e.target.value)}
              onValueChange={onCurrentPasswordChange}
              onToggleVisible={onToggleShowCurrentPassword}
            />
          </form>
        ) : (
          <form
            id="reset-password-form"
            className="space-y-3"
            onSubmit={handleResetSubmit}
          >
            <PasswordField
              id="new-password"
              label="Kata Sandi Baru"
              value={newPassword}
              placeholder="Masukkan kata sandi baru"
              visible={showNewPassword}
              error={fieldErrors.newPassword}
              onBlur={(e) => handleBlur("newPassword", e.target.value)}
              onValueChange={onNewPasswordChange}
              onToggleVisible={onToggleShowNewPassword}
            />
            <PasswordField
              id="confirm-password"
              label="Ulangi Kata Sandi Baru"
              value={confirmPassword}
              placeholder="Ulangi kata sandi baru"
              visible={showConfirmPassword}
              error={fieldErrors.confirmPassword}
              onBlur={handleConfirmPasswordBlur}
              onValueChange={onConfirmPasswordChange}
              onToggleVisible={onToggleShowConfirmPassword}
            />
          </form>
        )}
      </AppSheet>
    </Sheet>
  );
}
