import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import RegisterMahasiswa from "./pages/RegisterMahasiswa.jsx";
import RegisterDosen from "./pages/RegisterDosen.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { PublicRouteGuard, MahasiswaRouteGuard } from "./components/RouteGuards.jsx";

export default function App() {
  return (
    <Routes>
      {/* 1. Halaman Login (Public Only) */}
      <Route
        path="/"
        element={
          <PublicRouteGuard>
            <Login />
          </PublicRouteGuard>
        }
      />
      <Route path="/login" element={<Navigate to="/" replace />} />

      {/* 2. Halaman Registrasi (Public Only) */}
      <Route path="/register" element={<Navigate to="/register/mahasiswa" replace />} />
      <Route
        path="/register/mahasiswa"
        element={
          <PublicRouteGuard>
            <RegisterMahasiswa />
          </PublicRouteGuard>
        }
      />
      <Route
        path="/register/dosen"
        element={
          <PublicRouteGuard>
            <RegisterDosen />
          </PublicRouteGuard>
        }
      />

      {/* 3. Halaman Dashboard Mahasiswa (Protected Mahasiswa Only) */}
      <Route
        path="/dashboard"
        element={
          <MahasiswaRouteGuard>
            <Dashboard />
          </MahasiswaRouteGuard>
        }
      />

      {/* Rute lainnya dialihkan kembali ke halaman utama sesuai RBAC */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
