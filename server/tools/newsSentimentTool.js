import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { tavily } from '@tavily/core';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';


let search = null;
try {
  if (config.tavilyApiKey) {
    search = tavily({ apiKey: config.tavilyApiKey });
  }
} catch (e) {
  logger.error('Tavily setup failed for news tool:', e);
}


export const newsSentimentTool = tool(
  async ({ company }) => {
    logger.info(`Getting news for: ${company}`);

    if (!search) {
      return JSON.stringify({ error: 'Search API not configured. Check TAVILY_API_KEY.' });
    }

    try {
      const query = `latest news and stock market sentiment for ${company}`;
      const res = await search.search(query, {
        searchDepth: 'advanced',
        maxResults: 6,
        topic: 'general'
      });

      const items = (res.results || []).map((item, i) => ({
        index: i + 1,
        title: item.title,
        url: item.url,
        snippet: item.content,
        date: item.published_date || new Date().toLocaleDateString()
      }));

      const output = {
        company,
        fetchedAt: new Date().toISOString(),
        articles: items
      };

      logger.success(`Got ${items.length} news articles for ${company}`);
      return JSON.stringify(output, null, 2);
    } catch (e) {
      logger.error(`News fetch failed for ${company}:`, e);
      return JSON.stringify({ error: `Could not get news for "${company}". Details: ${e.message}` });
    }
  },
  {
    name: 'fetch_latest_news_sentiment',
    description: 'Gets recent news headlines and articles for a company to understand market sentiment.',
    schema: z.object({
      company: z.string().describe('Company name, e.g. Tesla or Nvidia')
    })
  }
);
