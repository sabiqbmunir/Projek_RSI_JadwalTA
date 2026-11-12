const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { getPool } = require('./src/config/database');
const routes = require('./src/routes');
const { errorHandler } = require('./src/middlewares/error.middleware');
const { errorResponse } = require('./src/utils/response');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Security Headers via Helmet
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS Setup
app.use(cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Request Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// 5. Mount API Routes with /api/v1 prefix
app.use('/api/v1', routes);

// 6. Handle 404 Not Found
app.use((req, res) => {
    return errorResponse(res, `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`, [], 404, 'ERR-SYS-04');
});

// 7. Global Error Handler
app.use(errorHandler);

// 8. Server Boot & Database Connection
async function startServer() {
    try {
        console.log('Menginisialisasi koneksi ke basis data SQL Server...');
        await getPool();
        console.log('Basis data terhubung.');

        app.listen(PORT, () => {
            console.log(`=======================================================`);
            console.log(`Backend API Penjadwalan Tugas Akhir aktif!`);
            console.log(`URL: http://localhost:${PORT}/api/v1`);
            console.log(`Health Check: http://localhost:${PORT}/api/v1/health`);
            console.log(`=======================================================`);
        });
    } catch (err) {
        console.error('Fatal: Gagal menghubungkan basis data saat server dimulai:', err);
        process.exit(1);
    }
}

startServer();

module.exports = app;
