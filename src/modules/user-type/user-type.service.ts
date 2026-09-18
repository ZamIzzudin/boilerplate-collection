import { AppError } from "@/common/errors";
import { prisma } from "@/lib/prisma";
import { bumpPermissionVersion } from "@/common/middleware/permission-version";
import type {
  ListUserTypeQuery,
  RoleInput,
  UpdateRoleInput,
} from "./user-type.schema";

const toRecord = (type: {
  id: number;
  name: string;
  showOnRegister: boolean;
  form: string | null;
  statusCode: string;
}) => ({
  id: type.id,
  value: type.id,
  user_type_name: type.name,
  user_type_show_on_register: type.showOnRegister,
  user_type_form: type.form,
  status_code: type.statusCode,
});

export const userTypeService = {
  async list(query: ListUserTypeQuery) {
    const where = {
      ...(query.user_type_name
        ? { name: { contains: query.user_type_name, mode: "insensitive" as const } }
        : {}),
      ...(query.user_type_show_on_register === undefined
        ? {}
        : { showOnRegister: query.user_type_show_on_register }),
    };

    const [records, total] = await Promise.all([
      prisma.userType.findMany({
        where,
        orderBy: { id: "asc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.userType.count({ where }),
    ]);

    return {
      records: records.map(toRecord),
      has_next: query.page * query.limit < total,
      records_total: total,
    };
  },

  async create(input: RoleInput) {
    const existing = await prisma.userType.findUnique({
      where: { id: Number(input.id) },
    });
    if (existing) {
      throw AppError.unprocessable("Validation error", {
        id: "Role dengan kode ini sudah ada",
      });
    }

    const created = await prisma.userType.create({
      data: {
        id: Number(input.id),
        name: input.label,
        showOnRegister: input.user_type_show_on_register,
      },
    });

    await bumpPermissionVersion();
    return toRecord(created);
  },

  async update(id: number, input: UpdateRoleInput) {
    const existing = await prisma.userType.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound("Role tidak ditemukan");

    const updated = await prisma.userType.update({
      where: { id },
      data: {
        name: input.label,
        ...(input.user_type_show_on_register === undefined
          ? {}
          : { showOnRegister: input.user_type_show_on_register }),
      },
    });

    await bumpPermissionVersion();
    return toRecord(updated);
  },

  async remove(id: number) {
    const existing = await prisma.userType.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound("Role tidak ditemukan");

    const users = await prisma.user.count({ where: { userTypeId: id } });
    if (users > 0) {
      throw AppError.unprocessable(
        "Role masih digunakan oleh user, tidak dapat dihapus",
      );
    }

    await prisma.userType.delete({ where: { id } });
    await bumpPermissionVersion();
    return { status: 0, message: "Role berhasil dihapus" };
  },
};
