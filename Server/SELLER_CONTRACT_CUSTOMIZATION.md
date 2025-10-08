# Seller Contract Customization - Hướng Dẫn

## Tổng Quan

Hệ thống cho phép **người bán tùy chỉnh hợp đồng** khi đăng sản phẩm:
- Người bán nhập HTML điều khoản bổ sung
- Người bán ký tên → sinh PDF template
- Template này đính kèm với sản phẩm
- Khi người mua mua → mở template của người bán → đọc điều khoản custom → ký

---

## Flow Tổng Thể

### 1. Người Bán (Seller)

#### a) Tạo/chỉnh sửa hợp đồng tùy chỉnh
1. Mở màn hình `ProductContractEditor` với `productId`
2. Nhập HTML điều khoản bổ sung (ví dụ: bảo hành, điều kiện đặc biệt...)
3. Ký tên trong signature pad → nhận base64 PNG
4. Bấm "Lưu hợp đồng"
5. Client:
   - Sinh PDF từ HTML + chữ ký người bán
   - Upload PDF lên Cloudinary → nhận `pdfUrl`
   - Gọi API: `PUT /api/products/:id/contract-template`
     - Body: `{ htmlContent, sellerSignature, pdfUrl }`
6. Backend lưu vào `product.contractTemplate`

#### b) API: Cập nhật template

```http
PUT /api/products/:id/contract-template
Authorization: Bearer <token>
Content-Type: application/json

{
  "htmlContent": "<div>...</div>",
  "sellerSignature": "data:image/png;base64,...",
  "pdfUrl": "https://cloudinary.com/..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật hợp đồng thành công",
  "data": {
    "productId": "...",
    "contractTemplate": { ... }
  }
}
```

**Validation:**
- Chỉ người bán (owner) mới được sửa
- Product phải tồn tại

---

### 2. Người Mua (Buyer)

#### a) Xem và ký hợp đồng

1. Mở màn hình `ContractScreen` với `productId`
2. Client gọi API lấy template:
   - `GET /api/products/:id/contract-template`
3. Nhận về:
   - `htmlContent` (điều khoản custom của seller)
   - `sellerSignature` (chữ ký người bán)
4. Render hợp đồng:
   - Phần cố định: thông tin 2 bên, sản phẩm, giá, giao nhận...
   - **Phần custom**: chèn `${sellerContractHtml}` vào sau ĐIỀU 7
   - Chữ ký người bán: hiển thị "Đã ký" (có thể hiện `sellerSignature` nếu cần)
5. Người mua ký → sinh PDF final (có cả 2 chữ ký: seller từ template + buyer mới ký)
6. Upload PDF lên Cloudinary → `finalUrl`
7. Gọi `POST /api/contracts/sign` với `finalUrl`

#### b) API: Lấy template

```http
GET /api/products/:id/contract-template
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "...",
    "productTitle": "...",
    "contractTemplate": {
      "htmlContent": "<div>...</div>",
      "sellerSignature": "data:image/png;base64,...",
      "pdfUrl": "https://...",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

Nếu chưa có template: `contractTemplate` = `null`

---

## Database Schema

**Product Model:**
```javascript
{
  // ... existing fields ...
  contractTemplate: {
    htmlContent: String,      // HTML điều khoản tùy chỉnh
    sellerSignature: String,  // base64 PNG
    pdfUrl: String,           // URL PDF template đã ký
    createdAt: Date
  }
}
```

---

## Frontend Components

### ProductContractEditor.tsx (Người bán)

**Props/Params:**
- `productId`: ID sản phẩm cần tùy chỉnh hợp đồng
- `productTitle`: Tên sản phẩm (hiển thị preview)

**Features:**
- TextInput để nhập HTML
- Signature pad để người bán ký
- WebView preview real-time
- Nút "Lưu hợp đồng": sinh PDF + upload + gọi API

**Usage:**
```tsx
navigation.navigate('ProductContractEditor', {
  productId: product._id,
  productTitle: product.title
});
```

### ContractScreen.tsx (Người mua) - Updated

**Thay đổi:**
- Fetch template từ `GET /api/products/:id/contract-template`
- Chèn `sellerContractHtml` vào HTML template (sau ĐIỀU 7)
- Hiển thị "Đã ký" ở phần người bán (có thể hiện `sellerSignature` nếu muốn)
- Rebuild HTML khi `sellerContractHtml` thay đổi

**Variables mới:**
- `${sellerContractHtml}`: HTML điều khoản bổ sung của người bán
- `sellerSignature`: (optional) có thể hiển thị ảnh chữ ký người bán

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/api/products/:id/contract-template` | Seller | Cập nhật template (chỉ owner) |
| `GET` | `/api/products/:id/contract-template` | Public | Lấy template để hiển thị |

