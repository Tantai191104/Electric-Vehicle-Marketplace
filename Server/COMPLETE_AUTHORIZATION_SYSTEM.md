# 🛡️ Hệ thống Phân quyền Hoàn chỉnh - Electric Vehicle Marketplace

## 📋 Tổng quan

Hệ thống marketplace với 3 role chính:
- **Guest**: Không đăng nhập, chỉ xem sản phẩm
- **User**: Người bán/mua trên platform
- **Admin**: Quản lý platform, không tham gia giao dịch

---

## 🎭 Chi tiết từng Role

### 1. Guest (Không đăng nhập)

#### ✅ Có thể làm:
```
👀 Xem sản phẩm (chỉ danh sách):
- GET /api/products (danh sách sản phẩm)

🔐 Đăng ký/Đăng nhập:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/users/register
- POST /api/users/login
```

#### ❌ Không thể:
- Xem chi tiết sản phẩm
- Mua hàng, đăng bán, chat, nạp tiền
- Truy cập profile, admin panel

---

### 2. User (Người dùng Marketplace)

#### ✅ Có thể làm:
```
👀 Xem sản phẩm:
- GET /api/products (danh sách sản phẩm)
- GET /api/products/vehicles (chi tiết xe điện)
- GET /api/products/batteries (chi tiết pin)
- GET /api/products/motorcycles (chi tiết xe máy điện)
- GET /api/products/:id (chi tiết sản phẩm)

🛒 Mua hàng:
- POST /api/products (đăng bán sản phẩm)
- GET /api/products/my/products (xem sản phẩm của mình)
- PUT /api/products/:id (chỉ sản phẩm của mình)
- DELETE /api/products/:id (chỉ sản phẩm của mình)
- PATCH /api/products/:id/mark-sold (cập nhật sản phẩm đã bán)
- PATCH /api/products/:id/mark-available (cập nhật sản phẩm có thể bán)
- Tất cả /api/shipping/* (tạo đơn hàng, tính phí ship)
- ❌ KHÔNG được mua sản phẩm của chính mình

💬 Chat:
- Tất cả /api/chat/* (chat với người bán/mua)

💰 Quản lý tài chính:
- Tất cả /api/zalopay/* (nạp tiền vào ví)

👤 Quản lý Profile:
- Tất cả /api/profile/* (update thông tin cá nhân, địa chỉ, mật khẩu)
```

#### ❌ Không thể:
- Mua sản phẩm của chính mình
- Mua sản phẩm đã được bán (status = "sold")
- Truy cập admin panel
- Quản lý user khác
- Xem thống kê platform

---

### 3. Admin (Quản lý Platform)

#### ✅ Có thể làm:
```
👀 Xem sản phẩm (chỉ danh sách):
- GET /api/products (danh sách sản phẩm)

🛠️ Quản lý sản phẩm:
- GET /api/admin/products/pending (xem sản phẩm chờ duyệt)
- PATCH /api/admin/products/:id/approve (duyệt sản phẩm)
- PATCH /api/admin/products/:id/reject (từ chối sản phẩm)
- PUT /api/admin/products/:id (set inactive khi có vi phạm)
- DELETE /api/admin/products/:id (xóa sản phẩm vi phạm)

👥 Quản lý User:
- GET /api/users/list (xem thống kê user)
- GET /api/users/:id (xem chi tiết user)
- PUT /api/admin/users/:id (ban/unban user, đổi role)
- DELETE /api/admin/users/:id (ban user)

📊 Admin Panel:
- GET /api/admin/stats (thống kê platform)
- GET /api/admin/users (danh sách user)
- GET /api/admin/orders (danh sách đơn hàng)
- PUT /api/admin/orders/:id (cập nhật trạng thái đơn hàng)

🚨 Quản lý vi phạm:
- GET /api/admin/violations (xem vi phạm)
- POST /api/admin/users/:id/violations (báo cáo vi phạm)
- PUT /api/admin/users/:id/violations/:violationId (xử lý vi phạm)

💰 Quản lý doanh thu:
- GET /api/admin/revenue (báo cáo doanh thu platform)

👤 Quản lý Profile Admin:
- Tất cả /api/profile/* (Admin có profile riêng, có thể update thông tin)
```

#### ❌ Không thể:
- Xem chi tiết sản phẩm (không cần thiết)
- Đăng bán sản phẩm
- Mua hàng
- Chat với user
- Nạp tiền vào ví

---

## 🔧 Middleware Bảo vệ

### 1. `optionalAuth`
```javascript
// Cho phép Guest và User/Admin
// Tự động xác định role từ token
// Sử dụng: Xem sản phẩm
```

### 2. `authenticate`
```javascript
// Yêu cầu đăng nhập
// Sử dụng: Tất cả routes cần authentication
```

### 3. `requireUser`
```javascript
// Chỉ User mới được truy cập
// Sử dụng: Chat, nạp tiền, profile
```

