# Sistem Informasi Penjadwalan Tugas Akhir (SI-Penjadwalan TA)
**Rekayasa Sistem Informasi — Universitas Sebelas Maret**

Proyek ini merupakan implementasi penuh sistem autentikasi dan registrasi terintegrasi dengan basis data Microsoft SQL Server sesuai panduan **Technical Specification Document (TSD)** dan kaidah **Clean Architecture**.

---

## 📁 Struktur Direktori Proyek

Folder utama: `C:\PROJEK_RSI_PENJADWALAN\`

```
C:\PROJEK_RSI_PENJADWALAN\
├── database/                          # Skrip DDL, Trigger, Stored Procedure, dan Seed
│   ├── Database_Penjadwalan_TA.sql   # Skrip DDL 14 tabel utama
│   ├── 01_audit_log_and_triggers.sql # Tabel Log_audit, Trigger append-only, Trigger audit, dan SP
│   └── 03_seed_data.sql              # Data akun awal demo (Admin, Dosen, Mahasiswa)
├── backend/                           # RESTful API (Node.js, Express, mssql/msnodesqlv8)
│   ├── .env                           # Konfigurasi port, DB connection, JWT, bcrypt
│   ├── .env.example
│   ├── package.json
│   ├── server.js                      # Entry point Express server
│   └── src/
│       ├── config/                    # Koneksi database & konfigurasi JWT
│       ├── controllers/               # Controller (HTTP Request/Response Handler)
│       ├── middlewares/               # Auth JWT, RBAC Middleware, Zod Validator, Error Handler
│       ├── repositories/              # Repository (Parameterized SQL & Stored Procedure Execution)
│       ├── routes/                    # Definisi rute RESTful API (/api/v1/...)
│       ├── services/                  # Business Logic Layer (Clean Architecture)
│       ├── utils/                     # Format JSON Envelope standar
│       └── validators/                # Validasi skema Zod
└── frontend/                          # React 19 + Vite + Tailwind CSS
    ├── .env                           # VITE_API_BASE_URL
    ├── package.json
    ├── vite.config.js                 # Proxy konfigurasi ke backend
    ├── index.html
    └── src/
        ├── api/                       # API fetch wrapper & auth service
        ├── components/                # Reusable UI components
        ├── hooks/                     # Custom hooks untuk form state & submit
        ├── lib/                       # Form validators
        └── pages/                     # Login, Register Mahasiswa, Register Dosen, Dashboard
