const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { restrictFeatureAccess } = require('../middlewares/rbac.middleware');

// Seluruh endpoint admin dibatasi oleh kebijakan RBAC
router.use(authenticateJWT, restrictFeatureAccess);

module.exports = router;
