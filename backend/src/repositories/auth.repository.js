const { getPool, getSql } = require('../config/database');

class AuthRepository {
    /**
     * Mencari pengguna di 3 tabel (Mahasiswa, Dosen, Admin_Dosen_TA) berdasarkan email
     * Seluruh query menggunakan parameterized query (mencegah SQL Injection)
     */
    async findUserByEmail(email) {
        const pool = await getPool();
        const sql = getSql();

        // 1. Cek Admin_Dosen_TA terlebih dahulu (SuperAdmin)
        const adminReq = pool.request();
        adminReq.input('email', sql.NVarChar(100), email);
        const adminRes = await adminReq.query(`
            SELECT 
                CAST(id_admin AS NVARCHAR(30)) AS id,
                nip,
                nama,
                email,
                password,
                role,
                'SuperAdmin' AS normalized_role,
                'admin' AS user_type
            FROM Admin_Dosen_TA 
            WHERE email = @email
        `);

        if (adminRes.recordset.length > 0) {
            return adminRes.recordset[0];
        }

        // 2. Cek Dosen (Admin)
        const dosenReq = pool.request();
        dosenReq.input('email', sql.NVarChar(100), email);
        const dosenRes = await dosenReq.query(`
            SELECT 
                d.nip AS id,
                d.nip,
                d.nama,
                d.email,
                d.password,
                d.jumlah_bimbingan,
                d.role,
                'Admin' AS normalized_role,
                'dosen' AS user_type,
                STRING_AGG(k.kepakaran, ', ') AS kepakaran
            FROM Dosen d
            LEFT JOIN Dosen_Kepakaran k ON d.nip = k.nip
            WHERE d.email = @email
            GROUP BY d.nip, d.nama, d.email, d.password, d.jumlah_bimbingan, d.role
        `);

        if (dosenRes.recordset.length > 0) {
            return dosenRes.recordset[0];
        }

        // 3. Cek Mahasiswa (User)
        const mhsReq = pool.request();
        mhsReq.input('email', sql.NVarChar(100), email);
        const mhsRes = await mhsReq.query(`
            SELECT 
                nim AS id,
                nim,
                nama,
                email,
                password,
                prodi,
                tahun_masuk,
                judul,
                role,
                'User' AS normalized_role,
                'mahasiswa' AS user_type
            FROM Mahasiswa 
            WHERE email = @email
        `);

        if (mhsRes.recordset.length > 0) {
            return mhsRes.recordset[0];
        }

        return null;
    }

    async findMahasiswaByNim(nim) {
        const pool = await getPool();
        const sql = getSql();

        const req = pool.request();
        req.input('nim', sql.VarChar(20), nim);
        const res = await req.query(`
            SELECT nim, nama, email, prodi, tahun_masuk, judul, role
            FROM Mahasiswa 
            WHERE nim = @nim
        `);

        return res.recordset[0] || null;
    }

    async findDosenByNip(nip) {
        const pool = await getPool();
        const sql = getSql();

        const req = pool.request();
        req.input('nip', sql.VarChar(30), nip);
        const res = await req.query(`
            SELECT 
                d.nip, 
                d.nama, 
                d.email, 
                d.jumlah_bimbingan, 
                d.role,
                STRING_AGG(k.kepakaran, ', ') AS kepakaran
            FROM Dosen d
            LEFT JOIN Dosen_Kepakaran k ON d.nip = k.nip
            WHERE d.nip = @nip
            GROUP BY d.nip, d.nama, d.email, d.jumlah_bimbingan, d.role
        `);

        return res.recordset[0] || null;
    }

