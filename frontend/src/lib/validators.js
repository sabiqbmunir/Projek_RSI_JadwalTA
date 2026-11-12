const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Hapus semua karakter non-angka (untuk input NIP & Tahun Masuk) */
export const digitsOnly = (value) => value.replace(/\D/g, "");

/** Aturan validasi halaman Login. Return string kosong jika valid. */
export const loginRules = {
  email(v) {
    if (!v.trim()) return "Email wajib diisi.";
    if (!EMAIL_REGEX.test(v.trim())) return "Format email tidak valid.";
    return "";
  },
  password(v) {
    if (!v) return "Kata sandi wajib diisi.";
    if (v.length < 6) return "Kata sandi minimal 6 karakter.";
    return "";
  },
};

/** Aturan validasi halaman Registrasi (mahasiswa & dosen) */
export const registerRules = {
  nama(v) {
    if (!v.trim()) return "Nama lengkap wajib diisi.";
    if (v.trim().length < 3) return "Nama minimal 3 karakter.";
    return "";
  },
  nim(v) {
    if (!v.trim()) return "NIM wajib diisi.";
    if (!/^[A-Za-z0-9]{5,20}$/.test(v.trim())) return "Format NIM tidak valid, contoh: M0521088 atau L0225036.";
    return "";
  },
  nip(v) {
    if (!v.trim()) return "NIP wajib diisi.";
    if (!/^\d{8,25}$/.test(v.trim())) return "NIP hanya berisi angka (minimal 8 digit).";
    return "";
  },
  email(v) {
    if (!v.trim()) return "Email wajib diisi.";
    if (!EMAIL_REGEX.test(v.trim())) return "Format email tidak valid.";
    return "";
  },
  password(v) {
    if (!v) return "Kata sandi wajib diisi.";
    if (v.length < 8) return "Kata sandi minimal 8 karakter.";
    return "";
  },
  prodi(v) {
    return v ? "" : "Pilih program studi.";
  },
  tahun(v) {
    const now = new Date().getFullYear();
    if (!v.trim()) return "Tahun masuk wajib diisi.";
    if (!/^\d{4}$/.test(v) || Number(v) < 2000 || Number(v) > now + 1) {
      return `Masukkan tahun yang valid (2000–${now + 1}).`;
    }
    return "";
  },
  kepakaran(v) {
    if (!v.trim()) return "Bidang kepakaran wajib dipilih.";
    return "";
  },
  judul(v) {
    if (!v.trim()) return "Judul penelitian wajib diisi.";
    if (v.trim().length < 5) return "Judul terlalu singkat, tulis rencana judul usulan Anda.";
    return "";
  },
};
