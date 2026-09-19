# API Contract — Modul Auth & RBAC

Dokumen ini adalah **kontrak API wajib** antara boilerplate `react-vite` (frontend) dan `express` (backend), sekaligus acuan bila Anda membuat boilerplate backend baru dengan stack lain. Semua boilerplate frontend/backend di repo ini **wajib** mengimplementasikan kontrak ini agar saling kompatibel.

## Konvensi Umum

| Aspek | Ketentuan |
|---|---|
| Base path | Frontend memanggil via proxy `/api` (dev) atau `VITE_API_BASE_URL_NEW` (prod) |
| Auth | **httpOnly cookie** (`withCredentials`). Tidak ada header `Authorization` |
| Envelope sukses | `{ "status": <number>, "message": <string>, "data": <payload> }` |
| Envelope error | `{ "status": <number>, "message": <string>, "errors": { "<field>": "<msg>" } }` (422 validasi) |
| Paginasi (list type `page`) | `{ "data": { "records": [...], "records_total": <n>, "page_total": <n> } }` |
| Header `x-perm-version` | Dikirim pada endpoint auth & semua response terproteksi. Frontend membandingkan nilai ini untuk auto-refresh privilege |
| List params umum | `?type=list\|page&page=&limit=&<nama_field>=<filter>` |

## Enkripsi Payload (AES-256-CBC)

Frontend (`src/lib/crypto.ts`) mengenkripsi payload sensitif dan menaruhnya di body `{ "data": "<ciphertext>" }`. Token pada URL email (`/reset/:token`, `/activation/:token`) juga berbentuk ciphertext yang dibuat backend.

Spesifikasi (harus identik di kedua sisi):

1. Key = `APP_KEY` (`VITE_APP_KEY` di frontend). Prefix `base64:` → decode base64; selain itu raw UTF-8. Potong/pad ke ukuran key (16/24/32 byte).
2. `AES-256-CBC`, padding `PKCS7`.
3. IV acak 16 byte **di-prepend** ke ciphertext.
4. Hasil gabungan di-encode **base64url** (tanpa padding `=`).
5. Payload yang dienkripsi adalah JSON string.

## 1. Auth

### POST `/auth/login`
Body: `{ "email": "", "password": "" }`

> Jenis user **tidak lagi dikirim** saat login. Backend mengenali user type dari kombinasi email + password yang cocok (email unik).

Response `200` + header `x-perm-version` + set cookie session:
```json
{
  "status": 1,
  "message": "Login berhasil",
  "data": {
    "id": "uuid",
    "user_email": "user@example.com",
    "user_status": "ACTIVE",
    "user_type_user_type_id": "1",
    "user_type_name": "Superadmin",
    "access_token": "<jwt>",
    "refresh_token": "<jwt>",
    "actions": [],
    "menus": [ /* MenuFromBackend[] — lihat §5 */ ]
  }
}
```
> `status: 110` = akun belum terverifikasi (frontend menampilkan warning, tidak login).

### GET `/auth/me` (authed)
Response `200` + header `x-perm-version`:
```json
{ "data": { "id": "uuid", "user_email": "...", "user_type_user_type_id": "1", "user_type_name": "...", "menus": [ /* MenuFromBackend[] */ ] } }
```
> `401` jika session kadaluarsa → frontend otomatis panggil `/auth/refresh` lalu retry.

### GET `/auth/refresh`
Rotasi cookie session (refresh token). Response `200` kosong/berisi data user. `401` jika refresh token invalid → frontend logout.

### GET `/auth/events` (authed via refresh cookie — SSE)
Stream **Server-Sent Events** untuk push `perm_version` secara real-time ke frontend (tanpa polling):

- **Autentikasi: cookie refresh token** (`internal_session`), bukan access token — supaya koneksi bertahan melintasi rotasi token 30 menit tanpa reconnect.
- Response: `Content-Type: text/event-stream`; koneksi terbuka terus.
- Saat connect, server langsung mengirim versi terkini (klien reconnect tidak akan ketinggalan bump).
- Setiap `bumpPermissionVersion()` (perubahan privilege/menu/action/role) mem-push event ke semua koneksi terbuka.
- Keepalive `: ping` setiap 30 detik (frame komentar, bukan request) agar proxy tidak memutus stream idle.

```
retry: 10000

event: perm-version
data: <perm_version>
```

Frontend (`usePermissionEvents`) membandingkan `data` dengan versi tersimpan; jika beda → `GET /auth/me` sekali → privilege store diperbarui. Header `x-perm-version` pada response biasa tetap berlaku sebagai fallback (mis. koneksi SSE sedang putus).

### POST `/auth/logout` (authed)
Hapus cookie session.

### GET `/auth/profile` (authed)
```json
{ "data": { "id": "uuid", "username": "...", "user_email": "...", "user_type_user_type_id": "1", "user_type_name": "..." } }
```

## 2. User Lifecycle (password & aktivasi)

Semua body bertanda 🔒 dikirim sebagai `{ "data": "<encrypted>" }`.

### POST `/user/forgot-password`
Body: `{ "email": "", "submitted_by_admin": false }`
Response: `{ "status": 0, "message": "..." }` (sukses). Email berisi link `/reset/:token` dengan token = 🔒 `{ "email": "", "token": "" }`.

### POST `/user/reset-password`
Body 🔒: `{ "email": "", "token": "", "new_password": "", "confirm_password": "" }`

### POST `/user/activation`
Body 🔒: `{ "email": "", "token": "", "new_password": "", "confirm_password": "" }`
Email berisi link `/activation/:token` dengan token = 🔒 `{ "email": "", "token": "" }`.

