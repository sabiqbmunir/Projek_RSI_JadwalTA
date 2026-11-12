import { Contact, Landmark, Mail } from "lucide-react";
import RegisterLayout from "../components/RegisterLayout.jsx";
import RegisterActions from "../components/RegisterActions.jsx";
import { Field, PasswordInput, SelectInput, TextInput } from "../components/FormControls.jsx";
import { NumberIcon } from "../components/icons.jsx";
import { useRegisterForm } from "../hooks/useRegisterForm.js";
import { digitsOnly } from "../lib/validators.js";

const KEPAKARAN_OPTIONS = [
  "Cyber Security",
  "Rekayasa Perangkat Lunak",
  "Kecerdasan Buatan",
  "Data Science",
  "Jaringan Komputer",
  "Sistem Informasi",
  "Basis Data"
];

export default function RegisterDosen() {
  const form = useRegisterForm({
    role: "dosen",
    initialValues: { nama: "", nip: "", email: "", password: "", kepakaran: "" },
  });
  const { field } = form;

  return (
    <RegisterLayout
      title="Registrasi Akun Dosen"
      subtitle="Lengkapi data identitas dosen untuk menjadi pembimbing dan penguji tugas akhir."
    >
      <form onSubmit={form.handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <Field id="nama" label="Nama Lengkap" required error={field("nama").error}>
            <TextInput icon={Contact} placeholder="Contoh: Dr. Budi Santoso, M.Kom." autoComplete="name" {...field("nama")} />
          </Field>

          <Field id="nip" label="NIP (Nomor Induk Pegawai)" required error={field("nip").error}>
            <TextInput
              icon={NumberIcon}
              inputMode="numeric"
              placeholder="Contoh: 198005152005011002"
              autoComplete="off"
              {...field("nip", { format: digitsOnly })}
            />
          </Field>

          <Field id="email" label="Email" required error={field("email").error}>
            <TextInput icon={Mail} type="email" placeholder="nama@staff.uns.ac.id" autoComplete="email" {...field("email")} />
          </Field>

          <Field id="password" label="Kata Sandi" required error={field("password").error}>
            <PasswordInput placeholder="Minimal 8 karakter" autoComplete="new-password" {...field("password")} />
          </Field>

          <Field id="kepakaran" label="Bidang Kepakaran" required error={field("kepakaran").error} className="md:col-span-2">
            <SelectInput icon={Landmark} placeholder="Pilih Bidang Kepakaran" options={KEPAKARAN_OPTIONS} {...field("kepakaran")} />
          </Field>
        </div>

        <RegisterActions form={form} submitLabel="Daftar Akun Dosen" />
      </form>
    </RegisterLayout>
  );
}
