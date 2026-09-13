const Redis = require('ioredis');
const logger = require('../utils/logger');

// Redis is a *performance* optimization (caching, distributed rate-limit
// store), not a hard dependency — the app must still run correctly (just
// slower / per-instance-limited) when Redis is missing, e.g. on a laptop
// with no Redis installed. Everything below is written to degrade
// gracefully instead of crashing the process.
let redisAvailable = false;
let hasLoggedUnavailable = false;

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 1, // fail fast per-command instead of hanging requests
  lazyConnect: false,
  // ioredis sends an internal "ready check" (INFO command) after each
  // connection attempt by default. When Redis is unreachable, that
  // internal command's rejection isn't awaited by our code and surfaces
  // as a process-level "unhandled rejection" — disabling it removes that
  // failure mode entirely (harmless for a single, non-clustered Redis).
  enableReadyCheck: false,
  retryStrategy(times) {
    if (times > 5) {
      if (!hasLoggedUnavailable) {
        logger.warn('Redis unreachable after 5 attempts — continuing without cache/rate-limit store. Set REDIS_URL to enable it.');
        hasLoggedUnavailable = true;
      }
      return null; // stop retrying so we don't spam reconnect attempts forever
    }
    return Math.min(times * 200, 2000);
  },
});

redisClient.on('connect', () => {
  redisAvailable = true;
  hasLoggedUnavailable = false;
  logger.info('Redis connected');
});

redisClient.on('error', (err) => {
  // Only warn once per outage instead of once per failed command.
  if (redisAvailable || !hasLoggedUnavailable) {
    logger.warn(`Redis unavailable (${err.message}) — falling back to direct DB reads / in-memory rate limiting.`);
  }
  redisAvailable = false;
});

redisClient.on('end', () => {
  redisAvailable = false;
});

// Prevent any redis command promise from ever becoming an *unhandled*
// rejection — every call site below already checks `redisAvailable`
// first, but this is a safety net for anything else that touches the client.
redisClient.on('error', () => {});

function isRedisAvailable() {
  return redisAvailable;
}

/**
 * Cache-aside helper. Wraps a DB-fetching function with a Redis cache.
 * Silently skips the cache (and just calls fetchFn) when Redis is down.
 * @param {string} key cache key
 * @param {number} ttlSeconds time to live
 * @param {Function} fetchFn async function that returns data on cache miss
 */
async function cacheAside(key, ttlSeconds, fetchFn) {
  if (!redisAvailable) return fetchFn();

  try {
    const cached = await redisClient.get(key);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    logger.warn(`Redis GET failed for ${key}: ${err.message}`);
  }

  const fresh = await fetchFn();

  try {
    await redisClient.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
  } catch (err) {
    logger.warn(`Redis SET failed for ${key}: ${err.message}`);
  }

  return fresh;
}

/** Invalidate all cache keys matching a prefix (e.g. after product mutation) */
async function invalidateByPrefix(prefix) {
  if (!redisAvailable) return;

  try {
    const stream = redisClient.scanStream({ match: `${prefix}*`, count: 100 });
    const pipeline = redisClient.pipeline();
    let found = false;
    for await (const keys of stream) {
      if (keys.length) {
        found = true;
        keys.forEach((k) => pipeline.del(k));
      }
    }
    if (found) await pipeline.exec();
  } catch (err) {
    logger.warn(`Redis cache invalidation failed for prefix ${prefix}: ${err.message}`);
  }
}

module.exports = { redisClient, cacheAside, invalidateByPrefix, isRedisAvailable };
