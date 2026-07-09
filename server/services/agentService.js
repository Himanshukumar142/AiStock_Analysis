import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { companyResearchTool } from '../tools/companyResearchTool.js';
import { financialDataTool } from '../tools/financialDataTool.js';
import { newsSentimentTool } from '../tools/newsSentimentTool.js';
import { prompt, parser } from '../prompts/analysisPrompt.js';


export async function analyzeStock(company) {
  logger.info(`Starting analysis for: "${company}"`);

  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not set in .env');
  }

  
  const ai = new ChatGoogleGenerativeAI({
    apiKey: config.geminiApiKey,
    model: 'gemini-2.5-flash',
    temperature: 0.1,
    maxOutputTokens: 8192
  });

  
  logger.info('Fetching data from tools...');
  const [profile, financials, news] = await Promise.all([
    companyResearchTool.invoke({ company }),
    financialDataTool.invoke({ company }),
    newsSentimentTool.invoke({ company })
  ]);

  
  logger.info('Building prompt...');
  const fullPrompt = await prompt.format({
    company,
    companyProfile: typeof profile === 'string' ? profile : JSON.stringify(profile),
    financialData: typeof financials === 'string' ? financials : JSON.stringify(financials),
    newsData: typeof news === 'string' ? news : JSON.stringify(news)
  });

  
  logger.info('Asking Gemini for analysis...');
  const reply = await ai.invoke(fullPrompt);

  let text = reply.content;
  if (typeof text !== 'string') {
    throw new Error('Gemini returned unexpected output.');
  }

  
  text = text.trim();
  if (text.startsWith('```json')) text = text.slice(7);
  if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  text = text.trim();

  
  const result = await parser.parse(text);
  logger.success(`Analysis done for: ${company}`);
  return result;
}
