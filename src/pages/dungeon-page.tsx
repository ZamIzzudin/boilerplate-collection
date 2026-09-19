import { DotsThreeOutlineIcon, InfoIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { z } from "zod";

const PORT_DEMO_OPTIONS = [
  { label: "Pelabuhan Tanjung Priok", value: "1" },
  { label: "Pelabuhan Tanjung Perak", value: "2" },
  { label: "Pelabuhan Belawan", value: "3" },
  { label: "Pelabuhan Makassar", value: "4" },
  { label: "Pelabuhan Bitung", value: "5" },
];
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { FormField } from "@/components/ui/form-field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { AppSheet } from "@/components/ui/app-sheet";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { NotificationToast } from "@/components/ui/notification-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { notifyFailed, notifySuccess, notifyWarning } from "@/lib/notify";
import { ACTION_CODES } from "@/lib/action-codes";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { AlertMessage } from "@/components/ui/alert-message";
import { TableRowActionMenu } from "@/components/table-row-action-menu";
import { ForbiddenView } from "@/components/forbidden-view";
import { AppSidebar } from "@/components/app-sidebar";
import type { SidebarMenu } from "@/types";
import {
  AppDataTable,
  type AppDataTableColumn,
} from "@/components/ui/app-data-table";

const validationSchema = z.object({
  email: z.email("Format email tidak valid"),
  role: z.string().min(1, "Role wajib dipilih"),
});

const variants = [
  "default",
  "primary",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "warning",
  "link",
] as const;
const sizes = ["xs", "sm", "default", "lg"] as const;

type PortRow = {
  id: string;
  name: string;
  code: string;
  province: string;
  city: string;
};

const basePortRows: Omit<PortRow, "id">[] = [
  {
    name: "Tanjung Pandan",
    code: "TJQ",
    province: "Kepulauan Bangka Belitung",
    city: "Kab. Belitung",
  },
  { name: "Sorong", code: "SRG", province: "Papua Barat", city: "Kota Sorong" },
  {
    name: "Calabai",
    code: "CBR",
    province: "Nusa Tenggara Barat",
    city: "Kab. Dompu",
  },
  {
    name: "Malahayati",
    code: "MLH",
    province: "Aceh",
    city: "Kab. Simeulue",
  },
  {
    name: "Wonosobo",
    code: "WSB",
    province: "Jawa Tengah",
    city: "Kab. Wonosobo",
  },
];

const totalPortRows = 32;
const portRows: PortRow[] = Array.from(
  { length: totalPortRows },
  (_, index) => {
    const base = basePortRows[index % basePortRows.length];
    return {
      id: String(index + 1),
      ...base,
    };
  },
);

const portColumns: AppDataTableColumn<PortRow>[] = [
  {
    key: "name",
    header: "Nama Pelabuhan",
    filter: { type: "text", placeholder: "Cari nama pelabuhan" },
    render: (row) => (
      <div className="space-y-1">
        <button
          type="button"
          className="font-semibold text-[#1876d3] underline-offset-2 hover:underline"
        >
          {row.name}
        </button>
        <p className="text-xs text-[#738496]">{row.code}</p>
      </div>
    ),
  },
  {
    key: "province",
    header: "Provinsi",
    filter: { type: "text", placeholder: "Cari provinsi" },
    render: (row) => <span className="font-medium">{row.province}</span>,
  },
  {
    key: "city",
    header: "Kota/Kabupaten",
    filter: {
      type: "select",
      options: [
        { label: "Kab. Belitung", value: "Kab. Belitung" },
        { label: "Kota Sorong", value: "Kota Sorong" },
        { label: "Kab. Dompu", value: "Kab. Dompu" },
        { label: "Kab. Simeulue", value: "Kab. Simeulue" },
        { label: "Kab. Wonosobo", value: "Kab. Wonosobo" },
      ],
    },
    render: (row) => <span className="font-medium">{row.city}</span>,
  },
  {
    key: "action",
    header: "Aksi",
    className: "text-right",
    render: () => (
      <div className="flex justify-end">
        <TableRowActionMenu
          items={[
            {
              label: "Approve",
              onClick: () =>
                notifySuccess({
                  title: "Approve",
                  description: "Item disetujui",
                }),
            },
            {
              label: "Edit",
              onClick: () =>
                notifySuccess({ title: "Edit", description: "Item diedit" }),
            },
            {
              label: "Lengkapi",
              onClick: () =>
                notifySuccess({
                  title: "Lengkapi",
                  description: "Item dilengkapi",
                }),
            },
            {
              label: "Aktifkan",
              onClick: () =>
                notifySuccess({
                  title: "Aktifkan",
                  description: "Item diaktifkan",
                }),
            },
            {
              label: "Nonaktifkan",
              destructive: true,
              confirmMessage: "Yakin ingin menonaktifkan item ini?",
              onClick: () =>
                notifyWarning({
                  title: "Nonaktifkan",
                  description: "Item dinonaktifkan",
                }),
            },
            {
              label: "Download",
              onClick: () =>
                notifySuccess({
                  title: "Download",
                  description: "File diunduh",
                }),
            },
            {
              label: "Hapus",
              destructive: true,
              confirmMessage: "Yakin ingin menghapus item ini?",
              onClick: () =>
                notifyFailed({ title: "Hapus", description: "Item dihapus" }),
            },
          ]}
        />
      </div>
    ),
  },
];

const sidebarPreviewMenus: SidebarMenu[] = [
  {
    code: "module-1",
    name: "Dokter",
    path: null,
    icon: "Users",
    sortOrder: 0,
    actions: [{ code: ACTION_CODES.VIEW, name: "view" }],
    isGroup: false,
    subMenus: [
      {
        code: "module-1-1",
        name: "Data Dokter",
        path: "/dokter/data",
        icon: "Users",
        sortOrder: 0,
        actions: [{ code: ACTION_CODES.VIEW, name: "view" }],
        subMenus: [],
        isGroup: false,
      },
    ],
  },
  {
    code: "module-2",
    name: "Pelabuhan",
    path: "/pelabuhan",
    icon: "Database",
    sortOrder: 1,
    actions: [{ code: ACTION_CODES.VIEW, name: "view" }],
    subMenus: [],
    isGroup: false,
  },
];

export default function DungeonPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMenuSearch, setSidebarMenuSearch] = useState("");
  const [sidebarOpenMenus, setSidebarOpenMenus] = useState<
    Record<string, boolean>
  >({});
  const [tablePage, setTablePage] = useState(1);
  const [tablePerPage, setTablePerPage] = useState(5);
  const [tableSearch, setTableSearch] = useState("");
  const [tableFilters, setTableFilters] = useState<Record<string, string>>({});
  const [validationForm, setValidationForm] = useState({
    email: "",
    role: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<"email" | "role", string>>
  >({});
  const [alertPreview, setAlertPreview] = useState<{
    open: boolean;
    tone: "success" | "warning" | "failed" | "info";
    title: string;
    description: string;
  }>({ open: false, tone: "info", title: "", description: "" });

  // Demo paginated dropdown untuk master data
  const [portDemoSearch, setPortDemoSearch] = useState("");
  const portDemoLoading = false;
  const portDemoOptions = useMemo(
    () =>
      PORT_DEMO_OPTIONS.filter((option) =>
        option.label.toLowerCase().includes(portDemoSearch.toLowerCase()),
      ),
    [portDemoSearch],
  );
  const loadMorePortDemo = () => {};
  const [portDemoSelected, setPortDemoSelected] = useState("");

  const sidebarVisibleMenus = sidebarPreviewMenus
    .map((item) => ({
      ...item,
      subMenus: item.subMenus.filter((sub) =>
        sub.actions.some((a) => a.code === ACTION_CODES.VIEW),
      ),
    }))
    .filter(
      (item) =>
        item.actions.some((a) => a.code === ACTION_CODES.VIEW) ||
        item.subMenus.length > 0,
    )
    .filter((item) => {
      if (!sidebarMenuSearch.trim()) return true;
      const query = sidebarMenuSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.subMenus.some((sub) => sub.name.toLowerCase().includes(query))
      );
    });

  const filteredPortRows = useMemo(() => {
    return portRows.filter((row) => {
      const searchQuery = tableSearch.trim().toLowerCase();
      if (searchQuery) {
        const searchable =
          `${row.name} ${row.code} ${row.province} ${row.city}`.toLowerCase();
        if (!searchable.includes(searchQuery)) return false;
      }

      if (tableFilters.name) {
        if (!row.name.toLowerCase().includes(tableFilters.name.toLowerCase()))
          return false;
      }

      if (tableFilters.province) {
        if (
          !row.province
            .toLowerCase()
            .includes(tableFilters.province.toLowerCase())
        )
          return false;
      }

      if (tableFilters.city) {
        if (row.city !== tableFilters.city) return false;
      }

      return true;
    });
  }, [
    tableFilters.city,
    tableFilters.name,
    tableFilters.province,
    tableSearch,
  ]);

  const tableTotalPages = Math.max(
    1,
    Math.ceil(filteredPortRows.length / tablePerPage),
  );
  const pagedPortRows = filteredPortRows.slice(
    (tablePage - 1) * tablePerPage,
    tablePage * tablePerPage,
  );

  const handleValidationPreview = () => {
    const result = validationSchema.safeParse(validationForm);

    if (!result.success) {
      const nextErrors: Partial<Record<"email" | "role", string>> = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as "email" | "role";
        nextErrors[field] = issue.message;
      }

      setValidationErrors(nextErrors);
      return;
    }

    setValidationErrors({});
    notifySuccess({
      title: "Validasi berhasil",
      description: "Contoh form validasi pada FormField lolos.",
    });
  };

  return (
    <div className="space-y-6 px-6">
      <Card>
        <CardHeader>
          <CardTitle>Component Inventory (src/components)</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sidebar</CardTitle>
        </CardHeader>
        <CardContent className="rounded-lg border border-dashed border-primary p-4">
          <div className="overflow-hidden rounded-lg border">
            <AppSidebar
              collapsed={sidebarCollapsed}
              menuSearch={sidebarMenuSearch}
              pathname="/dokter/data"
              visibleMenus={sidebarVisibleMenus}
              openMenus={sidebarOpenMenus}
              onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
              onMenuSearchChange={setSidebarMenuSearch}
              onToggleMenu={(menuCode, isOpen) =>
                setSidebarOpenMenus((prev) => ({
                  ...prev,
                  [menuCode]: !isOpen,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App Data Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-medium text-[#2f3e4b]">Daftar Pelabuhan</p>
          <AppDataTable
            columns={portColumns}
            rows={pagedPortRows}
            getRowKey={(row) => row.id}
            query={{
              search: tableSearch,
              searchPlaceholder: "Cari nama pelabuhan",
              onSearchChange: (value) => {
                setTableSearch(value);
                setTablePage(1);
              },
              filters: tableFilters,
              onFiltersChange: (value) => {
                setTableFilters(value);
                setTablePage(1);
              },
            }}
            pagination={{
              totalItems: filteredPortRows.length,
              currentPage: tablePage,
              perPage: tablePerPage,
              perPageOptions: [5, 10, 15],
              onPerPageChange: (value) => {
                setTablePerPage(value);
                setTablePage(1);
              },
              onPageChange: (value) => {
                if (value < 1 || value > tableTotalPages) return;
                setTablePage(value);
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Button</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-brand-primary">Sizing</p>
            <div className="flex flex-wrap gap-3 rounded-lg border border-dashed border-primary p-4">
              {sizes.map((size) => (
                <Button key={size} size={size} variant="primary">
                  {size}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-brand-primary">Variant</p>
            <div className="grid gap-3 rounded-lg border border-dashed border-primary p-4 md:grid-cols-3">
              {variants.map((variant) => (
                <Button
                  key={variant}
                  className="w-full py-5 capitalize"
                  variant={variant}
                >
                  {variant}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tag / Chip</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 items-center justify-center">
          <Tag variant="success" size="sm">
            Success
          </Tag>
          <Tag variant="warning">Warning</Tag>
          <Tag variant="failed">Failed</Tag>
          <Tag variant="disabled">Disabled</Tag>
          <Tag variant="info" size="lg">
            Info
          </Tag>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Types</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 rounded-lg border border-dashed border-primary p-4 md:grid-cols-2">
          <FormField
            id="field-text"
            label="Text"
            type="text"
            placeholder="Masukkan teks"
          />
          <FormField
            id="field-number"
            label="Input Number"
            type="number"
            placeholder="0"
          />
          <FormField
            id="field-number-addon-left"
            label="Number Addon Left"
            type="number"
            placeholder="0"
            addonStart="Rp"
          />
          <FormField
            id="field-number-addon-right"
            label="Number Addon Right"
            type="number"
            placeholder="0"
            addonEnd="/kg"
          />
          <FormField
            id="field-number-addon-both"
            label="Number Addon Both"
            type="number"
            placeholder="0"
            addonStart="Rp"
            addonEnd="/ekor"
          />
          <FormField
            id="field-select"
            label="Dropdown / Select"
            type="select"
            options={[
              { label: "Pilih role", value: "" },
              { label: "Admin", value: "admin" },
              { label: "Editor", value: "editor" },
              { label: "Viewer", value: "viewer" },
            ]}
          />
          <FormField
            id="field-combobox"
            label="Combobox (Searchable)"
            type="select"
            searchable
            placeholder="Ketik untuk mencari..."
            options={[
              { label: "Admin", value: "admin" },
              { label: "Editor", value: "editor" },
              { label: "Viewer", value: "viewer" },
              { label: "Manager", value: "manager" },
            ]}
          />
          <FormField id="field-date" label="Date" type="date" />
          <FormField id="field-month" label="Month" type="month" />
          <FormField
            id="field-datetime"
            label="Date Time"
            type="datetime-local"
          />
          <FormField
            id="field-textarea"
            label="Text Area"
            type="textarea"
            placeholder="Tulis deskripsi"
            className="md:col-span-2"
          />
          <FormField
            id="field-checkbox"
            label="Checkbox"
            type="checkbox"
            placeholder="Saya menyetujui syarat dan ketentuan"
            className="md:col-span-2"
          />
          <FormField
            id="field-hidden"
            label="Hidden Field"
            type="text"
            hidden
            placeholder="Tidak tampil"
          />

          <div className="md:col-span-2 rounded-lg border border-dashed border-primary p-4 space-y-3">
            <p className="text-sm font-medium text-brand-primary">
              Validasi FormField (Preview)
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                id="field-validation-email"
                label="Email"
                type="email"
                placeholder="contoh@email.com"
                value={validationForm.email}
                onChange={(e) => {
                  setValidationForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));
                  setValidationErrors((prev) => ({
                    ...prev,
                    email: undefined,
                  }));
                }}
                required
                error={validationErrors.email}
              />
              <FormField
                id="field-validation-role"
                label="Role"
                type="select"
                placeholder="Pilih role"
                value={validationForm.role}
                onChange={(e) => {
                  setValidationForm((prev) => ({
                    ...prev,
                    role: e.target.value,
                  }));
                  setValidationErrors((prev) => ({ ...prev, role: undefined }));
                }}
                options={[
                  { label: "Pilih role", value: "" },
                  { label: "Admin", value: "admin" },
                  { label: "Editor", value: "editor" },
                  { label: "Viewer", value: "viewer" },
                ]}
                required
                error={validationErrors.role}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleValidationPreview}
            >
              Cek Validasi
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Types (Disabled)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 rounded-lg border border-dashed border-primary p-4 md:grid-cols-2">
          <FormField
            id="field-text-disabled"
            label="Text"
            type="text"
            placeholder="Masukkan teks"
            disabled
          />
          <FormField
            id="field-number-disabled"
            label="Input Number"
            type="number"
            placeholder="0"
            disabled
          />
          <FormField
            id="field-number-addon-left-disabled"
            label="Number Addon Left"
            type="number"
            placeholder="0"
            addonStart="Rp"
            disabled
          />
          <FormField
            id="field-number-addon-right-disabled"
            label="Number Addon Right"
            type="number"
            placeholder="0"
            addonEnd="/kg"
            disabled
          />
          <FormField
            id="field-number-addon-both-disabled"
            label="Number Addon Both"
            type="number"
            placeholder="0"
            addonStart="Rp"
            addonEnd="/ekor"
            disabled
          />
          <FormField
            id="field-select-disabled"
            label="Dropdown / Select"
            type="select"
            options={[
              { label: "Pilih role", value: "" },
              { label: "Admin", value: "admin" },
              { label: "Editor", value: "editor" },
              { label: "Viewer", value: "viewer" },
            ]}
            disabled
          />
          <FormField
            id="field-combobox-disabled"
            label="Combobox (Searchable)"
            type="select"
            searchable
            placeholder="Ketik untuk mencari..."
            options={[
              { label: "Admin", value: "admin" },
              { label: "Editor", value: "editor" },
              { label: "Viewer", value: "viewer" },
              { label: "Manager", value: "manager" },
            ]}
            disabled
          />
          <FormField
            id="field-date-disabled"
            label="Date"
            type="date"
            disabled
          />
          <FormField
            id="field-month-disabled"
            label="Month"
            type="month"
            disabled
          />
          <FormField
            id="field-datetime-disabled"
            label="Date Time"
            type="datetime-local"
            disabled
          />
          <FormField
            id="field-textarea-disabled"
            label="Text Area"
            type="textarea"
            placeholder="Tulis deskripsi"
            className="md:col-span-2"
            disabled
          />
          <FormField
            id="field-checkbox-disabled"
            label="Checkbox"
            type="checkbox"
            placeholder="Saya menyetujui syarat dan ketentuan"
            className="md:col-span-2"
            disabled
          />
          <FormField
            id="field-email-disabled"
            label="Email"
            type="email"
            placeholder="contoh@email.com"
            disabled
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paginated Dropdown (Infinite Scroll)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-400">
            Contoh dropdown yang menampilkan 10 data per halaman. Saat discroll
            ke bawah, halaman berikutnya akan di-fetch dan ditambahkan ke daftar
            (data lama tetap, tidak ditimpa). Mendukung pencarian dengan
            debounce 300ms. Sumber data: master pelabuhan dari endpoint{" "}
            <code>/port?type=list</code>.
          </p>
          <div className="max-w-sm">
            <FormField
              id="field-paginated-port"
              label="Pilih Pelabuhan"
              type="select"
              placeholder="Cari / pilih pelabuhan"
              value={portDemoSelected}
              options={portDemoOptions}
              loading={portDemoLoading}
              searchable
              onSearchChange={setPortDemoSearch}
              onScrollToBottom={loadMorePortDemo}
              onChange={(e) => setPortDemoSelected(e.target.value)}
            />
            <p className="mt-2 text-xs text-gray-400">
              Total opsi dimuat: {portDemoOptions.length} pelabuhan
              {portDemoLoading ? " (memuat...)" : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatar & Card</CardTitle>
          <CardAction>
            <Button size="sm" variant="outline">
              Card Action
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <AvatarGroup>
            <Avatar>
              <AvatarImage
                src="https://i.pravatar.cc/80?img=12"
                alt="avatar-1"
              />
              <AvatarFallback>AA</AvatarFallback>
              <AvatarBadge />
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>BB</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+4</AvatarGroupCount>
          </AvatarGroup>
        </CardContent>
        <CardFooter>
          <span className="text-xs text-gray-400">
            CardFooter styling preview
          </span>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dropdown, Sheet, Alert Dialog</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline">Open Menu</Button>}
            />
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Hapus</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger
              render={<Button variant="outline">Open Sheet</Button>}
            />
            <AppSheet
              title="Contoh App Sheet"
              description="Ini preview komponen sheet reusable dengan header + footer action."
              size="lg"
              closeLabel="Tutup"
              actionLabel="Simpan"
              onActionClick={() =>
                notifySuccess({
                  title: "Sheet Action",
                  description: "Action button dari AppSheet terpanggil",
                })
              }
            >
              <div className="space-y-2 text-sm text-gray-400">
                <p>Contoh body sheet.</p>
                <p>
                  Ubah <code>size</code> ke <code>sm</code>, <code>md</code>,{" "}
                  <code>lg</code>, <code>xl</code>, atau <code>full</code>.
                </p>
              </div>
            </AppSheet>
          </Sheet>

          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="outline">Open Alert</Button>}
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi</AlertDialogTitle>
                <AlertDialogDescription>
                  Preview alert-dialog global.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction>Lanjut</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accordion / Collapse</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion multiple defaultValue={["acc-1"]}>
            <AccordionItem value="acc-1">
              <AccordionTrigger>Item pertama (terbuka)</AccordionTrigger>
              <AccordionContent>
                <p>
                  Konten item pertama. Bisa digunakan untuk mengelompokkan form
                  atau informasi terkait.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="acc-2">
              <AccordionTrigger>Item kedua</AccordionTrigger>
              <AccordionContent>
                <p>Konten item kedua.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="acc-3">
              <AccordionTrigger>Item ketiga</AccordionTrigger>
              <AccordionContent>
                <p>Konten item ketiga.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Snackbar / Toast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 rounded-lg border border-dashed border-primary p-4">
          <NotificationToast
            id="success-preview"
            type="success"
            title="Title here"
            description="Subtitle here Subtitle here Subtitle here"
          />
          <NotificationToast
            id="warning-preview"
            type="warning"
            title="Title here"
            description="Subtitle here Subtitle here Subtitle here"
          />
          <NotificationToast
            id="failed-preview"
            type="failed"
            title="Title here"
            description="Subtitle here Subtitle here Subtitle here"
          />
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() =>
                notifySuccess({
                  title: "Berhasil",
                  description: "Data berhasil disimpan",
                })
              }
            >
              Trigger Success
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                notifyWarning({
                  title: "Warning",
                  description: "Periksa kembali input Anda",
                })
              }
            >
              Trigger Warning
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                notifyFailed({
                  title: "Failed",
                  description: "Gagal memproses permintaan",
                })
              }
            >
              Trigger Failed
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Composite Components</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <ConfirmActionButton
            triggerLabel="Success Confirm"
            confirmLabel="Action Here"
            loadingLabel="Memproses..."
            title="Title here"
            description="Subtitle here subtitle here"
            tone="success"
            variant="outline"
            onConfirm={async () => {}}
          />
          <ConfirmActionButton
            triggerLabel="Warning Confirm"
            confirmLabel="Action Here"
            loadingLabel="Memproses..."
            title="Title here"
            description="Subtitle here subtitle here"
            tone="warning"
            variant="outline"
            onConfirm={async () => {}}
          />
          <ConfirmActionButton
            triggerLabel="Failed Confirm"
            confirmLabel="Action Here"
            loadingLabel="Memproses..."
            title="Title here"
            description="Subtitle here subtitle here"
            tone="failed"
            variant="outline"
            onConfirm={async () => {}}
          />
          <ConfirmActionButton
            triggerLabel="Info Confirm"
            confirmLabel="Action Here"
            loadingLabel="Memproses..."
            title="Title here"
            description="Subtitle here subtitle here"
            tone="info"
            variant="outline"
            onConfirm={async () => {}}
          />
          <ConfirmActionButton
            triggerLabel="With Reason"
            confirmLabel="Action Here"
            loadingLabel="Memproses..."
            title="Title here"
            description="Subtitle here subtitle here"
            tone="warning"
            variant="outline"
            reasonLabel="Alasan"
            reasonPlaceholder="Masukkan alasan Anda"
            reasonRequired
            onConfirm={async (reason) => {
              notifySuccess({
                title: "Reason submitted",
                description: reason ?? "No reason",
              });
            }}
          />
          <TableRowActionMenu
            items={[
              {
                label: "Detail",
                onClick: () =>
                  notifySuccess({
                    title: "Detail",
                    description: "Aksi detail dijalankan",
                  }),
              },
              {
                label: "Delete",
                destructive: true,
                confirmMessage: "Yakin ingin menghapus item ini?",
                onClick: () =>
                  notifyFailed({
                    title: "Deleted",
                    description: "Item berhasil dihapus",
                  }),
              },
            ]}
          />
          <Button variant="ghost" size="icon">
            <DotsThreeOutlineIcon className="size-4" />
          </Button>
        </CardContent>
      </Card>

      <ForbiddenView title="Preview Forbidden View" />

      <Card>
        <CardContent className="flex items-start gap-2 py-4 text-xs text-gray-400">
          <InfoIcon className="mt-0.5 size-3.5" />
          Komponen berbasis data/session seperti login-form, dashboard-shell,
          query-provider, dan map tidak dipasang langsung di preview ini untuk
          menghindari side effect API/session saat buka dungeon.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Alert Message</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {(
            [
              {
                tone: "success",
                title: "Berhasil",
                description: "Data berhasil disimpan",
              },
              {
                tone: "warning",
                title: "Peringatan",
                description: "Pastikan data sudah benar",
              },
              {
                tone: "failed",
                title: "Gagal",
                description: "Terjadi kesalahan saat memproses",
              },
              {
                tone: "info",
                title: "Informasi",
                description: "Silakan cek kembali data Anda",
              },
            ] as const
          ).map((item) => (
            <Button
              key={item.tone}
              variant="outline"
              onClick={() =>
                setAlertPreview({
                  open: true,
                  tone: item.tone,
                  title: item.title,
                  description: item.description,
                })
              }
            >
              {item.tone.charAt(0).toUpperCase() + item.tone.slice(1)}
            </Button>
          ))}
        </CardContent>
      </Card>

      <AlertMessage
        open={alertPreview.open}
        onOpenChange={(open) => setAlertPreview((prev) => ({ ...prev, open }))}
        title={alertPreview.title}
        description={alertPreview.description}
        tone={alertPreview.tone}
        onConfirm={() => setAlertPreview((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
