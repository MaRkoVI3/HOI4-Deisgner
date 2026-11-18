import Redis from 'ioredis';
import { config } from '../config';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying
        return Math.min(times * 100, 3000);
      },
    });

    redisClient.on('error', (err) => {
      console.error('[Redis] Connection error:', err);
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected');
    });

    redisClient.on('ready', () => {
      console.log('[Redis] Ready');
    });
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  if (client.status === 'wait') {
    await client.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export async function getCachedAnalysis(key: string): Promise<string | null> {
  try {
    const client = getRedisClient();
    return await client.get(`analysis:${key}`);
  } catch (error) {
    console.error('[Redis] Get cache error:', error);
    return null;
  }
}

export async function setCachedAnalysis(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
  try {
    const client = getRedisClient();
    await client.setex(`analysis:${key}`, ttlSeconds, value);
  } catch (error) {
    console.error('[Redis] Set cache error:', error);
  }
}

export async function invalidateAnalysisCache(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(`analysis:${key}`);
  } catch (error) {
    console.error('[Redis] Invalidate cache error:', error);
  }
}