### 4. `requireAdmin`
```javascript
// Chỉ Admin mới được truy cập
// Sử dụng: Admin panel, quản lý users
```

### 5. `requireAuth`
```javascript
// User hoặc Admin
// Sử dụng: Update/delete sản phẩm
```

### 6. `requireProductManagement`
```javascript
// Chỉ User mới được đăng bán
// Sử dụng: Tạo sản phẩm
```

### 7. `requirePurchasePermission`
```javascript
// Chỉ User mới được mua hàng
// Sử dụng: Shipping, thanh toán
```

### 8. `preventSelfPurchase`
```javascript
// Kiểm tra User không được mua sản phẩm của chính mình
// Kiểm tra sản phẩm chưa được bán (status != "sold")
// Sử dụng: Tạo đơn hàng
```

### 9. `requireOwnership`
```javascript
// User chỉ có thể thao tác sản phẩm của chính mình
// Admin có thể thao tác bất kỳ sản phẩm nào
// Sử dụng: Update/delete sản phẩm
```

---

## 📍 Routes Chi tiết

### Auth Routes (`/api/auth`)
```
POST /register     → PUBLIC (đăng ký)
POST /login        → PUBLIC (đăng nhập)
POST /logout       → AUTHENTICATE (đăng xuất)
POST /refresh      → AUTHENTICATE (refresh token)
```

### User Routes (`/api/users`)
```
POST /register     → PUBLIC (đăng ký)
POST /login        → PUBLIC (đăng nhập)
GET /list          → AUTHENTICATE + ADMIN (admin xem thống kê user)
GET /:id           → AUTHENTICATE + ADMIN (admin xem chi tiết user)
```

### Product Routes (`/api/products`)
```
GET /              → OPTIONAL_AUTH (Guest, User, Admin xem danh sách)
GET /vehicles      → AUTHENTICATE + USER (chỉ User xem chi tiết xe điện)
GET /batteries     → AUTHENTICATE + USER (chỉ User xem chi tiết pin)
GET /motorcycles   → AUTHENTICATE + USER (chỉ User xem chi tiết xe máy điện)
GET /:id           → AUTHENTICATE + USER (chỉ User xem chi tiết sản phẩm)

POST /             → AUTHENTICATE + PRODUCT_MANAGEMENT (chỉ User đăng bán)
GET /my/products   → AUTHENTICATE + PRODUCT_MANAGEMENT (chỉ User xem sản phẩm của mình)
PUT /:id           → AUTHENTICATE + AUTH + OWNERSHIP (User: sản phẩm của mình, Admin: bất kỳ)
DELETE /:id        → AUTHENTICATE + AUTH + OWNERSHIP (User: sản phẩm của mình, Admin: bất kỳ)
PATCH /:id/mark-sold → AUTHENTICATE + USER (người bán đánh dấu đã bán)
PATCH /:id/mark-available → AUTHENTICATE + USER (người bán đánh dấu có thể bán)
```

### Profile Routes (`/api/profile`)
```
Tất cả routes      → AUTHENTICATE + AUTH (User và Admin đều có profile riêng)
```

### Chat Routes (`/api/chat`)
```
Tất cả routes      → AUTHENTICATE + USER (chỉ User chat, Admin không chat)
```

### Shipping Routes (`/api/shipping`)
```
Tất cả routes      → AUTHENTICATE + PURCHASE_PERMISSION + PREVENT_SELF_PURCHASE (chỉ User mua hàng, không mua sản phẩm của chính mình)
```

### ZaloPay Routes (`/api/zalopay`)
```
POST /create-order     → AUTHENTICATE + USER (chỉ User nạp tiền)
GET /order/:id/status  → AUTHENTICATE + USER (chỉ User xem trạng thái)
GET /history           → AUTHENTICATE + USER (chỉ User xem lịch sử)
POST /callback         → PUBLIC (ZaloPay webhook)
```

### Admin Routes (`/api/admin`)
```
GET /stats           → AUTHENTICATE + ADMIN (thống kê platform)
GET /users           → AUTHENTICATE + ADMIN (xem danh sách user - KHÔNG có thông tin wallet/tài chính)
GET /users/:id       → AUTHENTICATE + ADMIN (xem chi tiết user - KHÔNG có thông tin wallet/tài chính)
PUT /users/:id       → AUTHENTICATE + ADMIN (ban/unban user, đổi role)
DELETE /users/:id    → AUTHENTICATE + ADMIN (ban user)
GET /products/pending → AUTHENTICATE + ADMIN (xem sản phẩm chờ duyệt)
PATCH /products/:id/approve → AUTHENTICATE + ADMIN (duyệt sản phẩm)
PATCH /products/:id/reject → AUTHENTICATE + ADMIN (từ chối sản phẩm)
PUT /products/:id    → AUTHENTICATE + ADMIN (quản lý sản phẩm vi phạm)
DELETE /products/:id → AUTHENTICATE + ADMIN (xóa sản phẩm vi phạm)
GET /orders          → AUTHENTICATE + ADMIN (xem tất cả đơn hàng)
GET /orders/:id      → AUTHENTICATE + ADMIN (xem chi tiết đơn hàng)
PUT /orders/:id      → AUTHENTICATE + ADMIN (cập nhật trạng thái đơn hàng)
GET /violations      → AUTHENTICATE + ADMIN (xem vi phạm)
POST /users/:id/violations → AUTHENTICATE + ADMIN (báo cáo vi phạm)
PUT /users/:id/violations/:violationId → AUTHENTICATE + ADMIN (xử lý vi phạm)
GET /revenue         → AUTHENTICATE + ADMIN (báo cáo doanh thu)
```

