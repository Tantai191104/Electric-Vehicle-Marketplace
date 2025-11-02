# Hướng dẫn tích hợp Gemini API cho tính năng gợi ý giá sản phẩm

## 📋 Tổng quan

Tính năng này cho phép người dùng nhận gợi ý giá tự động dựa trên thông tin sản phẩm (tên, mô tả, thông số kỹ thuật, năm sản xuất, tình trạng, v.v.) khi đang soạn tin đăng mà chưa tạo sản phẩm. AI sẽ phân tích và đưa ra mức giá đề xuất cùng với lý do.

## 🎯 Yêu cầu

1. **Google Gemini API Key**: Cần đăng ký tại [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Node.js package**: `@google/generative-ai` - SDK chính thức của Google cho Gemini

## 📦 Cài đặt Package

### Bước 1: Cài đặt package

```bash
npm install @google/generative-ai
```

### Bước 2: Thêm biến môi trường

Thêm vào file `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🗂️ Cấu trúc File và Thư mục

Bạn cần tạo/cập nhật các file sau:

```
Server/
├── src/
│   ├── config/
│   │   └── gemini.js              # Config và khởi tạo Gemini client
│   ├── services/
│   │   └── priceSuggestionService.js  # Service xử lý logic gọi Gemini
│   ├── controllers/
│   │   └── priceSuggestionController.js  # Controller xử lý request
│   ├── validations/
│   │   └── priceSuggestion.validation.js  # Validation cho request
│   └── routes/
│       └── priceSuggestionRoutes.js  # Route định nghĩa endpoint
```

## 🔧 Các bước tích hợp chi tiết

### Bước 1: Tạo file config (`src/config/gemini.js`)

**Mục đích**: Khởi tạo và export Gemini client để sử dụng trong các service

**Nội dung cần có**:
- Import `GoogleGenerativeAI` từ `@google/generative-ai`
- Load `GEMINI_API_KEY` từ environment variables
- Tạo instance của `GoogleGenerativeAI` với API key
- Export model instance (ví dụ: `gemini-pro` hoặc `gemini-1.5-flash`)
- Export helper function để validate API key

**Cấu trúc gợi ý**:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
}

// Khởi tạo Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Export model instance (sử dụng gemini-1.5-flash hoặc gemini-pro)
export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash' // hoặc 'gemini-pro' cho độ chính xác cao hơn
});

// Export để validate API key
export function validateGeminiConfig() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required');
  }
  return true;
}
```

### Bước 2: Tạo service (`src/services/priceSuggestionService.js`)

**Mục đích**: Xử lý logic gọi Gemini API và format prompt

**Dữ liệu đầu vào cần thu thập**:
- `title` (string, required): Tên sản phẩm
- `description` (string, required): Mô tả sản phẩm
- `category` (enum: "vehicle", "battery", "motorcycle", required)
- `brand` (string, required): Hãng sản xuất
- `model` (string, required): Model
- `year` (number, required): Năm sản xuất
- `condition` (enum: "used", "refurbished", required): Tình trạng
- `specifications` (object, optional): Thông số kỹ thuật
  - Vehicle: `batteryCapacity`, `range`, `chargingTime`, `power`, `maxSpeed`, `warranty`
  - Battery: `batteryType`, `voltage`, `capacity`, `cycleLife`, `warranty`, `compatibility`
  - Motorcycle: `batteryCapacity`, `range`, `chargingTime`, `power`, `maxSpeed`, `compatibility`

**Prompt template gợi ý**:

Bạn nên tạo một prompt có cấu trúc như sau:

```
Bạn là một chuyên gia định giá xe điện và phụ kiện xe điện tại Việt Nam. 
Nhiệm vụ của bạn là đưa ra gợi ý giá bán dựa trên thông tin sản phẩm được cung cấp.

Thông tin sản phẩm:
- Tên sản phẩm: {title}
- Danh mục: {category} (vehicle/battery/motorcycle)
- Hãng: {brand}
- Model: {model}
- Năm sản xuất: {year}
- Tình trạng: {condition} (used/refurbished)
- Mô tả: {description}

Thông số kỹ thuật:
{formatSpecifications}

QUAN TRỌNG - Kiểm tra tính nhất quán dữ liệu:
Trước khi phân tích giá, bạn PHẢI kiểm tra xem có sự không nhất quán giữa các trường thông tin không:
1. So sánh tên sản phẩm (title) với hãng (brand) và model được cung cấp
2. Nếu phát hiện không nhất quán (ví dụ: title nói "Tesla Model 3" nhưng brand là "VinFast"):
   - Ghi nhận sự không nhất quán trong field "warnings"
   - Vẫn tiếp tục phân tích giá dựa trên brand và model được cung cấp (KHÔNG dựa vào title nếu có mâu thuẫn)
   - Đưa ra gợi ý giá cho brand/model đã được chỉ định
   - Trong reasoning, đề cập rằng có thể có nhầm lẫn trong thông tin đầu vào
3. Nếu thông tin nhất quán, vẫn có thể có warnings về các vấn đề khác (ví dụ: năm sản xuất quá cũ, model không tồn tại, v.v.)

Yêu cầu:
1. Phân tích giá trị sản phẩm dựa trên:
   - Thương hiệu và độ phổ biến tại thị trường Việt Nam
   - Năm sản xuất và mức độ hao mòn (nếu used)
   - Thông số kỹ thuật so với các model tương tự
   - Tình trạng sản phẩm (used vs refurbished)
   - Thị trường hiện tại của xe điện tại Việt Nam

2. Đưa ra 3 mức giá gợi ý:
   - Giá thấp (phù hợp nếu muốn bán nhanh)
   - Giá đề xuất (giá hợp lý, cân bằng)
   - Giá cao (nếu sản phẩm trong tình trạng tốt, hiếm)

3. Đưa ra lý do cho mỗi mức giá
4. Gợi ý giá theo đơn vị VND (đồng Việt Nam)
5. PHẢI kiểm tra và báo cáo mọi sự không nhất quán hoặc vấn đề trong dữ liệu đầu vào

Hãy trả về kết quả theo format JSON:
{
  "suggestedPrice": number,  // Giá đề xuất chính
  "priceRange": {
    "low": number,
    "recommended": number,
    "high": number
  },
  "reasoning": {
    "low": "string",
    "recommended": "string",
    "high": "string"
  },
  "marketAnalysis": "string",  // Phân tích thị trường ngắn gọn
  "factors": ["string"],  // Các yếu tố ảnh hưởng đến giá
  "tips": ["string"],  // Lời khuyên về cách đặt giá
  "warnings": ["string"],  // Cảnh báo về sự không nhất quán hoặc vấn đề trong dữ liệu (rỗng nếu không có)
  "dataQuality": {
    "isConsistent": boolean,  // true nếu title, brand, model nhất quán với nhau
    "detectedBrand": "string",  // Brand được phát hiện từ title (nếu khác với brand input)
    "detectedModel": "string",  // Model được phát hiện từ title (nếu khác với model input)
    "recommendation": "string"  // Gợi ý sửa dữ liệu nếu có inconsistency
  }
}
```

**Cấu trúc function gợi ý**:

```javascript
import { geminiModel, validateGeminiConfig } from '../config/gemini.js';

/**
 * Tạo prompt từ thông tin sản phẩm
 */
function buildPrompt(productData) {
  // Format specifications object thành text
  // Format category thành tiếng Việt
  // Xây dựng prompt hoàn chỉnh với phần kiểm tra consistency
  // Return prompt string
}

/**
 * Parse response từ Gemini (có thể là JSON hoặc text)
 */
function parseGeminiResponse(responseText) {
  // Xử lý trường hợp response là JSON string
  // Xử lý trường hợp response có markdown code block
  // Validate và return object đã parse
}

/**
 * Validate response structure bao gồm dataQuality fields
 */
function validatePriceSuggestionResponse(data) {
  // Validate các field cơ bản (suggestedPrice, priceRange, reasoning)
  // Validate dataQuality structure:
  //   - isConsistent phải là boolean
  //   - Nếu isConsistent = false, phải có warnings array (ít nhất 1 item)
  //   - detectedBrand và detectedModel có thể null hoặc string
  //   - recommendation có thể null hoặc string
  // Return true nếu hợp lệ
}

/**
 * Service chính để gợi ý giá
 */
export async function suggestPrice(productData) {
  // 1. Validate Gemini config
  // 2. Build prompt từ productData (đã bao gồm instruction về consistency check)
  // 3. Gọi Gemini API với prompt
  // 4. Parse response
  // 5. Validate response structure (bao gồm dataQuality)
  // 6. Format response và đảm bảo warnings được hiển thị rõ ràng
  // 7. Return kết quả
}
```

**Xử lý Inconsistency - Logic trong Service:**

Khi implement service, cần lưu ý:
1. **AI sẽ tự động phát hiện inconsistency**: Prompt đã yêu cầu AI kiểm tra và báo cáo
2. **Không cần validate trước**: Không cần validate title vs brand/model ở phía server vì:
   - User có thể nhập tự do, có thể có trường hợp hợp lệ (ví dụ: title "Xe điện VinFast VF8 mới" nhưng brand="VinFast" - vẫn nhất quán)
   - AI sẽ phát hiện chính xác hơn bằng ngữ cảnh
3. **Xử lý response**: 
   - Luôn trả về response thành công (status 200) ngay cả khi có inconsistency
   - Frontend sẽ dựa vào `data.dataQuality.isConsistent` và `data.warnings` để hiển thị cảnh báo
   - Giá vẫn được tính dựa trên brand/model đã chỉ định (không dựa vào title nếu có mâu thuẫn)

**Ví dụ các trường hợp AI sẽ phát hiện:**

1. **Title vs Brand mismatch:**
   - Input: `{title: "Tesla Model 3", brand: "VinFast", model: "VF8"}`
   - AI phát hiện: Tesla ≠ VinFast → `isConsistent: false`, `warnings` chứa thông báo

2. **Title vs Model mismatch:**
   - Input: `{title: "VinFast VF8 2023", brand: "VinFast", model: "VF5"}`
   - AI phát hiện: VF8 ≠ VF5 → `isConsistent: false`

3. **Thông tin nhất quán:**
   - Input: `{title: "Xe điện VinFast VF8", brand: "VinFast", model: "VF8"}`
   - AI xác nhận: nhất quán → `isConsistent: true`, `warnings: []`

4. **Edge case - Title không rõ ràng:**
   - Input: `{title: "Xe điện giá rẻ", brand: "VinFast", model: "VF8"}`
   - AI sẽ dựa vào brand/model, không có inconsistency nghiêm trọng → `isConsistent: true` (hoặc có thể có warning nhẹ về title thiếu thông tin)

**Xử lý lỗi cần có**:
- Kiểm tra API key tồn tại
- Xử lý timeout (thêm timeout cho request)
- Xử lý rate limiting của Gemini
- Xử lý response không đúng format
- Fallback nếu Gemini không trả về được

### Bước 3: Tạo validation (`src/validations/priceSuggestion.validation.js`)

**Mục đích**: Validate dữ liệu đầu vào từ client

**Cấu trúc gợi ý**:

```javascript
import { z } from "zod";

// Schema cho specifications (tương tự product.validation.js)
const vehicleSpecsSchema = z.object({
  batteryCapacity: z.string().optional(),
  range: z.string().optional(),
  chargingTime: z.string().optional(),
  power: z.string().optional(),
  maxSpeed: z.string().optional(),
  warranty: z.string().optional()
}).optional();

const batterySpecsSchema = z.object({
  batteryType: z.string().optional(),
  voltage: z.string().optional(),
  capacity: z.string().optional(),
  cycleLife: z.string().optional(),
  warranty: z.string().optional(),
  compatibility: z.string().optional()
}).optional();

const motorcycleSpecsSchema = z.object({
  batteryCapacity: z.string().optional(),
  range: z.string().optional(),
  chargingTime: z.string().optional(),
  power: z.string().optional(),
  maxSpeed: z.string().optional(),
  compatibility: z.string().optional()
}).optional();

// Validation schema cho request gợi ý giá
export const priceSuggestionValidation = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  category: z.enum(["vehicle", "battery", "motorcycle"], {
    message: "Invalid category"
  }),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1),
  condition: z.enum(["used", "refurbished"], {
    message: "Invalid condition"
  }),
  specifications: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return {}; }
      }
      return val;
    },
    z.union([vehicleSpecsSchema, batterySpecsSchema, motorcycleSpecsSchema])
  ).optional()
});
```

### Bước 4: Tạo controller (`src/controllers/priceSuggestionController.js`)

**Mục đích**: Xử lý HTTP request và response

**Cấu trúc gợi ý**:

```javascript
import { priceSuggestionValidation } from '../validations/priceSuggestion.validation.js';
import { suggestPrice } from '../services/priceSuggestionService.js';

export async function getPriceSuggestion(req, res) {
  try {
    // 1. Validate request body với Zod
    // 2. Gọi service suggestPrice
    // 3. Trả về response thành công
    // 4. Xử lý các loại lỗi khác nhau (validation, service, Gemini API)
  } catch (error) {
    // Xử lý lỗi và trả về status code phù hợp
  }
}
```

**Response format gợi ý**:

**Trường hợp thông tin nhất quán:**
```json
{
  "success": true,
  "data": {
    "suggestedPrice": 15000000,
    "priceRange": {
      "low": 12000000,
      "recommended": 15000000,
      "high": 18000000
    },
    "reasoning": {
      "low": "Giá này phù hợp nếu bạn muốn bán nhanh...",
      "recommended": "Đây là mức giá hợp lý dựa trên...",
      "high": "Có thể đặt giá cao hơn nếu sản phẩm..."
    },
    "marketAnalysis": "Trên thị trường hiện tại...",
    "factors": [
      "Thương hiệu VinFast có độ nhận diện cao",
      "Model 2023 còn khá mới",
      "Tình trạng used nhưng được bảo dưỡng tốt"
    ],
    "tips": [
      "Nên bao gồm ảnh chất lượng để tăng giá trị",
      "Liệt kê đầy đủ phụ kiện đi kèm",
      "Có thể thương lượng trong khoảng recommended ±10%"
    ],
    "warnings": [],
    "dataQuality": {
      "isConsistent": true,
      "detectedBrand": null,
      "detectedModel": null,
      "recommendation": null
    }
  }
}
```

**Trường hợp thông tin KHÔNG nhất quán (ví dụ: title "Tesla Model 3" nhưng brand là "VinFast"):**
```json
{
  "success": true,
  "data": {
    "suggestedPrice": 890000000,
    "priceRange": {
      "low": 750000000,
      "recommended": 890000000,
      "high": 1050000000
    },
    "reasoning": {
      "low": "Giá này dựa trên VinFast VF8...",
      "recommended": "Phân tích dựa trên thông tin brand/model được cung cấp (VinFast VF8)...",
      "high": "Nếu là VinFast VF8 thật sự..."
    },
    "marketAnalysis": "Phân tích dựa trên thông tin VinFast VF8...",
    "factors": [
      "Thương hiệu VinFast có độ nhận diện cao tại Việt Nam",
      "Model VF8 2023",
      "Lưu ý: Có thể có nhầm lẫn trong thông tin đầu vào"
    ],
    "tips": [
      "Vui lòng kiểm tra lại thông tin brand và model",
      "Đảm bảo thông tin nhất quán để có gợi ý giá chính xác hơn"
    ],
    "warnings": [
      "Phát hiện sự không nhất quán: Title đề cập đến 'Tesla' nhưng brand được chỉ định là 'VinFast'",
      "Gợi ý giá được tính dựa trên VinFast VF8 (brand và model đã chỉ định)",
      "Nếu sản phẩm thực sự là Tesla, vui lòng cập nhật lại brand và model"
    ],
    "dataQuality": {
      "isConsistent": false,
      "detectedBrand": "Tesla",
      "detectedModel": "Model 3",
      "recommendation": "Đề xuất sửa brand thành 'Tesla' và model thành 'Model 3' để có gợi ý giá chính xác hơn. Nếu sản phẩm thực sự là VinFast, vui lòng cập nhật title cho phù hợp."
    }
  }
}
```

### Bước 5: Tạo route (`src/routes/priceSuggestionRoutes.js`)

**Mục đích**: Định nghĩa endpoint và kết nối với controller

**Cấu trúc gợi ý**:

```javascript
import express from 'express';
import { getPriceSuggestion } from '../controllers/priceSuggestionController.js';
// Có thể không cần authenticate nếu muốn public
// hoặc require authenticate nếu muốn giới hạn usage

const router = express.Router();

/**
 * @swagger
 * /products/suggest-price:
 *   post:
 *     summary: Get AI price suggestion for a product draft
 *     description: Analyze product information and get AI-powered price suggestion before creating the listing
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category, brand, model, year, condition]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "VinFast VF8 2023"
 *               description:
 *                 type: string
 *                 example: "Xe điện VinFast VF8 đã qua sử dụng..."
 *               category:
 *                 type: string
 *                 enum: [vehicle, battery, motorcycle]
 *               brand:
 *                 type: string
 *                 example: "VinFast"
 *               model:
 *                 type: string
 *                 example: "VF8"
 *               year:
 *                 type: integer
 *                 example: 2023
 *               condition:
 *                 type: string
 *                 enum: [used, refurbished]
 *               specifications:
 *                 type: object
 *                 description: "Optional technical specifications"
 *     responses:
 *       200:
 *         description: Price suggestion received successfully
 *       400:
 *         description: Validation error or missing required fields
 *       500:
 *         description: Server error or Gemini API error
 */
router.post('/products/suggest-price', getPriceSuggestion);

export default router;
```

### Bước 6: Đăng ký route trong `src/index.js`

**Thêm vào phần import routes**:
```javascript
import priceSuggestionRoutes from './routes/priceSuggestionRoutes.js';
```

**Thêm vào phần app.use routes** (sau productRoutes hoặc trước productRoutes):
```javascript
app.use('/api', priceSuggestionRoutes);
```

## 📝 Chi tiết về Prompt Engineering

### Các yếu tố cần nhấn mạnh trong prompt:

1. **Context về thị trường Việt Nam**:
   - Thị trường xe điện tại Việt Nam đang phát triển
   - Các thương hiệu phổ biến (VinFast, Tesla, BYD, v.v.)
   - Xu hướng giá cả và độ hao mòn

2. **Phân tích theo category**:
   - **Vehicle (xe điện)**: Giá cao nhất, phụ thuộc vào model, năm, tình trạng, thông số pin
   - **Battery (pin)**: Phụ thuộc vào công suất, tuổi thọ, độ tương thích
   - **Motorcycle (xe máy điện)**: Giá thấp hơn xe điện, phụ thuộc vào model và thông số

3. **Điều chỉnh theo condition**:
   - **Used**: Giảm giá từ 20-40% so với giá mới tùy năm sử dụng
   - **Refurbished**: Giảm giá 10-30% tùy mức độ phục hồi

4. **Yếu tố ảnh hưởng giá**:
   - Năm sản xuất (xe càng mới càng giá cao)
   - Thương hiệu (thương hiệu cao cấp = giá cao)
   - Thông số kỹ thuật (pin lớn hơn = giá cao hơn)
   - Tình trạng sử dụng (km đã chạy, lịch sử bảo dưỡng)

### Ví dụ prompt chi tiết:

```
Bạn là một chuyên gia định giá xe điện và phụ kiện tại thị trường Việt Nam.

THÔNG TIN SẢN PHẨM:
- Tên: VinFast VF8 2023
- Danh mục: Xe điện (vehicle)
- Hãng: VinFast
- Model: VF8
- Năm sản xuất: 2023
- Tình trạng: Đã qua sử dụng (used)
- Mô tả: Xe điện VinFast VF8 SUV 7 chỗ, đã qua sử dụng 1 năm, tình trạng tốt, đầy đủ phụ kiện, bảo hành còn hiệu lực.

THÔNG SỐ KỸ THUẬT:
- Dung lượng pin: 3.5 kWh
- Quãng đường: 203 km
- Công suất: 2,500 W
- Tốc độ tối đa: 120 km/h
- Bảo hành: 3 năm hoặc 30,000 km

YÊU CẦU PHÂN TÍCH:
1. So sánh với giá thị trường hiện tại của VinFast VF8 mới (khoảng 890-1.2 tỷ VND tùy phiên bản)
2. Tính toán mức hao mòn sau 1 năm sử dụng (khoảng 15-25% tùy tình trạng)
3. Xem xét độ phổ biến của thương hiệu VinFast tại Việt Nam
4. Xem xét các yếu tố như: năm sản xuất mới (2023), đầy đủ phụ kiện, bảo hành còn hiệu lực

Đưa ra 3 mức giá đề xuất và lý do chi tiết cho từng mức.
```

## 🔄 Xử lý Response từ Gemini

### Parse JSON từ response:

Gemini có thể trả về:
1. **JSON thuần**: `{"suggestedPrice": 15000000, ...}`
2. **JSON trong markdown code block**: `\`\`\`json\n{...}\n\`\`\``
3. **Text format**: Cần parse thủ công

**Code xử lý gợi ý**:

```javascript
function parseGeminiResponse(text) {
  try {
    // Thử parse JSON trực tiếp
    return JSON.parse(text);
  } catch (e1) {
    try {
      // Thử extract JSON từ markdown code block
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
    } catch (e2) {
      // Nếu không parse được, tạo structure mặc định từ text
      return createFallbackResponse(text);
    }
  }
}
```

### Validate response structure:

Đảm bảo response có đủ các field cần thiết, bao gồm cả dataQuality:

```javascript
function validatePriceSuggestionResponse(data) {
  // Validate các field cơ bản
  const required = ['suggestedPrice', 'priceRange', 'reasoning', 'dataQuality'];
  for (const field of required) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Validate priceRange structure
  if (!data.priceRange.low || !data.priceRange.recommended || !data.priceRange.high) {
    throw new Error('Invalid priceRange structure');
  }
  
  // Validate các giá phải là số và hợp lý
  const prices = [data.priceRange.low, data.priceRange.recommended, data.priceRange.high, data.suggestedPrice];
  for (const price of prices) {
    if (typeof price !== 'number' || price <= 0) {
      throw new Error('All prices must be positive numbers');
    }
  }
  
  // Validate: low < recommended < high
  if (data.priceRange.low >= data.priceRange.recommended || 
      data.priceRange.recommended >= data.priceRange.high) {
    throw new Error('Invalid price range: low < recommended < high');
  }
  
  // Validate dataQuality structure
  if (typeof data.dataQuality.isConsistent !== 'boolean') {
    throw new Error('dataQuality.isConsistent must be a boolean');
  }
  
  // Nếu không nhất quán, phải có warnings
  if (!data.dataQuality.isConsistent) {
    if (!Array.isArray(data.warnings) || data.warnings.length === 0) {
      // Có thể log warning nhưng không throw error (vì AI có thể quên)
      console.warn('Inconsistent data detected but no warnings provided');
    }
  }
  
  // Validate warnings là array
  if (!Array.isArray(data.warnings)) {
    data.warnings = [];
  }
  
  return true;
}
```

## ⚠️ Xử lý Lỗi

### Các loại lỗi cần xử lý:

1. **Missing API Key**:
   ```javascript
   if (!process.env.GEMINI_API_KEY) {
     return res.status(503).json({ 
       error: 'Price suggestion service is temporarily unavailable' 
     });
   }
   ```

2. **Gemini API Rate Limit**:
   ```javascript
   // Trong service, catch và retry với exponential backoff
   // Hoặc trả về lỗi 429 Too Many Requests
   ```

3. **Timeout**:
   ```javascript
   // Set timeout cho request (ví dụ 30 giây)
   // Sử dụng AbortController hoặc axios timeout
   ```

4. **Invalid Response Format**:
   ```javascript
   // Validate response structure
   // Fallback về response mặc định nếu không parse được
   ```

5. **Gemini API Error**:
   ```javascript
   // Log error chi tiết
   // Trả về lỗi generic cho client
   ```

## 🎨 Frontend Integration (Gợi ý)

### Cách hiển thị warnings cho user:

Frontend nên kiểm tra `data.dataQuality.isConsistent` và hiển thị cảnh báo nếu có:

```javascript
// Ví dụ xử lý response ở frontend
if (!response.data.dataQuality.isConsistent) {
  // Hiển thị warning box với màu vàng/cam
  showWarning({
    title: "Phát hiện sự không nhất quán trong thông tin",
    messages: response.data.warnings,
    recommendation: response.data.dataQuality.recommendation,
    detectedBrand: response.data.dataQuality.detectedBrand,
    detectedModel: response.data.dataQuality.detectedModel
  });
  
  // Có thể offer quick fix nút:
  // "Sửa brand thành: Tesla" và "Sửa model thành: Model 3"
}

// Hiển thị giá bình thường
displayPriceSuggestion(response.data);
```

### UI/UX gợi ý:

1. **Warning badge**: Hiển thị badge màu vàng/cam bên cạnh giá gợi ý
2. **Expandable warning box**: User có thể click để xem chi tiết warnings
3. **Quick fix buttons**: Nếu AI detect được brand/model từ title, offer nút "Áp dụng: Tesla Model 3"
4. **Tooltip**: Giải thích rằng giá được tính dựa trên brand/model đã chỉ định, không phải title

## 🧪 Testing

### Test cases cần kiểm tra:

1. **Request hợp lệ với đầy đủ thông tin** → `isConsistent: true`
2. **Request thiếu required fields** → Validation error
3. **Request với specifications đầy đủ**
4. **Request với specifications rỗng**
5. **Request với category khác nhau** (vehicle, battery, motorcycle)
6. **Request với condition khác nhau** (used, refurbished)
7. **Request với title/brand/model mismatch** → `isConsistent: false`, có warnings
8. **Test với Gemini API key không hợp lệ**
9. **Test timeout scenario**
10. **Test với response format không đúng**
11. **Test edge case: Title không rõ ràng nhưng brand/model hợp lệ**

### Cách test endpoint:

**Test 1: Request nhất quán (expected: `isConsistent: true`)**
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
    "condition": "used",
    "specifications": {
      "batteryCapacity": "3.5 kWh",
      "range": "203 km",
      "power": "2,500 W"
    }
  }'
