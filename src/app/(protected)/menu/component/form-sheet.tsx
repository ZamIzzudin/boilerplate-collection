import { Dispatch, SetStateAction, SubmitEvent } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { AppSheet } from "@/components/ui/app-sheet";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { PlusIcon } from "@phosphor-icons/react";
import type { Access } from "@/types";

export type MenuForm = {
  menu_code: string;
  menu_name: string;
  parent_code: string;
  icon: string;
  slug: string;
  order: string;
  actions: string[];
  is_group: boolean;
};

type Props = {
  id: string | null;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  reset: () => void;
  isSubmitting: boolean;
  canSubmit: boolean;
  access: Access;
  form: MenuForm;
  setForm: Dispatch<SetStateAction<MenuForm>>;
  onSubmit: (e: SubmitEvent) => Promise<void>;
  parentOptions: { label: string; value: string }[];
  actionOptions: { label: string; value: string }[];
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
  parentOptions,
  actionOptions,
}: Readonly<Props>) {
  if (!access.canAdd && !access.canEdit) return null;

  const isEditMode = Boolean(id);
  const title = isEditMode ? "Edit Menu" : "Tambah Menu";
  const description = isEditMode
    ? "Perbarui informasi menu di bawah jika diperlukan"
    : "Lengkapi informasi menu di bawah ini";
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
          Tambah Menu
        </SheetTrigger>
      ) : null}
      <AppSheet
        title={title}
        description={description}
        size="md"
        closeLabel="Batalkan"
        actionLabel={actionLabel}
        actionType="submit"
        actionForm="menu-form"
        actionDisabled={isSubmitting || !canSubmit}
      >
        <form id="menu-form" className="space-y-3" onSubmit={onSubmit}>
          <FormField
            id="menu-name"
            label="Nama"
            value={form.menu_name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, menu_name: e.target.value }))
            }
            required
          />
          {!form?.is_group && (
            <FormField
              id="menu-parent"
              label="Parent Module (1 level)"
              type="select"
              value={form.parent_code}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, parent_code: e.target.value }))
              }
              placeholder="- Tidak ada -"
              options={parentOptions}
            />
          )}
          {actionOptions && actionOptions.length > 0 ? (
            <FormField
              id="menu-actions"
              label="Aksi"
              type="multi-select"
              options={actionOptions}
              multipleValue={form.actions}
              onMultipleChange={(value) =>
                setForm((prev) => ({ ...prev, actions: value }))
              }
              placeholder="Pilih aksi"
            />
          ) : null}

          <FormField
            id="menu-icon"
            label="Icon"
            type="icon"
            value={form.icon}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, icon: e.target.value }))
            }
            placeholder="Pilih icon"
            required
          />

          <FormField
            id="menu-slug"
            label="Slug"
            value={form.slug}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, slug: e.target.value }))
            }
            placeholder="/menu"
            required
          />
          <FormField
            id="menu-order"
            label="Order"
            type="number"
            value={form.order}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, order: e.target.value }))
            }
            required
          />
          <FormField
            id="menu-group"
            label="Is Group"
            type="checkbox"
            checked={form.is_group}
            onChange={(e: any) =>
              setForm((prev) => ({
                ...prev,
                is_group: e.target.checked,
                ...(e.target.checked ? { parent_code: "" } : {}),
              }))
            }
          />
        </form>
      </AppSheet>
    </Sheet>
  );
}
