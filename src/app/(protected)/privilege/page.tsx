import { useMemo, useState } from "react";

import { notifyFailed, notifySuccess } from "@/lib/notify";
import { getErrorMessage } from "@/lib/error-message";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import {
  usePrivilegeRoleMatrix,
  usePrivilegeRoles,
  useUpdateRoleMappings,
} from "./hook";
import { useMenuAccess } from "@/hooks/use-menu-access";
import { ForbiddenView } from "@/components/forbidden-view";
import { FormField } from "@/components/ui/form-field";
import {
  AppDataTable,
  type AppDataTableColumn,
} from "@/components/ui/app-data-table";
import { MatrixRow } from "@/types";
import { ArrowElbowDownRightIcon } from "@phosphor-icons/react";

type TableRow = {
  menuCode: string;
  menuName: string;
  isGroup: boolean;
  layer: number;
  sortOrder: number | null;
  availableActionCodes: string[];
  checkedActionCodes: string[];
};

export type PrivilegeEntry = {
  privilege_code: string;
  status_code: "ACTIVE" | "INACTIVE";
};

const INDENT_CLASSES = ["pl-0", "pl-1", "pl-7", "pl-11", "pl-16"];

function getIndentClass(layer: number): string {
  return INDENT_CLASSES.at(layer - 1) ?? INDENT_CLASSES.at(-1)!;
}

function getLayer(menu: MatrixRow, menuMap: Map<string, MatrixRow>): number {
  if (menu.parentMenuId === null) return 1;

  const parent = menuMap.get(menu.parentMenuId);
  if (!parent) return 1;

  return getLayer(parent, menuMap) + 1;
}

