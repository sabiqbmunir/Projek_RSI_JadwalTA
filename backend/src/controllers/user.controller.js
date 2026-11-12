const { getPool, getSql } = require('../config/database');
const { successResponse, paginatedResponse } = require('../utils/response');

class UserController {
    /**
     * GET /api/v1/dosen
     * Menampilkan daftar dosen beserta bidang kepakaran & jumlah bimbingan
     */
    async getDosenList(req, res, next) {
        try {
            const pool = await getPool();
            const sql = getSql();

            const page = Math.max(1, parseInt(req.query.page || '1', 10));
            const per_page = Math.min(100, Math.max(1, parseInt(req.query.per_page || '15', 10)));
            const offset = (page - 1) * per_page;
            const search = req.query.q || '';

            const countReq = pool.request();
            let whereClause = '';
            if (search) {
                countReq.input('q', sql.NVarChar(100), `%${search}%`);
                whereClause = 'WHERE d.nama LIKE @q OR d.nip LIKE @q';
            }

            const countRes = await countReq.query(`SELECT COUNT(*) AS total FROM Dosen d ${whereClause}`);
            const total = countRes.recordset[0].total;

            const dataReq = pool.request();
            if (search) dataReq.input('q', sql.NVarChar(100), `%${search}%`);
            dataReq.input('offset', sql.Int, offset);
            dataReq.input('per_page', sql.Int, per_page);

            const dataRes = await dataReq.query(`
                SELECT 
                    d.nip,
                    d.nama,
                    d.email,
                    d.jumlah_bimbingan,
                    d.role,
                    STRING_AGG(k.kepakaran, ', ') AS kepakaran
                FROM Dosen d
                LEFT JOIN Dosen_Kepakaran k ON d.nip = k.nip
                ${whereClause}
                GROUP BY d.nip, d.nama, d.email, d.jumlah_bimbingan, d.role
                ORDER BY d.nama ASC
                OFFSET @offset ROWS FETCH NEXT @per_page ROWS ONLY
            `);

            return paginatedResponse(res, dataRes.recordset, {
                current_page: page,
                per_page: per_page,
                total: total,
                last_page: Math.ceil(total / per_page) || 1
            }, 'Daftar dosen berhasil diambil');
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/v1/mahasiswa
     * Menampilkan daftar mahasiswa
     */
    async getMahasiswaList(req, res, next) {
        try {
            const pool = await getPool();
            const sql = getSql();

            const page = Math.max(1, parseInt(req.query.page || '1', 10));
            const per_page = Math.min(100, Math.max(1, parseInt(req.query.per_page || '15', 10)));
            const offset = (page - 1) * per_page;
            const search = req.query.q || '';

            const countReq = pool.request();
            let whereClause = '';
            if (search) {
                countReq.input('q', sql.NVarChar(100), `%${search}%`);
                whereClause = 'WHERE nama LIKE @q OR nim LIKE @q';
            }

            const countRes = await countReq.query(`SELECT COUNT(*) AS total FROM Mahasiswa ${whereClause}`);
            const total = countRes.recordset[0].total;

            const dataReq = pool.request();
            if (search) dataReq.input('q', sql.NVarChar(100), `%${search}%`);
            dataReq.input('offset', sql.Int, offset);
            dataReq.input('per_page', sql.Int, per_page);

            const dataRes = await dataReq.query(`
                SELECT 
                    nim,
                    nama,
                    email,
                    prodi,
                    tahun_masuk,
                    judul,
                    role
                FROM Mahasiswa
                ${whereClause}
                ORDER BY nim ASC
                OFFSET @offset ROWS FETCH NEXT @per_page ROWS ONLY
            `);

            return paginatedResponse(res, dataRes.recordset, {
                current_page: page,
                per_page: per_page,
                total: total,
                last_page: Math.ceil(total / per_page) || 1
            }, 'Daftar mahasiswa berhasil diambil');
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new UserController();
