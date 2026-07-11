import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, AlertCircle, ArrowRight, ChevronRight,
  TrendingUp, Shield, Zap, BarChart2, Users, Building2,
  Star, CheckCircle, Activity,
} from 'lucide-react';
import { useStockAnalysis } from '../hooks/useStockAnalysis.js';
import { getSuggestions } from '../services/api.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import Dashboard from '../components/Dashboard.jsx';
import CompanyLogo from '../components/CompanyLogo.jsx';
import StockChartWidget from '../components/StockChartWidget.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';

const EASE = [0.16, 1, 0.3, 1];

const TRENDING_COMPANIES = [
  { name: 'Reliance', ticker: 'RELIANCE.NS', logo: 'R', domain: 'relianceindustries.com', color: 'from-blue-600 to-blue-700' },
  { name: 'Tata Motors', ticker: 'TATAMOTORS.NS', logo: 'T', domain: 'tatamotors.com', color: 'from-sky-800 to-sky-900' },
  { name: 'Infosys', ticker: 'INFY.NS', logo: 'I', domain: 'infosys.com', color: 'from-cyan-600 to-cyan-700' },
  { name: 'Tesla', ticker: 'TSLA', logo: 'T', domain: 'tesla.com', color: 'from-red-600 to-red-700' },
  { name: 'Apple', ticker: 'AAPL', logo: '', domain: 'apple.com', color: 'from-slate-700 to-slate-800' },
  { name: 'Nvidia', ticker: 'NVDA', logo: 'N', domain: 'nvidia.com', color: 'from-emerald-600 to-emerald-700' },
];

const PARTNER_LOGOS = [
  { name: 'NSE India', domain: 'nseindia.com', type: 'nse' },
  { name: 'BSE India', domain: 'bseindia.com', type: 'bse' },
  { name: 'Yahoo Finance', domain: 'yahoo.com', type: 'yahoo' },
  { name: 'Gemini AI', domain: 'google.com', type: 'gemini' },
  { name: 'Tavily AI', domain: 'tavily.com', type: 'tavily' },
  { name: 'LangChain', domain: 'langchain.com', type: 'langchain' },
  { name: 'Recharts', domain: 'recharts.org', type: 'recharts' }
];

const FEATURES = [
  {
    icon: Building2,
    label: 'Start-ups',
    title: 'For Founders & Early Stage',
    desc: 'Get instant institutional-grade equity research on any competitor or target company before your next pitch deck.',
    active: false,
  },
  {
    icon: Users,
    label: 'Freelancers',
    title: 'For Independent Analysts',
    desc: 'Run deep-dive sentiment analysis, financial health scoring, and news aggregation for any ticker in seconds.',
    active: true,
  },
  {
    icon: Star,
    label: 'Enterprise',
    title: 'For Investment Teams',
    desc: 'Deploy at scale across your research workflow. Batch analysis across portfolios with consistent, structured output.',
    active: false,
  },
];

function GlassCard({ className, children }) {
  return (
    <div className={`bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] ${className}`}>
      {children}
    </div>
  );
}