```

**Test 2: Request KHÔNG nhất quán (expected: `isConsistent: false`, có warnings)**
```bash
curl -X POST http://localhost:5000/api/products/suggest-price \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Xe điện Tesla Model 3",
    "description": "Tesla Model 3 đã qua sử dụng",
    "category": "vehicle",
    "brand": "VinFast",
    "model": "VF8",
    "year": 2023,
    "condition": "used"
  }'
```

**Expected response cho Test 2:**
- `data.dataQuality.isConsistent` = `false`
- `data.warnings` có ít nhất 1 item về mismatch
- `data.dataQuality.detectedBrand` = `"Tesla"`
- `data.dataQuality.detectedModel` = `"Model 3"`
- Giá vẫn được tính (dựa trên VinFast VF8)

## 📊 Cải thiện và Tối ưu

### Caching (tùy chọn):

Nếu nhiều người dùng gửi request tương tự, có thể cache kết quả:
- Cache key: hash của (category + brand + model + year + condition)
- Cache duration: 1 giờ hoặc 24 giờ
- Sử dụng Redis hoặc in-memory cache

### Rate Limiting (khuyến nghị):

Giới hạn số request từ mỗi user:
- Free user: 5 requests/hour
- Pro user: 20 requests/hour
- Có thể implement trong middleware

### Collecting Market Data (tùy chọn):

Có thể cải thiện độ chính xác bằng cách:
- Lấy giá trung bình từ các sản phẩm tương tự trong database
- Feed data này vào prompt như context bổ sung
- Ví dụ: "Giá trung bình của VinFast VF8 trên thị trường là X triệu VND"

## 🔐 Bảo mật

1. **Không expose API key**: Luôn dùng environment variables
2. **Rate limiting**: Tránh abuse
3. **Input validation**: Tránh prompt injection
4. **Sanitize input**: Loại bỏ các ký tự đặc biệt có thể làm hỏng prompt

## 📚 Tài liệu tham khảo

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [@google/generative-ai npm package](https://www.npmjs.com/package/@google/generative-ai)
- [Gemini API Models](https://ai.google.dev/models/gemini)

## ✅ Checklist Implementation

- [ ] Cài đặt package `@google/generative-ai`
- [ ] Thêm `GEMINI_API_KEY` vào `.env`
- [ ] Tạo file `src/config/gemini.js`
- [ ] Tạo file `src/services/priceSuggestionService.js`
- [ ] Tạo file `src/validations/priceSuggestion.validation.js`
- [ ] Tạo file `src/controllers/priceSuggestionController.js`
- [ ] Tạo file `src/routes/priceSuggestionRoutes.js`
- [ ] Đăng ký route trong `src/index.js`
- [ ] Test endpoint với các scenarios khác nhau
- [ ] Xử lý các edge cases và error scenarios
- [ ] Thêm Swagger documentation
- [ ] Implement rate limiting (nếu cần)
- [ ] Thêm logging cho debugging

## 🎯 Lưu ý quan trọng

1. **Cost**: Gemini API có giới hạn free tier. Theo dõi usage để tránh vượt quota.
2. **Latency**: API call có thể mất 2-5 giây. Nên có loading state ở frontend.
3. **Accuracy**: Kết quả chỉ mang tính tham khảo. Người dùng nên tự điều chỉnh.
4. **Language**: Prompt nên hỗ trợ cả tiếng Việt và tiếng Anh cho input/output.

## 📌 Tóm tắt: Xử lý Inconsistency giữa Title và Brand/Model

### Câu hỏi: Nếu title là "Xe điện Tesla" nhưng brand nhập "VinFast" thì AI trả lời như thế nào?

### Trả lời:

1. **AI sẽ tự động phát hiện inconsistency**:
   - Prompt đã được thiết kế để AI so sánh title với brand/model
   - AI sẽ phát hiện "Tesla" trong title ≠ "VinFast" trong brand

2. **Response sẽ bao gồm**:
   - `dataQuality.isConsistent: false`
   - `warnings`: Array chứa cảnh báo về sự không nhất quán
   - `dataQuality.detectedBrand: "Tesla"` (AI extract từ title)
   - `dataQuality.detectedModel: "Model 3"` (nếu có trong title)
   - `dataQuality.recommendation`: Gợi ý sửa dữ liệu

3. **Giá vẫn được tính**:
   - **Giá được tính dựa trên brand/model đã chỉ định** (VinFast VF8)
   - **KHÔNG** dựa vào title khi có mâu thuẫn
   - Lý do: Brand và Model là trường quan trọng hơn, được user chỉ định rõ ràng

4. **Reasoning sẽ đề cập**:
   - "Phân tích dựa trên thông tin brand/model được cung cấp (VinFast VF8)..."
   - "Lưu ý: Có thể có nhầm lẫn trong thông tin đầu vào"

5. **Frontend xử lý**:
   - Hiển thị warning box màu vàng/cam
   - Hiển thị recommendation: "Đề xuất sửa brand thành 'Tesla'..."
   - Offer quick fix button nếu có `detectedBrand` và `detectedModel`

### Ví dụ cụ thể:

**Input:**
```json
{
  "title": "Xe điện Tesla Model 3",
  "brand": "VinFast",
  "model": "VF8",
  ...
}
```

**AI Response:**
```json
{
  "suggestedPrice": 890000000,  // Giá của VinFast VF8, KHÔNG phải Tesla
  "warnings": [
    "Phát hiện sự không nhất quán: Title đề cập đến 'Tesla' nhưng brand được chỉ định là 'VinFast'",
    "Gợi ý giá được tính dựa trên VinFast VF8 (brand và model đã chỉ định)"
  ],
  "dataQuality": {
    "isConsistent": false,
    "detectedBrand": "Tesla",
    "detectedModel": "Model 3",
    "recommendation": "Đề xuất sửa brand thành 'Tesla' và model thành 'Model 3' để có gợi ý giá chính xác hơn."
  }
}
```

### Tóm lại:
- ✅ AI phát hiện inconsistency
- ✅ Vẫn trả về giá (dựa trên brand/model đã chỉ định)
- ✅ Báo cảnh báo rõ ràng
- ✅ Đề xuất cách sửa
- ✅ Frontend hiển thị warning và offer quick fix

