/**
 * Tombol dasar. `className` dipakai untuk ukuran & warna.
 * Saat `loading`, ikon diganti spinner dan tombol dinonaktifkan.
 */
export default function Button({ loading = false, icon: Icon, className = "", children, ...props }) {
  return (
    <button
      disabled={loading}
      className={`group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold text-white transition active:translate-y-px disabled:pointer-events-none disabled:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500/45 ${className}`}
      {...props}
    >
      <span>{children}</span>
      {loading ? (
        <span
          className="size-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden="true"
        />
      ) : (
        Icon && (
          <Icon
            className="size-[18px] transition-transform group-hover:translate-x-[3px]"
            strokeWidth={2.2}
            aria-hidden="true"
          />
        )
      )}
    </button>
  );
}
