import { SubmitEvent, useEffect, useState } from "react";
import { notifyFailed, notifySuccess } from "@/lib/notify";
import { getErrorMessage } from "@/lib/error-message";
import { AppLayout } from "@/components/app-layout";
import { TableRowActionMenu } from "@/components/table-row-action-menu";
import {
  AppDataTable,
  type AppDataTableColumn,
} from "@/components/ui/app-data-table";
import { ActionItem } from "./handler";
import {
  useActions,
  useCreateAction,
  useDeleteAction,
  useUpdateAction,
} from "./hook";
import { useMenuAccess } from "@/hooks/use-menu-access";
import { ForbiddenView } from "@/components/forbidden-view";
import FormSheet, { type ActionForm } from "./component/form-sheet";
import DetailSheet from "./component/detail-sheet";
import type { ActiveSheet } from "@/types";

const initialForm: ActionForm = {
  action_code: "",
  action_name: "",
};

export default function ActionPage() {
  const [id, setId] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [form, setForm] = useState<ActionForm>(initialForm);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const access = useMenuAccess("/action");
  const { data, isLoading: isLoadingItems } = useActions({
    page,
    perPage,
    action_name: debouncedSearch,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const createMutation = useCreateAction();
  const updateMutation = useUpdateAction();
  const deleteMutation = useDeleteAction();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const canSubmit = id ? access.canEdit : access.canAdd;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [search]);

  const reset = () => {
    setId(null);
    setForm(initialForm);
  };

  const submit = async (e: SubmitEvent) => {
    e.preventDefault();
    const basePayload = {
      action_name: form.action_name,
    };
    try {
      if (id) {
        await updateMutation.mutateAsync({
          ...basePayload,
          action_code: form.action_code,
        });
        notifySuccess({
          title: "Berhasil",
          description: "Action berhasil diperbarui",
        });
      } else {
        await createMutation.mutateAsync(basePayload);
        notifySuccess({
          title: "Berhasil",
          description: "Action berhasil ditambahkan",
        });
      }
      setActiveSheet(null);
      reset();
    } catch (error) {
      notifyFailed({
        title: "Failed",
        description: getErrorMessage(error, "Gagal menyimpan action"),
      });
    }
  };

  const edit = (item: ActionItem) => {
    setId(item.id);
    setForm({
      action_code: item.id,
      action_name: item.action_name,
    });
    setActiveSheet("FORM");
  };

  const showDetail = (item: ActionItem) => {
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
    await remove(selectedItem.id);
    setActiveSheet(null);
    setSelectedItem(null);
  };

  const remove = async (actionCode: string) => {
    try {
      await deleteMutation.mutateAsync({ action_code: actionCode });
      notifySuccess({
        title: "Berhasil",
        description: "Action berhasil dihapus",
      });
    } catch (error) {
      notifyFailed({
        title: "Failed",
        description: getErrorMessage(error, "Gagal menghapus action"),
      });
    }
  };

  const tableColumns: AppDataTableColumn<ActionItem>[] = [
    {
      key: "action_code",
      header: "Kode",
      render: (item) => (
        <button
          type="button"
          className={`text-left font-semibold ${access.canViewDetail ? "text-primary underline cursor-pointer" : "text-black"}`}
          onClick={() => showDetail(item)}
        >
          {item.action_code}
        </button>
      ),
    },
    {
      key: "action_name",
      header: "Nama",
      render: (item) => item.action_name,
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
                      confirmTitle: `Hapus data action '${item.action_name}'?`,
                      confirmMessage:
                        "Hapus data ini? Tindakan ini tidak bisa dibatalkan.",
                    },
                  ]
                : []),
              ...(access.canActive && item.status_code === "ACTIVE"
                ? [
                    {
                      label: "Nonaktfikan",
                      onClick: () => remove(item.id),
                      confirmTitle: `Nonaktifkan data action '${item.action_name}'?`,
                      confirmMessage:
                        "Nonaktifkan data ini? Tindakan ini tidak bisa dibatalkan.",
                    },
                  ]
                : []),
              ...(access.canActive && item.status_code !== "ACTIVE"
                ? [
                    {
                      label: "Aktifkan",
                      onClick: () => remove(item.id),
                      confirmTitle: `Nonaktifkan data action '${item.action_name}'?`,
                      confirmMessage:
                        "Nonaktifkan data ini? Tindakan ini tidak bisa dibatalkan.",
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
  if (!access.canView) return <ForbiddenView title="Action" />;

  return (
    <AppLayout
      title="Daftar Action"
      description="Menampilkan daftar action yang tersedia untuk module."
    >
      <AppDataTable
        columns={tableColumns}
        rows={items}
        getRowKey={(row) => row.id}
        isLoading={isLoadingItems}
        query={{
          search,
          searchPlaceholder: "Cari nama action",
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
          />
        }
        pagination={{
          totalItems: total,
          currentPage: page,
          perPage,
          perPageOptions: [5, 10, 15],
          onPerPageChange: (value) => {
            setPerPage(value);
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
