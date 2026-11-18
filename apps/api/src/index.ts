import Fastify from 'fastify';
import { config } from './config';
import { connectRedis, disconnectRedis } from './services/redis';
import analysisRoutes from './routes/analysis';
import { registerSwagger } from './docs/openapi';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from '@fastify/type-provider-zod';

// ============================================================================
// Fastify App Setup
// ============================================================================

const app = Fastify({
  logger: {
    level: config.nodeEnv === 'development' ? 'debug' : 'info',
    transport: config.nodeEnv === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: 'all',
    },
  },
}).withTypeProvider<ZodTypeProvider>();

// Set Zod validators/serializers
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// ============================================================================
// Plugins & Middleware
// ============================================================================

// CORS
app.register(import('@fastify/cors'), {
  origin: config.nodeEnv === 'development' ? true : process.env.CORS_ORIGIN?.split(',') || false,
  credentials: true,
});

// Rate limiting
app.register(import('@fastify/rate-limit'), {
  max: config.rateLimit.max,
  timeWindow: config.rateLimit.timeWindow,
  hook: 'onRequest',
});

// Swagger/OpenAPI Documentation
await registerSwagger(app);

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: process.env.npm_package_version || '0.0.0',
}));

// API routes
app.register(analysisRoutes, { prefix: '/api' });

// 404 handler
app.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    success: false,
    error: `Route ${request.method} ${request.url} not found`,
  });
});

// Error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error, 'Unhandled error');
  const message = error instanceof Error ? error.message : 'Internal server error';
  reply.status(500).send({
    success: false,
    error: config.nodeEnv === 'development' ? message : 'Internal server error',
  });
});

// ============================================================================
// Server Lifecycle
// ============================================================================

async function start(): Promise<void> {
  try {
    // Connect to Redis
    await connectRedis();

    // Start server
    await app.listen({ port: config.port, host: config.host });

    app.log.info(`🚀 Server listening on http://${config.host}:${config.port}`);
    app.log.info(`📚 API docs available at http://${config.host}:${config.port}/api/analysis/health`);
  } catch (error) {
    app.log.error(error, 'Failed to start server');
    process.exit(1);
  }
}

async function stop(): Promise<void> {
  app.log.info('Shutting down...');
  await disconnectRedis();
  await app.close();
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

// Start the server
start();

export { app, start, stop };