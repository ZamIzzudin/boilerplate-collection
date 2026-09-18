import React from "react";

export function DetailFieldRow({
  label,
  value,
  inline = false,
}: Readonly<{
  label: React.ReactNode;
  value: React.ReactNode;
  inline?: boolean;
}>) {
  return (
    <div
      className={`${inline ? "grid grid-cols-3 gap-4" : "flex flex-col"} mb-3`}
    >
      {typeof label === "string" ? (
        <span className="text-brand-muted">{label}</span>
      ) : (
        <>{label}</>
      )}
      {typeof value === "string" ? (
        <span className={`font-semibold ${inline ? "col-span-2" : ""}`}>
          {value}
        </span>
      ) : (
        <div className={`${inline ? "col-span-2" : ""}`}>{value}</div>
      )}
    </div>
  );
}
