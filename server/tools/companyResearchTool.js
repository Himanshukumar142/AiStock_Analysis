import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { tavily } from '@tavily/core';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Set up Tavily search client
let search = null;
try {
  if (config.tavilyApiKey) {
    search = tavily({ apiKey: config.tavilyApiKey });
  } else {
    logger.warn('No Tavily key found. Company research will not work.');
  }
} catch (e) {
  logger.error('Tavily setup failed:', e);
}

// This tool looks up basic info about a company (what they do, CEO, products, etc)
export const companyResearchTool = tool(
  async ({ company }) => {
    logger.info(`Looking up company info for: ${company}`);

    if (!search) {
      return JSON.stringify({ error: 'Search API not set up. Check TAVILY_API_KEY.' });
    }

    try {
      const query = `business profile of ${company} — CEO, industry, products, headquarters, market position`;
      const res = await search.search(query, {
        searchDepth: 'advanced',
        maxResults: 5,
        includeAnswer: true
      });

      const items = (res.results || []).map((item, i) => ({
        index: i + 1,
        title: item.title,
        url: item.url,
        content: item.content
      }));

      const output = {
        company,
        summary: res.answer || 'No summary found.',
        sources: items
      };

      logger.success(`Got company info for ${company} (${items.length} sources)`);
      return JSON.stringify(output, null, 2);
    } catch (e) {
      logger.error(`Company research failed for ${company}:`, e);
      return JSON.stringify({ error: `Search failed: ${e.message}` });
    }
  },
  {
    name: 'research_company_profile',
    description: 'Searches for a company business profile, products, CEO, industry, and market position.',
    schema: z.object({
      company: z.string().describe('Company name to research, e.g. Tesla or Apple')
    })
  }
);
