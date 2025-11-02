import { callGeminiWithFailover, validateGeminiConfig } from '../config/gemini.js';

/**
 * Format category name to Vietnamese
 */
function formatCategory(category) {
  const categoryMap = {
    vehicle: 'Xe điện (ô tô)',
    battery: 'Pin xe điện',
    motorcycle: 'Xe máy điện'
  };
  return categoryMap[category] || category;
}

/**
 * Format condition name to Vietnamese
 */
function formatCondition(condition) {
  const conditionMap = {
    used: 'Đã qua sử dụng',
    refurbished: 'Đã được phục hồi/chất lượng cao'
  };
  return conditionMap[condition] || condition;
}

/**
 * Format specifications object to text
 */
function formatSpecifications(specs, category) {
  if (!specs || typeof specs !== 'object' || Object.keys(specs).length === 0) {
    return 'Không có thông tin chi tiết';
  }

  const lines = [];
  
  if (category === 'vehicle' || category === 'motorcycle') {
    if (specs.batteryCapacity) lines.push(`- Dung lượng pin: ${specs.batteryCapacity}`);
    if (specs.range) lines.push(`- Quãng đường: ${specs.range}`);
    if (specs.chargingTime) lines.push(`- Thời gian sạc: ${specs.chargingTime}`);
    if (specs.power) lines.push(`- Công suất: ${specs.power}`);
    if (specs.maxSpeed) lines.push(`- Tốc độ tối đa: ${specs.maxSpeed}`);
    if (specs.warranty) lines.push(`- Bảo hành: ${specs.warranty}`);
    if (specs.compatibility) lines.push(`- Tương thích: ${specs.compatibility}`);
  }
  
  if (category === 'battery') {
    if (specs.batteryType) lines.push(`- Loại pin: ${specs.batteryType}`);
    if (specs.voltage) lines.push(`- Điện áp: ${specs.voltage}`);
    if (specs.capacity) lines.push(`- Dung lượng: ${specs.capacity}`);
    if (specs.cycleLife) lines.push(`- Chu kỳ sạc: ${specs.cycleLife}`);
    if (specs.warranty) lines.push(`- Bảo hành: ${specs.warranty}`);
    if (specs.compatibility) lines.push(`- Tương thích: ${specs.compatibility}`);
  }

  return lines.length > 0 ? lines.join('\n') : 'Không có thông tin chi tiết';
}

/**
 * Build prompt from product data
 */
function buildPrompt(productData) {
  const categoryVN = formatCategory(productData.category);
  const conditionVN = formatCondition(productData.condition);
  const specsText = formatSpecifications(productData.specifications, productData.category);

  const prompt = `Bạn là chuyên gia định giá xe điện tại Việt Nam. Phân tích và đưa ra gợi ý giá bán.

Thông tin sản phẩm:
Tên: ${productData.title}
Danh mục: ${categoryVN}
Hãng: ${productData.brand}
Model: ${productData.model}
Năm: ${productData.year}
Tình trạng: ${conditionVN}
Mô tả: ${productData.description}

Thông số: ${specsText}

KIỂM TRA NHẤT QUÁN:
- So sánh title với brand/model. Nếu không khớp, ghi vào "warnings" và phân tích theo brand/model đã chỉ định.

YÊU CẦU:
1. Phân tích dựa trên: thương hiệu, năm sản xuất, thông số, tình trạng, thị trường VN
2. Đưa ra 3 mức giá: thấp (bán nhanh), đề xuất (cân bằng), cao (tình trạng tốt/hiếm)
3. Lý do cho từng mức
4. Giá tính bằng VND
5. Báo cáo mọi không nhất quán trong "warnings"

Trả về JSON (CHỈ JSON, không text khác):
{
  "suggestedPrice": number,
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
  "marketAnalysis": "string",
  "factors": ["string"],
  "tips": ["string"],
  "warnings": ["string"],
  "dataQuality": {
    "isConsistent": boolean,
    "detectedBrand": "string" | null,
    "detectedModel": "string" | null,
    "recommendation": "string" | null
  }
}`;

  return prompt;
}

/**
 * Parse Gemini response (could be JSON string or text with markdown)
 */
