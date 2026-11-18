import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { analyzeDivision, invalidateAnalysis, AnalysisRequest } from '../services/analysis';
import type { Division, AnalysisResults } from '@generalstaff/shared-types';

// ============================================================================
// Route Handlers
// ============================================================================

export async function analysisRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /api/analysis - Analyze a division
  fastify.post<{
    Body: AnalysisRequest;
    Reply: { success: boolean; data?: AnalysisResults; error?: string; cached?: boolean; processingTimeMs?: number };
  }>('/analysis', {
    schema: {
      body: {
        type: 'object',
        properties: {
          division: {
            type: 'object',
            // Division schema is complex, using basic validation
          },
          forceRefresh: { type: 'boolean' },
        },
        required: ['division'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: { type: 'string' },
            cached: { type: 'boolean' },
            processingTimeMs: { type: 'number' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Body: AnalysisRequest }>, reply: FastifyReply) => {
      try {
        const { division, forceRefresh } = request.body;

        // Validate division has required fields
        if (!division || !division.name || !division.country) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid division: missing required fields (name, country)',
          });
        }

        const result = await analyzeDivision({ division, forceRefresh });

        if (!result.success) {
          return reply.status(500).send(result);
        }

        return reply.send(result);
      } catch (error) {
        fastify.log.error(error, 'Analysis route error');
        return reply.status(500).send({
          success: false,
          error: 'Internal server error during analysis',
        });
      }
    },
  });

  // POST /api/analysis/invalidate - Invalidate cache for a division
  fastify.post<{
    Body: { division: Division };
    Reply: { success: boolean; error?: string };
  }>('/analysis/invalidate', {
    schema: {
      body: {
        type: 'object',
        properties: {
          division: { type: 'object' },
        },
        required: ['division'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { division } = request.body;

        if (!division || !division.name || !division.country) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid division: missing required fields',
          });
        }

        await invalidateAnalysis(division);

        return reply.send({ success: true });
      } catch (error) {
        fastify.log.error(error, 'Cache invalidation error');
        return reply.status(500).send({
          success: false,
          error: 'Failed to invalidate cache',
        });
      }
    },
  });

  // GET /api/analysis/health - Health check
  fastify.get('/analysis/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            anthropic: { type: 'boolean' },
            redis: { type: 'boolean' },
          },
        },
      },
    },
    handler: async () => {
      const anthropicAvailable = !!process.env.ANTHROPIC_API_KEY;
      let redisAvailable = false;

      try {
        const { getRedisClient } = await import('../services/redis');
        const client = getRedisClient();
        await client.ping();
        redisAvailable = true;
      } catch {
        redisAvailable = false;
      }

      return {
        status: 'ok',
        anthropic: anthropicAvailable,
        redis: redisAvailable,
      };
    },
  });
}

export default analysisRoutes;