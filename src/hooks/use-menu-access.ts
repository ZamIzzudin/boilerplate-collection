import { useMemo } from "react";
import { usePrivilegeStore } from "@/store/privilege-store";
import { ACTION_CODES } from "@/lib/action-codes";
import { SidebarMenuList } from "@/types/menu";

export const useMenuAccess = (menuKey: string) => {
  const menus = usePrivilegeStore((state) => state.menus);

  return useMemo(() => {
    const normalizedKey = menuKey.toLowerCase().replace(/^\//, "");
    const findMenuActionCodes = (menuList: SidebarMenuList[]): Set<string> => {
      for (const menu of menuList) {
        const menuPath = (menu.path ?? "").toLowerCase().replace(/^\//, "");
        if (menuPath === normalizedKey) {
          return new Set((menu.actions ?? []).map((a) => a.code));
        }
        const subResult = findMenuActionCodes(menu.subMenus ?? []);
        if (subResult.size > 0) {
          return subResult;
        }
      }
      return new Set();
    };

    const codes = findMenuActionCodes(menus);

    return {
      isLoading: false,
      canView: codes.has(ACTION_CODES.LIST),
      canAdd: codes.has(ACTION_CODES.ADD),
      canEdit: codes.has(ACTION_CODES.EDIT),
      canDelete: codes.has(ACTION_CODES.DELETE),
      canApprove: codes.has(ACTION_CODES.APPROVE),
      canReject: codes.has(ACTION_CODES.REJECT),
      canViewDetail: codes.has(ACTION_CODES.VIEW),
      canResetPassword: codes.has(ACTION_CODES.RESET),
      canActive: codes.has(ACTION_CODES.ACTIVE_TOGGLE),
      canDownload: codes.has(ACTION_CODES.DOWNLOAD),
      canEditRoom: codes.has(ACTION_CODES.EDIT_ROOM),
      canDeleteRoom: codes.has(ACTION_CODES.DELETE_ROOM),
      canUploadHealth: codes.has(ACTION_CODES.UPLOAD_HEALTH),
      canUploadPayment: codes.has(ACTION_CODES.UPLOAD_PAYMENT),
      canUploadQuarantine: codes.has(ACTION_CODES.UPLOAD_QUARANTINE),
      canVerifPayment: codes.has(ACTION_CODES.VERIF_PAYMENT),
      canVerifQR: codes.has(ACTION_CODES.VERIF_QR),
      canVerifQuarantine: codes.has(ACTION_CODES.VERIF_QUARANTINE),
      canCancel: codes.has(ACTION_CODES.CANCEL),
    };
  }, [menuKey, menus]);
};
