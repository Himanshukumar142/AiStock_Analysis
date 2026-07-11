import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';


const schema = z.object({
  overview: z.object({
    summary: z.string().describe('Short overview of what the company does.'),
    industry: z.string().describe('What industry or sector they are in.'),
    ceo: z.string().describe('Name of the CEO.'),
    headquarters: z.string().describe('City and country of HQ.'),
    products: z.array(z.string()).describe('List of main products or services.'),
    marketPosition: z.string().describe('Their position in the market (leader, challenger, etc).'),
    website: z.string().describe('Official website URL or domain of the company, e.g. "tesla.com", "relianceindustries.com", "apple.com".')
  }),
  financial: z.object({
    revenue: z.string().describe('Total revenue, e.g. "$96.77 Billion".'),
    marketCap: z.string().describe('Market cap, e.g. "$720 Billion".'),
    peRatio: z.string().describe('P/E ratio, e.g. "54.2" or "N/A".'),
    eps: z.string().describe('Earnings per share, e.g. "$2.34".'),
    cashFlow: z.string().describe('Operating or free cash flow.'),
    debt: z.string().describe('Total debt amount.'),
    revenueGrowth: z.string().describe('YoY revenue growth, e.g. "12.5%".'),
    financialHealthScore: z.number().min(0).max(100).describe('Score from 0-100 based on debt, margins, and cash flow.')
  }),
  news: z.object({
    latestNews: z.array(z.object({
      title: z.string().describe('News headline.'),
      url: z.string().describe('Link to article.'),
      snippet: z.string().describe('Short summary of the article.')
    })).describe('3 to 5 recent news items.'),
    sentiment: z.string().describe('Overall sentiment: Bullish, Bearish, Neutral, or Mixed.'),
    positiveNews: z.array(z.string()).describe('Good news highlights.'),
    negativeNews: z.array(z.string()).describe('Bad news or risks from media.'),
    overallSummary: z.string().describe('One paragraph summarizing how the media sees this company.')
  }),
  risk: z.object({
    businessRisks: z.array(z.string()).describe('Business model or operational risks.'),
    financialRisks: z.array(z.string()).describe('Debt, cash flow, or financial risks.'),
    competition: z.array(z.string()).describe('Key competitors and competitive threats.'),
    regulatoryRisks: z.array(z.string()).describe('Legal, government, or compliance risks.')
  }),
  recommendation: z.object({
    decision: z.enum(['INVEST', 'PASS']).describe('Final answer: INVEST or PASS only.'),
    confidenceScore: z.number().min(0).max(100).describe('How confident we are (0-100).'),
    overallScore: z.number().min(0).max(100).describe('Overall company rating (0-100).'),
    reasoning: z.string().describe('Why we made this decision.'),
    strengths: z.array(z.string()).describe('Reasons to invest.'),
    weaknesses: z.array(z.string()).describe('Reasons to be careful or pass.')
  })
});

export const parser = StructuredOutputParser.fromZodSchema(schema);

export const prompt = new PromptTemplate({
  template: `You are a professional stock market analyst.
Your job is to read the data below and write an investment report about the company "{company}".

Be honest and objective. If the numbers look bad, say so.

=== COMPANY INFO ===
{companyProfile}

=== FINANCIAL DATA ===
{financialData}

=== NEWS & SENTIMENT ===
{newsData}

===================
INSTRUCTIONS
===================
Write your report using the exact format below.
- "decision" must be either "INVEST" or "PASS" — no other options.
- "financialHealthScore" should be based on the actual numbers (debt ratio, margins, cash flow).
- Be specific and factual.

{formatInstructions}

Return only raw JSON. Do not wrap it in markdown code blocks.`,
  inputVariables: ['company', 'companyProfile', 'financialData', 'newsData'],
  partialVariables: {
    formatInstructions: parser.getFormatInstructions()
  }
});
