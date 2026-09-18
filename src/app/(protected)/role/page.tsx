import { SubmitEvent, useEffect, useState } from "react";
import { notifyFailed, notifySuccess } from "@/lib/notify";
import { getErrorMessage } from "@/lib/error-message";
import { AppLayout } from "@/components/app-layout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { AppSheet } from "@/components/ui/app-sheet";
import { TableRowActionMenu } from "@/components/table-row-action-menu";
import {
  AppDataTable,
  type AppDataTableColumn,
} from "@/components/ui/app-data-table";
import { RoleItem } from "./handler";
import { useCreateRole, useDeleteRole, useRoles, useUpdateRole } from "./hook";
import { useMenuAccess } from "@/hooks/use-menu-access";
import { ForbiddenView } from "@/components/forbidden-view";
import { PlusIcon } from "@phosphor-icons/react";

export default function RolePage() {
  const [id, setId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tableFilters, setTableFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [perPage, setPerPage] = useState(15);

  const access = useMenuAccess("/role");
  const { data, isLoading: isLoadingItems } = useRoles({
    page,
    limit: perPage,
    name: debouncedSearch || undefined,
    ...tableFilters,
  });

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();
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
    setCode("");
    setName("");
    setCategory(false);
  };

  const submit = async (e: SubmitEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await updateMutation.mutateAsync({
          id,
          payload: {
            id: code,
            label: name,
            user_type_show_on_register: category,
          },
        });
        notifySuccess({
          title: "Berhasil",
          description: "Role berhasil diperbarui",
        });
      } else {
        await createMutation.mutateAsync({
          id: code,
          label: name,
          user_type_show_on_register: category,
        });
        notifySuccess({
          title: "Berhasil",
          description: "Role berhasil ditambahkan",
        });
      }
      reset();
    } catch (error) {
      notifyFailed({
        title: "Failed",
        description: getErrorMessage(error, "Gagal menyimpan role"),
      });
    }
  };

  const edit = (item: RoleItem) => {
    setId(item.id);
    setCode(item.id);
    setName(item.label);
    setCategory(item.user_type_show_on_register);
  };

  const remove = async (itemId: string) => {
    try {
      await deleteMutation.mutateAsync(itemId);
      notifySuccess({
        title: "Berhasil",
        description: "Role berhasil dihapus",
      });
      if (id === itemId) reset();
    } catch (error) {
      notifyFailed({
        title: "Failed",
        description: getErrorMessage(error, "Gagal menghapus role"),
      });
    }
  };

  const tableColumns: AppDataTableColumn<RoleItem>[] = [
    {
      key: "name",
      header: "Nama",
      render: (item) => item.name,
    },
    {
      key: "category",
      header: "Kategori",
      filter: {
        type: "select",
        options: [
          { label: "Internal", value: 0 },
          { label: "External", value: 1 },
        ],
      },
      render: (item) => (item.category ? "External" : "Internal"),
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
                ? [
                    {
                      label: "Edit",
                      onClick: () => {
                        edit(item);
                        setOpen(true);
                      },
                    },
                  ]
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
  if (!access.canView) return <ForbiddenView title="Role" />;

  return (
    <AppLayout
      title="Daftar Role"
      description="Menampilkan daftar role internal dan external."
    >
      <Sheet
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) reset();
        }}
      >
        <SheetTrigger className="hidden" />
        <AppSheet
          title={id ? "Edit Role" : "Tambah Role"}
          description="Kelola role internal dan external."
          size="md"
          closeLabel="Batalkan"
          actionLabel={getActionLabel(isSubmitting, Boolean(id))}
          actionType="submit"
          actionForm="role-form"
          actionDisabled={isSubmitting || !canSubmit}
        >
          <form id="role-form" className="space-y-3" onSubmit={submit}>
            <FormField
              id="role-code"
              label="Kode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <FormField
              id="role-name"
              label="Nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {/* <FormField
              id="role-category"
              label="Kategori"
              type="select"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as "internal" | "external")
              }
              options={[
                { label: "Internal", value: false },
                { label: "External", value: true },
              ]}
              required
            /> */}
          </form>
        </AppSheet>
      </Sheet>
      <AppDataTable
        columns={tableColumns}
        rows={data ?? []}
        getRowKey={(row) => row.id}
        isLoading={isLoadingItems}
        query={{
          search,
          searchPlaceholder: "Search nama",
          onSearchChange: (value) => setSearch(value),
          filters: tableFilters,
          onFiltersChange: (value) => {
            setTableFilters(value);
            setPage(1);
          },
        }}
        actionButton={
          access.canAdd ? (
            <Button
              variant="primary"
              onClick={() => {
                reset();
                setId(null);
                setOpen(true);
              }}
              className="px-4 py-5"
            >
              <PlusIcon />
              Tambah Role
            </Button>
          ) : null
        }
        pagination={{
          // totalItems: data?.total ?? 0,
          totalItems: data?.length ?? 0,
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
    </AppLayout>
  );
}

function getActionLabel(isSubmitting: boolean, isEditMode: boolean): string {
  if (isSubmitting) return "Menyimpan...";
  if (isEditMode) return "Perbarui";
  return "Simpan";
}