function parseGeminiResponse(responseText) {
  if (!responseText || typeof responseText !== 'string') {
    throw new Error('Invalid response from Gemini API');
  }

  // Try to parse as direct JSON
  try {
    const parsed = JSON.parse(responseText.trim());
    return parsed;
  } catch (e1) {
    // Try to extract JSON from markdown code block
    try {
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        const parsed = JSON.parse(jsonMatch[1].trim());
        return parsed;
      }
    } catch (e2) {
      // Try to find JSON object in text
      try {
        const jsonObjectMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          const parsed = JSON.parse(jsonObjectMatch[0]);
          return parsed;
        }
      } catch (e3) {
        // If all parsing fails, create fallback response
        console.warn('Failed to parse Gemini response as JSON, creating fallback');
        return createFallbackResponse(responseText);
      }
    }
  }

  throw new Error('Unable to parse Gemini response');
}

/**
 * Create fallback response when JSON parsing fails
 */
function createFallbackResponse(text) {
  // Try to extract any numbers that might be prices
  const priceMatches = text.match(/[\d,]+/g);
  const suggestedPrice = priceMatches && priceMatches.length > 0 
    ? parseInt(priceMatches[0].replace(/,/g, '')) 
    : 10000000;

  return {
    suggestedPrice: suggestedPrice,
    priceRange: {
      low: Math.round(suggestedPrice * 0.8),
      recommended: suggestedPrice,
      high: Math.round(suggestedPrice * 1.2)
    },
    reasoning: {
      low: "Giá thấp dựa trên phân tích tự động",
      recommended: "Giá đề xuất dựa trên phân tích tự động",
      high: "Giá cao dựa trên phân tích tự động"
    },
    marketAnalysis: "Phân tích thị trường dựa trên thông tin sản phẩm",
    factors: ["Thông tin được phân tích tự động"],
    tips: ["Vui lòng kiểm tra lại thông tin sản phẩm", "Giá chỉ mang tính tham khảo"],
    warnings: ["Không thể parse đầy đủ response từ AI, giá được ước tính tự động"],
    dataQuality: {
      isConsistent: true,
      detectedBrand: null,
      detectedModel: null,
      recommendation: null
    }
  };
}

/**
 * Validate price suggestion response structure
 */
function validatePriceSuggestionResponse(data) {
  // Validate required fields
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

  // Validate prices are numbers and positive
  const prices = [data.priceRange.low, data.priceRange.recommended, data.priceRange.high, data.suggestedPrice];
  for (const price of prices) {
    if (typeof price !== 'number' || price <= 0 || !isFinite(price)) {
      throw new Error('All prices must be positive finite numbers');
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

  // Ensure warnings is an array
  if (!Array.isArray(data.warnings)) {
    data.warnings = [];
  }

  // Ensure factors and tips are arrays
  if (!Array.isArray(data.factors)) {
    data.factors = [];
  }
  if (!Array.isArray(data.tips)) {
    data.tips = [];
  }

  return true;
}

/**
 * Main service function to suggest price
 */
export async function suggestPrice(productData) {
  try {
    // 1. Validate Gemini config
    validateGeminiConfig();

    // 2. Build prompt from productData
    const prompt = buildPrompt(productData);

    // 3. Call Gemini API with failover
    // Longer timeout for longer prompts (2400+ chars can take 60-90 seconds)
    const promptLength = prompt.length;
    const timeout = promptLength > 2000 ? 120000 : 60000; // 2 minutes for long prompts, 1 minute for short
    
    console.log(`📏 Prompt length: ${promptLength} chars, using timeout: ${timeout}ms`);
    
    const result = await callGeminiWithFailover(prompt, {
      maxRetries: 5, // Try all 5 keys if needed
      timeout: timeout
    });

    // 4. Parse response
    const parsedResponse = parseGeminiResponse(result.text);

    // 5. Validate response structure
    validatePriceSuggestionResponse(parsedResponse);

    // 6. Format and return result
    return {
      ...parsedResponse,
      _metadata: {
        apiKeyUsed: result.apiKey,
        usedKeyIndex: result.usedKeyIndex
      }
    };
  } catch (error) {
    // Log error with context
    console.error('Error in suggestPrice service:', {
      message: error.message,
      stack: error.stack,
      productData: {
        title: productData.title,
        brand: productData.brand,
        model: productData.model,
        category: productData.category
      }
    });
    throw error;
  }
}

