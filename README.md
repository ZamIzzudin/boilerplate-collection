# React Vite Boilerplate

Boilerplate frontend internal app: **React 19 + Vite 7 + TypeScript + Tailwind CSS 4 + shadcn/ui (Base UI)**.

Berisi fondasi wajib untuk aplikasi internal tim: **auth lengkap** (login, logout, refresh token cookie, reset & aktivasi password) dan **RBAC** (user, role, action, menu, privilege) — plus seluruh global component UI dan halaman `dungeon` sebagai playground komponen.

> Bagian dari repo [boilerplate](../README.md). Backend pasangannya ada di branch **`express`**. Kontrak API: [`docs/API-CONTRACT.md`](./docs/API-CONTRACT.md).

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | React 19, Vite 7, TypeScript 5 |
| Styling | Tailwind CSS 4, tw-animate-css |
| UI Kit | shadcn/ui (`base-nova`) di atas Base UI, Phosphor Icons |
| Routing | React Router DOM 7 |
| Data | TanStack React Query 5, Axios |
| State | Zustand 5 |
| Validasi | Zod 4 |
| Testing | Jest 30 + Testing Library (ts-jest, ESM) |
| Utilitas | Sonner (toast), date-fns, crypto-js, class-variance-authority |

## Menjalankan

```bash
cp .env.example .env.local      # sesuaikan VITE_APP_KEY agar sama dengan backend
npm install
npm run dev                     # http://localhost:5173
```

Backend Express (branch `express`) berjalan di `http://localhost:4000`. Vite mem-proxy `/api` → backend (lihat `vite.config.ts`).

### Scripts

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server + HMR |
| `npm run build` | Build production ke `dist/` |
| `npm run preview` | Preview hasil build |
| `npm run lint` | ESLint |
| `npm test` | Jest (bail, silent) |
| `npm run test:watch` | Jest watch |
| `npm run test:cov` | Coverage (untuk SonarQube) |

## Struktur

```
src/
├── app/                     # Halaman per-modul (pola page/handler/hook/schemas/types)
│   ├── login/               # Login + lupa password (+ captcha)
│   ├── reset/               # Reset password via token dari email
│   ├── activation/          # Aktivasi akun via token dari email
│   └── (protected)/         # Route wajib login
│       ├── dashboard/
│       ├── user/            # CRUD user
│       ├── role/            # CRUD role / user-type
│       ├── action/          # CRUD action
│       ├── menu/            # CRUD menu
│       ├── privilege/       # Matrix privilege per role
│       └── profile/         # Profil + ganti password
├── components/
│   ├── ui/                  # Global UI kit (button, sheet, table, map, dll.)
│   ├── providers/           # QueryProvider
│   ├── app-layout.tsx, app-sidebar.tsx, dashboard-shell.tsx, dll.
├── hooks/                   # Hook global (captcha, menu-access, user-type-options, dll.)
├── layouts/protected-layout.tsx
├── lib/                     # axios client, config, crypto, notify, validation, utils
├── pages/                   # dungeon-page (playground), not-found-page
├── store/                   # auth-store, privilege-store (zustand)
└── types/                   # api, auth, menu, privilege, domain
```

### Pola per-modul

Setiap modul memisahkan tanggung jawab:

| File | Peran |
|---|---|
| `page.tsx` | View/UI halaman |
| `handler.tsx` | Lapisan pemanggilan API (axios) |
| `hook.tsx` | Hook React Query (query/mutation + invalidasi cache) |
| `schemas.ts` | Skema validasi Zod |
| `types.ts` | Tipe modul |
| `component(s)/` | Komponen lokal modul |

## Alur Auth

1. `AppBootstrap` (di `App.tsx`) memanggil `GET /auth/me` saat app dimuat untuk memulihkan sesi dari cookie. Bila gagal → state auth dibersihkan.
2. `POST /auth/login` cukup mengirim `email` + `password` (jenis user dikenali dari akun yang cocok). Response berisi data user + `menus` + header `x-perm-version`. Data disimpan di `auth-store` & `privilege-store`.
3. Axios interceptor (`lib/axios/client.ts`):
   - `401` → otomatis `GET /auth/refresh`, request yang gagal diantrikan lalu di-retry; bila refresh gagal → logout.
   - Header `x-perm-version` berubah → privilege di-refresh otomatis.
4. `ProtectedLayout` menjaga route: wajib `isAuthenticated`, privilege siap, dan user tersedia; jika tidak → redirect `/login`.
5. `PublicLayout` mengarahkan user yang sudah login ke `/dashboard`.

## RBAC

- **Menu** membentuk sidebar (`app-sidebar`) via `privilege-store`; ikon dipetakan di `lib/icon-map.ts`.
- **Action** per menu dipakai `useMenuAccess("/path")` untuk menentukan `canView/canAdd/canEdit/canDelete/...`.
- Halaman yang tidak punya akses menampilkan `<ForbiddenView />`.
- Matrix role × menu × action dikelola di halaman **Privilege**.

## Dungeon

`/dungeon` (publik) dan `/protected/dungeon` (setelah login) adalah halaman playground seluruh komponen UI — referensi cepat saat membangun halaman baru.

## Enkripsi

`lib/crypto.ts` (AES-256-CBC, IV di-prepend, base64url) dipakai untuk payload sensitif reset/aktivasi. **`VITE_APP_KEY` harus identik dengan `APP_KEY` di backend Express.** Lihat [`docs/API-CONTRACT.md`](./docs/API-CONTRACT.md) §Enkripsi.

## Integrasi Boilerplate Lain

Jika membuat boilerplate frontend baru (mis. Next.js), implementasikan halaman/flow di `docs/API-CONTRACT.md` agar langsung kompatibel dengan backend manapun yang mengikuti kontrak yang sama. Sebaliknya, backend baru wajib mengimplementasikan kontrak ini agar kompatibel dengan frontend ini.
