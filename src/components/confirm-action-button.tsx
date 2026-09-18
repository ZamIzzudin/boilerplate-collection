import { ReactElement, ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

import {
  SealCheckIcon,
  SealQuestionIcon,
  SealWarningIcon,
  XCircleIcon,
  XIcon,
} from "@phosphor-icons/react";

type ConfirmTone = "success" | "warning" | "failed" | "info";

type Props = {
  triggerLabel?: string | ReactNode;
  triggerRender?: ReactElement;
  confirmLabel: string;
  loadingLabel: string;
  title: string;
  description: string;
  onConfirm: (reason?: string) => Promise<void>;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "plain"
    | "ghost"
    | "destructive"
    | "link"
    | "primary"
    | "warning"
    | "warning-outline"
    | "muted-outline";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  tone?: ConfirmTone;
  cancelLabel?: string;
  content?: ReactNode;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonRequired?: boolean;
  confirmDisabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const toneMap: Record<
  ConfirmTone,
  { icon: typeof SealCheckIcon; color: string; ring: string }
> = {
  success: {
    icon: SealCheckIcon,
    color: "text-emerald-500",
    ring: "border-emerald-500",
  },
  warning: {
    icon: SealWarningIcon,
    color: "text-amber-500",
    ring: "border-amber-500",
  },
  failed: { icon: XCircleIcon, color: "text-red-500", ring: "border-red-500" },
  info: {
    icon: SealQuestionIcon,
    color: "text-amber-500",
    ring: "border-amber-500",
  },
};

export function ConfirmActionButton({
  triggerLabel,
  triggerRender,
  confirmLabel,
  loadingLabel,
  title,
  description,
  onConfirm,
  variant = "default",
  size = "sm",
  disabled = false,
  tone = "success",
  cancelLabel = "Batal",
  content,
  reasonLabel,
  reasonPlaceholder,
  reasonRequired = false,
  confirmDisabled = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: Readonly<Props>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const toneStyle = toneMap[tone];
  const Icon = toneStyle.icon;

  const hasReason = Boolean(reasonLabel);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(hasReason ? reason : undefined);
      setOpen(false);
      setReason("");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setReason("");
    }
    setOpen(value);
  };

  const isControlled = controlledOpen !== undefined;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <AlertDialogTrigger
          className="flex-1"
          render={
            triggerRender ?? (
              <Button size={size} variant={variant} disabled={disabled}>
                {triggerLabel}
              </Button>
            )
          }
        />
      )}
      <AlertDialogContent className="max-w-sm p-6 rounded-md">
        <AlertDialogCancel
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3"
          aria-label="Tutup"
          disabled={loading}
        >
          <XIcon className="size-4" />
        </AlertDialogCancel>
        <AlertDialogHeader className="items-center justify-center">
          <div className="flex items-center justify-center w-full">
            <Icon className={cn("size-16", toneStyle.color)} weight="duotone" />
          </div>

          <AlertDialogTitle className="w-full text-lg text-center">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="w-full text-sm text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {hasReason ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {reasonLabel}
              {reasonRequired && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-20 resize-none"
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            />
          </div>
        ) : null}
        {content}
        <AlertDialogFooter className="grid grid-cols-2 gap-3 bg-transparent border-0">
          <AlertDialogCancel
            disabled={loading}
            variant="outline"
            className="w-full py-5"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={
              loading || confirmDisabled || (reasonRequired && !reason.trim())
            }
            variant="primary"
            className="w-full py-5"
          >
            {loading ? loadingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
