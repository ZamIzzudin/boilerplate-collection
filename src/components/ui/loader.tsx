import { SpinnerGapIcon } from "@phosphor-icons/react";

const Loader = ({ label }: { label?: string }) => {
  return (
    <div className="flex items-center h-96 justify-center gap-2 p-12 text-brand-muted">
      <SpinnerGapIcon className="h-5 w-5 animate-spin" />
      <span className="text-sm">Memuat {label}...</span>
    </div>
  );
};

export default Loader;
