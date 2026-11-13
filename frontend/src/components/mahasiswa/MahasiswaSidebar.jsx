import {
  GraduationCap,
  User,
  Upload,
  CalendarDays,
  Clock,
  Paperclip,
  Mail,
  LogOut,
} from "lucide-react";

export default function MahasiswaSidebar({ activeMenu = "profil", onSelect, onLogout }) {
  return (
    <aside className="sticky top-0 flex h-screen w-[280px] shrink-0 flex-col border-r border-slate-100 bg-white px-5 pb-6 pt-7 shadow-xs">
      {/* Brand Logo */}
      <div className="mb-8 flex items-center gap-3 px-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-600 shadow-xs">
          <GraduationCap size={22} />
        </div>
        <span className="text-[21px] font-extrabold tracking-tight text-[#1e3a8a]">
          Penjadwalan TA
        </span>
      </div>

      {/* Navigation Menu (Tampilan tajam, bersih, tanpa blur, tanpa lock) */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {/* 1. Profil (Menu Aktif Utama) */}
        <button
          type="button"
          onClick={() => onSelect && onSelect("profil")}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-2.5 text-left text-[15px] font-semibold transition-colors bg-[#45cbf2] text-white shadow-sm"
        >
          <User size={19} strokeWidth={1.8} className="text-white" />
          <span>Profil</span>
        </button>

        {/* 2. Upload Berkas */}
        <button
          type="button"
          onClick={() => onSelect && onSelect("profil")}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-2.5 text-left text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Upload size={19} strokeWidth={1.8} className="text-slate-500" />
          <span>Upload Berkas</span>
        </button>

        {/* 3. Jadwal TA */}
        <button
          type="button"
          onClick={() => onSelect && onSelect("profil")}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-2.5 text-left text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <CalendarDays size={19} strokeWidth={1.8} className="text-slate-500" />
          <span>Jadwal TA</span>
        </button>

        {/* 4. Rekognisi */}
        <button
          type="button"
          onClick={() => onSelect && onSelect("profil")}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-2.5 text-left text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Clock size={19} strokeWidth={1.8} className="text-slate-500" />
          <span>Rekognisi</span>
        </button>

        {/* 5. Dosen Pembimbing */}
        <button
          type="button"
          onClick={() => onSelect && onSelect("profil")}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-2.5 text-left text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Paperclip size={19} strokeWidth={1.8} className="text-slate-500" />
          <span>Dosen Pembimbing</span>
        </button>

        {/* 6. Pesan */}
        <button
          type="button"
          onClick={() => onSelect && onSelect("profil")}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-2.5 text-left text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Mail size={19} strokeWidth={1.8} className="text-slate-500" />
          <span>Pesan</span>
        </button>
      </nav>

      {/* Logout Button */}
      <div className="border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-2.5 text-left text-[15px] font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} strokeWidth={1.8} className="text-slate-400 group-hover:text-red-600" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
