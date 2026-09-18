import { useMemo } from "react";
import {
  CheckCircleIcon,
  PencilSimpleLineIcon,
  TrashIcon,
  PowerIcon,
  FileIcon,
  DownloadSimpleIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { cn } from "@/lib/utils";

type Item = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  destructive?: boolean;
  confirmMessage?: string;
  confirmTitle?: string;
  icon?: React.ComponentType<any>;
  className?: string;
};

type Props = {
  items: Item[];
};

type ActionKeyword = {
  isApprove: boolean;
  isEdit: boolean;
  isLengkapi: boolean;
  isAktifkan: boolean;
  isNonaktifkan: boolean;
  isDownload: boolean;
};

function detectKeywords(label: string): ActionKeyword {
  const lower = label.toLowerCase();
  return {
    isApprove: lower.includes("approve"),
    isEdit: lower.includes("edit"),
    isLengkapi: lower.includes("lengkapi"),
    isAktifkan: lower.includes("aktifkan") && !lower.includes("nonaktifkan"),
    isNonaktifkan: lower.includes("nonaktifkan"),
    isDownload: lower.includes("download"),
  };
}

function resolveDefaultIcon(kw: ActionKeyword) {
  if (kw.isApprove) return CheckCircleIcon;
  if (kw.isEdit) return PencilSimpleLineIcon;
  if (kw.isLengkapi) return FileIcon;
  if (kw.isAktifkan || kw.isNonaktifkan) return PowerIcon;
  if (kw.isDownload) return DownloadSimpleIcon;
  return TrashIcon;
}

function resolveDefaultClassName(kw: ActionKeyword): string {
  if (kw.isApprove || kw.isAktifkan)
    return "bg-success-container text-on-success-container hover:bg-[#c8edce]";
  if (kw.isEdit || kw.isLengkapi || kw.isDownload)
    return "bg-primary-container text-on-primary-container hover:bg-[#c9e1fb]";
  if (kw.isNonaktifkan)
    return "bg-warning-container text-on-warning-container hover:bg-[#ffd9bc]";
  return "bg-error-container text-on-error-container hover:bg-[#fed7d7]";
}

function resolveConfirmTitle(item: Item): string {
  if (item.confirmTitle) return item.confirmTitle;
  return item.destructive ? "Warning" : "Konfirmasi tindakan";
}

export function TableRowActionMenu({ items }: Readonly<Props>) {
  const normalizedItems = useMemo(
    () =>
      items.map((item) => {
        const kw = detectKeywords(item.label);
        return {
          ...item,
          icon: item.icon ?? resolveDefaultIcon(kw),
          className: item.className ?? resolveDefaultClassName(kw),
        };
      }),
    [items],
  );

  if (items.length === 0) {
    return <span className="text-sm text-gray-400"></span>;
  }

  return (
    <div className="inline-flex items-center gap-2">
      {normalizedItems.map((item) => (
        <ActionButtonItem key={item.label} item={item} />
      ))}
    </div>
  );
}

function ActionButtonItem({
  item,
}: Readonly<{
  item: Item & { icon: React.ComponentType<any>; className: string };
}>) {
  const Icon = item.loading ? SpinnerGapIcon : item.icon;
  const isIconOnly = !item.label.toLowerCase().includes("lengkapi");
  const buttonSize = isIconOnly ? "icon-lg" : "default";
  const buttonClassName = cn(
    item.className,
    !isIconOnly && "h-9 px-3 gap-1.5 text-xs font-semibold",
  );

  if (item.confirmMessage) {
    return (
      <ConfirmActionButton
        triggerRender={
          <Button
            type="button"
            size={buttonSize}
            className={buttonClassName}
            disabled={item.disabled || item.loading}
            aria-label={item.label}
            title={item.label}
          >
            <Icon className={cn("size-3.5", item.loading && "animate-spin")} />
            {!isIconOnly && <span>{item.label}</span>}
          </Button>
        }
        confirmLabel="Ya, lanjutkan"
        loadingLabel="Memproses..."
        title={resolveConfirmTitle(item)}
        description={item.confirmMessage}
        tone={item.destructive ? "warning" : "info"}
        onConfirm={async () => {
          item.onClick();
        }}
      />
    );
  }

  return (
    <Button
      type="button"
      size={buttonSize}
      className={buttonClassName}
      disabled={item.disabled || item.loading}
      onClick={item.onClick}
      aria-label={item.label}
      title={item.label}
    >
      <Icon className={cn("size-3.5", item.loading && "animate-spin")} />
      {!isIconOnly && <span>{item.label}</span>}
    </Button>
  );
}
