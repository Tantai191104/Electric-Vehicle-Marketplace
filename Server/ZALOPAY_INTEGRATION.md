# ZaloPay Integration - Tích hợp ZaloPay cho tính năng nạp xu

## Tổng quan
Tính năng này cho phép người dùng nạp xu vào ví điện tử thông qua cổng thanh toán ZaloPay Sandbox.

## API Endpoints

### 1. Tạo đơn hàng nạp tiền
```
POST /api/zalopay/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100000,
  "description": "Nạp xu vào ví"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đơn hàng được tạo thành công",
  "data": {
    "orderId": "topup_user123_1703123456789_abc12345",
    "app_trans_id": "231220_topup_user123_1703123456789_abc12345",
    "amount": 100000,
    "order_url": "https://sbgateway.zalopay.vn/ordertoken?token=...",
    "status": "pending"
  }
}
```

### 2. Kiểm tra trạng thái đơn hàng
```
GET /api/zalopay/order/{orderId}/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "topup_user123_1703123456789_abc12345",
    "app_trans_id": "231220_topup_user123_1703123456789_abc12345",
    "amount": 100000,
    "status": "success",
    "payment_time": "2023-12-20T10:30:00.000Z",
    "created_at": "2023-12-20T10:25:00.000Z"
  }
}
```

### 3. Lịch sử nạp tiền
```
GET /api/zalopay/history?page=1&limit=20&status=success
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "topups": [
      {
        "orderId": "topup_user123_1703123456789_abc12345",
        "app_trans_id": "231220_topup_user123_1703123456789_abc12345",
        "amount": 100000,
        "status": "success",
        "description": "Nạp xu vào ví",
        "payment_time": "2023-12-20T10:30:00.000Z",
        "createdAt": "2023-12-20T10:25:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 4. Webhook Callback (Internal)
```
POST /api/zalopay/callback
Content-Type: application/json

{
  "data": "encrypted_callback_data",
  "mac": "signature"
}
```

## Cấu hình

### Environment Variables
```env
# ZaloPay Callback URL
ZALOPAY_CALLBACK_URL=http://localhost:5000/api/zalopay/callback

# For production:
# ZALOPAY_CALLBACK_URL=https://yourdomain.com/api/zalopay/callback
```

### ZaloPay Sandbox Config
- **App ID:** 2554
- **Key1:** sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn
- **Key2:** trMrHtvjo6myautxDUiAcYsVtaeQ8nhf
- **Endpoint:** https://sb-openapi.zalopay.vn/v2/create

## Flow hoạt động

1. **Người dùng tạo đơn nạp tiền:**
   - Gọi API `POST /api/zalopay/create-order`
   - Hệ thống tạo record trong `WalletTopup` với status `pending`
   - Trả về `order_url` để người dùng thanh toán

2. **Người dùng thanh toán:**
   - Mở `order_url` trong browser/app
   - Thực hiện thanh toán qua ZaloPay

3. **ZaloPay gửi callback:**
   - ZaloPay gọi webhook `POST /api/zalopay/callback`
   - Hệ thống validate MAC signature
   - Cập nhật status thành `success`
   - Cộng tiền vào wallet của user
   - Tạo `WalletTransaction` record

4. **Kiểm tra trạng thái (optional):**
   - Người dùng có thể gọi API `GET /api/zalopay/order/{orderId}/status`
   - Nếu status vẫn `pending`, hệ thống sẽ query ZaloPay để cập nhật

## Database Schema

### WalletTopup Model
```javascript
{
  userId: ObjectId,           // ID người dùng
  orderId: String,            // ID đơn hàng unique
  app_trans_id: String,       // ZaloPay transaction ID
  zp_trans_token: String,     // ZaloPay token
  zp_trans_id: String,        // ZaloPay final transaction ID
  amount: Number,             // Số tiền nạp
  description: String,        // Mô tả
  status: String,             // pending|processing|success|failed|cancelled
  payment_method: String,     // zalopay
  order_url: String,          // URL thanh toán
  payment_time: Date,         // Thời gian thanh toán thành công
  callback_data: Mixed,       // Dữ liệu callback từ ZaloPay
  ip_address: String,         // IP của người tạo đơn
  user_agent: String,         // User agent
  createdAt: Date,
  updatedAt: Date
}
```

### WalletTransaction Model (existing)
```javascript
{
  userId: ObjectId,
  type: 'deposit',
  amount: Number,
  description: String,
  status: 'completed',
  reference: {
    type: 'zalopay_topup',
    id: ObjectId,             // WalletTopup ID
    app_trans_id: String,
    zp_trans_id: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Validation Rules

### Tạo đơn nạp tiền:
- `amount`: 1,000 - 50,000,000 VND
- `description`: tối đa 200 ký tự (optional)

### Lịch sử nạp tiền:
- `page`: >= 1
- `limit`: 1-100
- `status`: pending|processing|success|failed|cancelled (optional)

## Error Handling

### Common Error Codes:
- `400`: Validation error, Invalid amount, ZaloPay order creation failed
- `401`: Unauthorized (missing/invalid token)
- `404`: Order not found
- `500`: Internal server error

### Example Error Response:
```json
{
  "error": "Invalid amount",
  "message": "Số tiền nạp tối thiểu là 1,000 VND"
}
```

## Testing

### Test với ZaloPay Sandbox:
1. Tạo đơn hàng với amount = 100000
2. Mở order_url trong browser
3. Chọn phương thức thanh toán test
4. Hoàn tất thanh toán
5. Kiểm tra callback log và wallet balance

### Test Cases:
- ✅ Tạo đơn hàng thành công
- ✅ Thanh toán thành công
- ✅ Callback xử lý đúng
- ✅ Wallet balance được cập nhật
- ✅ WalletTransaction được tạo
- ✅ Query status hoạt động
- ✅ Lịch sử nạp tiền hiển thị đúng

## Security Notes

1. **MAC Validation**: Luôn validate MAC signature từ ZaloPay callback
2. **HTTPS**: Sử dụng HTTPS cho callback URL trong production
3. **Rate Limiting**: Implement rate limiting cho API endpoints
4. **Logging**: Log tất cả transactions để audit
5. **Idempotency**: Đảm bảo callback có thể được gọi nhiều lần mà không gây lỗi
