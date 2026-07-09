import YahooFinance from 'yahoo-finance2';
import { logger } from '../utils/logger.js';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });


async function findTicker(name) {
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
          logger.info(`Chart resolved "${name}" directly to Indian ticker: ${indianSymbol}`);
          return indianSymbol;
        }
      } catch (e) {
        
      }
    }

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
            logger.info(`Chart mapped search result "${firstQuote.symbol}" to Indian ticker: ${nseSymbol}`);
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
        logger.info(`Chart found matching Indian stock: ${indianMatch.symbol}`);
        return indianMatch.symbol;
      }

      
      if (firstQuote?.symbol) {
        return firstQuote.symbol;
      }
    }
  } catch (e) {
    logger.warn(`Chart ticker search failed for "${name}"`);
  }
  return name;
}



export async function getStockChart(req, res) {
  const { company } = req.params;
  try {
    const ticker = await findTicker(company);
    logger.info(`Fetching chart data for: ${ticker}`);

    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 12); 

    const [history, quote] = await Promise.all([
      yf.historical(ticker, {
        period1: start.toISOString().split('T')[0],
        period2: end.toISOString().split('T')[0],
        interval: '1d'
      }, { validateResult: false }),
      yf.quote(ticker, {}, { validateResult: false }).catch(() => null)
    ]);

    const data = (history || [])
      .filter(d => d.close)
      .map(d => ({
        date: new Date(d.date).toISOString().split('T')[0],
        price: Math.round(d.close * 100) / 100,
        volume: d.volume || 0
      }));

    const currentPrice = quote?.regularMarketPrice || (data.length > 0 ? data[data.length - 1].price : 0);
    const openPrice = data.length > 0 ? data[0].price : currentPrice;
    const totalChange = currentPrice - openPrice;
    const totalChangePercent = openPrice > 0 ? (totalChange / openPrice) * 100 : 0;

    logger.success(`Chart data ready for ${ticker} (${data.length} points)`);

    res.json({
      ticker,
      companyName: quote?.longName || quote?.shortName || company,
      currentPrice: Math.round(currentPrice * 100) / 100,
      change: Math.round(totalChange * 100) / 100,
      changePercent: Math.round(totalChangePercent * 100) / 100,
      isUp: totalChange >= 0,
      currency: quote?.currency || 'USD',
      marketState: quote?.marketState || 'CLOSED',
      data
    });
  } catch (e) {
    logger.error(`Chart fetch failed for "${company}":`, e);
    res.status(500).json({ error: e.message });
  }
}



export async function getAutocomplete(req, res) {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.json([]);
  }
  try {
    const results = await yf.search(q.trim(), { quotesCount: 8, newsCount: 0 }, { validateResult: false });
    const suggestions = (results.quotes || [])
      .filter(item => item.quoteType === 'EQUITY' || item.typeDisp === 'Equity')
      .map(item => ({
        symbol: item.symbol,
        name: item.shortname || item.longname || item.symbol,
        exchange: item.exchDisp || item.exchange
      }));
    res.json(suggestions);
  } catch (e) {
    logger.error(`Autocomplete failed for query "${q}":`, e);
    res.status(500).json({ error: e.message });
  }
}
