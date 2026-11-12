# Penjadwalan Tugas Akhir — Frontend

Frontend ini menggunakan **React**, **Vite**, **Tailwind CSS v4**, dan **CSS biasa** untuk aturan global serta komponen yang dipakai berulang.

## Teknologi
- React + React DOM
- Vite
- Tailwind CSS v4 melalui `@tailwindcss/vite`
- React Router
- Lucide React
- Plus Jakarta Sans

## Menjalankan project

Pastikan Node.js versi yang kompatibel dengan Vite terpasang. Kemudian jalankan:

```bash
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan Vite di terminal.

## Perintah lain

```bash
npm run build
npm run preview
```

## Struktur utama

```text
src/
├── components/     # Komponen UI yang dapat digunakan ulang
├── hooks/          # Hook untuk state dan validasi form
├── lib/            # Fungsi validasi
├── pages/          # Halaman Login, Register, Dashboard, dan Lupa Password
├── App.jsx         # Routing aplikasi
├── main.jsx        # Entry point React
└── index.css       # Tailwind, design tokens, dan CSS global
```

## Catatan integrasi

Project ini adalah **frontend**. Validasi form berjalan di browser, tetapi autentikasi login, penyimpanan akun registrasi, dan pengiriman email reset password belum aktif sampai endpoint backend/API tersedia.

- Login: ganti simulasi di `src/pages/Login.jsx` dengan request ke API.
- Registrasi: ganti simulasi di `src/hooks/useRegisterForm.js` dengan request ke API.
- Lupa password: implementasikan request reset password pada `src/pages/ForgotPassword.jsx`.
- Dashboard: `src/pages/Dashboard.jsx` masih berupa halaman placeholder.

Jangan menyimpan password mentah di frontend atau menganggap validasi browser sebagai pengamanan autentikasi.
