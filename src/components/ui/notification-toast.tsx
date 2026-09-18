import {
  CheckCircleIcon,
  WarningCircleIcon,
  XIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type NotificationType = "success" | "warning" | "failed";

type NotificationToastProps = {
  id: string | number;
  type: NotificationType;
  title: string;
  description: string;
};

const toneStyles: Record<NotificationType, { icon: string; border: string }> = {
  success: {
    icon: "text-emerald-500",
    border: "border-b-3 border-b-emerald-500",
  },
  warning: { icon: "text-amber-500", border: "border-b-3 border-b-amber-500" },
  failed: { icon: "text-red-500", border: "border-b-3 border-b-red-500" },
};

const icons: Record<NotificationType, ReactNode> = {
  success: <CheckCircleIcon weight="fill" className="size-5" />,
  warning: <WarningCircleIcon weight="fill" className="size-5" />,
  failed: <XCircleIcon weight="fill" className="size-5" />,
};

export function NotificationToast({
  id,
  type,
  title,
  description,
}: Readonly<NotificationToastProps>) {
  return (
    <div
      className={cn(
        "w-105 rounded-md border border-input bg-white p-4 shadow-md",
        toneStyles[type].border,
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn("shrink-0", toneStyles[type].icon)}>
          {icons[type]}
        </span>
        <div className="flex-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-gray-500 whitespace-pre-line">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.dismiss(id)}
          className="cursor-pointer text-gray-400 hover:text-foreground"
        >
          <XIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
