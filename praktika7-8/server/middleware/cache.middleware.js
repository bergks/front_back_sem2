const { getFromCache, saveToCache } = require('../utils/redis');

function cacheMiddleware(keyBuilder, ttl) {
    return async (req, res, next) => {
        try {
            const key = keyBuilder(req);
            const cachedData = await getFromCache(key);
            
            if (cachedData) {
                return res.json({
                    source: 'cache',
                    data: cachedData
                });
            }
            
            req.cacheKey = key;
            req.cacheTTL = ttl;
            next();
        } catch (err) {
            console.error('Cache middleware error:', err);
            next();
        }
    };
}

module.exports = cacheMiddleware;