import { useMemo, useState } from "react";
import { ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { seminarProposal, sidangTA } from "../../data/jadwal.js";

const PER_PAGE = 8;
const TOTAL_PAGES = 5;

const TABS = [
  { key: "seminar", label: "Seminar Proposal", data: seminarProposal },
  { key: "sidang", label: "Sidang TA", data: sidangTA },
];

function SortHead({ children }) {
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <ChevronsUpDown className="h-3 w-3 text-slate-400" />
    </span>
  );
}

const dash = (v) => (v === undefined || v === null || v === "" ? "-" : v);

export default function MahasiswaJadwalTA() {
  const [tab, setTab] = useState("seminar");
  const [page, setPage] = useState(1);

  const active = TABS.find((t) => t.key === tab) || TABS[0];

  // Selalu tampilkan 8 baris; baris kosong ditampilkan dengan tanda "-"
  const rows = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    const slice = active.data.slice(start, start + PER_PAGE);
    return Array.from({ length: PER_PAGE }, (_, i) => slice[i] ?? null);
  }, [active, page]);

  const changeTab = (key) => {
    setTab(key);
    setPage(1);
  };

  const pageBtn =
    "flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-200 px-2.5 text-xs font-semibold transition";

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="card-shadow rounded-2xl border border-slate-200/90 bg-white px-8 py-5 shadow-xs">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Jadwal Ujian TA</h1>
        <p className="mt-1 text-xs text-slate-500">
          Jadwal pelaksanaan Seminar Proposal dan Sidang Tugas Akhir mahasiswa.
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex gap-1.5 rounded-xl bg-slate-200/60 p-1.5 shadow-inner">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => changeTab(t.key)}
            className={[
              "rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors",
              tab === t.key
                ? "bg-[#1fc2f2] text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabel */}
      <div className="card-shadow overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="w-14 px-5 py-4">No</th>
                <th className="px-4 py-4">
                  <SortHead>Tanggal</SortHead>
                </th>
                <th className="px-4 py-4">Nama</th>
                <th className="px-4 py-4">NIM</th>
                <th className="px-4 py-4">Penguji</th>
                <th className="px-4 py-4">
                  <SortHead>
                    Jam
                    <br />
                    Mulai
                  </SortHead>
                </th>
                <th className="px-4 py-4">
                  Jam
                  <br />
                  Selesai
                </th>
                <th className="px-4 py-4">Ruang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="h-[64px] px-5 text-xs text-slate-500 font-medium">
                    {(page - 1) * PER_PAGE + i + 1}
                  </td>
                  <td className="px-4 font-medium text-slate-700">{dash(row?.tanggal)}</td>
                  <td className="px-4 font-bold text-slate-900">{dash(row?.nama)}</td>
                  <td className="px-4 font-mono text-xs">{dash(row?.nim)}</td>
                  <td className="px-4">
                    {row?.penguji?.length ? (
                      <ul className="space-y-0.5 text-xs text-slate-700">
                        {row.penguji.map((p) => (
                          <li key={p}>&bull; {p}</li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 font-medium">{dash(row?.jamMulai)}</td>
                  <td className="px-4 font-medium">{dash(row?.jamSelesai)}</td>
                  <td className="px-4">
                    {row?.ruang ? (
                      <span className="inline-block rounded-md bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
                        {row.ruang}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <span className="text-xs text-slate-500">
            Menampilkan halaman {page} dari {TOTAL_PAGES}
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
      </div>
    </div>
  );
}
