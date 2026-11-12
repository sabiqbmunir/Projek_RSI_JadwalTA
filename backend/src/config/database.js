const dotenv = require('dotenv');
dotenv.config();

let poolPromise = null;
let activeSql = null;

async function getPool() {
    if (poolPromise) {
        return poolPromise;
    }

    poolPromise = (async () => {
        // 1. Coba koneksi menggunakan SQL Server Authentication (Host / User / Password dari DBeaver)
        if (process.env.DB_SERVER && process.env.DB_USER) {
            try {
                const sql = require('mssql');
                const config = {
                    server: process.env.DB_SERVER,
                    database: process.env.DB_DATABASE || 'PenjadwalanTA',
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    port: parseInt(process.env.DB_PORT || '1433', 10),
                    options: {
                        encrypt: process.env.DB_ENCRYPT === 'true',
                        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false'
                    }
                };

                console.log(`Menghubungkan ke SQL Server (${config.server}:${config.port}/${config.database}) via user '${config.user}'...`);
                const pool = await sql.connect(config);
                console.log(`Koneksi database SQL Server (${config.server}) berhasil!`);
                activeSql = sql;
                return pool;
            } catch (err) {
                console.warn('Koneksi via SQL Auth gagal, mencoba fallback ke Windows Auth...', err.message);
            }
        }

        // 2. Fallback koneksi msnodesqlv8 (Windows Authentication localhost)
        if (process.env.DB_CONNECTION_STRING) {
            try {
                const sqlV8 = require('mssql/msnodesqlv8');
                const config = {
                    connectionString: process.env.DB_CONNECTION_STRING
                };
                console.log('Menghubungkan ke SQL Server menggunakan msnodesqlv8 (Windows Trusted Connection)...');
                const pool = await sqlV8.connect(config);
                console.log('Koneksi database SQL Server (msnodesqlv8) berhasil.');
                activeSql = sqlV8;
                return pool;
            } catch (err) {
                console.error('Semua upaya koneksi database gagal:', err.message);
                throw err;
            }
        }

        throw new Error('Tidak ada konfigurasi database yang valid di file .env');
    })();

    return poolPromise;
}

function getSql() {
    return activeSql || require('mssql');
}

module.exports = {
    getPool,
    getSql
};
