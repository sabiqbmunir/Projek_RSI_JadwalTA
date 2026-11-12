import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Integrasikan dengan endpoint reset password backend ketika API tersedia.
  };

  return (
    <div className="auth-page">
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

      <main className="auth-main">
        <section className="auth-card">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-600">
            <Mail size={22} aria-hidden="true" />
          </div>
          <h1 className="text-center text-2xl font-bold tracking-tight">Lupa Kata Sandi?</h1>
          <p className="mt-2 mb-8 text-center text-[13px] leading-6 text-slate-600">
            Masukkan email yang terdaftar. Instruksi pemulihan akan dikirim setelah fitur ini dihubungkan ke backend.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="reset-email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-800">
              Email
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nama@student.uns.ac.id"
              className="h-[46px] w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-4 focus:ring-sky-600/15"
            />
            <p className="mt-3 text-xs leading-5 text-amber-700">
              Halaman ini merupakan antarmuka awal. Pengiriman email reset belum aktif karena endpoint backend belum tersedia.
            </p>
            <button
              type="submit"
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
            >
              Kirim instruksi
            </button>
          </form>

          <Link to="/" className="mt-6 inline-flex w-full items-center justify-center gap-2 text-xs font-semibold text-sky-700 hover:underline">
            <ArrowLeft size={14} /> Kembali ke Login
          </Link>
        </section>
      </main>

      <footer className="auth-footer" />
    </div>
  );
}
