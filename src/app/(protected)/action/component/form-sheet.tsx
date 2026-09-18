import { Dispatch, SetStateAction, SubmitEvent } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { AppSheet } from "@/components/ui/app-sheet";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { PlusIcon } from "@phosphor-icons/react";
import type { Access } from "@/types";

export type ActionForm = {
  action_code: string;
  action_name: string;
};

type Props = {
  id: string | null;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  reset: () => void;
  isSubmitting: boolean;
  canSubmit: boolean;
  access: Access;
  form: ActionForm;
  setForm: Dispatch<SetStateAction<ActionForm>>;
  onSubmit: (e: SubmitEvent) => Promise<void>;
};

export default function FormSheet({
  id,
  isOpen,
  setIsOpen,
  reset,
  isSubmitting,
  canSubmit,
  access,
  form,
  setForm,
  onSubmit,
}: Readonly<Props>) {
  if (!access.canAdd && !access.canEdit) return null;

  const isEditMode = Boolean(id);
  const title = isEditMode ? "Edit Action" : "Tambah Action";
  const description = isEditMode
    ? "Perbarui informasi action di bawah jika diperlukan"
    : "Lengkapi informasi action di bawah ini";
  let actionLabel = "Simpan";
  if (isSubmitting) {
    actionLabel = "Menyimpan...";
  } else if (isEditMode) {
    actionLabel = "Perbarui";
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        if (!value) reset();
      }}
    >
      {access.canAdd ? (
        <SheetTrigger
          render={<Button variant="primary" className="py-5 px-4" />}
          onClick={() => reset()}
        >
          <PlusIcon />
          Tambah Action
        </SheetTrigger>
      ) : null}
      <AppSheet
        title={title}
        description={description}
        size="md"
        closeLabel="Batalkan"
        actionLabel={actionLabel}
        actionType="submit"
        actionForm="action-form"
        actionDisabled={isSubmitting || !canSubmit}
      >
        <form id="action-form" className="space-y-3" onSubmit={onSubmit}>
          <FormField
            id="action-name"
            label="Nama"
            value={form.action_name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, action_name: e.target.value }))
            }
            required
          />
        </form>
      </AppSheet>
    </Sheet>
  );
}
