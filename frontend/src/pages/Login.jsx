import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../components/Button.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import { useFormState } from "../hooks/useFormState.js";
import { loginRules } from "../lib/validators.js";
import { authApi } from "../api/auth.js";

const labelClass = "text-xs font-semibold tracking-wide text-slate-800 uppercase";

function LoginInput({ error, ...props }) {
  return (
    <input
      aria-invalid={error ? true : undefined}
      className={`h-[46px] w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
        error
          ? "border-red-600 ring-4 ring-red-600/10"
          : "border-slate-300 focus:border-sky-600 focus:bg-white focus:ring-4 focus:ring-sky-600/15"
      }`}
      {...props}
    />
  );
}

function FieldError({ message }) {
  return message ? (
    <p role="alert" className="mt-1.5 text-xs text-red-600">
      {message}
    </p>
  ) : null;
}

export default function Login() {
  const navigate = useNavigate();
  const { values, field, validateAll } = useFormState({
    initialValues: { email: "", password: "" },
    rules: loginRules,
  });
  const [status, setStatus] = useState({ loading: false, type: "", text: "" });

  const redirectTimer = useRef();
  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const email = field("email");
  const password = field("password");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: false, type: "", text: "" });

    const firstInvalid = validateAll();
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setStatus({ loading: true, type: "", text: "" });

    try {
      const response = await authApi.login(values.email, values.password);
      const user = response.data?.user;

      setStatus({ 
        loading: false, 
        type: "success", 
        text: `Selamat datang, ${user?.nama || "Pengguna"}! Mengalihkan ke dashboard...` 
      });

      redirectTimer.current = setTimeout(() => navigate("/dashboard"), 800);
    } catch (error) {
      const errMsg = error.message || "Email atau kata sandi tidak valid. Silakan coba lagi.";
      setStatus({ loading: false, type: "error", text: errMsg });
    }
  };

  return (
    <div className="auth-page">
      {/* Navbar */}
      <header className="auth-navbar">
        <Link to="/" className="text-[13px] font-medium text-slate-600 transition hover:text-sky-600">
          Login
        </Link>
        <Link
          to="/register/mahasiswa"
          className="inline-flex h-7 items-center rounded-lg bg-sky-600 px-4 text-[13px] font-semibold text-white transition hover:bg-sky-700"
        >
          Register
        </Link>
      </header>

      {/* Kartu login */}
      <main className="auth-main">
        <section className="auth-card">
          <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">Masuk ke Akun</h1>
          <p className="mt-1.5 mb-8 text-center text-[13px] text-slate-600">
            Sistem Informasi Penjadwalan Tugas Akhir
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="email" className={labelClass}>Email</label>
              </div>
              <LoginInput 
                type="email" 
                placeholder="nama@student.uns.ac.id / staff.uns.ac.id" 
                autoComplete="email" 
                {...email} 
              />
              <FieldError message={email.error} />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className={labelClass}>Kata Sandi</label>
                <Link to="/lupa-password" className="text-xs font-medium text-sky-600 transition hover:text-sky-700 hover:underline">
                  Lupa Password?
                </Link>
              </div>
              <LoginInput 
                type="password" 
                placeholder="Masukkan kata sandi" 
                autoComplete="current-password" 
                {...password} 
              />
              <FieldError message={password.error} />
            </div>

            <Button
              type="submit"
              loading={status.loading}
              icon={ArrowRight}
              className="mt-6 h-11 w-full bg-sky-600 text-sm shadow-[0_8px_16px_-6px_rgba(2,132,199,0.28)] hover:bg-sky-700 text-white font-semibold"
            >
              Masuk
            </Button>

            <StatusMessage status={status} className="mt-4" />
          </form>

          <div className="mt-6 text-center text-[13px] text-slate-500 space-y-1">
            <p>
              Belum punya akun Mahasiswa?{" "}
              <Link to="/register/mahasiswa" className="font-bold text-sky-600 hover:text-sky-700 hover:underline">
                Daftar Mahasiswa
              </Link>
            </p>
            <p>
              Registrasi Dosen?{" "}
              <Link to="/register/dosen" className="font-bold text-sky-600 hover:text-sky-700 hover:underline">
                Daftar Dosen
              </Link>
            </p>
          </div>
        </section>
      </main>

      <footer className="auth-footer" />
    </div>
  );
}
