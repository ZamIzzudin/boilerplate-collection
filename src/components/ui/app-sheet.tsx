import { XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import React from "react";

type SheetSize = "sm" | "md" | "lg" | "xl" | "full";

const sizeClassMap: Record<SheetSize, string> = {
  sm: "w-full sm:min-w-md",
  md: "w-full sm:min-w-lg",
  lg: "w-full sm:min-w-2xl",
  xl: "w-full sm:min-w-4xl",
  full: "w-full min-w-full",
};

type AppSheetProps = {
  title: React.ReactNode;
  header?: string | React.ReactNode;
  description?: string | React.ReactNode;
  size?: SheetSize;
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  closeLabel?: string;
  cancelLabel?: string;
  actionLabel?: string;
  onCancelClick?: () => void;
  onActionClick?: () => void;
  actionType?: "button" | "submit" | "reset";
  actionForm?: string;
  actionDisabled?: boolean;
  actionVariant?:
    | "default"
    | "primary"
    | "secondary"
    | "outline"
    | "warning"
    | "destructive"
    | "ghost"
    | "link";
  confirmBeforeAction?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
  confirmActionLabel?: string;
  showFooter?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  extraFooterContent?: React.ReactNode;
};

export function AppSheet({
  title,
  header = title,
  description,
  size = "md",
  side = "right",
  showCloseButton = true,
  closeLabel = "Batalkan",
  cancelLabel = "Kembali",
  actionLabel = "Action",
  onCancelClick,
  onActionClick,
  actionType = "button",
  actionForm,
  actionDisabled = false,
  actionVariant = "primary",
  confirmBeforeAction,
  confirmTitle,
  confirmDescription,
  confirmActionLabel = "Ya, lanjutkan",
  showFooter = true,
  footer,
  children,
  className,
  extraFooterContent,
}: Readonly<AppSheetProps>) {
  const shouldConfirm = confirmBeforeAction ?? actionType === "submit";

  const runAction = () => {
    if (onActionClick) {
      onActionClick();
      return;
    }

    if (!actionForm) return;

    const form = document.getElementById(actionForm) as HTMLFormElement | null;
    if (!form) return;

    if (actionType === "submit") {
      form.requestSubmit();
      return;
    }

    if (actionType === "reset") {
      form.reset();
    }
  };

  const defaultConfirmTitle = `Konfirmasi ${actionLabel.toLowerCase()}`;
  const defaultConfirmDescription = `Apakah Anda yakin ingin ${actionLabel.toLowerCase()} data ini?`;

  const renderCancelButton = () => {
    if (cancelLabel && onCancelClick) {
      return (
        <Button
          className="w-full py-5"
          variant="warning-outline"
          onClick={onCancelClick}
        >
          {cancelLabel}
        </Button>
      );
    }
    return (
      <SheetClose
        render={<Button className="w-full py-5" variant="warning-outline" />}
      >
        {closeLabel}
      </SheetClose>
    );
  };

  const renderActionButton = () => {
    if (shouldConfirm) {
      return (
        <ConfirmActionButton
          triggerRender={
            <Button
              className="w-full py-5"
              variant={actionVariant}
              type="button"
              disabled={actionDisabled}
            >
              {actionLabel}
            </Button>
          }
          confirmLabel={confirmActionLabel}
          loadingLabel="Memproses..."
          title={confirmTitle ?? defaultConfirmTitle}
          description={confirmDescription ?? defaultConfirmDescription}
          tone="info"
          onConfirm={async () => {
            runAction();
          }}
        />
      );
    }
    return (
      <Button
        className="flex-1 w-full py-5"
        variant={actionVariant}
        type={actionType}
        form={actionForm}
        onClick={onActionClick}
        disabled={actionDisabled}
      >
        {actionLabel}
      </Button>
    );
  };

  return (
    <SheetContent
      side={side}
      showCloseButton={false}
      className={cn("p-0", sizeClassMap[size], className)}
    >
      <SheetHeader className="p-4 border-b">
        <div className="flex items-center justify-between gap-3">
          {typeof header === "string" ? (
            <SheetTitle className="text-sm">{header}</SheetTitle>
          ) : (
            header
          )}

          <SheetClose
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Close sheet" />
            }
          >
            <XIcon className="size-4" />
          </SheetClose>
        </div>
      </SheetHeader>
      <div className="space-y-0.5 px-4 pb-4 border-b">
        <SheetTitle className="mb-2 text-2xl">{title}</SheetTitle>
        {description ? (
          <SheetDescription>{description}</SheetDescription>
        ) : null}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">{children}</div>

      {extraFooterContent}

      {showFooter && (
        <SheetFooter
          className={`grid p-4 ${showCloseButton && "sm:grid-cols-2"}`}
        >
          {footer ?? (
            <>
              {showCloseButton && renderCancelButton()}
              {renderActionButton()}
            </>
          )}
        </SheetFooter>
      )}
    </SheetContent>
  );
}
