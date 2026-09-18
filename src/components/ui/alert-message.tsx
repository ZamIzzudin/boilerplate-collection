import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

import {
  SealCheckIcon,
  SealQuestionIcon,
  SealWarningIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

type AlertTone = "success" | "warning" | "failed" | "info";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  tone?: AlertTone;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};

const toneMap: Record<
  AlertTone,
  { icon: typeof SealCheckIcon; color: string }
> = {
  success: {
    icon: SealCheckIcon,
    color: "text-emerald-500",
  },
  warning: {
    icon: SealWarningIcon,
    color: "text-amber-500",
  },
  failed: {
    icon: XCircleIcon,
    color: "text-red-500",
  },
  info: {
    icon: SealQuestionIcon,
    color: "text-amber-500",
  },
};

export function AlertMessage({
  open,
  onOpenChange,
  title,
  description,
  tone = "info",
  confirmLabel = "OK",
  cancelLabel,
  onConfirm,
}: Readonly<Props>) {
  const toneStyle = toneMap[tone];
  const Icon = toneStyle.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm rounded-md p-6 flex flex-col gap-6">
        <AlertDialogHeader className="items-center justify-center">
          <div className="w-full flex items-center justify-center">
            <Icon className={cn("size-16", toneStyle.color)} weight="duotone" />
          </div>

          <AlertDialogTitle className="w-full text-lg text-center">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm w-full text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogAction
          onClick={onConfirm}
          className={cn("w-full py-5", !cancelLabel && "col-span-2")}
        >
          {confirmLabel}
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