function getPartnerFallback(type) {
  switch (type) {
    case 'yahoo':
      return (
        <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 5.5l2.25 4.5 2.25-4.5h2.5L14 14.5V18h-2v-3.5L8.5 7.5h2z" />
        </svg>
      );
    case 'gemini':
      return (
        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2c.4 3.7 3.3 6.6 7 7-3.7.4-6.6 3.3-7 7-.4-3.7-3.3-6.6-7-7 3.7-.4 6.6-3.3 7-7z" />
        </svg>
      );
    case 'tavily':
      return (
        <svg className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    case 'langchain':
      return (
        <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case 'recharts':
      return (
        <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="12" width="4" height="9" rx="1" />
          <rect x="10" y="7" width="4" height="14" rx="1" />
          <rect x="17" y="3" width="4" height="18" rx="1" />
        </svg>
      );
    case 'nse':
      return (
        <svg className="w-5 h-5 text-blue-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case 'bse':
      return (
        <svg className="w-5 h-5 text-blue-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      );
    default:
      return (
        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
          {type ? type[0].toUpperCase() : 'P'}
        </div>
      );
  }
}

function PartnerLogoImg({ domain, type, name }) {
  const [error, setError] = useState(!!globalThis.clearbitOffline);
  const [loading, setLoading] = useState(!globalThis.clearbitOffline);

  const fallback = getPartnerFallback(type);

  useEffect(() => {
    if (globalThis.clearbitOffline) {
      setError(true);
      setLoading(false);
    }
  }, []);

  if (error || !domain || globalThis.clearbitOffline) {
    return fallback;
  }

  return (
    <div className="relative w-6 h-6 flex items-center justify-center bg-transparent rounded overflow-hidden">
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={`${name} Logo`}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setLoading(false)}
        onError={() => {
          globalThis.clearbitOffline = true;
          setError(true);
          setLoading(false);
        }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 rounded">
          <div className="w-2.5 h-2.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative w-full max-w-sm mx-auto h-72 select-none pointer-events-none">
      {}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-64"
      >
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                <BarChart2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white/90 text-xs font-semibold">AI Analysis</span>
            </div>
            <span className="text-emerald-300 text-xs font-bold">● LIVE</span>
          </div>
          <div className="text-white text-2xl font-bold tracking-tight mb-1">
            94<span className="text-lg">/100</span>
          </div>
          <div className="text-white/60 text-[10px] uppercase tracking-widest">Financial Health Score</div>
          <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: '94%' }}
              transition={{ duration: 1.2, delay: 0.9, ease: EASE }}
            />
          </div>
        </GlassCard>
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
        className="absolute top-28 left-0 z-10 w-36"
      >
        <GlassCard className="p-3">
          <div className="text-white/70 text-[9px] uppercase tracking-widest mb-1">Sentiment</div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white text-sm font-bold">Bullish</span>
          </div>
          <div className="text-white/50 text-[9px] mt-1">+34 positive signals</div>
        </GlassCard>
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.65, ease: EASE }}
        className="absolute top-4 right-0 z-10 w-36"
      >
        <GlassCard className="p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 shrink-0" />
            <span className="text-white/80 text-[10px] font-semibold truncate">Reliance Ind.</span>
          </div>
          <div className="text-white text-base font-bold">₹2,940</div>
          <div className="text-emerald-400 text-[10px] font-medium">▲ +1.8%</div>
        </GlassCard>
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.75, ease: EASE }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-56"
      >
        <GlassCard className="p-3">
          <div className="text-white/60 text-[9px] uppercase tracking-widest mb-2">Report Sections</div>
          {['Overview', 'Financials', 'Sentiment', 'Risk'].map((s) => (
            <div key={s} className="flex items-center gap-2 mb-1 last:mb-0">
              <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-white/80 text-[11px]">{s}</span>
            </div>
          ))}
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const {
    loading, currentStep, error, results,
    chartData, chartLoading, analyzedCompany,
    runAnalysis, resetAnalysis,
  } = useStockAnalysis();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim().length >= 2) {
      const list = await getSuggestions(val);
      setSuggestions(list);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm || !searchTerm.trim()) return;
    setShowSuggestions(false);
    runAnalysis(searchTerm);
  };

  const handleSuggestClick = (ticker) => {
    setSearchTerm(ticker);
    setShowSuggestions(false);
    runAnalysis(ticker);
  };

  const handleSuggestionItemClick = (item) => {
    setSearchTerm(item.symbol);
    setShowSuggestions(false);
    runAnalysis(item.symbol);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (results) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [results]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes float-a { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes float-b { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-16px); } }
        .float-a { animation: float-a 6s ease-in-out infinite; }
        .float-b { animation: float-b 8s ease-in-out infinite 1s; }
      `}</style>

      {}
      {}
      {}
      <div className="relative bg-gradient-to-br from-[#1a47b8] via-[#1e56d4] to-[#4f88f8]">
        {}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[80px]" />
          <div className="absolute bottom-[-20%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-600/25 blur-[90px]" />
          <div className="absolute top-[30%] left-[35%] w-[300px] h-[300px] rounded-full bg-sky-400/15 blur-[70px]" />
        </div>

        {}
        {}
        {}
        <header className="sticky top-0 z-50 pointer-events-none">
          <div className="px-[30px] pt-4 pb-2">
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className={`pointer-events-auto w-full flex items-center justify-between gap-4 px-6 py-3.5 rounded-[60px] border transition-all duration-300 ${scrolled
                  ? 'bg-white/15 border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.22)] backdrop-blur-2xl'
                  : 'bg-white/10 border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.10)] backdrop-blur-xl'
                }`}
            >
              {}
              <div
                className="flex items-center gap-2.5 cursor-pointer group shrink-0"
                onClick={resetAnalysis}
              >
                <img
                  src="/favicon.svg"
                  alt="AiStock Logo"
                  className="w-8 h-8 object-contain transition-transform duration-300 group-hover:rotate-12"
                />
                <span className="text-xl font-bold tracking-tight text-white">
                  AiStock <span className="text-blue-200">Agent</span>
                </span>
              </div>

              {}
              <nav className="hidden md:flex items-center gap-1">
                {[
                  { label: 'Home', onClick: (e) => { e.preventDefault(); resetAnalysis(); } },
                  { label: 'Features', onClick: (e) => e.preventDefault() },
                  { label: 'Forex', onClick: (e) => { e.preventDefault(); alert('Forex News integration: live global stock telemetry.'); } },
                  { label: 'Contact', href: 'mailto:support@altunilabs.ai' },
                ].map(({ label, onClick, href }) => (
                  <a
                    key={label}
                    href={href || '#'}
                    onClick={onClick}
                    className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-150"
                  >
                    {label}
                  </a>
                ))}
              </nav>

              {}
              <button
                onClick={() => { resetAnalysis(); setTimeout(() => document.querySelector('input')?.focus(), 50); }}
                className="hidden md:flex items-center gap-2 bg-white text-blue-700 hover:bg-white/90 text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-black/20 active:scale-95 transition-all duration-150 shrink-0"
              >
                Start Research <ArrowRight className="w-4 h-4" />
              </button>

              {}
              <button className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex flex-col gap-1.5 w-5">
                  <span className="h-0.5 rounded-full bg-white/80" />
                  <span className="h-0.5 rounded-full bg-white/80 w-3.5" />
                  <span className="h-0.5 rounded-full bg-white/80" />
                </div>
              </button>
            </motion.div>
          </div>
        </header>

        {}
        {}
        {}
        {}
        <AnimatePresence>
          {!loading && !results && (
            <motion.section
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 min-h-[540px] flex items-center"
            >
              <div className="w-full max-w-6xl mx-auto px-5 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                {}
                <div className="space-y-7">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-4 py-1.5 rounded-full"
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-200" />
                    <span className="text-blue-100 text-xs font-semibold tracking-wide">
                      Advanced RAG Equity Researcher
                    </span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
                    className="text-4xl sm:text-5xl lg:text-[3.2rem] font-extrabold leading-[1.08] tracking-tight text-white"
                  >
                    Make Your Equity Research{' '}
                    <span className="text-blue-200">Fast</span> and{' '}
                    <span className="text-blue-200">Precise</span>, with{' '}
                    <span className="inline-flex items-center gap-2">
                      <img src="/favicon.svg" alt="" className="w-8 h-8 inline-block" />
                      AiStock
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
                    className="text-blue-100/90 text-base md:text-lg leading-relaxed max-w-lg"
                  >
                    Enter any company name or stock ticker. Our AI agent reads financials,
                    media coverage, and sentiment to deliver institutional-grade equity reports in seconds.
                  </motion.p>

                  {}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
                    className="relative max-w-lg"
                    ref={dropdownRef}
                  >
                    <form onSubmit={handleSearchSubmit}>
                      <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                        <Search className="w-4.5 h-4.5 text-gray-400 ml-3 shrink-0" />
                        <Input
                          placeholder="Reliance, Tata Motors, Tesla…"
                          value={searchTerm}
                          onChange={handleInputChange}
                          disabled={loading}
                          required
                          className="border-0 bg-transparent px-2 py-2.5 focus:ring-0 shadow-none text-gray-900 placeholder-gray-400 text-sm flex-1"
                        />
                        <Button
                          type="submit"
                          disabled={loading || !searchTerm.trim()}
                          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold shadow-none active:scale-95 transition-all duration-150 flex items-center gap-1.5"
                        >
                          Get Started <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>

                    {}
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-50 max-h-64 overflow-y-auto"
                        >
                          {suggestions.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSuggestionItemClick(item)}
                              className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors duration-150"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                                  {item.exchange}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-600 text-xs font-semibold bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                                <span>{item.symbol}</span>
                                <ChevronRight className="w-3 h-3" />
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-lg bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3"
                    >
                      <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-red-800 uppercase tracking-wide">Research Failed</h5>
                        <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
                  className="hidden lg:block"
                >
                  <HeroVisual />
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
      {}

      {}
      {}
      {}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">

          {}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 w-full max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
            >
              <div className="lg:col-span-5">
                <LoadingScreen currentStep={currentStep} companyName={analyzedCompany} />
              </div>
              <div className="lg:col-span-7 h-full flex flex-col justify-center space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Live market telemetry —
                </p>
                <StockChartWidget chartData={chartData} isLoading={chartLoading} />
              </div>
            </motion.div>
          )}

          {}
          {!loading && results && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="flex-1"
            >
              <Dashboard data={results} chartData={chartData} onBack={resetAnalysis} />
            </motion.div>
          )}

          {}
          {!loading && !results && (
            <motion.div
              key="landing-sections"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >

              {}
              {}
              {}
              <section className="border-y border-gray-100 py-8 bg-white overflow-hidden">
                <div className="max-w-6xl mx-auto px-5">
                  <p className="text-center text-sm font-semibold text-gray-400 mb-6 uppercase tracking-widest">
                    Trusted By More Than <span className="text-blue-600">+10,000</span> Users
                  </p>
                  <div className="overflow-hidden">
                    <div
                      className="flex whitespace-nowrap"
                      style={{ animation: 'marquee 28s linear infinite', width: 'max-content' }}
                    >
                      {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((p, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-3 px-8 border-r border-gray-100 last:border-0"
                        >
                          <PartnerLogoImg domain={p.domain} type={p.type} name={p.name} />
                          <span className="text-sm font-semibold text-gray-500">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {}
              {}
              {}
              <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-5">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="text-center mb-14 space-y-3"
                  >
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-600 text-xs font-semibold uppercase tracking-widest">
                      <Zap className="w-3.5 h-3.5" /> Powerful Features
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                      Get The Most Powerful and<br />
                      <span className="text-blue-600">Easy to Use</span> Research Software
                    </h2>
                    <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
                      Whether you are a founder, an independent analyst, or part of a large investment team —
                      AiStock Agent scales to your needs.
                    </p>
                  </motion.div>

                  <div className="flex flex-col md:flex-row items-stretch justify-center">
                    {FEATURES.map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <motion.div
                          key={f.label}
                          initial={{ opacity: 0, y: 24 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.25 }}
                          transition={{ duration: 0.55, delay: i * 0.12, ease: EASE }}
                          className={`relative flex-1 rounded-3xl overflow-hidden transition-all duration-300 ${f.active
                              ? 'bg-gradient-to-br from-[#1a47b8] via-[#1e56d4] to-[#4f88f8] text-white shadow-[0_20px_60px_rgba(30,86,212,0.45)] z-10 scale-105 md:-mx-2'
                              : 'bg-white text-gray-800 shadow-lg border border-gray-100 z-0'
                            }`}
                        >
                          <div className="p-8 h-full flex flex-col gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${f.active ? 'bg-white/20' : 'bg-blue-50'}`}>
                              <Icon className={`w-6 h-6 ${f.active ? 'text-white' : 'text-blue-600'}`} />
                            </div>
                            <div className="space-y-2">
                              <span className={`text-xs font-bold uppercase tracking-widest ${f.active ? 'text-blue-200' : 'text-blue-500'}`}>
                                {f.label}
                              </span>
                              <h3 className={`text-xl font-bold leading-snug ${f.active ? 'text-white' : 'text-gray-900'}`}>
                                {f.title}
                              </h3>
                              <p className={`text-sm leading-relaxed ${f.active ? 'text-blue-100/85' : 'text-gray-500'}`}>
                                {f.desc}
                              </p>
                            </div>
                            <button
                              onClick={() => document.querySelector('input')?.focus()}
                              className={`mt-auto self-start flex items-center gap-1.5 text-sm font-semibold transition-all duration-150 ${f.active ? 'text-white hover:text-blue-100' : 'text-blue-600 hover:text-blue-700'
                                }`}
                            >
                              Learn More <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {}
              {}
              {}
              <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                  {}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6 max-w-sm mx-auto">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            <BarChart2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-800">Sentiment Report</div>
                            <div className="text-[10px] text-gray-400">AI-generated</div>
                          </div>
                        </div>
                        <span className="text-blue-600 text-lg font-black">+92%</span>
                      </div>
                      <div className="space-y-3 mb-4">
                        {['Positive Headlines', 'Analyst Upgrades', 'Insider Buying'].map((item, i) => (
                          <div key={item} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="text-gray-600">{item}</span>
                            </div>
                            <div className="h-2 w-24 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                                style={{ width: `${[78, 65, 88][i]}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold rounded-xl">
                        View Full Analysis
                      </button>
                    </div>
                  </motion.div>

                  {}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
                    className="space-y-6"
                  >
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-600 text-xs font-semibold uppercase tracking-widest">
                      <TrendingUp className="w-3.5 h-3.5" /> Sentiment Engine
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-gray-900">
                      Insights That are Endlessly{' '}
                      <span className="text-blue-600">Rewarding</span>{' '}
                      For Every Research Query
                    </h2>
                    <p className="text-gray-500 leading-relaxed">
                      Our AI agent aggregates news, social signals, and analyst reports to give you a
                      real-time sentiment score. Make confident decisions backed by data — not guesswork.
                    </p>
                    <ul className="space-y-3">
                      {[
                        'Real-time news aggregation via Tavily AI',
                        'Positive / Negative signal classification',
                        'Analyst rating & insider activity tracking',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => document.querySelector('input')?.focus()}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors duration-150"
                    >
                      Try It Free <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                </div>
              </section>

              {}
              {}
              {}
              <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                  {}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="space-y-6 order-2 lg:order-1"
                  >
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-600 text-xs font-semibold uppercase tracking-widest">
                      <Shield className="w-3.5 h-3.5" /> Risk Engine
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-gray-900">
                      Keep Your Portfolio Analysis{' '}
                      <span className="text-blue-600">Always</span> Accurate
                    </h2>
                    <p className="text-gray-500 leading-relaxed">
                      Protect your investment thesis with multi-factor risk scoring. AiStock surfaces
                      debt metrics, macro headwinds, and competitive pressures before you commit capital.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: Shield, label: 'Risk Score', val: 'Low-Medium' },
                        { icon: BarChart2, label: 'Health Score', val: '92 / 100' },
                      ].map(({ icon: I, label, val }) => (
                        <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                          <I className="w-5 h-5 text-blue-500 mb-2" />
                          <div className="text-xs text-gray-400 font-medium">{label}</div>
                          <div className="text-base font-bold text-gray-800 mt-0.5">{val}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
                    className="order-1 lg:order-2"
                  >
                    <div className="relative max-w-sm mx-auto space-y-3">
                      {TRENDING_COMPANIES.slice(0, 4).map((company, idx) => (
                        <motion.button
                          key={company.name}
                          initial={{ opacity: 0, x: 12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.45, delay: idx * 0.08, ease: EASE }}
                          onClick={() => handleSuggestClick(company.ticker)}
                          className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm shrink-0">
                              <CompanyLogo
                                name={company.name}
                                domain={company.domain}
                                fallbackText={company.logo}
                                className="w-9 h-9 rounded-full"
                                color={`bg-gradient-to-br ${company.color}`}
                              />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-800">{company.name}</div>
                              <div className="text-[10px] text-gray-400 font-medium">{company.ticker}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg">
                            Research <ChevronRight className="w-3 h-3" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </section>

              {}
              {}
              {}
              <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="space-y-6"
                  >
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-600 text-xs font-semibold uppercase tracking-widest">
                      <Zap className="w-3.5 h-3.5" /> Instant Reports
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-gray-900">
                      Collect All Your Reports Within{' '}
                      <span className="text-blue-600">Minutes</span>
                    </h2>
                    <p className="text-gray-500 leading-relaxed">
                      Deploy on your website or integrate directly into your research workflow.
                      Any company, any market — React, Tailwind, and production-ready.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => document.querySelector('input')?.focus()}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors duration-150"
                      >
                        Start Researching <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert('Forex News integration: live global stock telemetry.')}
                        className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold px-6 py-3 rounded-xl transition-colors duration-150"
                      >
                        View Demo
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
                  >
                    <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6 max-w-sm mx-auto space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <BarChart2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-800">Equity Report</div>
                            <div className="text-[10px] text-gray-400">AI-generated · Gemini 2.5 Flash</div>
                          </div>
                        </div>
                        <span className="text-green-600 text-xs font-bold bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                          Done
                        </span>
                      </div>
                      <div className="space-y-2">
                        {['Overview & Financials', 'Sentiment Analysis', 'Risk Assessment', 'Investment Thesis'].map((s) => (
                          <div key={s} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                            <span className="text-gray-600">{s}</span>
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          </div>
                        ))}
                      </div>
                      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl py-3 text-center">
                        <span className="text-white text-sm font-semibold">Report Delivered</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {}
      {}
      {}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={resetAnalysis}>
            <img src="/favicon.svg" alt="AiStock Logo" className="w-7 h-7 object-contain" />
            <span className="text-lg font-bold">
              AiStock <span className="text-blue-400">Agent</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" onClick={(e) => { e.preventDefault(); resetAnalysis(); }} className="hover:text-white transition-colors">Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Forex News integration.'); }} className="hover:text-white transition-colors">Forex News</a>
            <a href="mailto:support@altunilabs.ai" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-[11px] text-gray-500">
            {`© ${new Date().getFullYear()} AiStock Agent — Built for Equity Research & Investment Analysis`}
          </p>
        </div>
      </footer>
    </div>
  );
}