export default function PrivilegePage() {
  const [selectedRoleCode, setSelectedRoleCode] = useState<string | null>("");
  const [overrides, setOverrides] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const access = useMenuAccess("/privilege");

  const { data: roles = [], isLoading: isLoadingRoles } = usePrivilegeRoles();
  const activeRoleCode = selectedRoleCode || roles[0]?.id || "";
  const { data: matrix, isLoading: isLoadingMatrix } =
    usePrivilegeRoleMatrix(activeRoleCode);
  const updateMappingsMutation = useUpdateRoleMappings();

  const actions = matrix?.actions ?? [];
  const rows = matrix?.rows ?? [];

  const isChecked = (menuCode: string, actionCode: string) => {
    const override = overrides[menuCode]?.[actionCode];
    if (typeof override === "boolean") return override;

    const row = rows.find((r) => r.menuCode === menuCode);
    return row ? row.checkedActionCodes.includes(actionCode) : false;
  };

  const toggle = (menuCode: string, actionCode: string) => {
    const current = isChecked(menuCode, actionCode);
    setOverrides((prev) => ({
      ...prev,
      [menuCode]: {
        ...prev[menuCode],
        [actionCode]: !current,
      },
    }));
  };

  const tableRows: TableRow[] = useMemo(() => {
    const menuMap = new Map(rows.map((m) => [m.menuCode, m]));
    const childrenMap = new Map<string, MatrixRow[]>();

    for (const row of rows) {
      const parentId = row.parentMenuId ?? "";
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(row);
    }

    for (const [, children] of childrenMap) {
      children.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
    }

    const result: TableRow[] = [];

    function walk(parentId: string) {
      const children = childrenMap.get(parentId) ?? [];
      for (const menu of children) {
        const layer = getLayer(menu, menuMap);
        result.push({
          menuCode: menu.menuCode,
          menuName: menu.menuName,
          layer,
          isGroup: menu.isGroup,
          sortOrder: menu.sortOrder,
          availableActionCodes: menu.availableActionCodes,
          checkedActionCodes: menu.checkedActionCodes,
        });
        walk(menu.menuCode);
      }
    }

    walk("");
    return result;
  }, [rows]);

  const buildPrivileges = () => {
    if (!matrix) return [];

    const privileges: Array<{
      privilege_code?: string;
      menu_code: string;
      action_code: string;
      status_code: string;
    }> = [];

    for (const row of matrix.rows) {
      for (const action of actions) {
        const originalChecked = row.checkedActionCodes.includes(
          action.action_code,
        );
        const currentChecked = isChecked(row.menuCode, action.action_code);

        if (currentChecked === originalChecked) continue;

        const existing = row.privilegeMap?.[action.action_code];

        if (currentChecked) {
          privileges.push({
            ...(existing ? { privilege_code: existing.privilege_code } : {}),
            menu_code: row.menuCode,
            action_code: action.action_code,
            status_code: "ACTIVE",
          });
        } else if (existing) {
          privileges.push({
            privilege_code: existing.privilege_code,
            menu_code: row.menuCode,
            action_code: action.action_code,
            status_code: "DELETE",
          });
        }
      }
    }

    return privileges;
  };

  const save = async () => {
    const privileges = buildPrivileges();

    try {
      await updateMappingsMutation.mutateAsync({
        user_type_id: activeRoleCode,
        privileges,
      });

      setOverrides({});
      notifySuccess({
        title: "Berhasil",
        description: "Mapping privilege berhasil diperbarui.",
      });
    } catch (error) {
      notifyFailed({
        title: "Failed",
        description: getErrorMessage(
          error,
          "Gagal menyimpan mapping privilege",
        ),
      });
    }
  };

  const tableColumns: AppDataTableColumn<TableRow>[] = [
    {
      key: "menu",
      header: "Menu",
      render: (row: TableRow) => (
        <span
          className={`${getIndentClass(row.layer)} flex items-center gap-2`}
        >
          <ArrowElbowDownRightIcon
            className={`${row.layer > 1 ? "flex shrink-0" : "hidden"} text-gray-400`}
          />
          {row.menuName}
        </span>
      ),
    },
    ...actions.map((action) => ({
      key: action.action_code,
      header: action.action_name,
      className: "text-center",
      render: (row: TableRow) => {
        const available = row.availableActionCodes.includes(action.action_code);
        return (
          <input
            type="checkbox"
            disabled={!available || !access.canEdit}
            checked={
              available ? isChecked(row.menuCode, action.action_code) : false
            }
            onChange={() => toggle(row.menuCode, action.action_code)}
          />
        );
      },
    })),
  ];

  if (access.isLoading) {
    return <p className="text-sm text-gray-400">Memuat hak akses...</p>;
  }

  if (!access.canView) {
    return <ForbiddenView title="Privilege" />;
  }

  return (
    <AppLayout
      title="Privilege Mapping"
      description="Kelola mapping privilege role terhadap action pada menu."
    >
      <div className="space-y-4">
        <FormField
          id="user_type_id"
          label="Jenis User"
          type="select"
          value={activeRoleCode}
          onChange={(e) => {
            setSelectedRoleCode(e.target.value);
            setOverrides({});
          }}
          options={roles.map((role) => ({ label: role.name, value: role.id }))}
          placeholder="Pilih jenis user"
          selectLoading={isLoadingRoles || updateMappingsMutation.isPending}
          selectLoadingLabel="Memuat jenis user..."
        />
        {(() => {
          if (isLoadingRoles || isLoadingMatrix) {
            return (
              <p className="text-sm text-gray-400">Memuat data privilege...</p>
            );
          }
          if (tableRows.length === 0) {
            return (
              <p className="text-sm text-gray-400">Tidak ada data privilege.</p>
            );
          }
          return (
            <div className="space-y-6">
              <div>
                <AppDataTable
                  columns={tableColumns}
                  rows={tableRows}
                  getRowKey={(row: TableRow) => row.menuCode}
                  fixedHeader
                  stickyFirstColumn
                />
              </div>

              {access.canEdit ? (
                <Button
                  variant="primary"
                  className="py-4 px-5"
                  onClick={save}
                  disabled={updateMappingsMutation.isPending}
                >
                  {updateMappingsMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              ) : null}
            </div>
          );
        })()}
      </div>
    </AppLayout>
  );
}
