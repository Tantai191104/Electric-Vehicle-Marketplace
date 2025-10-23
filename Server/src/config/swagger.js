import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve absolute, POSIX-normalized paths so globbing works on Windows + ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EV Server API',
      version: '1.0.0',
      description:
        'API documentation for EV Server - User Management and Authentication System',
      contact: {
        name: 'API Support',
        email: 'support@ev.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      // Set base path to /api so documented paths match mounted routes
      {
        url: process.env.API_BASE_URL || '/api',
        description: 'API base',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'JWT token stored in httpOnly cookie',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the user',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Full name of the user',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com',
            },
            role: {
              type: 'string',
              enum: ['customer', 'staff', 'admin'],
              default: 'customer',
              description: 'Role of the user in the system',
              example: 'customer',
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Whether the user account is active',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the user was created',
              example: '2024-01-15T10:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the user was last updated',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Full name of the user',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              maxLength: 72,
              description: 'Password for the user account',
              example: 'password123',
            },
            role: {
              type: 'string',
              enum: ['customer', 'staff', 'admin'],
              description:
                'Role of the user in the system (optional, defaults to customer)',
              example: 'customer',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              maxLength: 72,
              description: 'Password for the user account',
              example: 'password123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the user',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'Full name of the user',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com',
            },
            role: {
              type: 'string',
              enum: ['customer', 'staff', 'admin'],
              description: 'Role of the user in the system',
              example: 'customer',
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token for API authentication',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token for getting new access tokens',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        RefreshTokenResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'New JWT access token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        LogoutResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Logout confirmation message',
              example: 'Logged out',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed',
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'User not found',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field that caused the error',
                  },
                  message: {
                    type: 'string',
                    description: 'Error message for the field',
                  },
                },
              },
              description: 'Detailed validation errors',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Product ID',
              example: '507f1f77bcf86cd799439011',
            },
            title: {
              type: 'string',
              description: 'Product title',
              example: 'VinFast VF8 2023',
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: 'Xe điện VinFast VF8 đã qua sử dụng',
            },
            price: {
              type: 'number',
              description: 'Product price in VND',
              example: 890000000,
            },
            category: {
              type: 'string',
              enum: ['vehicle', 'battery', 'motorcycle'],
              description: 'Product category',
              example: 'vehicle',
            },
            brand: {
              type: 'string',
              description: 'Product brand',
              example: 'VinFast',
            },
            model: {
              type: 'string',
              description: 'Product model',
              example: 'VF8',
            },
            year: {
              type: 'number',
              description: 'Manufacturing year',
              example: 2023,
            },
            condition: {
              type: 'string',
              enum: ['used', 'refurbished'],
              description: 'Product condition',
              example: 'used',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'url',
              },
              description: 'Product images',
            },
            seller: {
              $ref: '#/components/schemas/User',
            },
            status: {
              type: 'string',
              enum: ['pending', 'active', 'sold', 'inactive', 'rejected', 'deposit'],
              description: 'Product status',
              example: 'active',
            },
            isFeatured: {
              type: 'boolean',
              description: 'Whether product is featured',
              example: false,
            },
            views: {
              type: 'number',
              description: 'Number of views',
              example: 0,
            },
            likes: {
              type: 'number',
              description: 'Number of likes',
              example: 0,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-15T10:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        VehicleProduct: {
          allOf: [
            { $ref: '#/components/schemas/Product' },
            {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['vehicle'],
                  example: 'vehicle',
                },
                specifications: {
                  type: 'object',
                  properties: {
                    batteryCapacity: { type: 'string', example: '3.5 kWh' },
                    range: { type: 'string', example: '203 km' },
                    chargingTime: { type: 'string', example: '6-7 giờ' },
                    power: { type: 'string', example: '2,500 W' },
                    maxSpeed: { type: 'string', example: '120 km/h' },
                    warranty: { type: 'string', example: '3 năm hoặc 30,000 km' },
                    compatibility: { type: 'string', example: 'Tương thích trạm sạc VinFast' },
                  },
                },
              },
            },
          ],
        },
        BatteryProduct: {
          allOf: [
            { $ref: '#/components/schemas/Product' },
            {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['battery'],
                  example: 'battery',
                },
                specifications: {
                  type: 'object',
                  properties: {
                    batteryType: { type: 'string', example: 'LFP' },
                    voltage: { type: 'string', example: '48V' },
                    capacity: { type: 'string', example: '34.6 Ah' },
                    cycleLife: { type: 'string', example: '2000 chu kỳ' },
                    warranty: { type: 'string', example: '3 năm hoặc 30,000 km' },
                    compatibility: { type: 'string', example: 'Tương thích trạm sạc VinFast' },
                  },
                },
              },
            },
          ],
        },
        MotorcycleProduct: {
          allOf: [
            { $ref: '#/components/schemas/Product' },
            {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['motorcycle'],
                  example: 'motorcycle',
                },
                specifications: {
                  type: 'object',
                  properties: {
                    batteryCapacity: { type: 'string', example: '3.5 kWh' },
                    range: { type: 'string', example: '203 km' },
                    chargingTime: { type: 'string', example: '6-7 giờ' },
                    power: { type: 'string', example: '2,500 W' },
                    maxSpeed: { type: 'string', example: '120 km/h' },
                    warranty: { type: 'string', example: '3 năm hoặc 30,000 km' },
                    compatibility: { type: 'string', example: 'Tương thích trạm sạc VinFast' },
                  },
                },
              },
            },
          ],
        },
        UpdateProduct: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 5,
              maxLength: 200,
              description: 'Product title',
              example: 'VinFast VF8 2023 - Updated',
            },
            description: {
              type: 'string',
              minLength: 20,
              maxLength: 2000,
              description: 'Product description',
              example: 'Updated description',
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Product price in VND',
              example: 850000000,
            },
            brand: {
              type: 'string',
              description: 'Product brand',
              example: 'VinFast',
            },
            model: {
              type: 'string',
              description: 'Product model',
              example: 'VF8',
            },
            year: {
              type: 'number',
              minimum: 2000,
              description: 'Manufacturing year',
              example: 2023,
            },
            condition: {
              type: 'string',
              enum: ['used', 'refurbished'],
              description: 'Product condition',
              example: 'used',
            },
            status: {
              type: 'string',
              enum: ['active', 'sold', 'inactive'],
              description: 'Product status',
              example: 'active',
            },
            isFeatured: {
              type: 'boolean',
              description: 'Whether product is featured',
              example: false,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        cookieAuth: [],
      },
    ],
  },
  apis: [
    path.join(projectRoot, 'routes', '*.js').replace(/\\/g, '/'),
    path.join(projectRoot, 'controllers', '*.js').replace(/\\/g, '/'),
    path.join(projectRoot, 'index.js').replace(/\\/g, '/'),
  ],
};

const specs = swaggerJsdoc(options);
// Helpful at startup to verify discovery in dev
if (process.env.NODE_ENV !== 'production') {
  const pathCount = specs?.paths ? Object.keys(specs.paths).length : 0;
  // eslint-disable-next-line no-console
  console.log(`[swagger] Discovered ${pathCount} operations from JSDoc`);
}

export { specs, swaggerUi };