---

## Use Cases

### Case 1: Người bán thêm điều khoản bảo hành đặc biệt

**Seller nhập HTML:**
```html
<div class="section">
  <div class="title">ĐIỀU KHOẢN BẢO HÀNH ĐẶC BIỆT</div>
  <ul>
    <li>Bảo hành động cơ: 12 tháng</li>
    <li>Bảo hành pin: 24 tháng hoặc 50,000 km</li>
    <li>Miễn phí bảo dưỡng định kỳ 3 lần đầu</li>
  </ul>
</div>
```

→ Người mua sẽ thấy điều khoản này trong hợp đồng

### Case 2: Người bán thêm điều kiện đặc biệt

**Seller nhập:**
```html
<div class="section">
  <div class="title">ĐIỀU KIỆN ĐẶC BIỆT</div>
  <ul>
    <li>Giao hàng miễn phí trong bán kính 20km</li>
    <li>Hỗ trợ đăng ký biển số lần đầu</li>
    <li>Tặng kèm bộ phụ kiện: mũ bảo hiểm, áo mưa</li>
  </ul>
</div>
```

### Case 3: Không có template tùy chỉnh

- `sellerContractHtml` = `null`
- Hợp đồng chỉ có các điều khoản chuẩn (ĐIỀU 1-7)
- Vẫn hoạt động bình thường

---

## Security & Validation

### Backend
- ✅ Chỉ owner sản phẩm mới được cập nhật template
- ✅ Validate productId tồn tại
- ✅ Không giới hạn độ dài HTML (seller tự chịu trách nhiệm)

### Frontend
- ✅ Sanitize HTML trước khi render (nếu cần, dùng DOMPurify cho web)
- ✅ Preview real-time để seller kiểm tra trước khi lưu
- ✅ Chữ ký bắt buộc khi lưu template

---

## Testing Flow

### Test 1: Seller tạo template
1. Login as seller
2. Tạo sản phẩm → lấy productId
3. Navigate to ProductContractEditor
4. Nhập HTML điều khoản
5. Ký tên
6. Lưu → kiểm tra response success

### Test 2: Buyer xem template
1. Login as buyer
2. Chọn sản phẩm có template
3. Mở ContractScreen
4. Kiểm tra HTML có hiển thị điều khoản custom
5. Ký tên người mua
6. Upload → finalUrl có chữ ký cả 2 bên

### Test 3: No template
1. Sản phẩm chưa có template
2. Buyer mở contract → chỉ thấy điều khoản chuẩn
3. Vẫn ký và hoàn tất được

---

## Migration Notes

**Existing products:**
- `contractTemplate` mặc định = `null`
- Hợp đồng vẫn hoạt động bình thường (dùng template mặc định)
- Seller có thể cập nhật sau

**Existing contracts:**
- Không ảnh hưởng contracts đã ký
- Chỉ áp dụng cho đơn hàng mới

---

## Troubleshooting

### Template không hiển thị
- Kiểm tra `GET /api/products/:id/contract-template` trả về gì
- Xem `sellerContractHtml` có giá trị không
- Check effect dependency rebuild HTML

### Upload thất bại
- Kiểm tra Cloudinary preset `unsigned_contracts`
- Kiểm tra `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`
- Xem log error từ Cloudinary response

### Chữ ký không lưu
- Kiểm tra `onOK` callback của Signature component
- Verify base64 string format: `data:image/png;base64,...`
- Check state update timing

---

## Example Usage (React Native)

### Seller: Edit contract template
```tsx
// From MyProducts screen
<TouchableOpacity onPress={() => 
  navigation.navigate('ProductContractEditor', {
    productId: product._id,
    productTitle: product.title
  })
}>
  <Text>Tùy chỉnh hợp đồng</Text>
</TouchableOpacity>
```

### Buyer: View contract with custom terms
```tsx
// ContractScreen automatically loads seller's template
// No code change needed - handled in useEffect
```

---

## Next Steps

1. ✅ Add navigation route for `ProductContractEditor`
2. ✅ Add "Tùy chỉnh hợp đồng" button in seller's product management screen
3. ✅ Test end-to-end flow
4. ✅ (Optional) Add rich text editor instead of raw HTML input
5. ✅ (Optional) Add template preview for buyer before signing

