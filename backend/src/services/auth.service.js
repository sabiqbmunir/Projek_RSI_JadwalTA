const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');
const { jwtSecret, jwtExpiresIn, bcryptSaltRounds } = require('../config/jwt');

class AppError extends Error {
    constructor(message, statusCode = 400, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
    }
}

class AuthService {
    /**
     * Memproses proses login pengguna
     * Memenuhi:
     * - BCrypt cost >= 12
     * - JWT Bearer token HS256 exp 24 jam
     * - Audit log otomatis (LOGIN_SUCCESS, LOGIN_FAILED)
     * - Target waktu respons <= 1000 ms
     */
    async login({ email, password, ip = '127.0.0.1' }) {
        const cleanEmail = email.trim().toLowerCase();

        const user = await authRepository.findUserByEmail(cleanEmail);
        if (!user) {
            await authRepository.logAudit(cleanEmail, 'LOGIN_FAILED', ip, { reason: 'Akun tidak ditemukan' });
            throw new AppError('Email atau kata sandi tidak valid', 401, 'ERR-AUTH-02');
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            await authRepository.logAudit(cleanEmail, 'LOGIN_FAILED', ip, { reason: 'Kata sandi salah' });
            throw new AppError('Email atau kata sandi tidak valid', 401, 'ERR-AUTH-02');
        }

        // Generate JWT token
        const tokenPayload = {
            user_id: user.id,
            email: user.email,
            nama: user.nama,
            role: user.normalized_role,
            raw_role: user.role,
            user_type: user.user_type,
            nim: user.nim || null,
            nip: user.nip || null
        };

        const token = jwt.sign(tokenPayload, jwtSecret, {
            expiresIn: jwtExpiresIn,
            algorithm: 'HS256'
        });

        // Catat audit log login sukses
        await authRepository.logAudit(user.email, 'LOGIN_SUCCESS', ip, { role: user.normalized_role });

        return {
            token,
            expires_in: 86400,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                peran: user.normalized_role,
                role: user.role,
                user_type: user.user_type,
                nim: user.nim || null,
                nip: user.nip || null,
                prodi: user.prodi || null,
                tahun_masuk: user.tahun_masuk || null,
                judul: user.judul || null,
                kepakaran: user.kepakaran || null,
                jumlah_bimbingan: user.jumlah_bimbingan !== undefined ? user.jumlah_bimbingan : null
            }
        };
    }

    /**
     * Memproses registrasi akun mahasiswa
     */
    async registerMahasiswa(data, ip = '127.0.0.1') {
        const cleanEmail = data.email.trim().toLowerCase();
        const cleanNim = data.nim.trim();

        // Enkripsi kata sandi dengan bcrypt cost 12
        const passwordHash = await bcrypt.hash(data.password, bcryptSaltRounds);

        const spResult = await authRepository.registerMahasiswaViaSP({
            nim: cleanNim,
            nama: data.nama.trim(),
            email: cleanEmail,
            passwordHash: passwordHash,
            prodi: data.prodi ? data.prodi.trim() : null,
            tahun_masuk: parseInt(data.tahun_masuk || data.tahun, 10),
            judul: data.judul ? data.judul.trim() : null
        }, ip);

        if (spResult === 'EMAIL_EXISTS') {
            throw new AppError('Email sudah terdaftar dalam sistem.', 409, 'ERR-DAT-02');
        }

        if (spResult === 'NIM_EXISTS') {
            throw new AppError('NIM sudah terdaftar dalam sistem.', 409, 'ERR-DAT-02');
        }

        if (spResult !== 'SUCCESS') {
            throw new AppError('Layanan tidak tersedia. Silakan coba lagi.', 503, 'ERR-SYS-01');
        }

        return {
            nim: cleanNim,
            nama: data.nama.trim(),
            email: cleanEmail,
            prodi: data.prodi ? data.prodi.trim() : null,
            tahun_masuk: parseInt(data.tahun_masuk || data.tahun, 10),
            judul: data.judul ? data.judul.trim() : null,
            role: 'mahasiswa'
        };
    }

    /**
     * Memproses registrasi akun dosen
     */
    async registerDosen(data, ip = '127.0.0.1') {
        const cleanEmail = data.email.trim().toLowerCase();
        const cleanNip = data.nip.trim();

        // Enkripsi kata sandi dengan bcrypt cost 12
        const passwordHash = await bcrypt.hash(data.password, bcryptSaltRounds);

        const spResult = await authRepository.registerDosenViaSP({
            nip: cleanNip,
            nama: data.nama.trim(),
            email: cleanEmail,
            passwordHash: passwordHash,
            kepakaran: data.kepakaran ? data.kepakaran.trim() : null
        }, ip);

        if (spResult === 'EMAIL_EXISTS') {
            throw new AppError('Email sudah terdaftar dalam sistem.', 409, 'ERR-DAT-02');
        }

        if (spResult === 'NIP_EXISTS') {
            throw new AppError('NIP sudah terdaftar dalam sistem.', 409, 'ERR-DAT-02');
        }

        if (spResult !== 'SUCCESS') {
            throw new AppError('Layanan tidak tersedia. Silakan coba lagi.', 503, 'ERR-SYS-01');
        }

        return {
            nip: cleanNip,
            nama: data.nama.trim(),
            email: cleanEmail,
            kepakaran: data.kepakaran ? data.kepakaran.trim() : null,
            role: 'dosen'
        };
    }

    /**
     * Mendapatkan profil lengkap pengguna yang sedang aktif (terautentikasi)
     */
    async getProfile(userPayload) {
        const user = await authRepository.findUserByEmail(userPayload.email);
        if (!user) {
            throw new AppError('Pengguna tidak ditemukan', 404, 'ERR-DAT-01');
        }

        delete user.password;
        return user;
    }

    /**
     * Logout pengguna dan mencatat ke audit log
     */
    async logout(userPayload, ip = '127.0.0.1') {
        if (userPayload && userPayload.email) {
            await authRepository.logAudit(userPayload.email, 'LOGOUT', ip, { role: userPayload.role });
        }
        return { message: 'Logout berhasil' };
    }

    /**
     * Mendapatkan daftar audit log (khusus SuperAdmin)
     */
    async getAuditLogs(query) {
        const page = Math.max(1, parseInt(query.page || '1', 10));
        const per_page = Math.min(100, Math.max(1, parseInt(query.per_page || '15', 10)));
        const email = query.email || null;
        const aksi = query.aksi || null;

        return await authRepository.getAuditLogs({ page, per_page, email, aksi });
    }
}

module.exports = new AuthService();
