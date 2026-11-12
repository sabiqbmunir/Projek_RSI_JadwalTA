import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Button from "./Button.jsx";
import StatusMessage from "./StatusMessage.jsx";

/** Bagian bawah form registrasi: persetujuan, link masuk, tombol daftar, dan pesan status */
export default function RegisterActions({ form, submitLabel }) {
  const { agree, setAgree, agreeError, status } = form;

  return (
    <>
      <div className="mt-8">
        <label className="relative flex cursor-pointer items-start gap-2">
          <input
            id="agree"
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="peer absolute size-5 cursor-pointer opacity-0"
          />
          <span
            aria-hidden="true"
            className="mt-px grid size-5 shrink-0 place-items-center rounded-[5px] border-[1.5px] border-slate-400 bg-white text-white transition peer-checked:border-sky-500 peer-checked:bg-sky-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sky-500/45 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
          >
            <Check className="size-3.5" strokeWidth={3.2} />
          </span>
          <span className="text-xs leading-normal text-slate-600">
            Saya menyatakan bahwa data yang diisikan adalah valid dan saya menyetujui ketentuan pedoman
            akademik penyelenggaraan Tugas Akhir di Universitas Sebelas Maret.
          </span>
        </label>
        {agreeError && (
          <p role="alert" className="mt-1.5 ml-7 text-xs text-red-600">
            {agreeError}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col-reverse items-stretch gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-center text-sm md:text-left">
          Sudah memiliki akun?{" "}
          <Link to="/" className="font-semibold text-sky-700 hover:underline">
            Masuk ke Akun
          </Link>
        </p>
        <Button
          type="submit"
          loading={status.loading}
          icon={ArrowRight}
          className="h-12 w-full bg-sky-500 px-6 text-sm shadow-[0_10px_18px_-8px_rgba(14,165,233,0.5)] hover:bg-sky-600 md:w-auto md:min-w-[244px]"
        >
          {submitLabel}
        </Button>
      </div>

      <StatusMessage status={status} className="mt-5" />
    </>
  );
}
