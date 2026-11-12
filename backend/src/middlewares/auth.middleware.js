const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/jwt');
const { errorResponse } = require('../utils/response');

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return errorResponse(res, 'Anda harus login untuk mengakses halaman ini', [], 401, 'ERR-AUTH-01');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return errorResponse(res, 'Format token autentikasi tidak valid. Gunakan format Bearer <token>', [], 401, 'ERR-AUTH-01');
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return errorResponse(res, 'Token autentikasi tidak valid atau sudah kedaluwarsa', [err.message], 401, 'ERR-AUTH-01');
    }
}

module.exports = {
    authenticateJWT
};
