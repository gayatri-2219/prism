/**
 * Redis Cache Service
 * Provides get/set/del with TTL for caching AI insights, opportunities, etc.
 * Falls back to in-memory Map when Redis is unavailable (demo-friendly).
 */

import { config } from "../config";

// ─── In-memory fallback cache ───────────────────────────────────────────────

const memoryCache = new Map<string, { value: string; expiresAt: number }>();

function memGet(key: string): string | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

function memSet(key: string, value: string, ttlSeconds: number): void {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

function memDel(key: string): void {
  memoryCache.delete(key);
}

// ─── Redis client (lazy init) ───────────────────────────────────────────────

let redisClient: any = null;
let redisAvailable = false;

async function getRedis() {
  if (redisClient !== null) return redisAvailable ? redisClient : null;

  try {
    const Redis = (await import("ioredis")).default;
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
    });
    await redisClient.connect();
    redisAvailable = true;
    console.log("[cache] Redis connected");
    return redisClient;
  } catch {
    console.warn("[cache] Redis unavailable, using in-memory cache");
    redisClient = "failed";
    redisAvailable = false;
    return null;
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function cacheGet(key: string): Promise<string | null> {
  const redis = await getRedis();
  if (redis) {
    try {
      return await redis.get(key);
    } catch {
      return memGet(key);
    }
  }
  return memGet(key);
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set(key, value, "EX", ttlSeconds);
      return;
    } catch {
      // fall through to memory
    }
  }
  memSet(key, value, ttlSeconds);
}

export async function cacheDel(key: string): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.del(key);
      return;
    } catch {
      // fall through
    }
  }
  memDel(key);
}

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const raw = await cacheGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSetJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await cacheSet(key, JSON.stringify(value), ttlSeconds);
}
