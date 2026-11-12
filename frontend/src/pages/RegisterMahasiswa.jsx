import { Calendar, Contact, Landmark, Mail } from "lucide-react";
import RegisterLayout from "../components/RegisterLayout.jsx";
import RegisterActions from "../components/RegisterActions.jsx";
import { Field, PasswordInput, SelectInput, TextArea, TextInput } from "../components/FormControls.jsx";
import { NumberIcon } from "../components/icons.jsx";
import { useRegisterForm } from "../hooks/useRegisterForm.js";
import { digitsOnly } from "../lib/validators.js";

const PRODI_OPTIONS = [
  "S1 Informatika",
  "S1 Sistem Informasi",
  "S1 Teknik Industri",
  "S1 Teknik Elektro",
  "D3 Teknik Informatika",
  "S2 Informatika",
];

export default function RegisterMahasiswa() {
  const form = useRegisterForm({
    role: "mahasiswa",
    initialValues: { nama: "", nim: "", email: "", password: "", prodi: "", tahun: "", judul: "" },
  });
  const { field } = form;

  return (
    <RegisterLayout
      title="Registrasi Akun Mahasiswa"
      subtitle="Lengkapi data identitas akademik untuk pendaftaran tugas akhir dan seminar."
    >
      <form onSubmit={form.handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <Field id="nama" label="Nama Lengkap" required error={field("nama").error}>
            <TextInput icon={Contact} placeholder="Contoh: Ahmad Fauzi" autoComplete="name" {...field("nama")} />
          </Field>

          <Field id="nim" label="NIM (Nomor Induk Mahasiswa)" required error={field("nim").error}>
            <TextInput icon={NumberIcon} placeholder="CONTOH: M0521088" autoComplete="off" {...field("nim")} />
          </Field>

          <Field id="email" label="Email" error={field("email").error}>
            <TextInput icon={Mail} type="email" placeholder="nama@student.uns.ac.id" autoComplete="email" {...field("email")} />
          </Field>

          <Field id="password" label="Kata Sandi" required error={field("password").error}>
            <PasswordInput placeholder="Minimal 8 karakter kombinasi" autoComplete="new-password" {...field("password")} />
          </Field>

          <Field id="prodi" label="Program Studi (Prodi)" required error={field("prodi").error}>
            <SelectInput icon={Landmark} placeholder="Contoh: S1 Informatika" options={PRODI_OPTIONS} {...field("prodi")} />
          </Field>

          <Field id="tahun" label="Tahun Masuk" required error={field("tahun").error}>
            <TextInput
              icon={Calendar}
              inputMode="numeric"
              maxLength={4}
              placeholder="Contoh: 2022"
              autoComplete="off"
              {...field("tahun", { format: digitsOnly })}
            />
          </Field>

          <Field
            id="judul"
            label="Judul Penelitian / Skripsi (Judul)"
            required
            hint="Rencana usulan awal"
            error={field("judul").error}
            className="md:col-span-2"
          >
            <TextArea placeholder="Masukkan judul usulan penelitian atau skripsi secara lengkap..." {...field("judul")} />
          </Field>
        </div>

        <RegisterActions form={form} submitLabel="Daftar Akun Mahasiswa" />
      </form>
    </RegisterLayout>
  );
}
