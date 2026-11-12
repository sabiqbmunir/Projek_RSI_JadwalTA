const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middlewares/validate.middleware');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const {
    loginSchema,
    registerMahasiswaSchema,
    registerDosenSchema
} = require('../validators/auth.validator');

// Endpoint Public (Autentikasi & Registrasi)
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/register/mahasiswa', validateRequest(registerMahasiswaSchema), authController.registerMahasiswa);
router.post('/register/dosen', validateRequest(registerDosenSchema), authController.registerDosen);
router.post('/register', authController.register);

// Endpoint Terproteksi JWT
router.post('/logout', authenticateJWT, authController.logout);
router.get('/me', authenticateJWT, authController.getMe);

module.exports = router;
