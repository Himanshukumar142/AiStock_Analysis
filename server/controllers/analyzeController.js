import { analyzeStock } from '../services/agentService.js';
import { logger } from '../utils/logger.js';


export async function analyzeCompany(req, res) {
  const { company } = req.body;

  
  if (!company || typeof company !== 'string' || company.trim() === '') {
    logger.warn('Request missing company name.');
    return res.status(400).json({ error: 'Please enter a company name or stock ticker.' });
  }

  const name = company.trim();
  logger.info(`Analyzing: "${name}"`);

  try {
    const report = await analyzeStock(name);
    return res.status(200).json(report);
  } catch (err) {
    logger.error(`Analysis failed for "${name}":`, err);

    let status = 500;
    let msg = 'Something went wrong. Please try again.';

    if (err.message.includes('API_KEY')) {
      msg = 'The API key is missing or invalid. Check your .env file.';
    } else if (err.message.includes('not found') || err.message.includes('404')) {
      status = 404;
      msg = `Could not find "${name}". Please check the spelling or try a ticker symbol.`;
    } else if (err.name === 'SyntaxError') {
      msg = 'The AI returned an unexpected format. Please try again.';
    }

    return res.status(status).json({ error: msg, details: err.message });
  }
}
