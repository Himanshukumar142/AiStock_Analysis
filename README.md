# AiStock: AI-Powered Investment Research Agent

AiStock is a complete, production-quality AI Investment Research Agent. It leverages **LangChain.js**, **Gemini 3.5 Flash**, **Tavily Search API**, and **Yahoo Finance API** to perform automated business analysis, financial analysis, news sentiment parsing, and risk assessment, generating institutional-grade investment recommendation reports (INVEST or PASS) with a premium glassmorphic dashboard.

---

## Project Features & Architecture

The application is structured into a Node.js/Express backend (ES Modules) and a Vite-based React frontend. The design strictly follows the separation of concerns (routes, controllers, services, tools) for high testability and clean developer maintenance.

### 🌟 Premium UI & UX Redesign
*   **Floating Glassmorphism Navbar**: A centered, pill-shaped navbar (`rounded-[60px]`) with backdrop blur and white-tinted glass that floats over a custom blue-gradient background.
*   **Dynamic Entry Animations**: Powered by Framer Motion, presenting floating dashboard preview cards and smooth timeline waiting sequences.
*   **Auto-Scrolling Brand Marquee**: A moving ticker strip showing real financial news channels, indexes, and partners.
*   **Optimized Dashboard Typography**: Scaled up font sizes (`text-xs` → `text-sm`) and improved spacing/margins for much higher legibility across the Risk Matrix, News Feed, and Strengths/Flaws lists.
*   **Auto-Adaptive Offline Logo Fallback**: Integrates a shared offline detection state (`globalThis.clearbitOffline`). If a network DNS resolution fails (like `ERR_NAME_NOT_RESOLVED` for clearbit), the app instantly bypasses network fetches and renders beautiful, custom-designed inline SVG vector logos, keeping the developer console clean and silent.

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
                                    [Gemini 3.5 Flash LLM]
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
*   **AI Orchestration**: LangChain.js (Prompts, Tools, and Output Parsers), Gemini 3.5 Flash (`@langchain/google-genai`).
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
        "marketPosition": "Dominant Leader",
        "website": "tesla.com"
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
5.  **Gemini Call & Validation**: Gemini 3.5 Flash reads the prompt and returns JSON. The parser converts it to a standard JS Object and verifies Zod types. If invalid, the controller rejects it with a client error.

---

## Key Decisions & Trade-offs

### Gemini 3.5 Flash over GPT-4o
Gemini 3.5 Flash was chosen for its high speed, generous API limits, context window efficiency, and strong structured JSON output capabilities. The model is swappable by changing `@langchain/google-genai` to `@langchain/openai`.

### Parallel Tool Invocation (`Promise.all`) over Sequential Loops
All three data-fetching tools run concurrently via `Promise.all`, reducing total analysis wait time from ~15 seconds down to ~5 seconds.

### Tavily Search API over Custom Google Serp Scraping
Tavily pre-synthesizes search results and answers, presenting the LLM with structured insights instantly. This reduces tokens and API overhead.

---

## Example Runs

### Tesla (TSLA)

```json
{
  "overview": {
    "summary": "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems globally.",
    "industry": "Automotive and Clean Energy",
    "ceo": "Elon Reeve Musk",
    "headquarters": "Austin, Texas, United States",
    "products": ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck", "Powerwall", "Megapack"],
    "marketPosition": "Global leader in battery electric vehicles (BEV) and the world's most valuable automobile manufacturer.",
    "website": "tesla.com"
  },
  "financial": {
    "revenue": "$97.88 Billion",
    "marketCap": "$1.53 Trillion",
    "peRatio": "370.69",
    "eps": "$1.10",
    "cashFlow": "$5.25 Billion (Free Cash Flow)",
    "debt": "$15.89 Billion",
    "revenueGrowth": "15.8%",
    "financialHealthScore": 70
  },
  "news": {
    "sentiment": "Mixed",
    "overallSummary": "The media views Tesla with a mix of excitement over its long-term AI, robotics, and energy storage potential, and caution regarding its near-term automotive headwinds."
  },
  "recommendation": {
    "decision": "PASS",
    "confidenceScore": 85,
    "overallScore": 58,
    "reasoning": "Tesla is currently priced as a high-growth AI and robotics powerhouse, yet its financial reality shows compressed profit margins and a high P/E ratio. While the balance sheet is exceptionally strong, the current valuation is highly speculative."
  }
}
```
