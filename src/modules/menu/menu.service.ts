import { AppError } from "@/common/errors";
import { generateMenuCode } from "@/lib/id";
import { prisma } from "@/lib/prisma";
import { bumpPermissionVersion } from "@/common/middleware/permission-version";
import type {
  CreateMenuInput,
  ListMenuQuery,
  MenuActionInput,
  UpdateMenuInput,
} from "./menu.schema";

type MenuWithRelations = {
  id: string;
  code: string;
  name: string;
  parentCode: string | null;
  icon: string | null;
  slug: string | null;
  order: number;
  isGroup: boolean;
  statusCode: string;
  actions: {
    actionCode: string;
    statusCode: string;
    action: { name: string };
  }[];
};

const toDto = (menu: MenuWithRelations) => ({
  id: menu.id,
  menu_code: menu.code,
  menu_name: menu.name,
  parent_code: menu.parentCode,
  icon: menu.icon,
  slug: menu.slug,
  order: menu.order,
  is_group: menu.isGroup,
  status_code: menu.statusCode,
  actions: menu.actions.map((mapping) => ({
    code: mapping.actionCode,
    name: mapping.action.name,
    status_code: mapping.statusCode,
  })),
});

const include = { actions: { include: { action: true } } } as const;

export const menuService = {
  async list(query: ListMenuQuery) {
    const where = query.menu_name
      ? { name: { contains: query.menu_name, mode: "insensitive" as const } }
      : {};

    const [records, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        include,
        orderBy: { order: "asc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.menu.count({ where }),
    ]);

    return {
      records: records.map(toDto),
      records_total: total,
      page_total: Math.max(1, Math.ceil(total / query.limit)),
    };
  },

  async syncActions(menuCode: string, actions: MenuActionInput[]) {
    await prisma.menuAction.deleteMany({ where: { menuCode } });

    if (actions.length === 0) return;

    await prisma.menuAction.createMany({
      data: actions.map((action) => ({
        menuCode,
        actionCode: action.action_code,
        statusCode: action.status_code ?? "ACTIVE",
      })),
      skipDuplicates: true,
    });
  },

  async create(input: CreateMenuInput) {
    const code = input.menu_code?.trim() || generateMenuCode();

    const existing = await prisma.menu.findUnique({ where: { code } });
    if (existing) {
      throw AppError.unprocessable("Validation error", {
        menu_code: "Kode menu sudah digunakan",
      });
    }

    await prisma.menu.create({
      data: {
        code,
        name: input.menu_name,
        parentCode: input.parent_code ?? null,
        icon: input.icon,
        slug: input.slug,
        order: input.order,
        isGroup: input.is_group,
      },
    });

    await this.syncActions(code, input.action ?? []);
    await bumpPermissionVersion();

    const created = await prisma.menu.findUniqueOrThrow({
      where: { code },
      include,
    });
    return toDto(created);
  },

  async update(code: string, input: UpdateMenuInput) {
    const existing = await prisma.menu.findUnique({ where: { code } });
    if (!existing) throw AppError.notFound("Menu tidak ditemukan");

    await prisma.menu.update({
      where: { code },
      data: {
        name: input.menu_name,
        parentCode: input.parent_code ?? null,
        icon: input.icon,
        slug: input.slug,
        order: input.order,
        isGroup: input.is_group,
      },
    });

    await this.syncActions(code, input.action ?? []);
    await bumpPermissionVersion();

    const updated = await prisma.menu.findUniqueOrThrow({
      where: { code },
      include,
    });
    return toDto(updated);
  },

  async remove(code: string) {
    const existing = await prisma.menu.findUnique({ where: { code } });
    if (!existing) throw AppError.notFound("Menu tidak ditemukan");

    await prisma.menu.delete({ where: { code } });
    await bumpPermissionVersion();
    return { status: 0, message: "Menu berhasil dihapus" };
  },
};