### POST `/user/valid-token`
Body 🔒: `{ "email": "", "token": "", "action": "activation" | "reset" }`
Response valid: `{ "status": 0 }`; invalid/expired: `4xx`.

### POST `/user/check-password` (authed)
Body: `{ "password": "" }` — verifikasi password saat ini (step 1 ganti password).

### POST `/user/change-password` (authed)
Body: `{ "new_password": "", "confirm_password": "" }` — setelah sukses, frontend logout.

### GET `/user/:id/file?type=logo` (authed)
Response: **blob** (avatar user di header). Implementasi minimal: return 404/blob placeholder bila tidak ada file.

## 3. Manajemen User (RBAC)

### GET `/users?page=&perPage=&q=` (authed)
```json
{ "items": [ { "id": "", "username": "", "email": "", "role": { "id": "", "code": "", "name": "" } } ],
  "total": 0, "page": 1, "perPage": 15, "totalPages": 1 }
```

### GET `/users/role-options` (authed)
```json
[ { "id": "", "code": "", "name": "" } ]
```

### POST `/users` | PUT `/users/:id` | DELETE `/users/:id`
Body create: `{ "username": "", "email": "", "password": "", "user_type_id": "" }`
Body update: sama, `password` opsional. User baru berstatus `PENDING` → kirim email aktivasi.

## 4. Role / User Type

### GET `/user-type?type=list&page=&limit=&user_type_name=&user_type_show_on_register=`
```json
{ "data": { "records": [ { "id": 1, "value": 1, "user_type_name": "Superadmin", "user_type_show_on_register": false } ], "has_next": false } }
```

### POST `/roles` | PUT `/roles/:id` | DELETE `/roles/:id`
Body: `{ "id": "<string|number>", "label": "<nama role>", "user_type_show_on_register": false }`
> `/roles` adalah alias CRUD untuk resource user-type (frontend memakai keduanya).

## 5. Menu & Privilege

### `MenuFromBackend` (dipakai `/auth/login`, `/auth/me`)
```json
{ "id": "1", "code": "MNU_DASHBOARD", "name": "Dashboard", "path": "/dashboard",
  "icon": "LayoutDashboard", "sortOrder": 1, "parentMenuId": null,
  "isGroup": false, "actions": [ { "code": "ACT_...", "name": "View" } ],
  "subMenus": [ /* rekursif SidebarSubMenu */ ] }
```
> `icon` = key dari `iconMap` (`src/lib/icon-map.ts`).

### GET `/menu?type=list|page&page=&limit=&menu_name=`
```json
{ "data": { "records": [ { "id": "1", "menu_code": "MNU_DASHBOARD", "menu_name": "Dashboard",
  "parent_code": null, "icon": "LayoutDashboard", "slug": "/dashboard", "order": 1,
  "is_group": false, "status_code": "ACTIVE", "actions": [ { "code": "ACT_...", "name": "View" } ] } ] } }
```

### POST `/menu` | PUT `/menu/:menu_code` | DELETE `/menu/:menu_code`
Body: `{ "menu_name": "", "parent_code": null, "icon": "", "slug": "", "order": 1, "is_group": false, "action": [ { "action_code": "ACT_...", "status_code": "ACTIVE" } ] }`

### GET `/action?type=list|page&page=&limit=&action_name=`
```json
{ "data": { "records": [ { "id": "1", "action_code": "ACT_VIEW", "action_name": "View", "status_code": "ACTIVE" } ],
  "records_total": 0, "page_total": 0 } }
```

### POST `/action` | PUT `/action/:action_code` | DELETE `/action/:action_code`
Body: `{ "action_name": "" }` (code dibuat otomatis).

### GET `/privilege/by-user-type/:userTypeId` (authed)
```json
{ "data": { "records": [ { "id": 1, "privilege_code": "PRV_...", "user_type_id": 1,
  "user_type_name": "Superadmin", "menu_code": "MNU_USER", "menu_name": "User",
  "action_code": "ACT_...", "action_name": "View", "status_code": "ACTIVE" } ] } }
```

### POST `/privilege` (authed)
Body: `{ "user_type_id": "1", "privileges": [ { "privilege_code?": "PRV_...", "menu_code": "", "action_code": "", "status_code": "ACTIVE|DELETE" } ] }`
Response: `{ "status": 0, "perm_version": "<version>" }` — **wajib bump `perm_version`** (dibaca frontend utk refresh privilege).

## 6. Action Codes (seed wajib)

Frontend me-hardcode kode aksi di `src/lib/action-codes.ts` (`ACTION_CODES`) dan memakainya untuk `use-menu-access`. Artinya **backend wajib menyediakan action dengan `action_code` yang persis sama**, karena `menu.actions[].code` dari `/auth/login` & `/auth/me` dibandingkan langsung dengan nilai-nilai ini.

Delapan action di bawah ini adalah standar minimum yang harus ada di database (sesuai `actions` yang ada di DB):

| Key | `action_code` | Nama |
|---|---|---|
| `LIST` | `ACT_LIST` | List |
| `VIEW` | `ACT_VIEW` | View |
| `ADD` | `ACT_ADD` | Add |
| `EDIT` | `ACT_EDIT` | Edit |
| `DELETE` | `ACT_DELETE` | Delete |
| `RESET` | `ACT_RESET` | Reset Password |
| `ACTIVE_TOGGLE` | `ACT_ACTIVE_TOGGLE` | Aktif/Nonaktif |
| `DOWNLOAD` | `ACT_DOWNLOAD` | Download |

Seed default (`express/prisma/seed.ts`) sudah memakai kode-kode di atas.
