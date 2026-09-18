import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mapRoles = (
  data: { id: number | string; user_type_name: string }[],
) =>
  data.map((r) => ({
    id: String(r.id),
    code: String(r.id),
    name: r.user_type_name,
  }));

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatDateID(
  date: string | Date | null | undefined,
  options?: { withTime?: boolean },
): string {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";
  const datePart = `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
  if (!options?.withTime) return datePart;
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${datePart} | ${hours}:${minutes} WIB`;
}

export const maskEmail = (email: string) => {
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) return `${localPart.at(0)}***@${domain}`;
  return `${localPart.at(0)}***${localPart.at(-1)}@${domain}`;
};

/**
 * Fetch a file from the /file endpoint by its encoded path,
 * open it in a new tab, and revoke the object URL after a short delay.
 */
export async function viewFileByPath(path: string): Promise<void> {
  const { apiNewClient } = await import("@/lib/axios/client");
  const response = await apiNewClient.get("/file", {
    params: { path },
    responseType: "blob",
  });
  const contentType = response.headers["content-type"];
  const blob: Blob = response.data;
  const fileBlob = new Blob([blob], {
    type:
      typeof contentType === "string"
        ? contentType
        : "application/octet-stream",
  });
  const url = URL.createObjectURL(fileBlob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function viewFileByURL(url:string): Promise<void> {
  const { apiNewClient } = await import("@/lib/axios/client");
  const response = await apiNewClient.get(url, {
    responseType: "blob",
  });
  const contentType = response.headers["content-type"];
  const blob: Blob = response.data;
  const fileBlob = new Blob([blob], {
    type:
      typeof contentType === "string"
        ? contentType
        : "application/octet-stream",
  });
  const output = URL.createObjectURL(fileBlob);
  window.open(output, "_blank");
  setTimeout(() => URL.revokeObjectURL(output), 10000);
}

export function formatRupiah(value: string | null): string {
  if (!value) return "-";
  const num = Number(value);
  return `Rp${num.toLocaleString("id-ID")}`;
}

export function isImageBlob(blob: Blob | null): boolean {
  return blob?.type.startsWith("image/") ?? false;
}

export function toDate(tanggal: string | null | undefined): Date | null {
  if (!tanggal) return null;
  const date = new Date(tanggal + "T00:00:00");
  return Number.isNaN(date.getTime()) ? null : date;
}