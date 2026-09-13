const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { MemoryStore } = require('express-rate-limit');
const { redisClient, isRedisAvailable } = require('../config/redis');
const logger = require('../utils/logger');

// --------------------------------------------------------------------------
// BUG FIX: rate-limit-redis's RedisStore loads two Lua scripts via
// `SCRIPT LOAD` *synchronously in its constructor* and hard-throws
// `TypeError: unexpected reply from redis client` if that call doesn't
// return a string SHA (see rate-limit-redis/dist/index.cjs loadIncrementScript).
// The previous implementation here passed a `sendCommand` that resolved to
// `null` whenever Redis was down — which is exactly the "not a string"
// condition that trips that throw. Because the load happens in the
// constructor, the resulting rejected promise was never awaited/caught,
// which is what produced the "UNHANDLED REJECTION: unexpected reply from
// redis client" spam at startup, and later the request-time 500s
// (`GET /api/v1/auth/me 500`, `GET /api/v1/csrf-token 500`, etc.) once a
// request tried to actually await that rejected script-SHA promise.
//
// Fix: never hand RedisStore a fake/null reply. Only construct (and use) a
// RedisStore once Redis is confirmed connected, and transparently fall back
// to an in-process MemoryStore (imported from express-rate-limit itself,
// the same one it uses by default) whenever Redis is down — matching the
// "falling back to ... in-memory rate limiting" log message that was
// already being printed but not actually honored.
// --------------------------------------------------------------------------
class ResilientRedisStore {
  constructor({ prefix }) {
    this.prefix = prefix;
    this.memoryStore = new MemoryStore();
    this.redisStore = null;
  }

  init(options) {
    this.windowMs = options.windowMs;
    this.memoryStore.init(options);
  }

  // Lazily build the RedisStore only once Redis is actually up, so its
  // constructor's `SCRIPT LOAD` calls get a real reply instead of null.
  getRedisStore() {
    if (!isRedisAvailable()) return null;
    if (!this.redisStore) {
      try {
        const store = new RedisStore({
          sendCommand: (...args) => redisClient.call(...args),
          prefix: this.prefix,
        });
        store.init({ windowMs: this.windowMs });
        this.redisStore = store;
      } catch (err) {
        logger.warn(`Rate limiter: failed to initialize Redis store, using in-memory fallback: ${err.message}`);
        this.redisStore = null;
      }
    }
    return this.redisStore;
  }

  async increment(key) {
    const store = this.getRedisStore();
    if (store) {
      try {
        return await store.increment(key);
      } catch (err) {
        logger.warn(`Rate limiter: Redis increment failed, falling back to in-memory: ${err.message}`);
        this.redisStore = null; // force a fresh RedisStore next time Redis is confirmed healthy
      }
    }
    return this.memoryStore.increment(key);
  }

  async decrement(key) {
    const store = this.getRedisStore();
    if (store) {
      try {
        return await store.decrement(key);
      } catch (err) {
        logger.warn(`Rate limiter: Redis decrement failed: ${err.message}`);
      }
    }
    return this.memoryStore.decrement(key);
  }

  async resetKey(key) {
    const store = this.getRedisStore();
    if (store) {
      try {
        await store.resetKey(key);
      } catch (err) {
        logger.warn(`Rate limiter: Redis resetKey failed: ${err.message}`);
      }
    }
    return this.memoryStore.resetKey(key);
  }
}

const makeLimiter = ({ windowMs, max, message, prefix }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    // Redis-backed so the limit is enforced correctly across every
    // horizontally-scaled instance behind the load balancer, with an
    // automatic, crash-proof fallback to a per-instance in-memory store
    // whenever Redis is unavailable (local dev without Redis, an outage, etc).
    store: new ResilientRedisStore({ prefix: prefix || 'rl:' }),
  });

// General API limiter
const apiLimiter = makeLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  message: 'Too many requests, please try again later.',
  prefix: 'rl:api:',
});

// Stricter limiter for auth & form-submission endpoints (brute force / spam protection)
// BUG FIX: previously every limiter shared the same Redis key prefix ('rl:'),
// so the api/auth/inquiry limiters all incremented and read each other's
// counters — a burst of normal browsing traffic could exhaust the auth
// limiter's budget (and vice versa). Each limiter now gets its own prefix.
const authLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts, please try again in 15 minutes.',
  prefix: 'rl:auth:',
});

const inquiryLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many inquiries submitted. Please try again later.',
  prefix: 'rl:inquiry:',
});

module.exports = { apiLimiter, authLimiter, inquiryLimiter };
