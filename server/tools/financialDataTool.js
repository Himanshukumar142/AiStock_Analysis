import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import YahooFinance from 'yahoo-finance2';
import { logger } from '../utils/logger.js';


const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });


async function getTicker(name) {
  try {
    const q = name.trim().toUpperCase();

    
    if (/^[A-Z0-9-]{1,12}\.(NS|BO)$/i.test(q)) {
      return q;
    }

    
    if (/^[A-Z0-9-]{1,6}$/.test(q)) {
      try {
        const indianSymbol = `${q}.NS`;
        const exists = await yf.quote(indianSymbol, {}, { validateResult: false });
        if (exists?.symbol) {
          logger.info(`Resolved "${name}" directly to Indian ticker: ${indianSymbol}`);
          return indianSymbol;
        }
      } catch (e) {
        
      }
    }

    logger.info(`Searching for ticker: ${name}`);
    const res = await yf.search(name, {}, { validateResult: false });
    const quotes = res?.quotes || [];

    if (quotes.length > 0) {
      
      const firstQuote = quotes.find(q => q.quoteType === 'EQUITY') || quotes[0];
      if (firstQuote?.symbol) {
        const baseSymbol = firstQuote.symbol.split('.')[0]; 
        const nseSymbol = `${baseSymbol}.NS`;
        try {
          const exists = await yf.quote(nseSymbol, {}, { validateResult: false });
          if (exists?.symbol) {
            logger.info(`Mapped search result "${firstQuote.symbol}" to Indian ticker: ${nseSymbol}`);
            return nseSymbol;
          }
        } catch (err) {
          
        }
      }

      
      const indianMatch = quotes.find(quote => 
        quote.symbol?.endsWith('.NS') || 
        quote.symbol?.endsWith('.BO') || 
        quote.exchDisp?.toLowerCase() === 'nse' || 
        quote.exchDisp?.toLowerCase() === 'bombay' || 
        quote.exchange === 'NSI' || 
        quote.exchange === 'BSE'
      );

      if (indianMatch) {
        logger.info(`Found matching Indian stock: ${indianMatch.symbol}`);
        return indianMatch.symbol;
      }

      
      if (firstQuote?.symbol) {
        logger.info(`Using first search result ticker: ${firstQuote.symbol}`);
        return firstQuote.symbol;
      }
    }

    return name; 
  } catch (e) {
    logger.warn(`Ticker search failed for "${name}", using as-is.`, e);
    return name;
  }
}


export const financialDataTool = tool(
  async ({ company }) => {
    logger.info(`Getting financials for: ${company}`);
    try {
      const ticker = await getTicker(company);
      logger.info(`Fetching data for ticker: ${ticker}`);

      const raw = await yf.quoteSummary(ticker, {
        modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics']
      }, { validateResult: false });

      if (!raw) {
        throw new Error(`No data found for ${ticker}`);
      }

      
      const get = (obj, path) => {
        return path.split('.').reduce((cur, key) => cur && cur[key] !== undefined ? cur[key] : null, obj);
      };

      const price = raw.price || {};
      const fin = raw.financialData || {};
      const detail = raw.summaryDetail || {};
      const stats = raw.defaultKeyStatistics || {};

      const data = {
        ticker: price.symbol || ticker,
        name: price.longName || price.shortName || company,
        currency: fin.financialCurrency || detail.currency || 'USD',
        marketCap: get(detail, 'marketCap.raw') || get(detail, 'marketCap') || null,
        revenue: get(fin, 'totalRevenue.raw') || get(fin, 'totalRevenue') || null,
        revenueGrowth: get(fin, 'revenueGrowth.raw') || get(fin, 'revenueGrowth') || null,
        peRatio: get(detail, 'trailingPE.raw') || get(detail, 'trailingPE') || get(detail, 'forwardPE.raw') || null,
        eps: get(stats, 'trailingEps.raw') || get(stats, 'trailingEps') || null,
        totalDebt: get(fin, 'totalDebt.raw') || get(fin, 'totalDebt') || null,
        debtToEquity: get(fin, 'debtToEquity.raw') || get(fin, 'debtToEquity') || null,
        currentRatio: get(fin, 'currentRatio.raw') || get(fin, 'currentRatio') || null,
        freeCashFlow: get(fin, 'freeCashflow.raw') || get(fin, 'freeCashflow') || null,
        operatingCashFlow: get(fin, 'operatingCashflow.raw') || get(fin, 'operatingCashflow') || null,
        profitMargin: get(fin, 'profitMargins.raw') || get(fin, 'profitMargins') || null,
        operatingMargin: get(fin, 'operatingMargins.raw') || get(fin, 'operatingMargins') || null,
      };

      logger.success(`Got financials for ${ticker}`);
      return JSON.stringify(data, null, 2);
    } catch (e) {
      logger.error(`Financials failed for ${company}:`, e);
      return JSON.stringify({ error: `Could not get financials for "${company}". Details: ${e.message}` });
    }
  },
  {
    name: 'fetch_financial_data',
    description: 'Gets stock price, revenue, margins, debt, cash flow, EPS, and P/E ratio for a company.',
    schema: z.object({
      company: z.string().describe('Company name or ticker, e.g. Tesla or TSLA')
    })
  }
);
