# 🆕 API Testing Guide - Tính năng mới

## 📋 Tổng quan

File này tổng hợp tất cả API mới được thêm vào hệ thống để test với Postman.

---

## 🔐 Authentication

**Base URL**: `http://localhost:5000/api`

**Headers cần thiết:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

---

## 🎯 1. API Người bán đánh dấu sản phẩm

### 1.1 Đánh dấu sản phẩm đã bán
```http
PATCH /api/products/{productId}/mark-sold
Authorization: Bearer {user_token}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "productId": "64a1b2c3d4e5f6789012345",
    "status": "sold"
  }
}
```

### 1.2 Đánh dấu sản phẩm có thể bán
```http
PATCH /api/products/{productId}/mark-available
Authorization: Bearer {user_token}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Đã cập nhật sản phẩm là có thể bán",
  "data": {
    "productId": "64a1b2c3d4e5f6789012345",
    "status": "active"
  }
}
```

**Lỗi có thể gặp:**
- `403`: Bạn chỉ có thể cập nhật sản phẩm của chính mình
- `400`: Sản phẩm đang chờ xét duyệt, chưa thể cập nhật đã bán
- `400`: Đã được cập nhật trước đó

---

## 🔍 2. API Admin xét duyệt sản phẩm

### 2.1 Xem danh sách sản phẩm chờ duyệt
```http
GET /api/admin/products/pending?page=1&limit=20
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `page`: Số trang (default: 1)
- `limit`: Số sản phẩm mỗi trang (default: 20)

**Response thành công:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "title": "Xe điện VinFast VF8",
      "price": 800000000,
      "status": "pending",
      "seller": {
        "_id": "64a1b2c3d4e5f6789012346",
        "name": "Nguyễn Văn A",
        "email": "nguyenvana@email.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

### 2.2 Duyệt sản phẩm
```http
PATCH /api/admin/products/{productId}/approve
Authorization: Bearer {admin_token}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Đã duyệt sản phẩm thành công",
  "data": {
    "productId": "64a1b2c3d4e5f6789012345",
    "status": "active",
    "approvedBy": "64a1b2c3d4e5f6789012347",
    "approvedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Lỗi có thể gặp:**
- `404`: Sản phẩm không tồn tại
- `400`: Sản phẩm này không cần xét duyệt

### 2.3 Từ chối sản phẩm
```http
PATCH /api/admin/products/{productId}/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "Sản phẩm không đáp ứng tiêu chuẩn chất lượng"
}
```

**Request Body (Optional):**
```json
{
  "reason": "Lý do từ chối (không bắt buộc)"
}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Đã từ chối sản phẩm",
  "data": {
    "productId": "64a1b2c3d4e5f6789012345",
    "status": "rejected",
    "rejectedBy": "64a1b2c3d4e5f6789012347",
    "rejectedAt": "2024-01-15T11:00:00.000Z",
    "reason": "Sản phẩm không đáp ứng tiêu chuẩn chất lượng"
  }
}
```

---

## 🛒 3. API Mua hàng (với kiểm tra mới)

### 3.1 Tạo đơn hàng (có kiểm tra sản phẩm đã bán)
```http
POST /api/shipping/order
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "product_id": "64a1b2c3d4e5f6789012345",
  "service_type_id": 2,
  "from_district_id": 1542,
  "from_ward_code": "1A0401",
  "to_district_id": 1542,
  "to_ward_code": "1A0401",
  "to_name": "Nguyễn Văn B",
  "to_phone": "0987654321",
  "to_address": "123 Đường ABC",
  "to_province_name": "Hà Nội",
  "to_district_name": "Quận Cầu Giấy",
  "length": 150,
  "width": 60,
  "height": 90,
  "weight": 50000,
  "insurance_value": 5000000,
  "cod_value": 0
}
```

**Lỗi mới có thể gặp:**
- `400`: Sản phẩm này đã được bán
- `400`: Sản phẩm này đang chờ xét duyệt
- `400`: Sản phẩm này đã bị từ chối
- `403`: Bạn không thể mua sản phẩm của chính mình

---

## 📊 4. API Xem sản phẩm (với phân quyền mới)

### 4.1 Xem danh sách sản phẩm (Guest/User/Admin)
```http
GET /api/products?page=1&limit=10
```

**Note:** Chỉ hiển thị sản phẩm đã được duyệt (`status = "active"` hoặc `"sold"`)

### 4.2 Xem chi tiết sản phẩm (chỉ User/Admin)
```http
GET /api/products/{productId}
Authorization: Bearer {user_or_admin_token}
```

**Lỗi nếu không đăng nhập:**
- `401`: Unauthorized

---

## 🔧 5. Test Cases cho Postman

### Test Case 1: Luồng đăng bán và xét duyệt
1. **User đăng bán sản phẩm** → `POST /api/products`
2. **Admin xem sản phẩm chờ duyệt** → `GET /api/admin/products/pending`
3. **Admin duyệt sản phẩm** → `PATCH /api/admin/products/{id}/approve`
4. **User khác xem sản phẩm** → `GET /api/products/{id}` (cần đăng nhập)

### Test Case 2: Luồng từ chối sản phẩm
1. **User đăng bán sản phẩm** → `POST /api/products`
2. **Admin xem sản phẩm chờ duyệt** → `GET /api/admin/products/pending`
3. **Admin từ chối sản phẩm** → `PATCH /api/admin/products/{id}/reject`
4. **User không thể mua sản phẩm bị từ chối** → `POST /api/shipping/order` → Lỗi

### Test Case 3: Luồng đánh dấu đã bán
1. **User đăng bán sản phẩm** → `POST /api/products`
2. **Admin duyệt sản phẩm** → `PATCH /api/admin/products/{id}/approve`
3. **User đánh dấu đã bán** → `PATCH /api/products/{id}/mark-sold`
4. **User khác không thể mua** → `POST /api/shipping/order` → Lỗi "đã bán"

### Test Case 4: Kiểm tra phân quyền
1. **Guest xem danh sách** → `GET /api/products` ✅
2. **Guest xem chi tiết** → `GET /api/products/{id}` ❌ 401
3. **User xem chi tiết** → `GET /api/products/{id}` ✅
4. **Admin duyệt sản phẩm** → `PATCH /api/admin/products/{id}/approve` ✅
5. **User duyệt sản phẩm** → `PATCH /api/admin/products/{id}/approve` ❌ 403

---

## 🚨 6. Error Codes mới

| Code | Message | Description |
|------|---------|-------------|
| `PRODUCT_ALREADY_SOLD` | Sản phẩm này đã được bán | Sản phẩm đã được đánh dấu sold |
| `PRODUCT_PENDING_APPROVAL` | Sản phẩm này đang chờ xét duyệt | Sản phẩm chưa được admin duyệt |
| `PRODUCT_REJECTED` | Sản phẩm này đã bị từ chối | Sản phẩm bị admin từ chối |
| `CANNOT_PURCHASE_OWN_PRODUCT` | Bạn không thể mua sản phẩm của chính mình | User cố mua sản phẩm của mình |

---

## 📝 7. Sample Data để Test

### Tạo sản phẩm test:
```json
{
  "title": "Xe điện VinFast VF8",
  "description": "Xe điện SUV cao cấp",
  "price": 800000000,
  "category": "vehicle",
  "brand": "VinFast",
  "model": "VF8",
  "year": 2023,
  "condition": "used",
  "length": 150,
  "width": 60,
  "height": 90,
  "weight": 50000,
  "specifications": {
    "batteryCapacity": "87.7 kWh",
    "range": "400 km",
    "chargingTime": "8 giờ",
    "power": "300 kW",
    "maxSpeed": "200 km/h"
  }
}
```

### Token test:
- **User Token**: Cần đăng nhập với role "user"
- **Admin Token**: Cần đăng nhập với role "admin"

---

## ✅ 8. Checklist Test

- [ ] User có thể đánh dấu sản phẩm đã bán
- [ ] User có thể đánh dấu sản phẩm có thể bán
- [ ] Admin có thể xem sản phẩm chờ duyệt
- [ ] Admin có thể duyệt sản phẩm
- [ ] Admin có thể từ chối sản phẩm
- [ ] User không thể mua sản phẩm của chính mình
- [ ] User không thể mua sản phẩm đã bán
- [ ] User không thể mua sản phẩm chờ duyệt
- [ ] Guest không thể xem chi tiết sản phẩm
- [ ] Sản phẩm mới có status "pending"

**Happy Testing!** 🎉
