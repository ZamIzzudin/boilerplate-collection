# Express Boilerplate

Boilerplate backend internal app: **Express 5 + TypeScript + Prisma + PostgreSQL**.

Mengimplementasikan **modul auth lengkap** (login, refresh token httpOnly cookie, me, logout, aktivasi akun, ganti password) dan **RBAC** (user, role/user-type, action, menu, privilege) sesuai kontrak API yang dipakai frontend.

> Bagian dari repo [boilerplate](../README.md). Frontend pasangannya ada di branch **`react-vite`**. Kontrak API: [`docs/API-CONTRACT.md`](./docs/API-CONTRACT.md).

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Runtime | Node.js 22, TypeScript 5 |
| Framework | Express 5 |
| ORM/DB | Prisma 6 + PostgreSQL |
| Auth | JWT (access + refresh) dalam httpOnly cookie |
| Keamanan | Helmet, CORS credentials, bcryptjs, AES-256-CBC (crypto-js) |
| Validasi | Zod |
| Testing | Jest + Supertest |
| Tooling | tsx (dev), tsc + tsc-alias (build) |

## Menjalankan

```bash
cp .env.example .env            # sesuaikan DATABASE_URL & APP_KEY (harus sama dengan frontend)

npm install
npm run prisma:generate
npm run prisma:migrate          # membuat tabel di database
npm run prisma:seed             # seed role, action, menu, privilege + admin
npm run dev                     # http://localhost:4000
```

Atau pakai Docker (PostgreSQL + API sekaligus):

```bash
docker compose up --build
```

### Akun seed default

```
email:    admin@boilerplate.local
password: Admin123!
```

### Scripts

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server (tsx watch) |
| `npm run build` | Compile ke `dist/` (+ rewrite path alias) |
| `npm start` | Jalankan hasil build |
| `npm run lint` | ESLint |
| `npm test` | Jest + Supertest |
| `npm run test:cov` | Coverage |
| `npm run prisma:migrate` | Migrasi dev |
| `npm run prisma:deploy` | Migrasi production |
| `npm run prisma:seed` | Seed data awal |
| `npm run prisma:studio` | Prisma Studio |

## Struktur

```
prisma/
├── schema.prisma            # UserType, User, Action, Menu, MenuAction, Privilege, AuthToken, Setting
└── seed.ts                  # seed role/action/menu/privilege + admin
src/
├── app.ts                   # express app (helmet, cors, cookie, routes, error handler)
├── server.ts                # bootstrap + graceful shutdown
├── config/env.ts            # env terpusat & tervalidasi
├── routes/index.ts          # pemetaan seluruh router
├── common/
│   ├── errors.ts            # AppError
│   ├── http/response.ts     # envelope response standar
│   └── middleware/          # authenticate, authorize (RBAC), validate, permission-version, error-handler
├── lib/                     # prisma, jwt, password, crypto, cookies, mailer, id, pagination
└── modules/
    ├── auth/                # login, me, refresh, logout, profile, events (SSE), activation, check/change password
    ├── user/                # CRUD user + role options + file avatar
    ├── user-type/           # user type (+ /roles alias)
    ├── action/              # CRUD action
    ├── menu/                # CRUD menu + menu tree builder
    └── privilege/           # matrix privilege per role
```

### Pola per-modul

| File | Peran |
|---|---|
| `*.routes.ts` | Definisi endpoint + middleware (validate/authenticate) |
| `*.controller.ts` | Terima request, panggil service, kirim response |
| `*.service.ts` | Business logic + akses data (Prisma) |
| `*.schema.ts` | Skema validasi Zod + tipe input |

## Alur Auth

1. **Login** (`POST /auth/login`) — verifikasi kredensial (`email` + `password`; jenis user dikenali dari akun yang cocok), lalu set dua cookie httpOnly:
   - `access_token` (default 30 menit) — dipakai `authenticate` middleware.
   - `internal_session` (default 7 hari) — refresh token, dipakai `GET /auth/refresh`.
   Response berisi data user + menu tree + header `x-perm-version`.
2. **Request terproteksi** — `authenticate` membaca cookie `access_token`. Bila tidak ada/kadaluarsa → `401`, frontend memanggil `/auth/refresh` lalu retry (axios interceptor + failed request queue).
3. **Refresh** (`GET /auth/refresh`) — verifikasi refresh cookie, rotasi kedua cookie.
4. **Logout** (`POST /auth/logout`) — bersihkan cookie.
5. **Aktivasi** — token sekali pakai disimpan di tabel `auth_tokens`; link email berisi ciphertext AES `{ email, token }`. (Fitur lupa/reset password dihapus dari boilerplate.)

## RBAC

- **Menu tree** dibangun `buildMenuTree()` — hanya menu/action dengan privilege `ACTIVE` milik role user, sudah berbentuk nested (`subMenus`).
- **Guard**: `authenticate` → `authorize(actionCode, menuCode)`, contoh:
  ```ts
  router.get("/users", authenticate, authorize("ACT_VIEW", "MNU_USER"), handler);
  ```
- **Permission version**: setiap perubahan menu/action/privilege memanggil `bumpPermissionVersion()` yang meng-update tabel `settings` dan meng-cache nilainya. Header `x-perm-version` diset ke semua response lewat middleware.

## Enkripsi

`src/lib/crypto.ts` kompatibel penuh dengan `src/lib/crypto.ts` frontend: AES-256-CBC, IV 16 byte di-prepend, base64url, PKCS7. **`APP_KEY` harus identik dengan `VITE_APP_KEY` frontend.** Body berisi `{ data: "<ciphertext>" }` didekripsi di controller (reset/activation/valid-token).

## Deployment

- `Dockerfile` multi-stage (build → runner alpine non-DB), `docker-compose.yaml` menyertakan PostgreSQL.
- Production: jalankan `npm run prisma:deploy` sebelum start, set `COOKIE_SECURE=true` dan `JWT_SECRET` yang kuat.
- CORS: `CORS_ORIGINS` harus berisi origin frontend, dengan kredensial aktif.

## Integrasi Boilerplate Lain

Backend ini adalah **referensi modul auth** untuk boilerplate boilerplate berikutnya. Jika membuat backend baru dengan stack berbeda (NestJS, Go, Laravel, dll), implementasikan endpoint & perilaku di `docs/API-CONTRACT.md` agar semua frontend boilerplate tetap kompatibel tanpa perubahan.