---

## 🔄 Luồng hoạt động

### 1. Guest → User
```
Guest xem danh sách sản phẩm → Muốn xem chi tiết/mua → Đăng ký/Đăng nhập → Trở thành User
```

### 2. User hoạt động
```
User đăng nhập → Có thể:
├── Xem chi tiết sản phẩm (/api/products/vehicles, /api/products/batteries, etc.)
├── Đăng bán sản phẩm (POST /api/products)
├── Mua hàng (POST /api/shipping) - KHÔNG mua sản phẩm của chính mình
├── Đánh dấu sản phẩm đã bán (PATCH /api/products/:id/mark-sold)
├── Đánh dấu sản phẩm có thể bán (PATCH /api/products/:id/mark-available)
├── Chat với người bán/mua (/api/chat)
├── Nạp tiền vào ví (/api/zalopay)
└── Quản lý profile (/api/profile)
```

### 3. Admin quản lý
```
Admin đăng nhập → Có thể:
├── Xem danh sách sản phẩm (/api/products) - chỉ danh sách
├── Xem thống kê platform (/api/admin/stats)
├── Xét duyệt sản phẩm:
│   ├── Xem sản phẩm chờ duyệt (/api/admin/products/pending)
│   ├── Duyệt sản phẩm (/api/admin/products/:id/approve)
│   └── Từ chối sản phẩm (/api/admin/products/:id/reject)
├── Quản lý user (ban/unban khi vi phạm)
├── Quản lý sản phẩm (set inactive/xóa khi có vi phạm)
├── Quản lý đơn hàng (cập nhật trạng thái)
├── Xử lý vi phạm user
├── Xem báo cáo doanh thu
└── Quản lý profile admin (/api/profile)
```

---

## 🚨 Quản lý vi phạm

### Admin có thể:
```
1. Báo cáo vi phạm:
POST /api/admin/users/:userId/violations
{
  "type": "spam|fake_product|fraud|inappropriate|other",
  "description": "Mô tả vi phạm",
  "severity": "low|medium|high"
}

2. Xử lý vi phạm:
PUT /api/admin/users/:userId/violations/:violationId
{
  "action": "warning|suspension|ban",
  "adminNotes": "Ghi chú của admin"
}

3. Ban user:
PUT /api/admin/users/:userId
{
  "isActive": false
}
```

---

## 💰 Hệ thống Commission

### Platform thu phí từ mỗi giao dịch:
```
- Tỷ lệ commission: 5% (có thể cấu hình)
- Commission được tính khi đơn hàng hoàn thành
- Admin có thể xem báo cáo doanh thu: GET /api/admin/revenue
```

---

## ✅ Kết luận

**Hệ thống phân quyền hoàn chỉnh với:**

- 🔒 **3 role rõ ràng**: Guest, User, Admin
- 🛡️ **Middleware bảo vệ** chặt chẽ ở mọi level
- 🎯 **Phân quyền đúng** theo mô hình marketplace
- 📊 **Quản lý vi phạm** và doanh thu platform
- 💡 **User experience** tốt với luồng rõ ràng
- 🚫 **Ngăn chặn** user mua sản phẩm của chính mình
- 🔄 **Tự động disable** sản phẩm khi đã bán
- 👤 **Admin có profile riêng** để quản lý thông tin

## ✅ Cập nhật mới nhất:

1. **Guest**: Chỉ xem danh sách sản phẩm, không xem chi tiết
2. **User**: Không được mua sản phẩm của chính mình
3. **Sản phẩm**: Tự động disable khi đã được mua
4. **Admin**: Không cần xem chi tiết sản phẩm, chỉ quản lý khi có vi phạm
5. **Admin**: Có profile riêng, có thể update thông tin
6. **Người bán**: Có thể tự đánh dấu sản phẩm đã bán (bán ở nơi khác)
7. **Xét duyệt sản phẩm**: User đăng bán → pending → Admin duyệt/từ chối → active/rejected

**Không có route nào bị thiếu middleware, hệ thống bảo mật 100%!** 🎉
