# 🗂️ Boilerplate Repository

Repositori penyimpanan boilerplate dengan **konsep git branch**: setiap branch adalah satu varian boilerplate yang siap dipakai (checkout branch → copy/salim → mulai develop).

## 📌 Daftar Branch

| Branch | Stack | Status | Keterangan |
|---|---|---|---|
| `main` | — | ✅ | Dokumentasi konsep repo (branch ini) |
| `react-vite` | React 19 + Vite 7 + TS + Tailwind 4 + shadcn (Base UI) | ✅ | Frontend internal app: auth + RBAC + global components |
| `express` | Express 5 + TS + Prisma + PostgreSQL | ✅ | Backend API: modul auth lengkap (login, refresh token cookie, RBAC, reset & activation password) |

> Kedua boilerplate **saling terkait**: `react-vite` dirancang untuk berintegrasi langsung dengan API contract yang diimplementasikan oleh `express` (lihat `docs/API-CONTRACT.md` di masing-masing branch).

## 🧭 Cara Pakai

```bash
# 1. Ambil boilerplate frontend
git clone <repo-url> my-app
cd my-app
git checkout react-vite

# 2. Atau ambil boilerplate backend
git clone <repo-url> my-api
cd my-api
git checkout express
```

Setelah checkout, hapus folder `.git` lalu `git init` ulang untuk project baru, atau push langsung ke remote baru.

## 🏛️ Prinsip

1. **`main` tidak berisi kode** — hanya dokumentasi konsep.
2. **Satu branch = satu tech stack boilerplate.** Branch baru (mis. `next-js`, `nestjs`) dibuat dari `main` dan harus mengimplementasikan **API contract modul auth** yang sama agar tetap kompatibel dengan frontend boilerplate mana pun.
3. **Modul wajib** untuk semua boilerplate: auth (login/logout/refresh/me), RBAC (user, role/user-type, action, menu, privilege), reset & activation password.
4. **Jangan mengubah branch boilerplate setelah dipakai project lain** — perbaikan dilakukan di branch boilerplate-nya, project turunan melakukan cherry-pick/rebase sesuai kebutuhan.

## 🔗 Relasi Frontend ↔ Backend

```
react-vite (SPA)  ──►  /api (vite dev proxy)  ──►  express (API)
      │                                                    │
      └──────────── cookie-based auth (httpOnly refresh) ──┘
```

- Auth berbasis **httpOnly cookie** (refresh token) + auto-refresh via axios interceptor dengan failed-request queue.
- Enkripsi payload sensitif (reset/activation) memakai **AES-256-CBC** dengan key yang sama (`VITE_APP_KEY` / `APP_KEY`) — key harus identik di kedua sisi.
- Header `x-perm-version` dipakai frontend untuk deteksi perubahan privilege secara real-time.

Detail lengkap endpoint: baca `docs/API-CONTRACT.md` pada branch `react-vite` atau `express`.
