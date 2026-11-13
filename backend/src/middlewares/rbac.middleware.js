const { errorResponse } = require('../utils/response');

/**
 * Normalisasi nama role sistem ke 3 level RBAC utama:
 * 1. SuperAdmin (Admin Divisi TA / Admin_Dosen_TA)
 * 2. Admin (Dosen)
 * 3. User (Mahasiswa)
 */
function normalizeRole(role) {
    if (!role) return '';
    const r = role.toLowerCase().trim();
    if (r === 'superadmin' || r === 'admin_dosen_ta') return 'SuperAdmin';
    if (r === 'admin' || r === 'dosen') return 'Admin';
    if (r === 'user' || r === 'mahasiswa') return 'User';
    return role;
}

/**
 * Middleware untuk membatasi akses endpoint berdasarkan peran pengguna.
 * @param {string[]|string} allowedRoles Daftar peran yang diizinkan (e.g. ['SuperAdmin', 'Admin'])
 */
function requireRole(allowedRoles) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const normalizedAllowed = rolesArray.map(normalizeRole);

    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return errorResponse(res, 'Anda harus login untuk mengakses halaman ini', [], 401, 'ERR-AUTH-01');
        }

        const userRole = normalizeRole(req.user.role);

        // SuperAdmin memiliki akses tertinggi jika diperbolehkan
        if (normalizedAllowed.includes(userRole)) {
            return next();
        }

        return errorResponse(
            res,
            'Anda tidak memiliki izin untuk mengakses resource ini',
            [`Peran '${userRole}' tidak diizinkan. Peran yang dibutuhkan: ${normalizedAllowed.join(', ')}`],
            403,
            'ERR-AUTH-03'
        );
    };
}

/**
 * Middleware RBAC untuk membatasi fungsionalitas sistem:
 * Membatasi agar fungsional di luar Login, Registrasi, dan Profil Mahasiswa tidak dapat diakses.
 */
function restrictFeatureAccess(req, res, next) {
    return errorResponse(
        res,
        'Akses fitur dibatasi oleh kebijakan RBAC',
        ['Sistem saat ini dibatasi: hanya fungsionalitas Login, Registrasi, dan Profil Mahasiswa yang diizinkan.'],
        403,
        'ERR-RBAC-RESTRICTED'
    );
}

/**
 * Middleware RBAC memastikan hanya peran Mahasiswa (User) yang diizinkan mengakses
 */
function requireMahasiswa(req, res, next) {
    if (!req.user) {
        return errorResponse(res, 'Anda harus login terlebih dahulu', [], 401, 'ERR-AUTH-01');
    }
    const role = normalizeRole(req.user.role);
    if (role !== 'User') {
        return errorResponse(
            res,
            'Akses ditolak: Dashboard hanya dapat diakses oleh Mahasiswa',
            [`Peran '${role}' tidak diizinkan mengakses area mahasiswa`],
            403,
            'ERR-RBAC-NOT-MAHASISWA'
        );
    }
    next();
}

module.exports = {
    normalizeRole,
    requireRole,
    restrictFeatureAccess,
    requireMahasiswa
};
