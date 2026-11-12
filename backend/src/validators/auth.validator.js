const { z } = require('zod');

const loginSchema = z.object({
    email: z
        .string({ required_error: 'Email wajib diisi' })
        .email({ message: 'Masukkan alamat email yang valid' })
        .max(100, { message: 'Email maksimal 100 karakter' }),
    password: z
        .string({ required_error: 'Kata sandi wajib diisi' })
        .min(6, { message: 'Kata sandi minimal 6 karakter' })
});

const registerMahasiswaSchema = z.object({
    nim: z
        .string({ required_error: 'NIM wajib diisi' })
        .min(3, { message: 'NIM minimal 3 karakter' })
        .max(20, { message: 'NIM maksimal 20 karakter' }),
    nama: z
        .string({ required_error: 'Nama lengkap wajib diisi' })
        .min(3, { message: 'Nama lengkap minimal 3 karakter' })
        .max(100, { message: 'Nama maksimal 100 karakter' }),
    email: z
        .string({ required_error: 'Email wajib diisi' })
        .email({ message: 'Masukkan alamat email yang valid' })
        .max(100, { message: 'Email maksimal 100 karakter' }),
    password: z
        .string({ required_error: 'Kata sandi wajib diisi' })
        .min(8, { message: 'Kata sandi minimal 8 karakter' }),
    prodi: z
        .string({ required_error: 'Program studi wajib diisi' })
        .min(2, { message: 'Program studi wajib dipilih' })
        .max(100, { message: 'Program studi maksimal 100 karakter' }),
    tahun_masuk: z
        .union([z.number(), z.string()])
        .optional()
        .transform((val) => {
            if (val === undefined || val === null || val === '') return new Date().getFullYear();
            const num = Number(val);
            return isNaN(num) ? new Date().getFullYear() : num;
        }),
    tahun: z
        .union([z.number(), z.string()])
        .optional(),
    judul: z
        .string()
        .max(255, { message: 'Judul maksimal 255 karakter' })
        .optional()
        .nullable()
});

const registerDosenSchema = z.object({
    nip: z
        .string({ required_error: 'NIP wajib diisi' })
        .min(8, { message: 'NIP minimal 8 karakter' })
        .max(30, { message: 'NIP maksimal 30 karakter' }),
    nama: z
        .string({ required_error: 'Nama lengkap wajib diisi' })
        .min(3, { message: 'Nama lengkap minimal 3 karakter' })
        .max(100, { message: 'Nama maksimal 100 karakter' }),
    email: z
        .string({ required_error: 'Email wajib diisi' })
        .email({ message: 'Masukkan alamat email yang valid' })
        .max(100, { message: 'Email maksimal 100 karakter' }),
    password: z
        .string({ required_error: 'Kata sandi wajib diisi' })
        .min(8, { message: 'Kata sandi minimal 8 karakter' }),
    kepakaran: z
        .string()
        .max(100, { message: 'Kepakaran maksimal 100 karakter' })
        .optional()
        .nullable()
});

module.exports = {
    loginSchema,
    registerMahasiswaSchema,
    registerDosenSchema
};
