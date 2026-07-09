import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, AlertCircle, TrendingUp, ArrowRight, Building2, Newspaper, Mail, ChevronRight
} from 'lucide-react';
import { useStockAnalysis } from '../hooks/useStockAnalysis.js';
import { getSuggestions } from '../services/api.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import Dashboard from '../components/Dashboard.jsx';
import StockChartWidget from '../components/StockChartWidget.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';


const BACKGROUND_BUBBLES = [
  { id: 1, name: 'Reliance', logo: 'R', domain: 'relianceindustries.com', color: 'from-blue-600 to-indigo-500 shadow-blue-500/20', size: 'w-16 h-16 md:w-20 md:h-20', top: '15%', left: '4%', animate: 'animate-float-slow' },
  { id: 2, name: 'Tata Motors', logo: 'T', domain: 'tatamotors.com', color: 'from-sky-950 to-blue-800 shadow-indigo-950/20', size: 'w-18 h-18 md:w-22 md:h-22', top: '12%', right: '14%', animate: 'animate-float-fast' },
  { id: 3, name: 'Tesla', logo: 'T', domain: 'tesla.com', color: 'from-red-600 to-rose-500 shadow-red-500/20', size: 'w-14 h-14 md:w-16 md:h-16', top: '48%', left: '3%', animate: 'animate-float-fast' },
  { id: 4, name: 'Apple', logo: '', domain: 'apple.com', color: 'from-slate-800 to-slate-600 shadow-slate-800/20', size: 'w-16 h-16 md:w-18 md:h-18', top: '35%', right: '5%', animate: 'animate-float-slow' },
  { id: 5, name: 'Nvidia', logo: 'N', domain: 'nvidia.com', color: 'from-emerald-600 to-green-500 shadow-emerald-500/20', size: 'w-20 h-20 md:w-24 md:h-24', top: '72%', left: '6%', animate: 'animate-float-slow' },
  { id: 6, name: 'Infosys', logo: 'I', domain: 'infosys.com', color: 'from-indigo-800 to-blue-600 shadow-blue-500/20', size: 'w-14 h-14 md:w-16 md:h-16', top: '60%', right: '12%', animate: 'animate-float-fast' },
  { id: 7, name: 'TCS', logo: 'T', domain: 'tcs.com', color: 'from-teal-600 to-emerald-500 shadow-teal-500/10', size: 'w-12 h-12 md:w-14 md:h-14', top: '24%', left: '16%', animate: 'animate-float-slow' },
  { id: 8, name: 'Google', logo: 'G', domain: 'google.com', color: 'from-red-500 via-yellow-500 to-green-500 shadow-yellow-500/20', size: 'w-18 h-18 md:w-20 md:h-20', top: '44%', left: '12%', animate: 'animate-float-fast' },
  { id: 9, name: 'Wipro', logo: 'W', domain: 'wipro.com', color: 'from-purple-600 to-violet-500 shadow-purple-500/10', size: 'w-14 h-14 md:w-16 md:h-16', top: '74%', right: '8%', animate: 'animate-float-slow' },
];


const TRENDING_COMPANIES = [
  { name: 'Reliance', ticker: 'RELIANCE.NS', logo: 'R', domain: 'relianceindustries.com', color: 'bg-blue-600 text-white shadow-blue-500/30' },
  { name: 'Tata Motors', ticker: 'TATAMOTORS.NS', logo: 'T', domain: 'tatamotors.com', color: 'bg-sky-950 text-white shadow-slate-900/30' },
  { name: 'Infosys', ticker: 'INFY.NS', logo: 'I', domain: 'infosys.com', color: 'bg-cyan-600 text-white shadow-cyan-500/30' },
  { name: 'Tesla', ticker: 'TSLA', logo: 'T', domain: 'tesla.com', color: 'bg-red-600 text-white shadow-red-500/30' },
  { name: 'Apple', ticker: 'AAPL', logo: '', domain: 'apple.com', color: 'bg-slate-800 text-white shadow-slate-950/30' },
  { name: 'Nvidia', ticker: 'NVDA', logo: 'N', domain: 'nvidia.com', color: 'bg-emerald-600 text-white shadow-emerald-500/30' },
];


