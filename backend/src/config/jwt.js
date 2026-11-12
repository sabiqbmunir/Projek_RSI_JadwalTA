const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'secret_penjadwalan_ta_2026',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)
};
