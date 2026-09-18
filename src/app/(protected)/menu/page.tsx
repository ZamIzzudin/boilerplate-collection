import { SubmitEvent, useEffect, useMemo, useState } from "react";
import { notifyFailed, notifySuccess } from "@/lib/notify";
import { getErrorMessage } from "@/lib/error-message";
import { AppLayout } from "@/components/app-layout";
import { TableRowActionMenu } from "@/components/table-row-action-menu";
import {
  AppDataTable,
  type AppDataTableColumn,
} from "@/components/ui/app-data-table";
import {
  useCreateMenu,
  useDeleteMenu,
  useMenuActions,
  useMenus,
  useUpdateMenu,
  useAllMenus,
} from "./hook";
import { MenuItem } from "./handler";
import { useMenuAccess } from "@/hooks/use-menu-access";
import { ForbiddenView } from "@/components/forbidden-view";
import FormSheet, { type MenuForm } from "./component/form-sheet";
import DetailSheet from "./component/detail-sheet";
import type { ActiveSheet } from "@/types";

const initialForm: MenuForm = {
  menu_code: "",
  menu_name: "",
  parent_code: "",
  icon: "",
  slug: "",
  order: "0",
  is_group: false,
  actions: [],
};

export default function MenuPage() {
  const [id, setId] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuForm>(initialForm);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [originalActions, setOriginalActions] = useState<
    { code: string; mapping_menu_code?: string }[]
  >([]);

  const access = useMenuAccess("/menu");
  const { data, isLoading: isLoadingItems } = useMenus({
    limit,
    page,
    menu_name: debouncedSearch,
  });

  const { data: actionsData } = useMenuActions();
  const { data: allMenus } = useAllMenus();
  const actionOptions =
    actionsData?.data?.records?.map((action: any) => ({
      label: action.action_name,
      value: action.action_code,
    })) ?? [];

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();
  const deleteMutation = useDeleteMenu();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const canSubmit = id ? access.canEdit : access.canAdd;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const parentOptions = useMemo(() => {
    const source = allMenus ?? items;
    return [
      { label: "None", value: "" },
      ...source
        .filter((x) => x.id !== id)
        .map((item) => ({ label: item.menu_name, value: item.menu_code })),
    ];
  }, [allMenus, items, id]);

  const reset = () => {
    setId(null);
    setOriginalActions([]);
    setForm(initialForm);
  };

  const submit = async (e: SubmitEvent) => {
    e.preventDefault();
    const originalActionCodes = originalActions.map((a) => a.code);
    let actionPayload: {
      mapping_menu_code?: string;
      action_code?: string;
      status_code?: string;
    }[] = [];
    if (id) {
      const existingActions = form.actions
        .filter((code) => originalActionCodes.includes(code))
        .map((action_code) => {
          const existing = originalActions.find((a) => a.code === action_code);
          return {
            mapping_menu_code: existing?.mapping_menu_code,
            status_code: "ACTIVE",
          };
        });
      const newActions = form.actions
        .filter((code) => !originalActionCodes.includes(code))
        .map((action_code) => ({ action_code }));
      const deletedActions = originalActionCodes
        .filter((code) => !form.actions.includes(code))
        .map((action_code) => {
          const existing = originalActions.find((a) => a.code === action_code);
          return {
            mapping_menu_code: existing?.mapping_menu_code,
            status_code: "DELETE",
          };
        });
      actionPayload = [...existingActions, ...newActions, ...deletedActions];
    } else {
      actionPayload = form.actions.map((action_code) => ({ action_code }));
    }

    const basePayload = {
      menu_name: form.menu_name,
      parent_code: form.parent_code || null,
      icon: form.icon,
      slug: form.slug,
      order: Number(form.order),
      action: actionPayload,
      is_group: form.is_group,
      ...(form.is_group ? { parent_code: null } : {}),
    };
    try {
      if (id) {
        await updateMutation.mutateAsync({
          payload: { ...basePayload, menu_code: id },
        });
        notifySuccess({
          title: "Berhasil",
          description: "Menu berhasil diperbarui",
        });
      } else {
        await createMutation.mutateAsync(basePayload);
        notifySuccess({
          title: "Berhasil",
          description: "Menu berhasil ditambahkan",
        });
      }
      setActiveSheet(null);
      reset();
    } catch (error) {
      notifyFailed({
        title: "Failed",
        description: getErrorMessage(error, "Gagal menyimpan menu"),
      });
    }
  };

  const edit = (item: MenuItem) => {
    setId(item.id);
    setOriginalActions(item.actions ?? []);
    setForm({
      menu_code: item.menu_code,
      menu_name: item.menu_name,
      parent_code: item.parent_code ?? "",
      icon: item.icon,
      slug: item.slug,
      order: String(item.order),
      actions: item.actions?.map((a) => a.code) ?? [],
      is_group: item?.isGroup,
    });
    setActiveSheet("FORM");
  };

  const showDetail = (item: MenuItem) => {
    if (!access.canViewDetail) return;
    setSelectedItem(item);
    setActiveSheet("DETAIL");
  };

  const editFromDetail = () => {
    if (!selectedItem) return;
    edit(selectedItem);
  };

  const deleteFromDetail = async () => {
    if (!selectedItem) return;
    await remove(selectedItem.menu_code);
    setActiveSheet(null);
    setSelectedItem(null);
  };

  const remove = async (menuCode: string) => {
    try {
      await deleteMutation.mutateAsync({ menu_code: menuCode });
      notifySuccess({
        title: "Berhasil",
        description: "Menu berhasil dihapus",
      });
    } catch (error) {
      notifyFailed({
        title: "Failed",
        description: getErrorMessage(error, "Gagal menghapus menu"),
      });
    }
  };

  const tableColumns: AppDataTableColumn<MenuItem>[] = [
    {
      key: "menu_code",
      header: "Kode",
      render: (item) => (
        <button
          type="button"
          className={`text-left font-semibold ${access.canViewDetail ? "text-primary underline cursor-pointer" : "text-black"}`}
          onClick={() => showDetail(item)}
        >
          {item.menu_code}
        </button>
      ),
    },
    {
      key: "menu_name",
      header: "Nama",
      render: (item) => item.menu_name,
    },
    {
      key: "slug",
      header: "Slug",
      render: (item) => item.slug,
    },
    {
      key: "action",
      header: "Action",
      className: "text-right",
      render: (item) => (
        <div className="text-right">
          <TableRowActionMenu
            items={[
              ...(access.canEdit
                ? [{ label: "Edit", onClick: () => edit(item) }]
                : []),
              ...(access.canDelete
                ? [
                    {
                      label: "Hapus",
                      onClick: () => remove(item.id),
                      destructive: true,
                      confirmMessage:
                        "Hapus data ini? Tindakan ini tidak bisa dibatalkan.",
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];

  if (access.isLoading)
    return <p className="text-sm text-gray-400">Memuat hak akses...</p>;
  if (!access.canView) return <ForbiddenView title="Menu" />;

  return (
    <AppLayout
      title="Daftar Module"
      description="Menampilkan daftar module yang terdaftar."
    >
      <AppDataTable
        columns={tableColumns}
        rows={items}
        getRowKey={(row) => row.id}
        isLoading={isLoadingItems}
        query={{
          search,
          searchPlaceholder: "Cari nama menu",
          onSearchChange: (value) => setSearch(value),
          filters: {},
          onFiltersChange: () => {},
        }}
        actionButton={
          <FormSheet
            id={id}
            isOpen={activeSheet === "FORM"}
            setIsOpen={(value) => setActiveSheet(value ? "FORM" : null)}
            reset={reset}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            access={access}
            form={form}
            setForm={setForm}
            onSubmit={submit}
            parentOptions={parentOptions}
            actionOptions={actionOptions}
          />
        }
        pagination={{
          totalItems: total,
          currentPage: page,
          perPage: limit,
          perPageOptions: [5, 10, 15],
          onPerPageChange: (value) => {
            setLimit(value);
            setPage(1);
          },
          onPageChange: (value) => setPage(value),
        }}
      />
      <DetailSheet
        selected={selectedItem}
        access={access}
        isOpen={activeSheet === "DETAIL"}
        setIsOpen={(value) => setActiveSheet(value ? "DETAIL" : null)}
        handleDelete={deleteFromDetail}
        handleEdit={editFromDetail}
      />
    </AppLayout>
  );
}
