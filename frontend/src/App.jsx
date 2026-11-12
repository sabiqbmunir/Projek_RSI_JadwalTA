import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import RegisterMahasiswa from "./pages/RegisterMahasiswa.jsx";
import RegisterDosen from "./pages/RegisterDosen.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Navigate to="/" replace />} />

      <Route path="/register" element={<Navigate to="/register/mahasiswa" replace />} />
      <Route path="/register/mahasiswa" element={<RegisterMahasiswa />} />
      <Route path="/register/dosen" element={<RegisterDosen />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/lupa-password" element={<ForgotPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
