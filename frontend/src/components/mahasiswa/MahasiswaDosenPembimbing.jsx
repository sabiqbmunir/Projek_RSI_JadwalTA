import { useState } from "react";
import { ChevronLeft, ChevronRight, Send, Check } from "lucide-react";

const PER_PAGE = 8;
const TOTAL_PAGES = 5;

// Dosen fallback default jika backend belum memuat list dosen
const DEFAULT_DOSEN = [
  { nama: "Dr. Budi Santoso, M.Kom.", nip: "197503121999031002", kepakaran: "Rekayasa Perangkat Lunak & Sistem Informasi" },
  { nama: "Dr. Siti Aminah, M.T.", nip: "198007242005012001", kepakaran: "Kecerdasan Buatan & Machine Learning" },
  { nama: "Bambang Widoyono, M.T.", nip: "197211181998021001", kepakaran: "Jaringan Komputer & Cyber Security" },
  { nama: "Prof. Ir. Joko Supriyanto, Ph.D.", nip: "196504091991031003", kepakaran: "Data Science & Cloud Computing" },
  { nama: "Dr. Eng. Irwan Santosa, M.T.", nip: "198305152008121002", kepakaran: "Internet of Things & Embedded Systems" },
  { nama: "Fitri Handayani, S.Kom., M.Cs.", nip: "198809202014042001", kepakaran: "UI/UX Design & Human-Computer Interaction" },
  { nama: "Agus Prasetyo, M.Kom.", nip: "198202112006041003", kepakaran: "Basis Data & Big Data Analytics" },
  { nama: "Rina Wijayanti, Ph.D.", nip: "198606302010122002", kepakaran: "Computer Vision & Deep Learning" },
];

export default function MahasiswaDosenPembimbing({
  dosenList = [],
  persetujuanCount = 0,
  setPersetujuanCount,
  onNotify,
}) {
  const [page, setPage] = useState(1);
  const [requestedDosen, setRequestedDosen] = useState({});

  // Gabungkan list dosen dari database / API dengan default
  const sourceList = dosenList && dosenList.length > 0 ? dosenList : DEFAULT_DOSEN;

  // Pastikan ada total (PER_PAGE * TOTAL_PAGES) baris terformat
  const allRows = Array.from({ length: PER_PAGE * TOTAL_PAGES }, (_, i) => {
    const item = sourceList[i];
    return {
      no: i + 1,
      nama: item ? item.nama : "-",
      nip: item ? item.nip : "-",
      kepakaran: item ? item.kepakaran : "-",
    };
  });

  const rows = allRows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pageBtn =
    "flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-200 px-2.5 text-xs font-semibold transition";

  const handleKirimPersetujuan = (dosenItem) => {
    if (requestedDosen[dosenItem.no]) return;
    if (persetujuanCount >= 2) {
      if (onNotify) {
        onNotify("Maksimal hanya dapat mengirimkan 2 pengajuan persetujuan bimbingan!");
      }
      return;
    }
    setRequestedDosen((prev) => ({ ...prev, [dosenItem.no]: true }));
    if (setPersetujuanCount) {
      setPersetujuanCount((prev) => prev + 1);
    }
    if (onNotify) {
      onNotify(`Pengajuan persetujuan bimbingan ke ${dosenItem.nama} berhasil dikirim!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white px-8 py-5 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dosen Pembimbing</h1>
          <p className="mt-1 text-xs text-slate-500">
            Daftar dosen pembimbing skripsi yang tersedia. Anda dapat mengajukan hingga 2 dosen.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-xs font-bold text-sky-800 border border-sky-200">
          <span>Status Pengajuan:</span>
          <span className="font-extrabold text-[#0284c7]">{persetujuanCount} / 2 Dosen Terpilih</span>
        </div>
      </div>

      {/* Tabel */}
      <section className="card-shadow overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="min-h-[560px] overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-50/70">
                <th className="w-20 px-6 py-4">No</th>
                <th className="w-80 py-4">Nama Dosen</th>
                <th className="py-4">Bidang Kepakaran</th>
                <th className="w-48 py-4 text-center">Persetujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((d) => {
                const isRequested = !!requestedDosen[d.no];
                const isEmpty = d.nama === "-";
                return (
                  <tr key={d.no} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-medium">{d.no}</td>
                    <td className="py-4">
                      <span className="font-bold text-slate-900 block">{d.nama}</span>
                      {d.nip !== "-" && <span className="text-[11px] text-slate-400 font-mono">NIP. {d.nip}</span>}
                    </td>
                    <td className="py-4 text-xs text-slate-600">{d.kepakaran}</td>
                    <td className="py-4 text-center">
                      {!isEmpty ? (
                        <button
                          type="button"
                          disabled={isRequested || persetujuanCount >= 2}
                          onClick={() => handleKirimPersetujuan(d)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-colors ${
                            isRequested
                              ? "bg-emerald-600 text-white cursor-default"
                              : persetujuanCount >= 2
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-[#0ea5e9] text-white hover:bg-sky-600 active:scale-[.98]"
                          }`}
                        >
                          {isRequested ? (
                            <>
                              <Check size={14} />
                              <span>Terkirim</span>
                            </>
                          ) : (
                            <>
                              <Send size={13} />
                              <span>Kirim Persetujuan</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <span className="text-xs text-slate-500">
            Halaman {page} dari {TOTAL_PAGES}
          </span>
          <nav aria-label="Halaman" className="flex gap-1.5">
            <button
              className={`${pageBtn} text-slate-400 disabled:opacity-40`}
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`${pageBtn} ${
                  n === page
                    ? "border-[#0ea5e9] bg-[#0ea5e9] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              className={`${pageBtn} text-slate-400 disabled:opacity-40`}
              disabled={page === TOTAL_PAGES}
              onClick={() => setPage(page + 1)}
              aria-label="Berikutnya"
            >
              <ChevronRight size={15} />
            </button>
          </nav>
        </div>
      </section>
    </div>
  );
}
