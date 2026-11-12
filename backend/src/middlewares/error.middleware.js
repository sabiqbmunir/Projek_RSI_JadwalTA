const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
    console.error('Unhandled Error:', err);

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Layanan tidak tersedia. Silakan coba lagi.';
    const errorCode = err.errorCode || 'ERR-SYS-01';

    return errorResponse(res, message, [err.message || 'Internal Server Error'], statusCode, errorCode);
}

module.exports = {
    errorHandler
};
