import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

<<<<<<< HEAD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
=======
// Resolve absolute, POSIX-normalized paths so globbing works on Windows + ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
>>>>>>> main

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
<<<<<<< HEAD
      title: 'Electric Vehicle Marketplace API',
      version: '1.0.0',
      description: 'API documentation for Electric Vehicle Marketplace',
    },
    servers: isProd
      ? [
          { url: 'https://electric-vehicle-marketplace.onrender.com/api', description: 'Production server' },
          { url: 'http://localhost:5000/api', description: 'Development server' },
        ]
      : [
          { url: 'http://localhost:5000/api', description: 'Development server' },
          { url: 'https://electric-vehicle-marketplace.onrender.com/api', description: 'Production server' },
        ],
=======
      title: 'EV Server API',
      version: '1.0.0',
      description: 'API documentation for EV Server - User Management and Authentication System',
      contact: {
        name: 'API Support',
        email: 'support@ev.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      // Relative URL allows Swagger UI to use current origin (works locally and on Render)
      {
        url: process.env.API_BASE_URL || '/',
        description: 'Current origin'
      }
    ],
>>>>>>> main
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
<<<<<<< HEAD
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
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'VinFast VF8 2023' },
            description: { type: 'string', example: 'Xe điện VinFast VF8 mới 100%' },
            price: { type: 'number', example: 890000000 },
            category: { type: 'string', enum: ['vehicle', 'battery', 'motorcycle'], example: 'vehicle' },
            brand: { type: 'string', example: 'VinFast' },
            model: { type: 'string', example: 'VF8' },
            year: { type: 'number', example: 2023 },
            condition: { type: 'string', enum: ['used', 'refurbished'], example: 'used' },
            images: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
            },
            length: { type: 'number', example: 150, description: 'Chiều dài (cm)' },
            width: { type: 'number', example: 60, description: 'Chiều rộng (cm)' },
            height: { type: 'number', example: 90, description: 'Chiều cao (cm)' },
            weight: { type: 'number', example: 100, description: 'Weight (kg)' },
            specifications: {
              type: 'object',
              properties: {
                batteryCapacity: { type: 'string', example: '3.5 kWh' },
                range: { type: 'string', example: '203 km' },
                chargingTime: { type: 'string', example: '6-7 giờ' },
                power: { type: 'string', example: '2,500 W' },
                maxSpeed: { type: 'string', example: '120 km/h' },
                motorType: { type: 'string', example: 'Permanent Magnet' },
                batteryType: { type: 'string', example: 'LFP' },
                voltage: { type: 'string', example: '48V' },
                capacity: { type: 'string', example: '34.6 Ah' },
                cycleLife: { type: 'string', example: '2000 chu kỳ' },
                operatingTemperature: { type: 'string', example: '-10°C đến 45°C' },
                warranty: { type: 'string', example: '3 năm hoặc 30,000 km' },
                compatibility: { type: 'string', example: 'Tương thích trạm sạc VinFast' }
              }
            },
            seller: { type: 'string', example: '507f1f77bcf86cd799439012' },
            status: { type: 'string', enum: ['active', 'sold', 'inactive'], example: 'active' },
            isFeatured: { type: 'boolean', example: false },
            views: { type: 'number', example: 0 },
            likes: { type: 'number', example: 0 },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
          }
        },
        CreateProduct: {
          type: 'object',
          required: ['title', 'description', 'price', 'category', 'brand', 'model', 'year', 'condition', 'length', 'width', 'height', 'weight'],
          properties: {
            title: { type: 'string', example: 'VinFast VF8 2023' },
            description: { type: 'string', example: 'Xe điện VinFast VF8 mới 100%' },
            price: { type: 'number', example: 890000000 },
            category: { type: 'string', enum: ['vehicle', 'battery', 'motorcycle'], example: 'vehicle' },
            brand: { type: 'string', example: 'VinFast' },
            model: { type: 'string', example: 'VF8' },
            year: { type: 'number', minimum: 2000, example: 2023 },
            condition: { type: 'string', enum: ['used', 'refurbished'], example: 'used' },
            images: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['https://example.com/image1.jpg']
            },
            length: { type: 'number', example: 150, description: 'Chiều dài (cm) 1-200' },
            width: { type: 'number', example: 60, description: 'Chiều rộng (cm) 1-200' },
            height: { type: 'number', example: 90, description: 'Chiều cao (cm) 1-200' },
            weight: { type: 'number', example: 50, description: 'Weight (kg) 1-1600' },
            specifications: {
              type: 'object',
              properties: {
                batteryCapacity: { type: 'string', example: '3.5 kWh' },
                range: { type: 'string', example: '203 km' },
                chargingTime: { type: 'string', example: '6-7 giờ' },
                power: { type: 'string', example: '2,500 W' },
                maxSpeed: { type: 'string', example: '120 km/h' },
                motorType: { type: 'string', example: 'Permanent Magnet' },
                batteryType: { type: 'string', example: 'LFP' },
                voltage: { type: 'string', example: '48V' },
                capacity: { type: 'string', example: '34.6 Ah' },
                cycleLife: { type: 'string', example: '2000 chu kỳ' },
                operatingTemperature: { type: 'string', example: '-10°C đến 45°C' },
                warranty: { type: 'string', example: '3 năm hoặc 30,000 km' },
                compatibility: { type: 'string', example: 'Tương thích trạm sạc VinFast' }
              }
            }
          }
        },
        UpdateProduct: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'VinFast VF8 2023 Updated' },
            description: { type: 'string', example: 'Xe điện VinFast VF8 mới 100% - Updated' },
            price: { type: 'number', example: 900000000 },
            category: { type: 'string', enum: ['vehicle', 'battery', 'motorcycle'], example: 'vehicle' },
            brand: { type: 'string', example: 'VinFast' },
            model: { type: 'string', example: 'VF8' },
            year: { type: 'number', minimum: 2000, example: 2023 },
            condition: { type: 'string', enum: ['used', 'refurbished'], example: 'used' },
            images: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
            },
            length: { type: 'number', example: 150, description: 'Chiều dài (cm) 1-200' },
            width: { type: 'number', example: 60, description: 'Chiều rộng (cm) 1-200' },
            height: { type: 'number', example: 90, description: 'Chiều cao (cm) 1-200' },
            weight: { type: 'number', example: 50, description: 'Weight (kg) 1-1600' },
            specifications: {
              type: 'object',
              properties: {
                batteryCapacity: { type: 'string', example: '3.5 kWh' },
                range: { type: 'string', example: '203 km' },
                chargingTime: { type: 'string', example: '6-7 giờ' },
                power: { type: 'string', example: '2,500 W' },
                maxSpeed: { type: 'string', example: '120 km/h' },
                motorType: { type: 'string', example: 'Permanent Magnet' },
                batteryType: { type: 'string', example: 'LFP' },
                voltage: { type: 'string', example: '48V' },
                capacity: { type: 'string', example: '34.6 Ah' },
                cycleLife: { type: 'string', example: '2000 chu kỳ' },
                operatingTemperature: { type: 'string', example: '-10°C đến 45°C' },
                warranty: { type: 'string', example: '3 năm hoặc 30,000 km' },
                compatibility: { type: 'string', example: 'Tương thích trạm sạc VinFast' }
              }
            },
            status: { type: 'string', enum: ['active', 'sold', 'inactive'], example: 'active' },
            isFeatured: { type: 'boolean', example: false }
          }
        },
        VehicleProduct: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'VinFast VF8 2023 - Xe điện SUV 7 chỗ' },
            description: { type: 'string', example: 'Xe điện VinFast VF8 đã qua sử dụng, tình trạng tốt, đầy đủ phụ kiện' },
            price: { type: 'number', example: 890000000 },
            category: { type: 'string', enum: ['vehicle'], example: 'vehicle' },
            brand: { type: 'string', example: 'VinFast' },
            model: { type: 'string', example: 'VF8' },
            year: { type: 'number', example: 2023 },
            condition: { type: 'string', enum: ['used', 'refurbished'], example: 'used' },
            images: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
            },
            length: { type: 'number', example: 450, description: 'Length (cm)' },
            width: { type: 'number', example: 180, description: 'Width (cm)' },
            height: { type: 'number', example: 165, description: 'Height (cm)' },
            weight: { type: 'number', example: 100, description: 'Weight (kg)' },
            specifications: {
              type: 'object',
              description: 'Vehicle-specific technical specifications',
              properties: {
                batteryCapacity: { type: 'string', example: '3.5 kWh', description: 'Battery capacity' },
                range: { type: 'string', example: '203 km', description: 'Driving range' },
                chargingTime: { type: 'string', example: '6-7 giờ', description: 'Charging time' },
                power: { type: 'string', example: '2,500 W', description: 'Motor power' },
                maxSpeed: { type: 'string', example: '120 km/h', description: 'Maximum speed' },
                batteryType: { type: 'string', example: 'LFP', description: 'Battery type' },
                voltage: { type: 'string', example: '400V', description: 'Voltage' },
                capacity: { type: 'string', example: '87.7 Ah', description: 'Battery capacity (Ah)' },
                warranty: { type: 'string', example: '3 năm hoặc 30,000 km', description: 'Warranty' },
                compatibility: { type: 'string', example: 'Tương thích trạm sạc VinFast', description: 'Compatibility' }
              }
            },
            seller: { type: 'string', example: '507f1f77bcf86cd799439012' },
            status: { type: 'string', enum: ['active', 'sold', 'inactive'], example: 'active' },
            isFeatured: { type: 'boolean', example: false },
            views: { type: 'number', example: 0 },
            likes: { type: 'number', example: 0 },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
          }
        },
        BatteryProduct: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'Pin xe điện VinFast 48V 34.6Ah - Pin đã qua sử dụng' },
            description: { type: 'string', example: 'Pin xe điện VinFast đã qua sử dụng, dung lượng còn tốt, tình trạng ổn định' },
            price: { type: 'number', example: 15000000 },
            category: { type: 'string', enum: ['battery'], example: 'battery' },
            brand: { type: 'string', example: 'VinFast' },
            model: { type: 'string', example: 'VF Battery 48V' },
            year: { type: 'number', example: 2023 },
            condition: { type: 'string', enum: ['used', 'refurbished'], example: 'used' },
            images: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['https://example.com/battery1.jpg', 'https://example.com/battery2.jpg']
            },
            length: { type: 'number', example: 30, description: 'Length (cm)' },
            width: { type: 'number', example: 20, description: 'Width (cm)' },
            height: { type: 'number', example: 15, description: 'Height (cm)' },
            weight: { type: 'number', example: 5, description: 'Weight (kg)' },
            specifications: {
              type: 'object',
              description: 'Battery-specific technical specifications',
              properties: {
                batteryType: { type: 'string', example: 'LFP', description: 'Battery type' },
                voltage: { type: 'string', example: '48V', description: 'Voltage' },
                capacity: { type: 'string', example: '34.6 Ah', description: 'Battery capacity' },
                cycleLife: { type: 'string', example: '2000 chu kỳ', description: 'Cycle life' },
                warranty: { type: 'string', example: '3 năm hoặc 30,000 km', description: 'Warranty' },
                compatibility: { type: 'string', example: 'Tương thích trạm sạc VinFast', description: 'Compatibility' }
              }
            },
            seller: { type: 'string', example: '507f1f77bcf86cd799439012' },
            status: { type: 'string', enum: ['active', 'sold', 'inactive'], example: 'active' },
            isFeatured: { type: 'boolean', example: false },
            views: { type: 'number', example: 0 },
            likes: { type: 'number', example: 0 },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
          }
        },
        MotorcycleProduct: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'Xe máy điện VinFast Klara S 2023 - Xe đã qua sử dụng' },
            description: { type: 'string', example: 'Xe máy điện VinFast Klara S đã qua sử dụng, tình trạng tốt, tiết kiệm điện' },
            price: { type: 'number', example: 25000000 },
            category: { type: 'string', enum: ['motorcycle'], example: 'motorcycle' },
            brand: { type: 'string', example: 'VinFast' },
            model: { type: 'string', example: 'Klara S' },
            year: { type: 'number', example: 2023 },
            condition: { type: 'string', enum: ['used', 'refurbished'], example: 'used' },
            images: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['https://example.com/motorcycle1.jpg', 'https://example.com/motorcycle2.jpg']
            },
            length: { type: 'number', example: 200, description: 'Length (cm)' },
            width: { type: 'number', example: 70, description: 'Width (cm)' },
            height: { type: 'number', example: 110, description: 'Height (cm)' },
            weight: { type: 'number', example: 95, description: 'Weight (kg)' },
            specifications: {
              type: 'object',
              description: 'Motorcycle-specific technical specifications',
              properties: {
                batteryCapacity: { type: 'string', example: '1.2 kWh', description: 'Battery capacity' },
                range: { type: 'string', example: '80 km', description: 'Driving range' },
                chargingTime: { type: 'string', example: '4-6 giờ', description: 'Charging time' },
                power: { type: 'string', example: '1,200 W', description: 'Motor power' },
                maxSpeed: { type: 'string', example: '45 km/h', description: 'Maximum speed' },
                warranty: { type: 'string', example: '2 năm hoặc 20,000 km', description: 'Warranty' },
                compatibility: { type: 'string', example: 'Tương thích trạm sạc VinFast', description: 'Compatibility' }
              }
            },
            seller: { type: 'string', example: '507f1f77bcf86cd799439012' },
            status: { type: 'string', enum: ['active', 'sold', 'inactive'], example: 'active' },
            isFeatured: { type: 'boolean', example: false },
            views: { type: 'number', example: 0 },
            likes: { type: 'number', example: 0 },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
          }
        },
        ContractInitiate: {
          type: 'object',
          properties: {
            product_id: { type: 'string' },
            seller_id: { type: 'string' }
          }
        },
        ContractSign: {
          type: 'object',
          properties: {
            contractId: { type: 'string' }
          }
        },
        ContractDraft: {
          type: 'object',
          properties: {
            contractId: { type: 'string' }
=======
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'JWT token stored in httpOnly cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the user',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Full name of the user',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com'
            },
            role: {
              type: 'string',
              enum: ['customer', 'staff', 'admin'],
              default: 'customer',
              description: 'Role of the user in the system',
              example: 'customer'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Whether the user account is active',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the user was created',
              example: '2024-01-15T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the user was last updated',
              example: '2024-01-15T10:30:00.000Z'
            }
          }
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
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              maxLength: 72,
              description: 'Password for the user account',
              example: 'password123'
            },
            role: {
              type: 'string',
              enum: ['customer', 'staff', 'admin'],
              description: 'Role of the user in the system (optional, defaults to customer)',
              example: 'customer'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              maxLength: 72,
              description: 'Password for the user account',
              example: 'password123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the user',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              description: 'Full name of the user',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com'
            },
            role: {
              type: 'string',
              enum: ['customer', 'staff', 'admin'],
              description: 'Role of the user in the system',
              example: 'customer'
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token for API authentication',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token for getting new access tokens',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        },
        RefreshTokenResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'New JWT access token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        },
        LogoutResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Logout confirmation message',
              example: 'Logged out'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'User not found'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field that caused the error'
                  },
                  message: {
                    type: 'string',
                    description: 'Error message for the field'
                  }
                }
              },
              description: 'Detailed validation errors'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
>>>>>>> main
          }
        }
      }
    },
<<<<<<< HEAD
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js')
  ],
};

const specs = swaggerJsdoc(options);
=======
    security: [
      {
        bearerAuth: []
      },
      {
        cookieAuth: []
      }
    ]
  },
  apis: [
    path.join(projectRoot, 'routes', '*.js').replace(/\\/g, '/'),
    path.join(projectRoot, 'controllers', '*.js').replace(/\\/g, '/'),
    path.join(projectRoot, 'index.js').replace(/\\/g, '/'),
  ]
};

const specs = swaggerJsdoc(options);
// Helpful at startup to verify discovery in dev
if (process.env.NODE_ENV !== 'production') {
  const pathCount = specs?.paths ? Object.keys(specs.paths).length : 0;
  // eslint-disable-next-line no-console
  console.log(`[swagger] Discovered ${pathCount} operations from JSDoc`);
}
>>>>>>> main

export { specs, swaggerUi };
