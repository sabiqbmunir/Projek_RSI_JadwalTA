const { errorResponse } = require('../utils/response');

/**
 * Middleware validasi skema Zod
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
function validateRequest(schema, source = 'body') {
    return (req, res, next) => {
        try {
            const dataToValidate = req[source];
            const parsed = schema.parse(dataToValidate);
            req[source] = parsed;
            next();
        } catch (err) {
            if (err.errors) {
                const formattedErrors = err.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }));

                const firstMsg = formattedErrors[0]?.message || 'Lengkapi data yang wajib diisi';
                return errorResponse(res, firstMsg, formattedErrors, 422, 'ERR-VAL-02');
            }

            return errorResponse(res, 'Format data tidak valid', [err.message], 422, 'ERR-VAL-01');
        }
    };
}

module.exports = {
    validateRequest
};
