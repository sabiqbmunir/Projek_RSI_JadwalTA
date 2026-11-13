function InfoBox({ label, value, className = "", light = false }) {
  return (
    <div className={`info-box ${className}`}>
      <p className="info-label">{label}</p>
      <p className={light ? "mt-2 text-base text-slate-800 font-medium leading-relaxed" : "info-value"}>
        {value || "-"}
      </p>
    </div>
  );
}

export default function MahasiswaProfil({ currentUser }) {
  const m = {
    nama: currentUser?.nama || "Mahasiswa",
    email: currentUser?.email || "mahasiswa@student.uns.ac.id",
    peran: currentUser?.peran || currentUser?.role || "User",
    nim: currentUser?.nim || "-",
    prodi: currentUser?.prodi || "S1 Informatika",
    angkatan: currentUser?.tahun_masuk || "2025",
    judul: currentUser?.judul || "Belum ada judul penelitian/skripsi yang diajukan.",
  };

  const initial = m.nama ? m.nama.charAt(0).toUpperCase() : "M";

  return (
    <section className="hero-gradient min-h-[720px] rounded-[32px] px-6 pb-12 pt-12 shadow-hero sm:px-12">
      <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-[40px]">
        Selamat Datang di
        <br />
        <span className="text-[#fdd03b]">Penjadwalan TA UNS</span>
      </h1>

      <div className="mt-8 rounded-[32px] bg-white p-6 sm:p-8 shadow-sm">
        {/* Identitas Mahasiswa */}
        <div className="flex items-center gap-5 border-b border-slate-100 pb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0a87d3] text-3xl font-bold text-white shadow-sm">
            {initial}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{m.nama}</h2>
            <p className="text-[15px] text-[#8a9bb0]">{m.email}</p>
            <span className="mt-1 inline-block rounded-md bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              Peran: {m.peran}
            </span>
          </div>
        </div>

        {/* Detail Akademik */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <InfoBox label="NIM (Nomor Induk Mahasiswa)" value={m.nim} />
          <InfoBox label="Program Studi" value={m.prodi} />
          <InfoBox label="Tahun Masuk / Angkatan" value={m.angkatan} />
          <div className="hidden md:block" />
          <InfoBox
            label="Judul Penelitian / Skripsi"
            value={m.judul}
            light
            className="md:col-span-2"
          />
        </div>
      </div>
    </section>
  );
}
