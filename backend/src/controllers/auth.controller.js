const authService = require('../services/auth.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

class AuthController {
    /**
     * POST /api/v1/auth/login
     */
    async login(req, res, next) {
        try {
            const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            const { email, password } = req.body;

            const result = await authService.login({ email, password, ip: clientIp });
            return successResponse(res, result, 'Login berhasil', 200);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/v1/auth/register/mahasiswa
     */
    async registerMahasiswa(req, res, next) {
        try {
            const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            const result = await authService.registerMahasiswa(req.body, clientIp);
            return successResponse(res, result, 'Registrasi mahasiswa berhasil', 201);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/v1/auth/register/dosen
     */
    async registerDosen(req, res, next) {
        try {
            const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            const result = await authService.registerDosen(req.body, clientIp);
            return successResponse(res, result, 'Registrasi dosen berhasil', 201);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/v1/auth/register (Universal / role-based router)
     */
    async register(req, res, next) {
        try {
            const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            const role = (req.body.role || '').toLowerCase();

            if (role === 'dosen') {
                const result = await authService.registerDosen(req.body, clientIp);
                return successResponse(res, result, 'Registrasi dosen berhasil', 201);
            } else {
                const result = await authService.registerMahasiswa(req.body, clientIp);
                return successResponse(res, result, 'Registrasi mahasiswa berhasil', 201);
            }
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/v1/auth/logout
     */
    async logout(req, res, next) {
        try {
            const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            const result = await authService.logout(req.user, clientIp);
            return successResponse(res, null, 'Logout berhasil', 200);
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/v1/auth/me (Profil Pengguna Login)
     */
    async getMe(req, res, next) {
        try {
            const profile = await authService.getProfile(req.user);
            return successResponse(res, profile, 'Berhasil mengambil profil pengguna', 200);
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/v1/admin/audit-logs
     */
    async getAuditLogs(req, res, next) {
        try {
            const { data, meta } = await authService.getAuditLogs(req.query);
            return paginatedResponse(res, data, meta, 'Berhasil mengambil riwayat audit log');
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();