    /**
     * Memanggil Stored Procedure sp_registrasi_mahasiswa
     * Memenuhi kaidah atomisitas transaksi & DB impact mapping
     */
    async registerMahasiswaViaSP(data, clientIp = '127.0.0.1') {
        const pool = await getPool();
        const sql = getSql();

        const req = pool.request();
        req.input('p_nim', sql.VarChar(20), data.nim);
        req.input('p_nama', sql.NVarChar(100), data.nama);
        req.input('p_email', sql.NVarChar(100), data.email);
        req.input('p_password', sql.NVarChar(255), data.passwordHash);
        req.input('p_prodi', sql.NVarChar(100), data.prodi);
        req.input('p_tahun_masuk', sql.Int, data.tahun_masuk);
        req.input('p_judul', sql.NVarChar(255), data.judul || null);
        req.input('p_alamat_ip', sql.NVarChar(45), clientIp);
        req.output('p_result', sql.NVarChar(30));

        const result = await req.execute('sp_registrasi_mahasiswa');
        return result.output.p_result;
    }

    /**
     * Memanggil Stored Procedure sp_registrasi_dosen
     */
    async registerDosenViaSP(data, clientIp = '127.0.0.1') {
        const pool = await getPool();
        const sql = getSql();

        const req = pool.request();
        req.input('p_nip', sql.VarChar(30), data.nip);
        req.input('p_nama', sql.NVarChar(100), data.nama);
        req.input('p_email', sql.NVarChar(100), data.email);
        req.input('p_password', sql.NVarChar(255), data.passwordHash);
        req.input('p_kepakaran', sql.NVarChar(100), data.kepakaran || null);
        req.input('p_alamat_ip', sql.NVarChar(45), clientIp);
        req.output('p_result', sql.NVarChar(30));

        const result = await req.execute('sp_registrasi_dosen');
        return result.output.p_result;
    }

    /**
     * Mencatat aktivitas log audit (Login, Gagal Login, Logout, dll)
     */
    async logAudit(email, aksi, ip = '127.0.0.1', info = null) {
        try {
            const pool = await getPool();
            const sql = getSql();

            const req = pool.request();
            req.input('p_email', sql.NVarChar(150), email);
            req.input('p_jenis_aksi', sql.NVarChar(50), aksi);
            req.input('p_alamat_ip', sql.NVarChar(45), ip);
            req.input('p_info', sql.NVarChar(sql.MAX), info ? JSON.stringify(info) : null);

            await req.execute('sp_catat_login_audit');
        } catch (err) {
            console.error('Error saat mencatat log audit:', err.message);
        }
    }

    /**
     * Mendapatkan daftar audit log dengan pagination
     */
    async getAuditLogs({ page = 1, per_page = 15, email = null, aksi = null }) {
        const pool = await getPool();
        const sql = getSql();

        const offset = (page - 1) * per_page;

        const countReq = pool.request();
        let whereClauses = [];
        if (email) {
            countReq.input('email', sql.NVarChar(150), `%${email}%`);
            whereClauses.push("user_email LIKE @email");
        }
        if (aksi) {
            countReq.input('aksi', sql.NVarChar(50), aksi);
            whereClauses.push("jenis_aksi = @aksi");
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const countRes = await countReq.query(`SELECT COUNT(*) AS total FROM Log_audit ${whereSql}`);
        const total = countRes.recordset[0].total;

        const dataReq = pool.request();
        if (email) dataReq.input('email', sql.NVarChar(150), `%${email}%`);
        if (aksi) dataReq.input('aksi', sql.NVarChar(50), aksi);
        dataReq.input('offset', sql.Int, offset);
        dataReq.input('per_page', sql.Int, per_page);

        const dataRes = await dataReq.query(`
            SELECT 
                log_id,
                user_email,
                jenis_aksi,
                tabel_target,
                id_target,
                old_values,
                new_values,
                alamat_ip,
                waktu_dibuat
            FROM Log_audit
            ${whereSql}
            ORDER BY waktu_dibuat DESC
            OFFSET @offset ROWS FETCH NEXT @per_page ROWS ONLY
        `);

        return {
            data: dataRes.recordset,
            meta: {
                current_page: page,
                per_page: per_page,
                total: total,
                last_page: Math.ceil(total / per_page) || 1
            }
        };
    }
}

module.exports = new AuthRepository();
