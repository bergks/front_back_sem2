module.exports = {
    PORT: 3000,
    JWT_SECRET: 'access_secret',
    REFRESH_SECRET: 'refresh_secret',
    JWT_EXPIRES_IN: '30s',
    REFRESH_EXPIRES_IN: '7d',
    BCRYPT_ROUNDS: 10,
    CORS_ORIGIN: 'http://localhost:3001'
}