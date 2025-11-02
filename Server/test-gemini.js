import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1;

if (!apiKey) {
  console.error('❌ No API key found');
  process.exit(1);
}

console.log('🔑 Using API key:', apiKey.substring(0, 10) + '...');

const ai = new GoogleGenAI({
  apiKey: apiKey
});

async function test() {
  try {
    console.log('📤 Sending request...');
    console.log('Model: gemini-2.5-flash');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say hello in one word",
    });
    
    console.log('✅ Response received!');
    console.log('Response type:', typeof response);
    console.log('Response keys:', Object.keys(response || {}));
    console.log('Full response:', JSON.stringify(response, null, 2));
    
    if (response && response.text) {
      console.log('📝 Text:', response.text);
    } else if (response && typeof response.text === 'function') {
      console.log('📝 Text (function):', await response.text());
    } else {
      console.log('⚠️  No text property found');
    }
    
  } catch (error) {
    console.error('❌ Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...(error.response && {
        status: error.response.status,
        data: error.response.data
      })
    });
  }
}

test();

