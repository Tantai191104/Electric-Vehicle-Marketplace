# Gemini API Setup và Load Balancer Configuration

## 📋 Cấu hình Environment Variables

Thêm vào file `.env`:

### Cách 1: Sử dụng 1 API key (đơn giản)
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Cách 2: Sử dụng 5 API keys (recommended - load balancing)
```env
GEMINI_API_KEY_1=your_first_gemini_api_key
GEMINI_API_KEY_2=your_second_gemini_api_key
GEMINI_API_KEY_3=your_third_gemini_api_key
GEMINI_API_KEY_4=your_fourth_gemini_api_key
GEMINI_API_KEY_5=your_fifth_gemini_api_key
```

**Lưu ý**: 
- Nếu chỉ có `GEMINI_API_KEY`, hệ thống sẽ sử dụng key đó
- Nếu có `GEMINI_API_KEY_1` đến `GEMINI_API_KEY_5`, hệ thống sẽ ưu tiên các keys này
- Hệ thống tự động load balance giữa các keys và failover khi một key hết quota

## 🔄 Load Balancer Features

### 1. Round-Robin Selection
- Các API keys được chọn theo vòng tròn để phân tải đều

### 2. Automatic Failover
- Nếu một API key fail (quota, rate limit, error), tự động chuyển sang key khác
- Sau 3 lần fail liên tiếp, key sẽ bị đánh dấu unavailable
- Sau 1 giờ, key sẽ được reset và thử lại

### 3. Quota Detection
- Tự động phát hiện lỗi quota (403, 429)
- Đánh dấu key là unavailable ngay lập tức khi phát hiện quota error

### 4. Statistics Tracking
- Theo dõi số request thành công/thất bại cho mỗi key
- Success rate cho mỗi key

## 📊 Monitoring API Key Status

Có thể check status của các API keys bằng cách import function:

```javascript
import { getApiKeyStats } from './config/gemini.js';

const stats = getApiKeyStats();
console.log(stats);
// Output:
// [
//   {
//     index: 1,
//     key: "AIzaSyAbcd...",
//     isAvailable: true,
//     totalRequests: 150,
//     successfulRequests: 148,
//     failures: 2,
//     consecutiveFailures: 0,
//     successRate: "98.67%"
//   },
//   ...
// ]
```

## 🧪 Testing

Sau khi setup, test endpoint:

```bash
curl -X POST http://localhost:5000/api/products/suggest-price \
  -H "Content-Type: application/json" \
  -d '{
    "title": "VinFast VF8 2023",
    "description": "Xe điện VinFast VF8 đã qua sử dụng",
    "category": "vehicle",
    "brand": "VinFast",
    "model": "VF8",
    "year": 2023,
    "condition": "used"
  }'
```

## ⚠️ Troubleshooting

### Lỗi: "No Gemini API key available"
- Kiểm tra `.env` file đã có ít nhất 1 key chưa
- Đảm bảo format đúng: `GEMINI_API_KEY=...` hoặc `GEMINI_API_KEY_1=...`

### Lỗi: "All Gemini API keys failed"
- Tất cả keys đã hết quota hoặc bị lỗi
- Kiểm tra logs để xem lỗi cụ thể
- Reset keys bằng cách restart server (sẽ reset sau 1 giờ tự động)

### Keys bị mark unavailable
- Hệ thống sẽ tự động reset sau 1 giờ
- Hoặc restart server để reset ngay

## 📝 Lưu ý

1. **Bảo mật**: Không commit `.env` file vào git
2. **Cost**: Theo dõi usage của các keys để tránh vượt free tier
3. **Rate Limits**: Mỗi key có rate limit riêng, load balancer giúp phân tải
4. **Timeout**: Mặc định 30 giây, có thể điều chỉnh trong service

