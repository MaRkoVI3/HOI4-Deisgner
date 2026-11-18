import { vi } from 'vitest';

// Mock process.on to avoid pino/fastify issues in test environment
vi.stubGlobal('process', {
  ...process,
  on: vi.fn(),
  off: vi.fn(),
  once: vi.fn(),
  emit: vi.fn(),
  env: {
    ...process.env,
    NODE_ENV: 'test',
    ANTHROPIC_API_KEY: 'test-key',
    REDIS_URL: 'redis://localhost:6379',
    PORT: '3001',
    HOST: '0.0.0.0',
    CORS_ORIGIN: 'http://localhost:3000',
    RATE_LIMIT_MAX: '100',
    RATE_LIMIT_WINDOW: '60000',
    CACHE_TTL: '3600',
    LOG_LEVEL: 'silent',
  },
});

// Mock Redis
vi.mock('../src/services/redis', () => ({
  connectRedis: vi.fn().mockResolvedValue(undefined),
  disconnectRedis: vi.fn().mockResolvedValue(undefined),
  getRedisClient: vi.fn().mockReturnValue({
    ping: vi.fn().mockResolvedValue('PONG'),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    keys: vi.fn().mockResolvedValue([]),
    quit: vi.fn().mockResolvedValue('OK'),
  }),
  getCachedAnalysis: vi.fn().mockResolvedValue(null),
  setCachedAnalysis: vi.fn().mockResolvedValue(undefined),
  invalidateAnalysisCache: vi.fn().mockResolvedValue(undefined),
}));

// Mock @fastify/cors
vi.mock('@fastify/cors', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Mock @fastify/rate-limit
vi.mock('@fastify/rate-limit', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Mock @fastify/swagger
vi.mock('@fastify/swagger', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Mock @fastify/swagger-ui
vi.mock('@fastify/swagger-ui', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));