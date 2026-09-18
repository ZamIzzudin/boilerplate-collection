import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { XIcon } from "@phosphor-icons/react";
import { ActionItem } from "../handler";
import type { DetailAccess } from "@/types";

type Props = {
  selected: ActionItem | null;
  access: DetailAccess;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  handleDelete: () => Promise<void>;
  handleEdit: () => void;
};

export default function DetailSheet({
  selected,
  access,
  isOpen,
  setIsOpen,
  handleDelete,
  handleEdit,
}: Readonly<Props>) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 min-w-lg"
      >
        <SheetHeader className="border-b p-4">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-sm">Detail Action</SheetTitle>
            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close sheet"
                />
              }
            >
              <XIcon className="size-4" />
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="space-y-0.5 p-4">
          <SheetTitle className="text-2xl mb-2">
            {selected?.action_name ?? "-"}
          </SheetTitle>
          <SheetDescription>{selected?.action_code}</SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="flex flex-col">
            <span className="text-gray-500">Kode</span>
            <span className="text-md font-semibold">
              {selected?.action_code}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Status</span>
            <span className="text-md font-semibold">
              {selected?.status_code}
            </span>
          </div>
        </div>

        <SheetFooter className="p-4 sm:flex-row sm:justify-end">
          {access.canDelete && selected ? (
            <ConfirmActionButton
              triggerRender={
                <Button
                  className="py-5 px-8"
                  variant="warning-outline"
                  type="button"
                >
                  Delete
                </Button>
              }
              confirmLabel="Ya, hapus"
              loadingLabel="Menghapus..."
              title={`Hapus data action '${selected.action_name}'?`}
              description="Data yang dihapus tidak dapat dikembalikan."
              tone="warning"
              onConfirm={handleDelete}
            />
          ) : null}

          {access.canEdit ? (
            <Button
              className="py-5 px-8"
              variant="primary"
              type="button"
              onClick={handleEdit}
            >
              Edit
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
