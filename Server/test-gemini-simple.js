import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1;

if (!apiKey) {
  console.error('❌ No API key found');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
  process.exit(1);
}

console.log('🔑 Using API key:', apiKey.substring(0, 15) + '...');
console.log('📏 API key length:', apiKey.length);

const ai = new GoogleGenAI({
  apiKey: apiKey
});

async function test() {
  try {
    console.log('📤 Sending simple request...');
    console.log('Model: gemini-2.5-flash');
    console.log('Prompt: "Say hello"');
    
    const startTime = Date.now();
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say hello in one word",
    });
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  Request took ${duration}ms`);
    
    console.log('✅ Response received!');
    console.log('Response type:', typeof response);
    console.log('Response keys:', Object.keys(response || {}));
    
    // Try different ways to get text
    let text = null;
    if (response && response.text) {
      text = typeof response.text === 'function' ? await response.text() : response.text;
    } else if (response && response.response) {
      if (typeof response.response.text === 'function') {
        text = await response.response.text();
      } else {
        text = response.response.text;
      }
    }
    
    if (text) {
      console.log('📝 Text:', text);
    } else {
      console.log('⚠️  No text found');
      console.log('Full response:', JSON.stringify(response, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', {
      message: error.message,
      name: error.name,
      ...(error.cause && { cause: error.cause }),
      ...(error.response && {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })
    });
    console.error('Stack:', error.stack);
  }
}

test();

