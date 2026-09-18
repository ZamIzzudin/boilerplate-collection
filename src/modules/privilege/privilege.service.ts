import { AppError } from "@/common/errors";
import { generatePrivilegeCode } from "@/lib/id";
import { prisma } from "@/lib/prisma";
import { bumpPermissionVersion } from "@/common/middleware/permission-version";
import type { UpdatePrivilegeInput } from "./privilege.schema";

export const privilegeService = {
  async listByUserType(userTypeId: number) {
    const records = await prisma.privilege.findMany({
      where: { userTypeId },
      include: { menu: true, action: true, userType: true },
      orderBy: { createdAt: "asc" },
    });

    return records.map((privilege) => ({
      id: privilege.id,
      privilege_code: privilege.code,
      user_type_id: privilege.userTypeId,
      user_type_name: privilege.userType.name,
      menu_code: privilege.menuCode,
      menu_name: privilege.menu.name,
      action_code: privilege.actionCode,
      action_name: privilege.action.name,
      status_code: privilege.statusCode,
    }));
  },

  /**
   * Upsert the privilege matrix of a role. Entries with status_code "DELETE"
   * are removed, others are created/updated. Always bumps perm_version.
   */
  async updateMatrix({ user_type_id, privileges }: UpdatePrivilegeInput) {
    const userTypeId = Number(user_type_id);
    const userType = await prisma.userType.findUnique({
      where: { id: userTypeId },
    });
    if (!userType) throw AppError.notFound("Role tidak ditemukan");

    for (const entry of privileges) {
      if (entry.status_code === "DELETE") {
        await prisma.privilege.deleteMany({
          where: {
            userTypeId,
            menuCode: entry.menu_code,
            actionCode: entry.action_code,
          },
        });
        continue;
      }

      await prisma.privilege.upsert({
        where: {
          userTypeId_menuCode_actionCode: {
            userTypeId,
            menuCode: entry.menu_code,
            actionCode: entry.action_code,
          },
        },
        create: {
          code: entry.privilege_code || generatePrivilegeCode(),
          userTypeId,
          menuCode: entry.menu_code,
          actionCode: entry.action_code,
          statusCode: entry.status_code,
        },
        update: { statusCode: entry.status_code },
      });
    }

    const permVersion = await bumpPermissionVersion();
    return { status: 0, message: "Privilege berhasil diperbarui", perm_version: permVersion };
  },
};
