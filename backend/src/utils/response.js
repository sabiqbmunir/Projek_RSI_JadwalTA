/**
 * Standard RESTful JSON Envelope Response
 * Format: { status: 'success' | 'error', data, message, errors, error_code? }
 */

function successResponse(res, data = null, message = 'Berhasil', statusCode = 200) {
    return res.status(statusCode).json({
        status: 'success',
        data,
        message,
        errors: []
    });
}

function errorResponse(res, message = 'Terjadi kesalahan pada sistem', errors = [], statusCode = 400, errorCode = null) {
    const payload = {
        status: 'error',
        data: null,
        message,
        errors: Array.isArray(errors) ? errors : [errors]
    };

    if (errorCode) {
        payload.error_code = errorCode;
    }

    return res.status(statusCode).json(payload);
}

function paginatedResponse(res, data = [], meta = { current_page: 1, per_page: 15, total: 0, last_page: 1 }, message = 'Berhasil mengambil daftar data') {
    return res.status(200).json({
        status: 'success',
        data,
        meta,
        message,
        errors: []
    });
}

module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse
};