```

---

## 🔐 Kepatuhan Arsitektur & Keamanan (Sesuai TSD)

1. **Jalur Akses & Clean Code (AC-01 & AC-02):**
   - Frontend tidak pernah mengakses basis data secara langsung, melainkan melalui REST API (`/api/v1/...`).
   - Logika bisnis dipusatkan secara ketat pada **Service class** (`src/services/auth.service.js`), bukan pada Controller atau Model (`Route -> Controller -> Service -> Repository`).
2. **Format Standar Respons API (AC-03):**
   - Seluruh respons API dibungkus dalam format standar JSON Envelope:
     `{ "status": "success" | "error", "data": ..., "message": "...", "errors": [...] }`
3. **Spesifikasi Keamanan Kata Sandi (AC-05):**
   - Enkripsi kata sandi menggunakan **bcrypt dengan cost factor = 12**.
   - Plaintext kata sandi tidak pernah disimpan dalam basis data.
4. **Pencegahan SQL Injection (AC-10):**
   - Seluruh kueri basis data menggunakan **parameterized query** (`request.input(...)`) atau eksekusi Stored Procedure.
5. **Autentikasi & RBAC (AC-04 & Bagian 6):**
   - Token **JWT Bearer** (HS256, masa berlaku 24 jam) digunakan untuk setiap rute terproteksi.
   - Hak akses 3 peran (**SuperAdmin**, **Admin**, **User**) ditegakkan di level endpoint API melalui middleware `requireRole(...)`.
6. **Sistem Audit Log Ketat Berbasis Trigger (AC-09 & Bagian 5.4):**
   - Tabel `Log_audit` bersifat **append-only** yang dijaga oleh trigger `trg_audit_log_append_only` (menolak setiap `UPDATE` dan `DELETE`).
   - Perubahan data pada tabel `Mahasiswa`, `Dosen`, dan `Admin_Dosen_TA` otomatis direkam ke `Log_audit` oleh Database Triggers:
     - `trg_audit_mahasiswa` (`USER_CREATED`, `USER_UPDATED`, `ROLE_CHANGED`)
     - `trg_audit_dosen` (`DOSEN_CREATED`, `DOSEN_UPDATED`, `ROLE_CHANGED`)
     - `trg_audit_admin` (`ADMIN_CREATED`, `ADMIN_UPDATED`)
   - Riwayat login berhasil dan gagal dicatat secara presisi melalui Stored Procedure `sp_catat_login_audit`.
7. **Paginasi Standar (Bagian 7.2):**
   - Seluruh endpoint list (seperti `/api/v1/admin/audit-logs`, `/api/v1/dosen`, `/api/v1/mahasiswa`) menerapkan paginasi default 15 dan maksimal 100 item.

---

## 🗄️ Pemetaan Dampak API ke Basis Data (DB Impact Mapping)

| Endpoint | Method | Role | Tabel Terpengaruh | Stored Procedure | Triggers Terpicu | Keterangan |
|---|---|---|---|---|---|---|
| `/api/v1/auth/login` | POST | Public | `Mahasiswa`, `Dosen`, `Admin_Dosen_TA` (R), `Log_audit` (C) | `sp_catat_login_audit` | — | Autentikasi lintas peran & pencatatan log audit |
| `/api/v1/auth/register/mahasiswa` | POST | Public | `Mahasiswa` (C), `Log_audit` (C) | `sp_registrasi_mahasiswa` | `trg_audit_mahasiswa` | Registrasi akun mahasiswa baru (atomik) |
| `/api/v1/auth/register/dosen` | POST | Public | `Dosen` (C), `Dosen_Kepakaran` (C), `Log_audit` (C) | `sp_registrasi_dosen` | `trg_audit_dosen` | Registrasi akun dosen & kepakaran baru |
| `/api/v1/auth/me` | GET | All | `Mahasiswa` / `Dosen` / `Admin_Dosen_TA` (R) | — | — | Ambil data profil pengguna yang sedang login |
| `/api/v1/auth/logout` | POST | All | `Log_audit` (C) | `sp_catat_login_audit` | — | Logout pengguna & pencatatan audit log |
| `/api/v1/admin/audit-logs` | GET | SuperAdmin | `Log_audit` (R) | — | — | Riwayat audit log sistem berpaginasi |
| `/api/v1/dosen` | GET | All | `Dosen` (R), `Dosen_Kepakaran` (R) | — | — | Daftar dosen & kepakaran (paginated) |
| `/api/v1/mahasiswa` | GET | SuperAdmin, Admin | `Mahasiswa` (R) | — | — | Daftar mahasiswa terdaftar (paginated) |

---

## 👥 Akun Demo untuk Pengujian

Semua akun default memiliki kata sandi: **`Password123!`**

| Peran Sistem | Level RBAC | Email | Kata Sandi | Deskripsi |
|---|---|---|---|---|
| **Admin Divisi TA** | SuperAdmin | `admin.ta@uns.ac.id` | `Password123!` | Akses menu Jadwal, Input Nilai, List Dosen, Audit Log |
| **Dosen** | Admin | `budi.santoso@staff.uns.ac.id` | `Password123!` | Akses Jadwal TA Dosen, Reschedule, Tabel 1 & Tabel 2 Bimbingan |
| **Mahasiswa** | User | `rafa@student.uns.ac.id` | `Password123!` | Akses Profil, Jadwal Sempro & Sidang, Upload Berkas, Dosen Pembimbing |
| **Mahasiswa** | User | `sabiq@student.uns.ac.id` | `Password123!` | Akun mahasiswa Sabiq Badrul Munir |

---

## 🚀 Panduan Menjalankan Sistem

### 1. Menjalankan Backend
Buka terminal baru pada direktori backend:
```powershell
cd C:\PROJEK_RSI_PENJADWALAN\backend
npm start
```
*Backend API akan aktif di `http://localhost:3000/api/v1`*

### 2. Menjalankan Frontend
Buka terminal baru pada direktori frontend:
```powershell
cd C:\PROJEK_RSI_PENJADWALAN\frontend
npm run dev
```
*Frontend React akan aktif di `http://localhost:5173`*

### 3. Alur Pengujian Fitur:
1. Buka browser ke `http://localhost:5173`.
2. Lakukan login dengan salah satu akun demo di atas (misal `admin.ta@uns.ac.id` atau `rafa@student.uns.ac.id`).
3. Anda akan langsung dialihkan ke Dashboard dengan tampilan menu dan data profil sesuai peran pengguna.
4. Coba registrasi akun Mahasiswa baru di menu **Register** (`/register/mahasiswa`).
5. Coba registrasi akun Dosen baru di menu **Register Dosen** (`/register/dosen`).
6. Masuk sebagai Admin Divisi TA dan lihat tab **Riwayat Audit Log** untuk melihat seluruh pencatatan login dan registrasi yang dibuat secara otomatis oleh database triggers.
