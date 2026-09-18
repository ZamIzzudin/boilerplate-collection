import { AppError } from "@/common/errors";
import { generateActionCode } from "@/lib/id";
import { prisma } from "@/lib/prisma";
import { bumpPermissionVersion } from "@/common/middleware/permission-version";
import type {
  CreateActionInput,
  ListActionQuery,
  UpdateActionInput,
} from "./action.schema";

const toDto = (action: {
  id: string;
  code: string;
  name: string;
  statusCode: string;
}) => ({
  id: action.id,
  action_code: action.code,
  action_name: action.name,
  status_code: action.statusCode,
});

export const actionService = {
  async list(query: ListActionQuery) {
    const where = query.action_name
      ? { name: { contains: query.action_name, mode: "insensitive" as const } }
      : {};

    const [records, total] = await Promise.all([
      prisma.action.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.action.count({ where }),
    ]);

    let items = records;
    if (query.type === "list") {
      const all = await prisma.action.findMany({
        where,
        orderBy: { createdAt: "asc" },
        take: query.limit,
      });
      items = all;
    }

    return {
      records: items.map(toDto),
      records_total: total,
      page_total: Math.max(1, Math.ceil(total / query.limit)),
    };
  },

  async create(input: CreateActionInput) {
    const code = input.action_code?.trim() || generateActionCode();

    const existing = await prisma.action.findUnique({ where: { code } });
    if (existing) {
      throw AppError.unprocessable("Validation error", {
        action_code: "Kode action sudah digunakan",
      });
    }

    const created = await prisma.action.create({
      data: { code, name: input.action_name },
    });

    await bumpPermissionVersion();
    return toDto(created);
  },

  async update(code: string, input: UpdateActionInput) {
    const existing = await prisma.action.findUnique({ where: { code } });
    if (!existing) throw AppError.notFound("Action tidak ditemukan");

    const updated = await prisma.action.update({
      where: { code },
      data: { name: input.action_name },
    });

    await bumpPermissionVersion();
    return toDto(updated);
  },

  async remove(code: string) {
    const existing = await prisma.action.findUnique({ where: { code } });
    if (!existing) throw AppError.notFound("Action tidak ditemukan");

    await prisma.action.delete({ where: { code } });
    await bumpPermissionVersion();
    return { status: 0, message: "Action berhasil dihapus" };
  },
};
