# EV Server API Documentation với Swagger

## Tổng quan

Project này đã được tích hợp Swagger UI để tự động tạo và hiển thị tài liệu API. Swagger UI cung cấp giao diện web tương tác để test các API endpoints trực tiếp trên trình duyệt.

## Cách sử dụng

### 1. Khởi động server

```bash
npm run dev
# hoặc
npm start
```

### 2. Truy cập Swagger UI

Mở trình duyệt và truy cập: `http://localhost:5000/api-docs`

### 3. Các tính năng chính

#### 🔍 **Tự động liệt kê API**
- Tất cả API endpoints được tự động phát hiện từ JSDoc comments
- Phân loại theo tags: Authentication, Users, System
- Hiển thị đầy đủ thông tin: method, path, parameters, request/response schemas

#### 🧪 **Test API trực tiếp**
- Form nhập liệu cho request body, headers, query parameters
- Nút "Try it out" để thực thi API calls
- Hiển thị response thực tế từ server
- Hỗ trợ authentication với Bearer token và cookies

#### 📋 **Schema định nghĩa**
- **User Schema**: Định nghĩa cấu trúc dữ liệu User
- **RegisterRequest**: Schema cho đăng ký user mới
- **LoginRequest**: Schema cho đăng nhập
- **AuthResponse**: Schema cho response authentication
- **ErrorResponse**: Schema cho các lỗi

## Các API Endpoints

### Authentication APIs (`/api/auth`)

| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|----------------|
| POST | `/register` | Đăng ký user mới | Không |
| POST | `/login` | Đăng nhập | Không |
| POST | `/logout` | Đăng xuất | Không |
| POST | `/refresh-token` | Làm mới access token | Cookie |

### User Management APIs (`/api/users`)

| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|----------------|
| POST | `/register` | Tạo user mới (alternative) | Không |
| POST | `/login` | Đăng nhập (alternative) | Không |
| GET | `/list` | Lấy danh sách users | Required |
| GET | `/:id` | Lấy user theo ID | Required |
| PUT | `/:id` | Cập nhật user | Required |
| DELETE | `/:id` | Xóa user | Required |

### System APIs

| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|----------------|
| GET | `/health` | Kiểm tra trạng thái server | Không |

## Authentication

API hỗ trợ 2 phương thức authentication:

### 1. Bearer Token
```http
Authorization: Bearer <your-jwt-token>
```

### 2. Cookie Authentication
```http
Cookie: accessToken=<your-jwt-token>
```

## Cách test API

### 1. Test Authentication APIs

1. **Đăng ký user mới:**
   - Chọn `POST /api/auth/register`
   - Click "Try it out"
   - Nhập thông tin:
     ```json
     {
       "name": "John Doe",
       "email": "john@example.com",
       "password": "password123",
       "role": "customer"
     }
     ```
   - Click "Execute"

2. **Đăng nhập:**
   - Chọn `POST /api/auth/login`
   - Click "Try it out"
   - Nhập thông tin:
     ```json
     {
       "email": "john@example.com",
       "password": "password123"
     }
     ```
   - Click "Execute"
   - Copy `accessToken` từ response

### 2. Test Protected APIs

1. **Authorize:**
   - Click nút "Authorize" ở đầu trang
   - Nhập token: `Bearer <your-access-token>`
   - Click "Authorize"

2. **Test protected endpoints:**
   - Chọn bất kỳ API nào cần authentication
   - Click "Try it out"
   - API sẽ tự động sử dụng token đã authorize

## Cấu trúc Response

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

## Customization

### Thêm API mới
1. Tạo route trong thư mục `src/routes/`
2. Thêm JSDoc comments theo format:
   ```javascript
   /**
    * @swagger
    * /api/your-endpoint:
    *   post:
    *     summary: Your API description
    *     tags: [YourTag]
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             $ref: '#/components/schemas/YourSchema'
    *     responses:
    *       200:
    *         description: Success response
    */
   ```

### Thêm Schema mới
1. Mở file `src/config/swagger.js`
2. Thêm schema vào `components.schemas`
3. Reference schema trong JSDoc: `$ref: '#/components/schemas/YourSchema'`

## Troubleshooting

### Lỗi thường gặp

1. **"Failed to load API definition"**
   - Kiểm tra JSDoc syntax trong route files
   - Đảm bảo file swagger.js được import đúng

2. **"Unauthorized" khi test protected APIs**
   - Đảm bảo đã authorize với token hợp lệ
   - Kiểm tra token chưa hết hạn

3. **"CORS error"**
   - Server đã cấu hình CORS cho tất cả origins
   - Nếu vẫn lỗi, kiểm tra browser console

### Debug

1. Kiểm tra server logs
2. Sử dụng browser developer tools
3. Test API bằng Postman hoặc curl để so sánh

## Tài liệu tham khảo

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express)
- [Swagger JSDoc](https://www.npmjs.com/package/swagger-jsdoc)
