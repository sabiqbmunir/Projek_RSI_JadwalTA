import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-600">Alamat yang Anda buka belum tersedia.</p>
        <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white hover:bg-sky-700">
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}
