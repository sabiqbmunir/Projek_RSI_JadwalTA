import { Link, NavLink } from "react-router-dom";
import { GraduationCap, IdCard, User } from "lucide-react";

const tabBase =
  "flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-left text-sm leading-tight transition md:w-[146px] md:flex-none focus-visible:outline-2 focus-visible:outline-sky-500/45";
const tabActive = "bg-white font-semibold text-sky-700 shadow-[0_2px_6px_rgba(15,23,42,0.08)]";
const tabIdle = "font-medium text-slate-600 hover:text-sky-800";

const tabClass = ({ isActive }) => `${tabBase} ${isActive ? tabActive : tabIdle}`;

/** Kerangka halaman registrasi: navbar, kartu, judul, dan tab Mahasiswa/Dosen */
export default function RegisterLayout({ title, subtitle, children }) {
  return (
    <div className="bg-soft-glow flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between bg-white px-4 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.12)] md:px-8">
        <Link to="/" className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500/45">
          <span className="grid size-9 place-items-center rounded-[10px] bg-sky-500 text-white">
            <GraduationCap className="size-5" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-sky-800">Penjadwalan TA</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            to="/"
            className="inline-flex h-9 items-center rounded-xl bg-sky-500 px-6 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Login / Masuk
          </Link>
          <span className="grid size-8 place-items-center rounded-full bg-sky-500 text-white" aria-hidden="true">
            <User className="size-4" strokeWidth={2} />
          </span>
        </div>
      </header>

      {/* Kartu */}
      <main className="flex flex-1 items-start justify-center px-4 pt-9 pb-16">
        <section className="w-full max-w-4xl rounded-2xl bg-white px-5 py-6 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.22)] md:p-9">
          <div className="mb-7 flex flex-col gap-5 md:mb-9 md:flex-row md:items-start md:justify-between md:gap-8">
            <div className="md:max-w-[460px]">
              <h1 className="text-[26px] leading-[1.15] font-extrabold tracking-tight md:text-[32px]">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{subtitle}</p>
            </div>

            <nav aria-label="Jenis akun" className="flex shrink-0 gap-1 rounded-[14px] bg-tab p-1.5">
              <NavLink to="/register/mahasiswa" className={tabClass}>
                <User className="size-4" strokeWidth={2} aria-hidden="true" />
                <span>Akun Mahasiswa</span>
              </NavLink>
              <NavLink to="/register/dosen" className={tabClass}>
                <IdCard className="size-[18px]" strokeWidth={2} aria-hidden="true" />
                <span>Daftar sebagai Dosen</span>
              </NavLink>
            </nav>
          </div>

          {children}
        </section>
      </main>
    </div>
  );
}
