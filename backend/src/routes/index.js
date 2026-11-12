const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const userRoutes = require('./user.routes');

// Prefix /api/v1/
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/', userRoutes);

// Root health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            service: 'Sistem Informasi Penjadwalan Tugas Akhir API',
            version: 'v1.0.0',
            timestamp: new Date().toISOString()
        },
        message: 'API Beroperasi dengan Normal',
        errors: []
    });
});

module.exports = router;
