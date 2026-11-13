import { Navigate } from "react-router-dom";
import { ShieldAlert, LogOut } from "lucide-react";
import { tokenStorage, authApi } from "../api/auth.js";

/**
 * Route Guard untuk halaman publik (Login & Register)
 * Jika pengguna sudah login sebagai mahasiswa, otomatis arahkan ke /dashboard.
 */
export function PublicRouteGuard({ children }) {
  const token = tokenStorage.getToken();
  const user = tokenStorage.getUser();

  if (token && user) {
    const role = (user.peran || user.role || "").toLowerCase();
    const isMahasiswa =
      role === "user" ||
      role === "mahasiswa" ||
      (!role.includes("admin") && !role.includes("dosen") && user.user_type !== "admin");

    if (isMahasiswa) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

/**
 * Route Guard untuk Dashboard Mahasiswa
 * Memastikan hanya Mahasiswa terautentikasi yang dapat mengakses.
 * Peran lain (Dosen / Admin) diblokir sesuai aturan pembatasan RBAC.
 */
export function MahasiswaRouteGuard({ children }) {
  const token = tokenStorage.getToken();
  const user = tokenStorage.getUser();

  // 1. Jika belum login, arahkan ke halaman Login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // 2. Evaluasi peran RBAC
  const role = (user.peran || user.role || "").toLowerCase();
  const isMahasiswa =
    role === "user" ||
    role === "mahasiswa" ||
    (!role.includes("admin") && !role.includes("dosen") && user.user_type !== "admin");

  // 3. Jika bukan mahasiswa, tampilkan layar pembatasan RBAC
  if (!isMahasiswa) {
    const handleLogout = async () => {
      try {
        await authApi.logout();
      } catch {
        tokenStorage.clear();
      }
      window.location.href = "/";
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eff3f8] p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={30} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Dibatasi (RBAC)</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Sistem saat ini dibatasi oleh kebijakan <em>Role-Based Access Control</em> (RBAC): hanya{" "}
            <strong>Dashboard Mahasiswa</strong> yang diaktifkan. Akun Anda terdeteksi memiliki peran{" "}
            <span className="font-semibold text-slate-800">
              "{user.peran || user.role || "Non-Mahasiswa"}"
            </span>
            .
          </p>
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-sm transition"
          >
            <LogOut size={16} />
            <span>Keluar Akun & Masuk Sebagai Mahasiswa</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Mahasiswa diizinkan masuk ke Dashboard
  return children;
}
