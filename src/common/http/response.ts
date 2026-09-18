import type { Response } from "express";

/** Standard success envelope: { status, message, data }. */
export const ok = <T>(
  res: Response,
  data: T,
  message = "Success",
  status = 1,
): Response =>
  res.status(200).json({ status, message, data });

/** Records-style envelope used by list endpoints: { data: { records, ... } }. */
export const okRecords = <T>(
  res: Response,
  records: T[],
  extra: Record<string, unknown> = {},
): Response =>
  res.status(200).json({ status: 1, message: "Success", data: { records, ...extra } });

export const paginatedRecords = <T>(
  res: Response,
  records: T[],
  total: number,
  limit: number,
): Response =>
  okRecords(res, records, {
    records_total: total,
    page_total: Math.max(1, Math.ceil(total / Math.max(1, limit))),
  });

export const created = <T>(
  res: Response,
  data: T,
  message = "Created",
): Response => res.status(201).json({ status: 1, message, data });
