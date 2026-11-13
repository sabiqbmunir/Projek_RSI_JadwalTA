import { useRef, useState } from "react";
import { Award, FolderOpen, FileText, X, CheckCircle, AlertCircle } from "lucide-react";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_EXT = [".pdf", ".docx", ".jpg", ".png"];

const formatSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function MahasiswaRekognisi({ type = "semhas", onNotify }) {
  const [activeTab, setActiveTab] = useState(type.includes("sidang") ? "sidang" : "semhas");
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("idle");

  const pickFile = (f) => {
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      setError("Format file harus PDF, DOCX, JPG, atau PNG.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("Ukuran file melebihi batas 20 MB.");
      return;
    }
    setError("");
    setStatus("idle");
    setFile(f);
  };

  const clearFile = () => {
    setFile(null);
    setStatus("idle");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = () => {
    if (!file) {
      setError("Pilih file bukti rekognisi terlebih dahulu.");
      return;
    }
    setStatus("uploading");
    setTimeout(() => {
      setStatus("done");
      if (onNotify) {
        onNotify(`Bukti rekognisi "${file.name}" berhasil diajukan!`);
      }
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="card-shadow rounded-2xl border border-slate-200/90 bg-white px-8 py-5 shadow-xs">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Rekognisi Prestasi / Publikasi
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Unggah berkas bukti pengakuan prestasi atau publikasi ilmiah untuk ekuivalensi Seminar/Sidang.
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex gap-1.5 rounded-xl bg-slate-200/60 p-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => { setActiveTab("semhas"); clearFile(); }}
          className={[
            "rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "semhas"
              ? "bg-[#1fc2f2] text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900",
          ].join(" ")}
        >
          Rekognisi Semhas
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("sidang"); clearFile(); }}
          className={[
            "rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "sidang"
              ? "bg-[#1fc2f2] text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900",
          ].join(" ")}
        >
          Rekognisi Sidang TA
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid items-start gap-x-12 gap-y-10 xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        {/* Upload Card */}
        <section className="card-shadow flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-600">
              <Award size={22} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-slate-900">
                Upload Bukti Rekognisi ({activeTab === "semhas" ? "Semhas" : "Sidang TA"})
              </h2>
              <span className="text-xs text-slate-500">Sertifikat Juara / Surat Penerimaan Paper</span>
            </div>
          </div>

          {/* Dropzone */}
          <div
            className="dropzone mt-4 flex flex-col items-center px-6 py-8 text-center"
            data-dragging={dragging}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
          >
            <p className="text-[15px] font-semibold text-slate-800">Pilih berkas dari perangkat Anda</p>
            <p className="mt-1 text-xs text-slate-500">Format: PDF / DOCX / JPG / PNG (Maks 20MB)</p>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.jpg,.png"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0ea5e9] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-sky-600 active:scale-[.98]"
            >
              <FolderOpen size={16} />
              <span>Pilih File</span>
            </button>
          </div>

          {/* File Info */}
          <div className="flex min-h-[82px] items-center py-3" aria-live="polite">
            {error ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 w-full">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            ) : file ? (
              <div className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <FileText size={22} className="shrink-0 text-sky-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatSize(file.size)}
                    {status === "done" && (
                      <span className="ml-2 font-medium text-emerald-600">· Berhasil diunggah</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label="Hapus file"
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada file bukti dipilih.</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={status === "uploading" || !file}
            className="btn-primary-shadow mt-auto h-11 w-full rounded-xl bg-[#0587c8] text-[15px] font-semibold text-white transition-all hover:bg-sky-700 disabled:opacity-50 active:scale-[.99]"
          >
            {status === "uploading" ? "Mengunggah bukti rekognisi…" : "Upload Bukti Rekognisi"}
          </button>
        </section>

        {/* Syarat & Kriteria Rekognisi */}
        <section className="card-shadow min-h-[349px] self-start rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Syarat & Ketentuan Ekuivalensi Rekognisi
          </h3>
          <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="rounded-xl bg-sky-50 border border-sky-100 p-4">
              <span className="font-bold text-sky-900 block mb-1">1. Jalur Prestasi / Kompetisi:</span>
              <p>Juara 1, 2, atau 3 dalam lomba tingkat Nasional atau Internasional yang diselenggarakan oleh Puspresnas / Kemdikbudristek atau lembaga bereputasi terkait bidang IT/Informatika.</p>
            </div>
            <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
              <span className="font-bold text-purple-900 block mb-1">2. Jalur Publikasi Ilmiah:</span>
              <p>Publikasi pada jurnal terindeks Scopus / SINTA 1 atau 2, atau prosiding konferensi internasional terindeks IEEE / ACM sebagai penulis pertama atau kedua bersama Dosen Pembimbing.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
