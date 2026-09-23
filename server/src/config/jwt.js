require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'buylog_super_secret_jwt_key_2026_secure',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
