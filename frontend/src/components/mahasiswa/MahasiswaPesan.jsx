import { useState } from "react";
import { Mail, Calendar, ChevronRight } from "lucide-react";

const DEFAULT_PESAN = [
  {
    id: 1,
    header: "Pemberitahuan Pendaftaran Seminar Proposal Periode November 2026",
    tanggal: "12 Nov 2026, 09:00 WIB",
    isi: "Pendaftaran Seminar Proposal periode November telah resmi dibuka. Mahasiswa diwajibkan mengunggah formulir pendaftaran yang telah disetujui Dosen Pembimbing beserta berkas Turnitin dengan tingkat kesamaan (similarity index) maksimal 30%. Silakan cek menu Upload Berkas > Sempro.",
  },
  {
    id: 2,
    header: "Pengumuman Validasi & Pengajuan Dosen Pembimbing Tugas Akhir",
    tanggal: "11 Nov 2026, 14:30 WIB",
    isi: "Mahasiswa angkatan 2022-2025 yang telah memenuhi syarat 100 SKS dapat mulai mengajukan permohonan Dosen Pembimbing melalui menu Dosen Pembimbing. Maksimal kuota pengajuan per mahasiswa adalah 2 dosen.",
  },
  {
    id: 3,
    header: "Jadwal Pelaksanaan Sidang Akhir Skripsi Semester Ganjil 2026/2027",
    tanggal: "10 Nov 2026, 11:15 WIB",
    isi: "Jadwal Sidang Akhir Tugas Akhir telah diperbarui pada sistem. Mahasiswa yang telah menyelesaikan revisi Semhas dan mendapatkan persetujuan sidang harap memverifikasi ruangan dan jam pelaksanaan pada menu Jadwal TA.",
  },
];

export default function MahasiswaPesan({ pesanList = [] }) {
  const list = pesanList && pesanList.length > 0 ? pesanList : DEFAULT_PESAN;
  const [selected, setSelected] = useState(list[0]?.id || 1);

  const detail = list.find((p) => p.id === selected) || list[0];

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="card-shadow rounded-2xl border border-slate-200/90 bg-white px-8 py-5 shadow-xs">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pesan & Pengumuman</h1>
        <p className="mt-1 text-xs text-slate-500">
          Pemberitahuan resmi seputar penjadwalan, seminar, dan sidang tugas akhir.
        </p>
      </div>

      {/* Grid: List on Left/Top, Detail on Right/Bottom */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Message Headers List */}
        <div className="flex flex-col gap-4">
          {list.map((p) => {
            const isSelected = selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`card-shadow flex flex-col justify-center rounded-2xl border bg-white p-5 text-left transition-all hover:shadow-md ${
                  isSelected
                    ? "border-[#0ea5e9] ring-2 ring-[#0ea5e9]/40 bg-sky-50/20"
                    : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        isSelected ? "bg-[#0ea5e9] text-white" : "bg-sky-100 text-sky-600"
                      }`}
                    >
                      <Mail size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {p.header}
                      </h3>
                      {p.tanggal && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <Calendar size={12} />
                          <span>{p.tanggal}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className={`shrink-0 ${isSelected ? "text-[#0ea5e9]" : "text-slate-300"}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Message Detail Card */}
        <section className="card-shadow min-h-[360px] rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-5">
            <span className="inline-block rounded-md bg-sky-100 px-2.5 py-1 text-[11px] font-bold text-sky-800 uppercase tracking-wide mb-2">
              Detail Pengumuman
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
              {detail ? detail.header : "Pilih pesan untuk melihat"}
            </h2>
            {detail?.tanggal && (
              <p className="mt-2 text-xs text-slate-400 font-medium">
                Diterbitkan pada: {detail.tanggal}
              </p>
            )}
          </div>
          <div className="pt-6 text-sm text-slate-600 leading-relaxed space-y-4">
            <p>{detail ? detail.isi : "Klik salah satu pesan di sebelah kiri untuk membaca isinya secara detail."}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
