# AiStock: AI-Powered Investment Research Agent

AiStock is a complete, production-quality AI Investment Research Agent. It leverages **LangChain.js**, **Gemini 2.5 Flash**, **Tavily Search API**, and **Yahoo Finance API** to perform automated business analysis, financial analysis, news sentiment parsing, and risk assessment, generating institutional-grade investment recommendation reports (INVEST or PASS) with a light-mode glassmorphic dashboard.

---

## Project Overview & Architecture

The application is structured into a Node.js/Express backend (ES Modules) and a Vite-based React frontend. The design strictly follows the separation of concerns (routes, controllers, services, tools) for high testability and clean developer maintenance.

### System Flow
```
User Enters Stock Name/Ticker
   │
   ▼
[React App] ────(POST /api/analyze)────► [Express API Server]
                                              │
                                              ▼
                                    [LangChain Agent Service]
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
        [Company Research Tool]     [Financial Data Tool]     [News Sentiment Tool]
         (Tavily API Search)         (yahoo-finance2 API)      (Tavily News Feed)
                    │                         │                         │
                    └─────────────────────────┬─────────────────────────┘
                                              │
                                              ▼
                                   [Gemini 2.5 Flash LLM]
                                 Synthesizes report context
                                              │
                                              ▼
                                 [Structured Zod Parser]
                                  Converts to clean JSON
                                              │
                                              ▼
[React Dashboard] ◄────────────────(Returns JSON Report)
```

---

## Folder Structure

```
AiStock/
├── package.json               # Root script coordinator
├── README.md                  # System documentation
├── server/                    # Express + LangChain backend
│   ├── package.json
│   ├── index.js               # Express app entrypoint
│   ├── config/
│   │   └── env.js             # Environment variable validator
│   ├── routes/
│   │   └── analyze.js         # API endpoint routing definitions
│   ├── controllers/
│   │   └── analyzeController.js # Input validation & controller logic
│   ├── services/
│   │   └── agentService.js    # LangChain agent orchestrator
│   ├── tools/
│   │   ├── companyResearchTool.js  # Tavily business profile scraper
│   │   ├── financialDataTool.js    # yahoo-finance2 stock metric resolver
│   │   └── newsSentimentTool.js    # Tavily news sentiment scanner
│   ├── prompts/
│   │   └── analysisPrompt.js  # Zod schema and system prompts
│   └── utils/
│       └── logger.js          # Console logger formatters
└── client/                    # Vite + React + Tailwind CSS client
    ├── package.json
    ├── vite.config.js         # Development proxy settings
    ├── postcss.config.js
    ├── tailwind.config.js     # Custom animations & theme settings
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        ├── index.css          # Glassmorphic and timeline custom CSS
        ├── pages/
        │   └── Home.jsx       # Landing & research entry view
        ├── components/
        │   ├── LoadingScreen.jsx # Timeline progress waiting screen
        │   ├── StatCard.jsx      # Individual metric block
        │   ├── Dashboard.jsx     # Recharts analytics panels
        │   └── ui/            # Reusable primitives (Card, Badge, Button, Input)
        ├── hooks/
        │   └── useStockAnalysis.js # Async states & timeline steps hook
        ├── services/
        │   └── api.js         # Native fetch service layer
        └── utils/
            └── formatters.js  # Currencies, percentages, compact metrics
```

---

## Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS (Glassmorphism layout), Framer Motion (Smooth stage transitions), Recharts (Bar Charts, Radial Health gauges, Sentiment Pie slices), Lucide React (UI Icons).
*   **Backend**: Node.js, Express (REST API route handlers), ES Modules (`import/export` syntax).
*   **AI Orchestration**: LangChain.js (Prompts, Tools, and Output Parsers), Gemini 2.5 Flash (`@langchain/google-genai`).
*   **Data Scrapers**: Tavily API (Search & News topics), Yahoo Finance API (`yahoo-finance2`).

---

## Installation & Setup

### Prerequisites
*   Node.js (v18 or higher)
*   NPM (v9 or higher)

### 1. Clone the project and configure variables
Create a `.env` file in the project **root** directory (or inside the `/server` directory):

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
NODE_ENV=development
```

### 2. Install dependencies
Run the global installation helper script from the root workspace:

```bash
npm run install-all
```
This automatically triggers `npm install` for both the backend `/server` and the frontend `/client` directories, configuring everything.

---

## Running the Project

To launch both the Node.js Express server and the Vite React app concurrently in development mode, run:

```bash
npm run dev
```

*   **Backend URL**: `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)
*   **Frontend URL**: `http://localhost:5173` (with `/api` proxies routed directly to backend)

---

## API & Data Flow

### POST `/api/analyze`
*   **Description**: Invokes the LLM Research agent to compile stock metrics and news.
*   **Content-Type**: `application/json`
*   **Payload**:
    ```json
    {
      "company": "Tesla"
    }
    ```

