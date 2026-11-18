import { FastifyInstance } from 'fastify';
import { config } from '../config';

// ============================================================================
// OpenAPI/Swagger Configuration
// ============================================================================

/**
 * Registers Swagger/OpenAPI documentation with the Fastify instance
 * Provides both JSON/YAML spec endpoints and Swagger UI at /docs
 */
export async function registerSwagger(app: FastifyInstance): Promise<void> {
  // Register @fastify/swagger for OpenAPI spec generation
  await app.register(import('@fastify/swagger'), {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'GeneralStaff API',
        description: 'API for GeneralStaff - Military Division Analysis & Design Tool',
        version: config.apiVersion || '0.1.0',
        contact: {
          name: 'GeneralStaff Team',
          url: 'https://github.com/generalstaff/generalstaff',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: config.nodeEnv === 'development'
            ? `http://${config.host}:${config.port}`
            : config.apiBaseUrl || 'https://api.generalstaff.app',
          description: config.nodeEnv === 'development' ? 'Development server' : 'Production server',
        },
      ],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Analysis', description: 'Division analysis endpoints' },
        { name: 'Designs', description: 'Division design management endpoints' },
        { name: 'Auth', description: 'Authentication & authorization endpoints' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token obtained from authentication',
          },
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'API key for service-to-service communication',
          },
        },
        schemas: {
          // Common response wrappers
          SuccessResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: { type: 'string', example: 'Error message' },
            },
          },
          PaginatedResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object' } },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer', example: 1 },
                  limit: { type: 'integer', example: 20 },
                  total: { type: 'integer', example: 100 },
                  totalPages: { type: 'integer', example: 5 },
                },
              },
            },
          },
          // Country schema
          Country: {
            type: 'object',
            required: ['tag', 'name', 'color'],
            properties: {
              tag: { type: 'string', pattern: '^[A-Z]{3}$', example: 'USA' },
              name: { type: 'string', example: 'United States' },
              color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', example: '#002868' },
              flagUrl: { type: 'string', format: 'uri', example: 'https://flags.example.com/usa.svg' },
              modifiers: {
                type: 'object',
                additionalProperties: { type: 'number' },
                example: { softAttack: 0.1, hardness: 0.05 },
              },
            },
          },
          // Battalion schema
          Battalion: {
            type: 'object',
            required: ['id', 'templateId', 'count'],
            properties: {
              id: { type: 'string', example: 'bat-1' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              templateId: { type: 'string', example: 'infantry' },
              template_id: { type: 'string', example: 'infantry' },
              count: { type: 'integer', minimum: 1, maximum: 100, example: 3 },
              equipmentAssignments: {
                type: 'object',
                additionalProperties: { type: 'string' },
                example: { 'slot-1': 'eq-1' },
              },
              equipment_assignments: {
                type: 'object',
                additionalProperties: { type: 'string' },
                example: { 'slot-1': 'eq-1' },
              },
              customName: { type: 'string', example: '1st Infantry Battalion' },
            },
          },
          // Support Company schema
          SupportCompany: {
            type: 'object',
            required: ['id', 'templateId'],
            properties: {
              id: { type: 'string', example: 'sup-1' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              templateId: {
                type: 'string',
                enum: [
                  'recon', 'engineer', 'maintenance', 'logistics', 'signal',
                  'hospital', 'military_police', 'anti_air', 'anti_tank',
                  'artillery', 'rocket_artillery'
                ],
                example: 'engineer',
              },
              template_id: {
                type: 'string',
                enum: [
                  'recon', 'engineer', 'maintenance', 'logistics', 'signal',
                  'hospital', 'military_police', 'anti_air', 'anti_tank',
                  'artillery', 'rocket_artillery'
                ],
                example: 'engineer',
              },
              equipmentVariantId: { type: 'string', example: 'eng-variant-1' },
              equipment_variant_id: { type: 'string', example: 'eng-variant-1' },
            },
          },
          // Doctrine schema
          DoctrineRef: {
            type: 'object',
            required: ['id', 'doctrineId'],
            properties: {
              id: { type: 'string', example: 'doc-1' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              doctrineId: { type: 'string', example: 'mobile_warfare' },
            },
          },
          // Spirit schema
          SpiritRef: {
            type: 'object',
            required: ['id', 'spiritId'],
            properties: {
              id: { type: 'string', example: 'spi-1' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              spiritId: { type: 'string', example: 'elastic_defense' },
            },
          },
          // Technology schema
          TechnologyRef: {
            type: 'object',
            required: ['id', 'technologyId'],
            properties: {
              id: { type: 'string', example: 'tech-1' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              technologyId: { type: 'string', example: 'infantry_weapons_1' },
            },
          },
          // Division Stats schema
          DivisionStats: {
            type: 'object',
            properties: {
              softAttack: { type: 'number', example: 120.5 },
              hardAttack: { type: 'number', example: 45.2 },
              airAttack: { type: 'number', example: 10.0 },
              defense: { type: 'number', example: 85.3 },
              breakthrough: { type: 'number', example: 35.1 },
              armor: { type: 'number', example: 15.0 },
              hardness: { type: 'number', example: 0.35 },
              piercing: { type: 'number', example: 25.0 },
              organization: { type: 'number', example: 75.0 },
              maxOrganization: { type: 'number', example: 80.0 },
              recoveryRate: { type: 'number', example: 0.3 },
              supplyConsumption: { type: 'number', example: 2.5 },
              fuelConsumption: { type: 'number', example: 1.8 },
              weight: { type: 'number', example: 15000 },
              combatWidth: { type: 'number', example: 20 },
              recon: { type: 'number', example: 15.0 },
              suppression: { type: 'number', example: 8.0 },
              entrenchment: { type: 'number', example: 5.0 },
              initiative: { type: 'number', example: 1.2 },
              speed: { type: 'number', example: 4.5 },
              maxSpeed: { type: 'number', example: 5.0 },
              hp: { type: 'number', example: 120.0 },
              apAttack: { type: 'number', example: 12.0 },
              manpower: { type: 'number', example: 12000 },
              productionCost: { type: 'number', example: 5000 },
              icCost: { type: 'number', example: 250 },
              battalionCount: { type: 'integer', example: 9 },
              supportCompanyCount: { type: 'integer', example: 5 },
              isValid: { type: 'boolean', example: true },
              validationIssues: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    type: { type: 'string', enum: ['error', 'warning', 'info'] },
                    message: { type: 'string' },
                    field: { type: 'string' },
                    autoFix: { type: 'object' },
                  },
                },
              },
            },
          },
          // Division schema
          Division: {
            type: 'object',
            required: ['id', 'name', 'country', 'battalions', 'supportCompanies', 'doctrines', 'spirits', 'technologies', 'version', 'isPublic', 'ownerId'],
            properties: {
              id: { type: 'string', example: 'div-123' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              name: { type: 'string', minLength: 1, maxLength: 100, example: '7th Infantry Division' },
              description: { type: 'string', maxLength: 1000, example: 'Standard infantry division for defensive operations' },
              country: { $ref: '#/components/schemas/Country' },
              battalions: {
                type: 'array',
                items: { $ref: '#/components/schemas/Battalion' },
              },
              supportCompanies: {
                type: 'array',
                items: { $ref: '#/components/schemas/SupportCompany' },
              },
              doctrines: {
                type: 'array',
                items: { $ref: '#/components/schemas/DoctrineRef' },
              },
              spirits: {
                type: 'array',
                items: { $ref: '#/components/schemas/SpiritRef' },
              },
              technologies: {
                type: 'array',
                items: { $ref: '#/components/schemas/TechnologyRef' },
              },
              version: { type: 'integer', minimum: 1, example: 1 },
              isPublic: { type: 'boolean', example: false },
              ownerId: { type: 'string', example: 'user-456' },
              owner: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  email: { type: 'string', format: 'email' },
                  username: { type: 'string' },
                  avatarUrl: { type: 'string', format: 'uri' },
                  roles: { type: 'array', items: { type: 'string' } },
                },
              },
              stats: { $ref: '#/components/schemas/DivisionStats' },
              combatWidth: { type: 'integer', minimum: 1, example: 20 },
            },
          },
          // Analysis Request schema
          AnalysisRequest: {
            type: 'object',
            required: ['division'],
            properties: {
              division: { $ref: '#/components/schemas/Division' },
              forceRefresh: { type: 'boolean', default: false, example: false },
            },
          },
          // Category Scores schema
          CategoryScores: {
            type: 'object',
            required: ['offense', 'defense', 'mobility', 'logistics', 'costEfficiency'],
            properties: {
              offense: { type: 'number', minimum: 0, maximum: 100, example: 78 },
              defense: { type: 'number', minimum: 0, maximum: 100, example: 82 },
              mobility: { type: 'number', minimum: 0, maximum: 100, example: 65 },
              logistics: { type: 'number', minimum: 0, maximum: 100, example: 70 },
              costEfficiency: { type: 'number', minimum: 0, maximum: 100, example: 75 },
            },
          },
          // Matchup schema
          Matchup: {
            type: 'object',
            required: ['enemyType', 'winRate', 'avgCombatDuration', 'keyFactors'],
            properties: {
              enemyType: { type: 'string', example: 'armored_division' },
              winRate: { type: 'number', minimum: 0, maximum: 100, example: 68 },
              avgCombatDuration: { type: 'number', minimum: 0, example: 45.5 },
              keyFactors: {
                type: 'array',
                items: { type: 'string' },
                example: ['Superior organization', 'Better anti-tank capabilities'],
              },
            },
          },
          // Analysis Results schema
          AnalysisResults: {
            type: 'object',
            required: ['overallScore', 'categoryScores', 'strengths', 'weaknesses', 'recommendations', 'matchups'],
            properties: {
              overallScore: { type: 'number', minimum: 0, maximum: 100, example: 74 },
              categoryScores: { $ref: '#/components/schemas/CategoryScores' },
              strengths: {
                type: 'array',
                items: { type: 'string' },
                example: ['High organization', 'Good breakthrough', 'Cost effective'],
              },
              weaknesses: {
                type: 'array',
                items: { type: 'string' },
                example: ['Low hardness', 'Limited anti-air', 'Slow speed'],
              },
              recommendations: {
                type: 'array',
                items: { type: 'string' },
                example: ['Add anti-air support company', 'Upgrade armor technology', 'Consider motorized battalions'],
              },
              matchups: {
                type: 'array',
                items: { $ref: '#/components/schemas/Matchup' },
              },
            },
          },
          // Analysis Response schema
          AnalysisResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { $ref: '#/components/schemas/AnalysisResults' },
              error: { type: 'string', example: 'Analysis failed' },
              cached: { type: 'boolean', example: false },
              processingTimeMs: { type: 'number', example: 1250 },
            },
          },
          // Cache Invalidation Request
          InvalidateCacheRequest: {
            type: 'object',
            required: ['division'],
            properties: {
              division: { $ref: '#/components/schemas/Division' },
            },
          },
          InvalidateCacheResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              error: { type: 'string', example: 'Failed to invalidate cache' },
            },
          },
          // Health Check Response
          HealthResponse: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'ok' },
              anthropic: { type: 'boolean', example: true },
              redis: { type: 'boolean', example: true },
            },
          },
          // Design schemas (for future design endpoints)
          Design: {
            type: 'object',
            required: ['id', 'name', 'division', 'createdAt', 'updatedAt'],
            properties: {
              id: { type: 'string', example: 'des-123' },
              name: { type: 'string', example: 'My Custom Division' },
              description: { type: 'string', example: 'A custom division design' },
              division: { $ref: '#/components/schemas/Division' },
              isPublic: { type: 'boolean', example: false },
              tags: { type: 'array', items: { type: 'string' }, example: ['infantry', 'defensive'] },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              ownerId: { type: 'string', example: 'user-456' },
              forkedFrom: { type: 'string', example: 'des-456' },
              version: { type: 'integer', example: 1 },
            },
          },
          DesignListResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'array',
                items: { $ref: '#/components/schemas/Design' },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer', example: 1 },
                  limit: { type: 'integer', example: 20 },
                  total: { type: 'integer', example: 50 },
                  totalPages: { type: 'integer', example: 3 },
                },
              },
            },
          },
          DesignCreateRequest: {
            type: 'object',
            required: ['name', 'division'],
            properties: {
              name: { type: 'string', minLength: 1, maxLength: 100, example: 'New Division Design' },
              description: { type: 'string', maxLength: 1000, example: 'Description of the design' },
              division: { $ref: '#/components/schemas/Division' },
              isPublic: { type: 'boolean', default: false, example: false },
              tags: { type: 'array', items: { type: 'string' }, example: ['infantry'] },
            },
          },
          DesignUpdateRequest: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 1, maxLength: 100, example: 'Updated Division Design' },
              description: { type: 'string', maxLength: 1000, example: 'Updated description' },
              division: { $ref: '#/components/schemas/Division' },
              isPublic: { type: 'boolean', example: true },
              tags: { type: 'array', items: { type: 'string' }, example: ['infantry', 'updated'] },
            },
          },
          // Auth schemas
          LoginRequest: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email', example: 'user@example.com' },
              password: { type: 'string', minLength: 8, example: 'password123' },
            },
          },
          RegisterRequest: {
            type: 'object',
            required: ['email', 'password', 'username'],
            properties: {
              email: { type: 'string', format: 'email', example: 'user@example.com' },
              password: { type: 'string', minLength: 8, example: 'password123' },
              username: { type: 'string', minLength: 3, maxLength: 30, example: 'username' },
            },
          },
          AuthResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string', format: 'email' },
                      username: { type: 'string' },
                      avatarUrl: { type: 'string', format: 'uri' },
                      roles: { type: 'array', items: { type: 'string' } },
                    },
                  },
                  accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                  refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                },
              },
              error: { type: 'string', example: 'Invalid credentials' },
            },
          },
          RefreshTokenRequest: {
            type: 'object',
            required: ['refreshToken'],
            properties: {
              refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
            },
          },
          UserProfile: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              email: { type: 'string', format: 'email' },
              username: { type: 'string' },
              avatarUrl: { type: 'string', format: 'uri' },
              roles: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      security: [
        { bearerAuth: [] },
        { apiKey: [] },
      ],
    },
  });

  // Register @fastify/swagger-ui for the interactive documentation
  await app.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, _request, _reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
}

/**
 * Helper to add OpenAPI documentation to a route
 * Usage: addRouteSchema(app, { method: 'POST', url: '/api/analysis', schema: {...} })
 */
export function addRouteSchema(
  app: FastifyInstance,
  options: {
    method: string | string[];
    url: string;
    schema: {
      tags?: string[];
      summary?: string;
      description?: string;
      operationId?: string;
      security?: Array<Record<string, string[]>>;
      params?: Record<string, unknown>;
      querystring?: Record<string, unknown>;
      headers?: Record<string, unknown>;
      body?: Record<string, unknown>;
      response?: Record<string, Record<string, unknown>>;
    };
  }
): void {
  const { method } = options;
  const methods = Array.isArray(method) ? method : [method];

  methods.forEach((_m) => {
    // This is a placeholder - actual route documentation is added via the schema option in route registration
    // This function exists for future programmatic schema addition if needed
  });
}