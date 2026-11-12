/** Ikon "123" di dalam kotak (tidak tersedia di lucide) */
export function NumberIcon({ className, strokeWidth = 1.8, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10.5 7.5 10v4M10.5 10.5h2.5l-2.5 3.5h2.5M16 10.5h2.2l-1.2 1.7a1.2 1.2 0 1 1-1 2" />
    </svg>
  );
}
