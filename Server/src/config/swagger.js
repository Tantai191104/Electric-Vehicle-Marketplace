import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
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
