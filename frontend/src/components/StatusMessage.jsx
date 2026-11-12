const styles = {
  success: "bg-emerald-50 text-emerald-600",
  error: "bg-red-50 text-red-600",
};

/** Pesan hasil submit (berhasil / gagal) */
export default function StatusMessage({ status, className = "" }) {
  if (!status.text) return null;
  return (
    <p
      role="status"
      className={`rounded-[10px] px-4 py-3 text-center text-sm ${styles[status.type] ?? ""} ${className}`}
    >
      {status.text}
    </p>
  );
}
