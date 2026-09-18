import { SubmitEvent, useEffect, useState } from "react";
import { notifyFailed, notifySuccess } from "@/lib/notify";
import { getErrorMessage } from "@/lib/error-message";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { AppSheet } from "@/components/ui/app-sheet";
import { TableRowActionMenu } from "@/components/table-row-action-menu";
import {
  AppDataTable,
  type AppDataTableColumn,
} from "@/components/ui/app-data-table";
import {
  useCreateUser,
  useDeleteUser,
  useRoleOptions,
  useUpdateUser,
  useUsers,
} from "./hook";
import { UserItem } from "./handler";
import { useMenuAccess } from "@/hooks/use-menu-access";
import { ForbiddenView } from "@/components/forbidden-view";
import { AppLayout } from "@/components/app-layout";
import { PlusIcon } from "@phosphor-icons/react";

export default function UserPage() {
  const [id, setId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tableFilters, setTableFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const access = useMenuAccess("/user");
  const { data, isLoading: isLoadingUsers } = useUsers({
    page,
    perPage,
    q: debouncedSearch,
  });
  const users = data?.items ?? [];
  const { data: roles = [], isLoading: isLoadingRoles } = useRoleOptions();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const isSubmitting =
    createUserMutation.isPending || updateUserMutation.isPending;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [search]);

  const reset = () => {
    setId(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setSelectedRoleId("");
  };
  const edit = (user: UserItem) => {
    setId(user.id);
    setUsername(user.username);
    setEmail(user.email);
    setPassword("");
    setSelectedRoleId(user.role.id);
    setOpen(true);
  };

  const submit = async (e: SubmitEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await updateUserMutation.mutateAsync({
          id,
          payload: {
            username,
            email,
            user_type_id: selectedRoleId,
            ...(password ? { password } : {}),
          },
        });
        notifySuccess({
          title: "Berhasil",
          description: "User berhasil diperbarui",
        });
      } else {
        await createUserMutation.mutateAsync({
          username,
          email,
          password,
          user_type_id: selectedRoleId,
        });
        notifySuccess({
          title: "Berhasil",
          description: "User berhasil ditambahkan",
        });
      }
      setOpen(false);
      reset();
    } catch (error) {
      notifyFailed({
        title: "Failed",
        description: getErrorMessage(error, "Gagal menyimpan user"),
      });
    }
  };

  const remove = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      notifySuccess({
        title: "Berhasil",
        description: "User berhasil dihapus",
      });
    } catch (error) {
      notifyFailed({
        title: "Failed",
        description: getErrorMessage(error, "Gagal menghapus user"),
      });
    }
  };

  const tableColumns: AppDataTableColumn<UserItem>[] = buildColumns(
    access,
    edit,
    remove,
  );

  if (access.isLoading)
    return <p className="text-sm text-gray-400">Memuat hak akses...</p>;
  if (!access.canView) return <ForbiddenView title="User" />;

  return (
    <AppLayout
      title="Daftar User"
      description="Menampilkan informasi user yang sudah terdaftar."
    >
      <AppDataTable
        columns={tableColumns}
        rows={users}
        getRowKey={(row) => row.id}
        isLoading={isLoadingUsers}
        query={{
          search,
          searchPlaceholder: "Search username / email",
          onSearchChange: (value) => setSearch(value),
          filters: tableFilters,
          onFiltersChange: (value) => {
            setTableFilters(value);
            setPage(1);
          },
        }}
        actionButton={
          access.canAdd || access.canEdit ? (
            <Sheet
              open={open}
              onOpenChange={(value) => {
                setOpen(value);
                if (!value) reset();
              }}
            >
              {access.canAdd ? (
                <SheetTrigger
                  render={<Button variant="primary" className="py-4 px-5" />}
                  onClick={() => reset()}
                >
                  <PlusIcon />
                  Tambah User
                </SheetTrigger>
              ) : null}
              <AppSheet
                title={id ? "Edit User" : "Tambah User"}
                description="Kelola data user dan role yang digunakan."
                size="md"
                closeLabel="Batalkan"
                actionLabel={getActionLabel(isSubmitting, Boolean(id))}
                actionType="submit"
                actionForm="user-form"
                actionDisabled={isSubmitting || isLoadingRoles}
              >
                <form id="user-form" className="space-y-3" onSubmit={submit}>
                  <FormField
                    id="user-username"
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <FormField
                    id="user-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <FormField
                    id="user-password"
                    label={id ? "Password baru (opsional)" : "Password"}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!id}
                  />
                  <FormField
                    id="user-role"
                    label="Role"
                    type="select"
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    options={roles.map((role) => ({
                      label: `${role.name} (${role.code})`,
                      value: role.id,
                    }))}
                    placeholder={
                      isLoadingRoles ? "Memuat role..." : "Pilih role"
                    }
                    disabled={isLoadingRoles}
                    required
                  />
                </form>
              </AppSheet>
            </Sheet>
          ) : null
        }
        pagination={{
          totalItems: data?.total ?? 0,
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

function buildColumns(
  access: { canEdit: boolean; canDelete: boolean },
  edit: (user: UserItem) => void,
  remove: (userId: string) => Promise<void>,
): AppDataTableColumn<UserItem>[] {
  return [
    {
      key: "username",
      header: "Username",
      filter: { type: "text", placeholder: "Filter username" },
      render: (user) => user.username,
    },
    {
      key: "email",
      header: "Email",
      filter: { type: "text", placeholder: "Filter email" },
      render: (user) => user.email,
    },
    {
      key: "role",
      header: "Role",
      filter: { type: "text", placeholder: "Filter role" },
      render: (user) => user.role?.name ?? "Tanpa role",
    },
    {
      key: "action",
      header: "Action",
      className: "text-right",
      render: (user) => (
        <div className="text-right">
          <TableRowActionMenu
            items={[
              ...(access.canEdit
                ? [{ label: "Edit", onClick: () => edit(user) }]
                : []),
              ...(access.canDelete
                ? [
                    {
                      label: "Hapus",
                      onClick: () => remove(user.id),
                      destructive: true,
                      confirmMessage:
                        "Hapus user ini? Tindakan ini tidak bisa dibatalkan.",
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];
}
