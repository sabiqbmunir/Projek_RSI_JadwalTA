const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { restrictFeatureAccess } = require('../middlewares/rbac.middleware');

// Endpoint /dosen dan /mahasiswa dibatasi oleh kebijakan RBAC
router.get('/dosen', authenticateJWT, restrictFeatureAccess);
router.get('/mahasiswa', authenticateJWT, restrictFeatureAccess);

module.exports = router;