*   **Output (Conformance Schema)**:
    ```json
    {
      "overview": {
        "summary": "Tesla, Inc. designs, develops, manufactures, and sells electric vehicles...",
        "industry": "Auto Manufacturers",
        "ceo": "Elon Musk",
        "headquarters": "Austin, Texas",
        "products": ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck", "Solar Panels", "Megapack"],
        "marketPosition": "Dominant Leader"
      },
      "financial": {
        "revenue": "$96.77 Billion",
        "marketCap": "$780 Billion",
        "peRatio": "56.4",
        "eps": "$2.34",
        "cashFlow": "$13.2 Billion",
        "debt": "$5.8 Billion",
        "revenueGrowth": "15.4%",
        "financialHealthScore": 85
      },
      "news": {
        "latestNews": [
          { "title": "Tesla Announces Q2 Production Numbers", "url": "https://example.com/news1", "snippet": "Tesla beat expectations..." }
        ],
        "sentiment": "Bullish",
        "positiveNews": ["Record vehicle output", "Battery cell price reductions"],
        "negativeNews": ["Slowing margins in Europe", "Regulatory scrutiny on Autopilot"],
        "overallSummary": "The overall market view is optimistic due to production beats..."
      },
      "risk": {
        "businessRisks": ["Supply chain materials constraints"],
        "financialRisks": ["Capital intensive expansion projects"],
        "competition": ["Increased pressure from BYD and traditional car companies"],
        "regulatoryRisks": ["NHTSA autopilot investigation updates"]
      },
      "recommendation": {
        "decision": "INVEST",
        "confidenceScore": 85,
        "overallScore": 80,
        "reasoning": "Tesla continues to show strong profit margins despite competition...",
        "strengths": ["Industry leading brand", "Superior battery efficiency"],
        "weaknesses": ["Valuation multiple pricing in hypergrowth"]
      }
    }
    ```

---

## LangChain Workflow Details

1.  **Tools Initialization**: Three separate async tool functions are registered.
    *   `research_company_profile`: Collects general operational information.
    *   `fetch_financial_data`: Fetches quotes, balance sheets, and cash flow structures from Yahoo Finance.
    *   `fetch_latest_news_sentiment`: Extracts news URLs and descriptions.
2.  **Parallel Execution**: We execute `Promise.all([tool1, tool2, tool3])` to run web requests in parallel, preventing request stacking latency.
3.  **Zod Schema Compilation**: LangChain's `StructuredOutputParser` generates schema instructions defining the output variables, types, and constraints.
4.  **Prompt Template Compilation**: Variables and Zod instructions are parsed into standard `PromptTemplate` templates.
5.  **Gemini Call & Validation**: Gemini 2.5 Flash reads the prompt and returns JSON. The parser converts it to a standard JS Object and verifies Zod types. If invalid, the controller rejects it with a client error.

---

## Future Improvements

*   **Incremental Streaming Responses (SSE)**: Stream individual tool output logs to the client dynamically rather than returning a single final JSON body.
*   **Multi-Agent Refinement**: Incorporate a multi-agent framework (e.g., LangGraph.js) where a financial agent and a risk agent peer-review the recommendation report before presentation.
*   **Database Integration**: Cache analyzed reports in a document database (like MongoDB or PostgreSQL with JSONB) with TTL (Time-To-Live) constraints to minimize external API costs.
*   **Ticker Autocomplete**: Add autocomplete search dropdowns on the search box using a ticker API.
*   **Deployment**: Deploy to Vercel (frontend) + Railway/Render (backend) for a publicly shareable URL.
*   **Historical Trend Charts**: Overlay 1Y/5Y stock price charts using Yahoo Finance historical data.
*   **Watchlist & Report History**: Persist reports to MongoDB so users can revisit past analyses.

---

## Key Decisions & Trade-offs

### Gemini 2.5 Flash over GPT-4o
Gemini 2.5 Flash was chosen for its massive 1M-token context window, high speed, generous free tier, and strong structured JSON output quality. Trade-off: less community ecosystem than OpenAI. The model is swappable by changing `@langchain/google-genai` to `@langchain/openai`.

### Parallel Tool Invocation (`Promise.all`) over LangGraph Reactive Agents
All three data-fetching tools run concurrently via `Promise.all`, not sequentially through a LangGraph agent loop. This decision was deliberate — since the three tools (company profile, financials, news) are completely independent of each other, parallelism reduces total wait time from ~15s sequential to ~5s. Trade-off: a LangGraph loop could adaptively re-query if one tool returns poor data, which we forgo here for simplicity and speed.

### Tavily Search API over SerpAPI / Google Custom Search
Tavily's `includeAnswer: true` feature returns a pre-synthesized summary in addition to raw web results. This gives the LLM a richer, pre-distilled context vs. raw HTML snippets, improving report quality. Trade-off: Tavily is a paid API (with a free tier), whereas SerpAPI has broader global coverage.

### Yahoo Finance (`yahoo-finance2`) for Financial Data
Using the unofficial Yahoo Finance library keeps the project API-key-free for financial data. It covers 10,000+ global equities and provides revenue, market cap, P/E ratio, EPS, debt, and cash flow. Trade-off: being an unofficial scraper, it can break with Yahoo's API changes (as seen in the v2→v3 migration during this project). A production system would use Alpha Vantage or Financial Modeling Prep.

### Zod `StructuredOutputParser` over Raw `JSON.parse`
LangChain's `StructuredOutputParser` generates natural-language format instructions from the Zod schema that are embedded in the prompt. This makes the output contract self-documenting for the LLM and adds runtime type validation. Trade-off: slightly longer prompts. The alternative (OpenAI's `response_format: json_object`) would be simpler but less portable across LLM providers.

### What Was Left Out
*   No LangGraph multi-agent peer-review loop (time constraint — the single-pass prompt produces high-quality output already)
*   No database report caching (every run re-fetches live data — intentional for freshness)
*   No streaming/SSE endpoints (full JSON arrives at once; SSE is listed as a future improvement)
*   No authentication layer (out of scope for a research demo)

---

## Example Runs

> Run the app locally, search for a company, and paste the output here.

### Tesla (TSLA)
*(paste actual agent output here after running)*

### Apple (AAPL)
*(paste actual agent output here after running)*

### Nvidia (NVDA)
*(paste actual agent output here after running)*
