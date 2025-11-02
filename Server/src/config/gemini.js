import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Load multiple Gemini API keys from environment variables
// Support 5 API keys for load balancing and failover
const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean); // Remove undefined/null keys

// Fallback to single key if multiple keys not configured
if (GEMINI_API_KEYS.length === 0 && process.env.GEMINI_API_KEY) {
  GEMINI_API_KEYS.push(process.env.GEMINI_API_KEY);
}

if (GEMINI_API_KEYS.length === 0) {
  console.warn('⚠️  No GEMINI_API_KEY found in environment variables');
  console.warn('⚠️  Please set GEMINI_API_KEY or GEMINI_API_KEY_1 to GEMINI_API_KEY_5');
}

// Track API key usage and failures
const apiKeyStatus = new Map();
const MAX_FAILURES = 3; // Mark as unavailable after 3 consecutive failures
const RESET_INTERVAL = 60 * 60 * 1000; // Reset failures after 1 hour

// Initialize status for each key
GEMINI_API_KEYS.forEach((key, index) => {
  apiKeyStatus.set(key, {
    failures: 0,
    lastFailure: null,
    consecutiveFailures: 0,
    totalRequests: 0,
    successfulRequests: 0,
    isAvailable: true,
  });
});

/**
 * Get available API keys (not marked as unavailable)
 */
function getAvailableKeys() {
  return GEMINI_API_KEYS.filter(key => {
    const status = apiKeyStatus.get(key);
    return status && status.isAvailable;
  });
}

/**
 * Mark an API key as failed
 */
export function markApiKeyFailure(apiKey, error) {
  const status = apiKeyStatus.get(apiKey);
  if (!status) return;

  status.failures++;
  status.consecutiveFailures++;
  status.lastFailure = new Date();
  status.totalRequests++;

  // Check if error is quota/rate limit related
  const isQuotaError = error?.message?.includes('quota') || 
                       error?.message?.includes('rate limit') ||
                       error?.message?.includes('429') ||
                       error?.message?.includes('403') ||
                       error?.status === 429 ||
                       error?.status === 403;

  if (isQuotaError || status.consecutiveFailures >= MAX_FAILURES) {
    status.isAvailable = false;
    console.warn(`⚠️  API key marked as unavailable due to: ${isQuotaError ? 'quota/rate limit' : 'consecutive failures'}`);
    
    // Schedule reset after RESET_INTERVAL
    setTimeout(() => {
      const currentStatus = apiKeyStatus.get(apiKey);
      if (currentStatus) {
        currentStatus.consecutiveFailures = 0;
        currentStatus.isAvailable = true;
        console.log(`✅ API key reset and available again`);
      }
    }, RESET_INTERVAL);
  }
}

/**
 * Mark an API key as successful
 */
export function markApiKeySuccess(apiKey) {
  const status = apiKeyStatus.get(apiKey);
  if (!status) return;

  status.totalRequests++;
  status.successfulRequests++;
  status.consecutiveFailures = 0; // Reset consecutive failures on success
  status.isAvailable = true;
}

/**
 * Get the next available API key using round-robin
 */
let currentKeyIndex = 0;

export function getNextApiKey() {
  const availableKeys = getAvailableKeys();
  
  if (availableKeys.length === 0) {
    // If no keys available, reset all and try again
    console.warn('⚠️  No available API keys, resetting all keys');
    GEMINI_API_KEYS.forEach(key => {
      const status = apiKeyStatus.get(key);
      if (status) {
        status.consecutiveFailures = 0;
        status.isAvailable = true;
      }
    });
    
    // Try again with all keys
    const allKeys = getAvailableKeys();
    if (allKeys.length === 0) {
      throw new Error('No Gemini API keys available. Please check your configuration.');
    }
    currentKeyIndex = 0;
    return allKeys[0];
  }

  // Round-robin selection
  const selectedKey = availableKeys[currentKeyIndex % availableKeys.length];
  currentKeyIndex++;
  
  return selectedKey;
}

/**
 * Get Gemini AI client instance with specific API key
 */
function getGeminiClient(apiKey) {
  // GoogleGenAI can accept apiKey in constructor options
  // According to docs, it can also read from GEMINI_API_KEY env var
  // But for load balancing, we pass it explicitly
  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey
    });
    return ai;
  } catch (error) {
    console.error('❌ Error creating GoogleGenAI client:', error.message);
    throw error;
  }
}

/**
 * Get model name from env or use default
 */
function getModelName() {
  // Supported models: 'gemini-pro', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-pro-vision'
  return process.env.GEMINI_MODEL_NAME || 'gemini-2.5-flash';
}

/**
 * Main function to call Gemini API with automatic failover
 */
