const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

// GET /api/v1/dosen (Daftar Dosen)
router.get('/dosen', authenticateJWT, userController.getDosenList);

// GET /api/v1/mahasiswa (Daftar Mahasiswa - SuperAdmin & Admin)
router.get('/mahasiswa', authenticateJWT, requireRole(['SuperAdmin', 'Admin']), userController.getMahasiswaList);

module.exports = router;
