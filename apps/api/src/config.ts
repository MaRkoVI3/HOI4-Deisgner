// Configuration for the API
export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',

  // API Documentation
  apiVersion: process.env.API_VERSION || '0.1.0',
  apiBaseUrl: process.env.API_BASE_URL || '',

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Anthropic (Claude)
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4096', 10),
    temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.3'),
  },

  // Cache
  cache: {
    analysisTtlSeconds: parseInt(process.env.ANALYSIS_CACHE_TTL || '3600', 10), // 1 hour
  },

  // Rate limiting
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), // 1 minute
  },
};