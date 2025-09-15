import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Electric Vehicle Marketplace API',
      version: '1.0.0',
      description: 'API documentation for Electric Vehicle Marketplace',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://electric-vehicle-marketplace.onrender.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  errorCode: { type: 'string' }
                }
              }
            }
          }
        },
        BadRequestError: {
          description: 'Bad request / validation error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      },
      schemas: {
        Address: {
          type: 'object',
          properties: {
            houseNumber: { type: 'string', description: 'Free-text house number' },
            provinceCode: { type: 'string', description: 'Code or ProvinceID from provinces.json' },
            districtCode: { type: 'string', description: 'DistrictID or Code from districts.json' },
            wardCode: { type: 'string', description: 'WardCode from wards.json' },
            province: { type: 'string', readOnly: true },
            district: { type: 'string', readOnly: true },
            ward: { type: 'string', readOnly: true }
          },
          description: 'Provide all three codes together when setting address; houseNumber is optional'
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string', enum: ['vehicle', 'battery'] },
            brand: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'number' },
            condition: { type: 'string', enum: ['new', 'used', 'refurbished'] },
            images: { type: 'array', items: { type: 'string' } },
            specifications: {
              type: 'object',
              properties: {
                batteryCapacity: { type: 'string' },
                range: { type: 'string' },
                chargingTime: { type: 'string' },
                power: { type: 'string' },
                weight: { type: 'string' },
                dimensions: { type: 'string' },
                batteryType: { type: 'string' },
                voltage: { type: 'string' },
                capacity: { type: 'string' },
                cycleLife: { type: 'string' },
                operatingTemperature: { type: 'string' },
                warranty: { type: 'string' },
                compatibility: { type: 'string' }
              }
            },
            seller: { type: 'string' },
            status: { type: 'string', enum: ['active', 'sold', 'inactive'] },
            isFeatured: { type: 'boolean' },
            views: { type: 'number' },
            likes: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateProduct: {
          type: 'object',
          required: ['title', 'description', 'price', 'category', 'brand', 'model', 'year', 'condition'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string', enum: ['vehicle', 'battery'] },
            brand: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'number', minimum: 2000 },
            condition: { type: 'string', enum: ['new', 'used', 'refurbished'] },
            images: { type: 'array', items: { type: 'string' } },
            specifications: {
              type: 'object',
              properties: {
                batteryCapacity: { type: 'string' },
                range: { type: 'string' },
                chargingTime: { type: 'string' },
                power: { type: 'string' },
                weight: { type: 'string' },
                dimensions: { type: 'string' },
                batteryType: { type: 'string' },
                voltage: { type: 'string' },
                capacity: { type: 'string' },
                cycleLife: { type: 'string' },
                operatingTemperature: { type: 'string' },
                warranty: { type: 'string' },
                compatibility: { type: 'string' }
              }
            }
          }
        },
        UpdateProduct: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string', enum: ['vehicle', 'battery'] },
            brand: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'number', minimum: 2000 },
            condition: { type: 'string', enum: ['new', 'used', 'refurbished'] },
            images: { type: 'array', items: { type: 'string' } },
            specifications: {
              type: 'object',
              properties: {
                batteryCapacity: { type: 'string' },
                range: { type: 'string' },
                chargingTime: { type: 'string' },
                power: { type: 'string' },
                weight: { type: 'string' },
                dimensions: { type: 'string' },
                batteryType: { type: 'string' },
                voltage: { type: 'string' },
                capacity: { type: 'string' },
                cycleLife: { type: 'string' },
                operatingTemperature: { type: 'string' },
                warranty: { type: 'string' },
                compatibility: { type: 'string' }
              }
            },
            status: { type: 'string', enum: ['active', 'sold', 'inactive'] },
            isFeatured: { type: 'boolean' }
          }
        }
      }
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js')
  ],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
