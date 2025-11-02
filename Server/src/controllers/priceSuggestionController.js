import { priceSuggestionValidation } from '../validations/priceSuggestion.validation.js';
import { suggestPrice } from '../services/priceSuggestionService.js';

/**
 * Controller to get AI price suggestion for a product draft
 */
export async function getPriceSuggestion(req, res) {
  try {
    // 1. Validate request body với Zod
    const result = priceSuggestionValidation.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.issues?.[0]?.message || 'Validation error',
        details: result.error.issues
      });
    }

    // 2. Gọi service suggestPrice
    const suggestion = await suggestPrice(result.data);

    // 3. Trả về response thành công
    return res.status(200).json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    // 4. Xử lý các loại lỗi khác nhau
    console.error('Error in getPriceSuggestion controller:', error);

    // Check error type
    if (error.message?.includes('No Gemini API key')) {
      return res.status(503).json({
        success: false,
        error: 'Price suggestion service is temporarily unavailable',
        message: 'Gemini API keys are not configured'
      });
    }

    if (error.message?.includes('All Gemini API keys failed')) {
      return res.status(503).json({
        success: false,
        error: 'Price suggestion service is temporarily unavailable',
        message: 'All API keys have exceeded their quota or failed. Please try again later.'
      });
    }

    if (error.message?.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: 'Request timeout',
        message: 'The AI service took too long to respond. Please try again.'
      });
    }

    if (error.message?.includes('Missing required field')) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response format from AI',
        message: 'The AI service returned an incomplete response. Please try again.'
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'An error occurred while getting price suggestion'
    });
  }
}

