import React from 'react';
import { motion } from 'framer-motion';
import { Search, BarChart3, Newspaper, Cpu, CheckCircle2, Loader2 } from 'lucide-react';
import { LOADING_STEPS } from '../hooks/useStockAnalysis.js';






export default function LoadingScreen({ currentStep, companyName }) {
  
  
  const getStepIcon = (index, isActive, isCompleted) => {
    if (isCompleted) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    }
    if (isActive) {
      return <Loader2 className="w-5 h-5 text-primary-500 animate-spin shrink-0" />;
    }

    const iconClasses = "w-5 h-5 text-slate-300 shrink-0";
    switch (index) {
      case 0: return <Search className={iconClasses} />;
      case 1: return <BarChart3 className={iconClasses} />;
      case 2: return <Newspaper className={iconClasses} />;
      case 3: return <Cpu className={iconClasses} />;
      default: return <Search className={iconClasses} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-2 px-1">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md glass-card border-white/70 p-6 sm:p-8 text-center"
      >
        
        <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary-400/20 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-white rounded-2xl shadow-lg border border-slate-100/80 flex items-center justify-center">
            <img src="/favicon.svg" alt="AiStock Logo" className="w-13 h-13 object-contain animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-800 font-sans tracking-tight mb-2">
          Analyzing {companyName}
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Our LangChain Investment Agent is collecting and analyzing market data.
        </p>

        
        <div className="space-y-4 text-left max-w-sm mx-auto mb-6">
          {LOADING_STEPS.map((stepText, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className={`flex items-start space-x-3.5 p-3 rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary-50/50 border-primary-100 shadow-sm shadow-indigo-50/20' 
                    : isCompleted
                      ? 'bg-emerald-50/20 border-emerald-100/50'
                      : 'border-transparent opacity-60'
                }`}
              >
                
                <div className="mt-0.5">
                  {getStepIcon(idx, isActive, isCompleted)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-relaxed font-sans ${
                    isActive 
                      ? 'text-primary-600 font-bold' 
                      : isCompleted
                        ? 'text-slate-600 line-through decoration-emerald-200 decoration-1'
                        : 'text-slate-400'
                  }`}>
                    {stepText}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        
        <div className="w-full h-1.5 bg-slate-100 rounded-full timeline-bar mt-8 overflow-hidden" />
      </motion.div>
    </div>
  );
}
