import { useRef, useState } from "react";
import { FolderOpen, FileText, Download, X, CheckCircle, AlertCircle } from "lucide-react";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_EXT = [".pdf", ".docx"];

const formatSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/* ---------- Komponen UploadCard ---------- */
function UploadCard({ title = "Upload Berkas Pendaftaran", subType = "Formulir Pendaftaran", onNotify }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | uploading | done

  const pickFile = (f) => {
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      setError("Format file harus berupa PDF atau DOCX.");
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

  const handleUpload = async () => {
    if (!file) {
      setError("Pilih file terlebih dahulu.");
      return;
    }
    setStatus("uploading");
    setTimeout(() => {
      setStatus("done");
      if (onNotify) {
        onNotify(`${subType} "${file.name}" berhasil diunggah ke sistem!`);
      }
    }, 900);
  };

  return (
    <section className="card-shadow flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
      <h2 className="border-b border-slate-100 pb-4 text-[19px] font-bold text-slate-900">
        {title}
      </h2>

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
        <p className="mt-1 text-xs text-slate-500">Format: PDF / DOCX (Maks 20MB)</p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
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

      {/* File info / status */}
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
          <p className="text-xs text-slate-400 italic">Belum ada file dipilih.</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleUpload}
        disabled={status === "uploading" || !file}
        className="btn-primary-shadow mt-auto h-11 w-full rounded-xl bg-[#0587c8] text-[15px] font-semibold text-white transition-all hover:bg-sky-700 disabled:opacity-50 active:scale-[.99]"
      >
        {status === "uploading" ? "Mengunggah berkas…" : "Upload File Sekarang"}
      </button>
    </section>
  );
}

/* ---------- Komponen TemplateCard ---------- */
function TemplateCard({ name, onDownload }) {
  return (
    <section className="card-shadow min-h-[349px] self-start rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <div>
          <p className="text-sm font-bold text-slate-900">{name}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">DOCX &bull; 2.4 MB</p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-sky-600 active:scale-[.98]"
        >
          <Download size={14} />
          <span>Unduh</span>
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-xs text-slate-500 leading-relaxed">
        <h4 className="font-bold text-slate-700 mb-2">Petunjuk Pengunggahan Berkas:</h4>
        <ul className="list-disc pl-4 space-y-1">
          <li>Unduh template resmi di atas dan isi data secara lengkap.</li>
          <li>Pastikan dokumen telah ditandatangani oleh Dosen Pembimbing (jika diwajibkan).</li>
          <li>Simpan kembali dalam format <strong>PDF</strong> atau <strong>DOCX</strong> sebelum diunggah.</li>
          <li>Ukuran maksimal berkas adalah <strong>20 MB</strong>.</li>
        </ul>
      </div>
    </section>
  );
}

/* ---------- Main Component Upload Berkas ---------- */
export default function MahasiswaUploadBerkas({ type = "semhas", onNotify }) {
  const titles = {
    sempro: {
      label: "Seminar Proposal (Sempro)",
      template: "Template Pendaftaran Sempro",
    },
    semhas: {
      label: "Seminar Hasil (Semhas)",
      template: "Template Pendaftaran Semhas",
    },
    sidang: {
      label: "Sidang Tugas Akhir (Sidang TA)",
      template: "Template Pendaftaran Sidang TA",
    },
  };

  const info = titles[type] || titles.semhas;

  const handleDownloadTemplate = () => {
    if (onNotify) {
      onNotify(`${info.template} (.docx) berhasil diunduh!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header Card */}
      <div className="card-shadow rounded-2xl border border-slate-200/90 bg-white px-8 py-5 shadow-xs">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Upload Berkas — {info.label}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Silakan unduh template pendaftaran dan unggah formulir beserta berkas persyaratan.
        </p>
      </div>

      {/* Grid: 2 Upload Cards on the left + 1 Template Card on the right */}
      <div className="grid items-start gap-x-12 gap-y-10 xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          <UploadCard
            key={`${type}-1`}
            title="Upload Berkas Pendaftaran"
            subType="Berkas Pendaftaran"
            onNotify={onNotify}
          />
          <UploadCard
            key={`${type}-2`}
            title="Upload Berkas Persyaratan / Turnitin"
            subType="Bukti Turnitin / Persyaratan"
            onNotify={onNotify}
          />
        </div>

        <TemplateCard
          name={info.template}
          onDownload={handleDownloadTemplate}
        />
      </div>
    </div>
  );
}
