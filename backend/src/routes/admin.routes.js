const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

// Endpoint Khusus SuperAdmin
router.get('/audit-logs', authenticateJWT, requireRole('SuperAdmin'), authController.getAuditLogs);

module.exports = router;
