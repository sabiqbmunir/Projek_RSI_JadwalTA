import { Bell, User, CheckCircle } from "lucide-react";

export default function MahasiswaTopbar({ currentUser, actionNotice }) {
  const initial = currentUser?.nama ? currentUser.nama.charAt(0).toUpperCase() : "U";

  return (
    <header className="card-shadow flex h-[54px] items-center justify-between gap-6 rounded-xl bg-white px-6 shadow-xs">
      {/* Toast Notice */}
      <div className="flex-1">
        {actionNotice ? (
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 animate-fade-in">
            <CheckCircle size={14} />
            <span>{actionNotice}</span>
          </div>
        ) : (
          <div className="hidden sm:block text-xs text-slate-400">
            Sistem Informasi Penjadwalan Tugas Akhir — Universitas Sebelas Maret
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* Bell Notification */}
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative text-slate-400 hover:text-slate-600 transition"
        >
          <Bell size={19} strokeWidth={1.8} />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500"></span>
          </span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#0a87d3] text-sm font-bold text-white shadow-xs">
            {initial}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[14px] font-semibold text-slate-800 leading-tight">
              {currentUser?.nama || "User"}
            </span>
            <span className="text-[11px] text-slate-400 leading-none">
              {currentUser?.nim || "Mahasiswa"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