function CompanyLogo({ name, domain, fallbackText, className }) {
  const [error, setError] = useState(false);
  const logoUrl = `https://logo.clearbit.com/${domain}`;

  if (error || !domain) {
    return (
      <span className="uppercase font-extrabold tracking-wider">{fallbackText}</span>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      onError={() => setError(true)}
      className={`${className} object-contain rounded-full bg-white p-1`}
    />
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  const {
    loading,
    currentStep,
    error,
    results,
    chartData,
    chartLoading,
    analyzedCompany,
    runAnalysis,
    resetAnalysis
  } = useStockAnalysis();

  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
    if (!searchTerm || searchTerm.trim() === '') return;
    setShowSuggestions(false);
    runAnalysis(searchTerm);
  };

  const handleSuggestClick = (companyName) => {
    setSearchTerm(companyName);
    setShowSuggestions(false);
    runAnalysis(companyName);
  };

  const handleSuggestionItemClick = (item) => {
    setSearchTerm(item.symbol);
    setShowSuggestions(false);
    runAnalysis(item.symbol);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-slate-50/10">
      
      
      {!loading && !results && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          {BACKGROUND_BUBBLES.map((b) => (
            <div
              key={b.id}
              style={{
                position: 'absolute',
                top: b.top,
                left: b.left,
                right: b.right,
              }}
              className={`flex items-center justify-center rounded-full bg-gradient-to-tr ${b.color} border border-white/40 shadow-xl backdrop-blur-[6px] text-white font-sans font-extrabold select-none opacity-85 transition-all duration-500 hover:scale-110 pointer-events-auto ${b.size} ${b.animate}`}
            >
              <CompanyLogo
                name={b.name}
                domain={b.domain}
                fallbackText={b.logo}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full"
              />
            </div>
          ))}
        </div>
      )}

      
      <header className="w-full max-w-5xl mx-auto px-4 pt-6 sticky top-0 z-50">
        <div className="border border-white/50 bg-white/35 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between shadow-lg shadow-slate-100/50 rounded-2xl">
          
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={resetAnalysis}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-sans font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-800 to-slate-950 bg-clip-text text-transparent">
              AiStock <span className="font-medium text-primary-500">Agent</span>
            </span>
          </div>

          
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); resetAnalysis(); }}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-all duration-200"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Company</span>
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert("Forex News integration: displaying live global stock telemetry."); }}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-all duration-200"
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Forex News</span>
            </a>
            <a 
              href="mailto:support@altunilabs.ai" 
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-all duration-200"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Us</span>
            </a>
          </nav>

          
          <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Gemini 2.5 Flash</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </header>

      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          
          
          {loading && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto w-full"
            >
              
              <div className="lg:col-span-5">
                <LoadingScreen currentStep={currentStep} companyName={analyzedCompany} />
              </div>
              
              
              <div className="lg:col-span-7 h-full flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">
                    Live market telemetry preview:
                  </div>
                  <StockChartWidget chartData={chartData} isLoading={chartLoading} />
                </div>
              </div>
            </motion.div>
          )}

          
          {!loading && results && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <Dashboard data={results} chartData={chartData} onBack={resetAnalysis} />
            </motion.div>
          )}

          
          {!loading && !results && (
            <motion.div
              key="search-landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 70 }}
              className="max-w-2xl mx-auto w-full text-center space-y-10 py-16 relative"
            >
              
              <div className="space-y-5">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="inline-flex items-center space-x-2 bg-primary-100/50 border border-primary-200/35 px-4.5 py-1.5 rounded-full text-primary-700 text-xs font-bold font-sans tracking-wider uppercase shadow-sm"
                >
                  <span>Advanced RAG Equity Researcher</span>
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-800 font-sans leading-tight">
                  Investment Research <br />
                  <span className="bg-gradient-to-r from-primary-500 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                    Accelerated by AI
                  </span>
                </h1>
                <p className="text-slate-500 font-sans text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                  Enter a company name or stock ticker. Our autonomous RAG Agent searches financials, media news, and sentiment indicators to construct institutional-grade equity reports.
                </p>
              </div>

              
              <div className="relative max-w-xl mx-auto" ref={dropdownRef}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="flex items-center relative rounded-2xl search-glow bg-white border border-slate-200/80 p-2 focus-within:ring-4 focus-within:ring-primary-100/60 focus-within:border-primary-400/80 transition-all duration-350">
                    <div className="pl-4 pr-2 text-slate-400 shrink-0">
                      <Search className="w-5.5 h-5.5" />
                    </div>
                    <Input 
                      placeholder="Enter company name (e.g. Reliance, Tata Motors, Tesla)..." 
                      value={searchTerm}
                      onChange={handleInputChange}
                      className="border-0 bg-transparent px-2 py-3.5 focus:ring-0 focus:border-transparent focus:bg-transparent shadow-none text-base placeholder-slate-400 font-sans"
                      disabled={loading}
                      required
                    />
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg" 
                      disabled={loading || !searchTerm.trim()}
                      className="shrink-0 rounded-xl px-6 font-bold shadow-md shadow-primary-500/20 active:scale-95 transition-all duration-200"
                    >
                      Research <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>

                
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-2xl overflow-hidden z-50 text-left max-h-64 overflow-y-auto"
                    >
                      {suggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSuggestionItemClick(item)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-primary-50/70 cursor-pointer border-b border-slate-50 last:border-0 transition-colors duration-150"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 font-sans">{item.name}</span>
                            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                              Exchange: {item.exchange}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-primary-500 font-bold text-xs uppercase tracking-wider bg-primary-50 border border-primary-100/50 px-2.5 py-1 rounded-lg">
                            <span>{item.symbol}</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              
              <div className="space-y-3 pt-3">
                <span className="text-slate-400 text-xs font-bold font-sans uppercase tracking-widest block">
                  Click a direct company to research:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-3.5 max-w-xl mx-auto">
                  {TRENDING_COMPANIES.map((company) => (
                    <button
                      key={company.name}
                      type="button"
                      onClick={() => handleSuggestClick(company.ticker)}
                      className="flex items-center space-x-2.5 px-4.5 py-2.5 bg-white border border-slate-200/60 shadow-sm rounded-2xl hover:shadow-md hover:border-primary-350 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                    >
                      
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold tracking-wider uppercase overflow-hidden shadow">
                        <CompanyLogo
                          name={company.name}
                          domain={company.domain}
                          fallbackText={company.logo}
                          className="w-7 h-7 rounded-full"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{company.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50/50 border border-red-200/65 rounded-2xl p-4 max-w-lg mx-auto flex items-start space-x-3.5 text-left shadow-sm"
                >
                  <AlertCircle className="w-5.5 h-5.5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-extrabold text-red-800 font-sans tracking-wide uppercase">Research Failed</h5>
                    <p className="text-xs text-red-700 leading-relaxed font-sans font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      
      <footer className="border-t border-slate-200/40 bg-white/20 backdrop-blur-sm py-6 text-center text-xs text-slate-400 font-sans">
        <p>© {new Date().getFullYear()} AiStock Agent. Built for Equity Research and Investment Analysis.</p>
      </footer>
    </div>
  );
}
