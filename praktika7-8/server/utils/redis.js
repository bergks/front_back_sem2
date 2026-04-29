const { createClient } = require('redis');

let redisClient = null;

async function initRedis() {
    try {
        redisClient = createClient({
            url: 'redis://localhost:6379'
        });
        
        redisClient.on('error', (err) => console.error('Redis Client Error:', err));
        redisClient.on('connect', () => console.log('Redis connected'));
        
        await redisClient.connect();
    } catch (err) {
        console.error('Redis connection error:', err.message);
    }
}

async function getFromCache(key) {
    if (!redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Cache read error:', err);
        return null;
    }
}

async function saveToCache(key, data, ttl) {
    if (!redisClient) return;
    try {
        await redisClient.set(key, JSON.stringify(data), { EX: ttl });
    } catch (err) {
        console.error('Cache save error:', err);
    }
}

async function invalidateCache(key) {
    if (!redisClient) return;
    try {
        await redisClient.del(key);
    } catch (err) {
        console.error('Cache invalidate error:', err);
    }
}

module.exports = {
    initRedis,
    getFromCache,
    saveToCache,
    invalidateCache,
    get redisClient() { return redisClient; }
};