export async function callGeminiWithFailover(prompt, options = {}) {
  const maxRetries = options.maxRetries || GEMINI_API_KEYS.length || 1;
  const timeout = options.timeout || 60000; // 60 seconds default (increased from 30)
  const modelName = getModelName();
  
  console.log(`🚀 Starting Gemini API call with ${GEMINI_API_KEYS.length} key(s), model: ${modelName}`);

  let lastError = null;
  let attempts = 0;

  while (attempts < maxRetries) {
    const apiKey = getNextApiKey();
    
    if (!apiKey) {
      throw new Error('No available Gemini API keys');
    }

    try {
      const ai = getGeminiClient(apiKey);
      
      console.log(`🔍 Trying API key ${attempts + 1}/${maxRetries}, model: ${modelName}`);
      console.log(`📝 Prompt length: ${prompt.length} characters`);
      
      // Check if models.generateContent exists
      if (!ai.models || typeof ai.models.generateContent !== 'function') {
        throw new Error('ai.models.generateContent is not a function. Available methods: ' + Object.keys(ai.models || {}));
      }
      
      // Start the API call
      console.log(`📤 Sending API request...`);
      const startTime = Date.now();
      
      // Create timeout promise
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Request timeout after ${timeout}ms`));
        }, timeout);
      });

      // Use Promise.race for timeout
      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: prompt,
      }).then(response => {
        // Clear timeout on success
        if (timeoutId) clearTimeout(timeoutId);
        return response;
      }).catch(error => {
        // Clear timeout on error
        if (timeoutId) clearTimeout(timeoutId);
        throw error;
      });

      console.log(`⏳ Waiting for response (timeout: ${timeout}ms)...`);
      const response = await Promise.race([generatePromise, timeoutPromise]);
      const duration = Date.now() - startTime;
      console.log(`⏱️  Request completed in ${duration}ms`);
      
      // Log response structure for debugging
      console.log(`✅ Response received, type:`, typeof response, 'keys:', Object.keys(response || {}));
      
      // Check if response.text exists or if we need to access it differently
      let responseText;
      if (response && typeof response.text === 'string') {
        responseText = response.text;
      } else if (response && typeof response.text === 'function') {
        responseText = await response.text();
      } else if (response && response.response && typeof response.response.text === 'string') {
        responseText = response.response.text;
      } else if (response && response.response && typeof response.response.text === 'function') {
        responseText = await response.response.text();
      } else {
        console.error('❌ Unexpected response structure:', JSON.stringify(response, null, 2));
        throw new Error('Invalid response format from Gemini API');
      }
      
      markApiKeySuccess(apiKey);
      
      return {
        text: responseText,
        apiKey: apiKey.substring(0, 10) + '...', // Only log partial key for security
        usedKeyIndex: GEMINI_API_KEYS.indexOf(apiKey)
      };
    } catch (error) {
      lastError = error;
      markApiKeyFailure(apiKey, error);
      attempts++;
      
      // Log detailed error for debugging
      console.error(`❌ API key failed (attempt ${attempts}/${maxRetries}):`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...(error.response && { responseStatus: error.response.status, responseData: error.response.data })
      });
      
      // If quota/rate limit error, try next key immediately
      if (error?.message?.includes('quota') || 
          error?.message?.includes('rate limit') ||
          error?.message?.includes('429') ||
          error?.status === 429) {
        continue;
      }
      
      // For other errors, wait a bit before retrying
      if (attempts < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
      }
    }
  }

  // All keys failed
  throw new Error(`All Gemini API keys failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Validate Gemini configuration
 */
export function validateGeminiConfig() {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('At least one GEMINI_API_KEY is required (GEMINI_API_KEY or GEMINI_API_KEY_1 to GEMINI_API_KEY_5)');
  }
  return true;
}

/**
 * Get API key statistics (for monitoring/debugging)
 */
export function getApiKeyStats() {
  const stats = [];
  GEMINI_API_KEYS.forEach((key, index) => {
    const status = apiKeyStatus.get(key);
    if (status) {
      stats.push({
        index: index + 1,
        key: key.substring(0, 10) + '...',
        isAvailable: status.isAvailable,
        totalRequests: status.totalRequests,
        successfulRequests: status.successfulRequests,
        failures: status.failures,
        consecutiveFailures: status.consecutiveFailures,
        successRate: status.totalRequests > 0 
          ? ((status.successfulRequests / status.totalRequests) * 100).toFixed(2) + '%'
          : 'N/A'
      });
    }
  });
  return stats;
}

console.log(`✅ Gemini config loaded: ${GEMINI_API_KEYS.length} API key(s) available`);
console.log(`✅ Using model: ${getModelName()}`);
