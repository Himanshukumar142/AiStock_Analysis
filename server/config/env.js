import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });


const needed = ['GEMINI_API_KEY', 'TAVILY_API_KEY'];

function checkKeys() {
  const missing = [];
  for (const key of needed) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('Missing keys in .env:', missing.join(', '));
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing env keys: ' + missing.join(', '));
    } else {
      console.warn('Warning: Some features will not work without these keys.');
    }
  }
}

checkKeys();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  geminiApiKey: process.env.GEMINI_API_KEY,
  tavilyApiKey: process.env.TAVILY_API_KEY,
  nodeEnv: process.env.NODE_ENV || 'development'
};
