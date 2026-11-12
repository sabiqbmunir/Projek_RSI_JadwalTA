import { useState } from "react";
import { ChevronDown, Eye, EyeOff, Lock } from "lucide-react";

/* ----- Gaya dasar input ----- */
const inputBase =
  "w-full rounded-xl border bg-white text-sm text-slate-900 shadow-[0_2px_5px_-2px_rgba(15,23,42,0.08)] outline-none transition placeholder:text-slate-400";
const inputOk =
  "border-[#e6ebf2] focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15";
const inputError = "border-red-600 ring-4 ring-red-600/10";

const inputClass = (error, extra = "") =>
  `${inputBase} ${error ? inputError : inputOk} ${extra}`;

const iconClass = "pointer-events-none absolute left-4 size-[18px] text-slate-500";

/* ----- Pembungkus label + pesan error ----- */
export function Field({ id, label, required, hint, error, className = "", children }) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="mb-2 block text-sm font-semibold">
          {label}
          {required && <span className="text-red-600"> *</span>}
        </label>
        {hint && <span className="text-[11px] font-semibold text-slate-600">{hint}</span>}
      </div>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* ----- Input teks dengan ikon di kiri ----- */
export function TextInput({ icon: Icon, error, ...props }) {
  return (
    <div className="relative flex items-center">
      {Icon && <Icon className={iconClass} strokeWidth={1.8} aria-hidden="true" />}
      <input
        aria-invalid={error ? true : undefined}
        className={inputClass(error, "h-12 pr-4 pl-12")}
        {...props}
      />
    </div>
  );
}

/* ----- Input kata sandi dengan tombol tampil/sembunyi ----- */
export function PasswordInput({ error, ...props }) {
  const [visible, setVisible] = useState(false);
  const ToggleIcon = visible ? EyeOff : Eye;

  return (
    <div className="relative flex items-center">
      <Lock className={iconClass} strokeWidth={1.8} aria-hidden="true" />
      <input
        type={visible ? "text" : "password"}
        aria-invalid={error ? true : undefined}
        className={inputClass(error, "h-12 pr-13 pl-12")}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        className="absolute right-2 grid size-9 cursor-pointer place-items-center rounded-lg text-slate-500 hover:text-sky-800 focus-visible:outline-2 focus-visible:outline-sky-500/45"
      >
        <ToggleIcon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  );
}

/* ----- Dropdown ----- */
export function SelectInput({ icon: Icon, error, placeholder, options, value, ...props }) {
  return (
    <div className="relative flex items-center">
      {Icon && <Icon className={iconClass} strokeWidth={1.8} aria-hidden="true" />}
      <select
        value={value}
        aria-invalid={error ? true : undefined}
        className={inputClass(
          error,
          `h-12 cursor-pointer appearance-none pr-11 pl-12 ${value === "" ? "text-slate-400" : ""}`
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option} className="text-slate-900">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 size-4 text-slate-500" strokeWidth={2.2} aria-hidden="true" />
    </div>
  );
}

/* ----- Area teks ----- */
export function TextArea({ error, ...props }) {
  return (
    <textarea
      rows={3}
      aria-invalid={error ? true : undefined}
      className={inputClass(error, "min-h-22 resize-y p-4 leading-relaxed")}
      {...props}
    />
  );
}
