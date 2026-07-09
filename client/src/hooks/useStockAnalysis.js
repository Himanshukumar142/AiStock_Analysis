import { useState, useRef, useEffect } from 'react';
import { analyzeCompany, getStockChart } from '../services/api.js';


export const LOADING_STEPS = [
  'Researching company details...',
  'Analyzing financial statements & health ratios...',
  'Reading latest news articles & evaluating sentiment...',
  'Synthesizing recommendation report with Gemini AI...'
];

export function useStockAnalysis() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [analyzedCompany, setAnalyzedCompany] = useState('');
  
  const stepIntervalRef = useRef(null);

  
  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
    };
  }, []);

  const runAnalysis = async (companyName) => {
    if (!companyName || companyName.trim() === '') return;
    
    const query = companyName.trim();

    
    setLoading(true);
    setCurrentStep(0);
    setError(null);
    setResults(null);
    setChartData(null);
    setChartLoading(true);
    setAnalyzedCompany(query);

    
    
    const stepDuration = 2500; 
    stepIntervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev; 
      });
    }, stepDuration);

    
    getStockChart(query)
      .then((data) => {
        setChartData(data);
        setChartLoading(false);
      })
      .catch((err) => {
        console.error('Failed to pre-fetch stock chart:', err);
        setChartLoading(false);
      });

    try {
      
      const analysisReport = await analyzeCompany(query);
      setResults(analysisReport);
    } catch (err) {
      setError(err.message || 'An error occurred during the stock research process.');
    } finally {
      
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
      setLoading(false);
    }
  };

  return {
    loading,
    currentStep,
    error,
    results,
    chartData,
    chartLoading,
    analyzedCompany,
    runAnalysis,
    resetAnalysis: () => {
      setResults(null);
      setChartData(null);
      setError(null);
      setAnalyzedCompany('');
    }
  };
}
