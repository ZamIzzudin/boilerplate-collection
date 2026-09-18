import * as React from "react";
import { cn } from "@/lib/utils";
import {
  EyeIcon,
  FileIcon,
  PencilIcon,
  SpinnerGapIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";

const PhotoLightbox = React.lazy(() =>
  import("@/components/ui/lightbox").then((mod) => ({
    default: mod.PhotoLightbox,
  })),
);

type FileInputProps = {
  id?: string;
  name?: string;
  accept?: string;
  disabled?: boolean;
  value?: File | string | null;
  onChange?: (file: File | null) => void;
  className?: string;
  placeholder?: string;
  loading?: boolean;
  onView?: (file: File | string) => void;
  onResolveView?: (file: File | string) => Promise<Blob | string | null | undefined>;
  ariaLabel?: string;
};

function FileInput({
  id,
  name,
  accept,
  disabled,
  value,
  onChange,
  className,
  placeholder = "Klik di sini untuk mengunggah file",
  loading = false,
  onView,
  onResolveView,
  ariaLabel,
}: Readonly<FileInputProps>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [internalFile, setInternalFile] = React.useState<File | null>(null);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxFile, setLightboxFile] = React.useState<Blob | string | null>(null);

  const file = value === undefined ? internalFile : value;

  const handleClick = () => {
    if (!disabled && !loading) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setInternalFile(selected);
    onChange?.(selected);
    e.target.value = "";
  };

  const handleView = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!file) return;

    if (onView) {
      onView(file);
      return;
    }

    let displayFile: Blob | string = file;

    if (onResolveView) {
      const resolved = await onResolveView(file);
      if (resolved !== null && resolved !== undefined) {
        displayFile = resolved;
      }
    }

    setLightboxFile(displayFile);
    setLightboxOpen(true);
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        disabled={disabled || loading}
        className="sr-only"
        onChange={handleChange}
      />

      {(() => {
        if (loading) return <LoadingState />;
        if (file) {
          return (
            <FileSelectedState
              file={file}
              disabled={disabled}
              handleClick={handleClick}
              handleView={handleView}
            />
          );
        }
        return (
          <EmptyState
            placeholder={placeholder}
            disabled={disabled}
            handleClick={handleClick}
            ariaLabel={ariaLabel}
          />
        );
      })()}

      <React.Suspense fallback={null}>
        <PhotoLightbox
          open={lightboxOpen}
          onClose={() => {
            setLightboxOpen(false);
            setLightboxFile(null);
          }}
          images={lightboxFile ? [{ src: lightboxFile }] : []}
        />
      </React.Suspense>
    </div>
  );
}

export { FileInput };
export type { FileInputProps };

function LoadingState() {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5",
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground">
        <SpinnerGapIcon className="h-4 w-4 text-primary animate-spin" />
      </div>
      <span className="flex-1 truncate text-sm font-medium text-primary">
        Mengunggah file...
      </span>
    </div>
  );
}

function FileSelectedState(
  props: Readonly<{
    file: File | string;
    disabled?: boolean;
    handleClick: () => void;
    handleView: (e: React.MouseEvent) => void;
  }>,
) {
  const rawName =
    typeof props.file === "string"
      ? props.file.substring(props.file.lastIndexOf("/") + 1)
      : props.file?.name ?? "unknown";
  const fileName = rawName.length > 20 ? `${rawName.slice(0, 20)}...` : rawName;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 overflow-hidden",
        "group-data-[invalid=true]/field:border-destructive group-data-[invalid=true]/field:ring-1 group-data-[invalid=true]/field:ring-destructive",
        props.disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground">
        <FileIcon className="h-4 w-4 text-primary" />
      </div>
      <span className="flex-1 min-w-0 truncate text-sm font-medium text-foreground">
        {fileName}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={props.handleClick}
          disabled={props.disabled}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-gray-400",
            "hover:bg-muted hover:text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label="Ganti file"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={props.handleView}
          disabled={props.disabled}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-gray-400",
            "hover:bg-muted hover:text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label="Lihat file"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyState(
  props: Readonly<{
    placeholder: string;
    disabled?: boolean;
    handleClick: () => void;
    ariaLabel?: string;
  }>,
) {
  return (
    <button
      type="button"
      onClick={props.handleClick}
      disabled={props.disabled}
      aria-label={props.ariaLabel}
      className={cn(
        "flex w-full items-center gap-4 rounded-lg",
        "border border-border bg-background",
        "px-3 py-2.5 text-center transition-colors",
        "hover:border-muted-foreground/50 hover:bg-muted/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "group-data-[invalid=true]/field:border-destructive group-data-[invalid=true]/field:ring-1 group-data-[invalid=true]/field:ring-destructive",
        props.disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#CDD6DA] text-gray-400">
        <UploadSimpleIcon />
      </div>
      <span className="text-sm text-gray-400">{props.placeholder}</span>
    </button>
  );
}
