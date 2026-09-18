import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ACTIONS = [
  { code: "ACT1780387013007", name: "View" },
  { code: "ACT1779689449003", name: "Add" },
  { code: "ACT1780387019008", name: "Edit" },
  { code: "ACT1780387028009", name: "Delete" },
  { code: "ACT1780458369010", name: "Approve" },
  { code: "ACT1781146783014", name: "Reject" },
  { code: "ACT1780978958011", name: "Reset Password" },
  { code: "ACT1781056372012", name: "List" },
  { code: "ACT1781057065013", name: "Aktif/Nonaktif" },
  { code: "ACT1782444061019", name: "Download" },
  { code: "ACT1781925870016", name: "Edit Room" },
  { code: "ACT1781925881017", name: "Delete Room" },
  { code: "ACT1782714618026", name: "Upload Health" },
  { code: "ACT1782714499023", name: "Upload Payment" },
  { code: "ACT1782714469022", name: "Upload Quarantine" },
  { code: "ACT1782714312020", name: "Verifikasi Payment" },
  { code: "ACT1782714532024", name: "Verifikasi QR" },
  { code: "ACT1782714363021", name: "Verifikasi Quarantine" },
  { code: "ACT1782714708027", name: "Cancel" },
];

const MENUS = [
  { code: "MNU_DASHBOARD", name: "Dashboard", slug: "/dashboard", icon: "LayoutDashboard", order: 1 },
  { code: "MNU_USER", name: "User", slug: "/user", icon: "Users", order: 2 },
  { code: "MNU_ROLE", name: "Role", slug: "/role", icon: "Shield", order: 3 },
  { code: "MNU_ACTION", name: "Action", slug: "/action", icon: "Lightning", order: 4 },
  { code: "MNU_MENU", name: "Menu", slug: "/menu", icon: "ListBullets", order: 5 },
  { code: "MNU_PRIVILEGE", name: "Privilege", slug: "/privilege", icon: "Key", order: 6 },
];

async function main(): Promise<void> {
  // Actions
  const actionRecords = [];
  for (const action of ACTIONS) {
    const record = await prisma.action.upsert({
      where: { code: action.code },
      create: { code: action.code, name: action.name },
      update: { name: action.name },
    });
    actionRecords.push(record);
  }

  // Menus
  const menuRecords = [];
  for (const menu of MENUS) {
    const record = await prisma.menu.upsert({
      where: { code: menu.code },
      create: {
        code: menu.code,
        name: menu.name,
        slug: menu.slug,
        icon: menu.icon,
        order: menu.order,
      },
      update: { name: menu.name, slug: menu.slug, icon: menu.icon, order: menu.order },
    });
    menuRecords.push(record);
  }

  // Attach every action to every menu
  for (const menu of menuRecords) {
    for (const action of actionRecords) {
      await prisma.menuAction.upsert({
        where: {
          menuCode_actionCode: { menuCode: menu.code, actionCode: action.code },
        },
        create: { menuCode: menu.code, actionCode: action.code },
        update: {},
      });
    }
  }

  // Roles
  const superadmin = await prisma.userType.upsert({
    where: { id: 1 },
    create: { id: 1, name: "Superadmin", showOnRegister: false },
    update: { name: "Superadmin" },
  });
  await prisma.userType.upsert({
    where: { id: 2 },
    create: { id: 2, name: "Admin", showOnRegister: false },
    update: { name: "Admin" },
  });

  // Full privileges for Superadmin
  for (const menu of menuRecords) {
    for (const action of actionRecords) {
      await prisma.privilege.upsert({
        where: {
          userTypeId_menuCode_actionCode: {
            userTypeId: superadmin.id,
            menuCode: menu.code,
            actionCode: action.code,
          },
        },
        create: {
          code: `PRV_${menu.code}_${action.code}`,
          userTypeId: superadmin.id,
          menuCode: menu.code,
          actionCode: action.code,
        },
        update: { statusCode: "ACTIVE" },
      });
    }
  }

  // Default superadmin user
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@boilerplate.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    create: {
      username: "admin",
      email,
      password: hashed,
      statusCode: "ACTIVE",
      userTypeId: superadmin.id,
    },
    update: { password: hashed, statusCode: "ACTIVE", userTypeId: superadmin.id },
  });

  await prisma.setting.upsert({
    where: { key: "perm_version" },
    create: { key: "perm_version", value: String(Date.now()) },
    update: {},
  });

  console.info(`[seed] done. login: ${email} / ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
