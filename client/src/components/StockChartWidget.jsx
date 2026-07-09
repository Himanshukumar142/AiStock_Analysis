import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

export default function StockChartWidget({ chartData, isLoading }) {
  const [range, setRange] = useState('6M'); 

  
  const filteredData = useMemo(() => {
    if (!chartData?.data) return [];
    
    const allPoints = chartData.data;
    if (allPoints.length === 0) return [];

    const cutoff = new Date();
    if (range === '1M') cutoff.setMonth(cutoff.getMonth() - 1);
    else if (range === '3M') cutoff.setMonth(cutoff.getMonth() - 3);
    else if (range === '6M') cutoff.setMonth(cutoff.getMonth() - 6);
    else if (range === '1Y') cutoff.setFullYear(cutoff.getFullYear() - 1);

    return allPoints.filter(d => new Date(d.date) >= cutoff);
  }, [chartData, range]);

  
  const rangeStats = useMemo(() => {
    if (filteredData.length < 2) return { change: 0, percent: 0, isUp: true };
    const start = filteredData[0].price;
    const end = filteredData[filteredData.length - 1].price;
    const change = end - start;
    const percent = (change / start) * 100;
    return {
      change: Math.round(change * 100) / 100,
      percent: Math.round(percent * 100) / 100,
      isUp: change >= 0
    };
  }, [filteredData]);

  if (isLoading) {
    return (
      <div className="w-full bg-white/70 backdrop-blur-md border border-slate-100 rounded-3xl p-6 h-[380px] flex flex-col justify-between animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-slate-200 rounded-full" />
          <div className="h-8 w-48 bg-slate-200 rounded-full" />
          <div className="h-4 w-32 bg-slate-200 rounded-full" />
        </div>
        <div className="h-40 w-full bg-slate-150 rounded-2xl" />
        <div className="flex justify-between items-center">
          <div className="h-4 w-28 bg-slate-200 rounded-full" />
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-12 bg-slate-200 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return null;
  }

  const { ticker, companyName, currentPrice, currency, marketState } = chartData;
  const isUp = rangeStats.isUp;
  const strokeColor = isUp ? '#00c853' : '#ff3d00';
  const fillColor = isUp ? 'rgba(0, 200, 83, 0.08)' : 'rgba(255, 61, 0, 0.08)';

  // Calculate min/max for chart margins
  const prices = filteredData.map(d => d.price);
  const minPrice = prices.length ? Math.min(...prices) * 0.99 : 0;
  const maxPrice = prices.length ? Math.max(...prices) * 1.01 : 100;

  return (
    <div className="w-full bg-white/80 backdrop-blur-lg border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300">
      
      
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">{ticker}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">{companyName}</span>
          </div>
          
          <div className="flex items-baseline space-x-2 mt-1.5">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
              {currentPrice.toLocaleString(undefined, { style: 'currency', currency })}
            </span>
            <span className={`flex items-center text-sm font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isUp ? <TrendingUp className="w-4 h-4 mr-0.5" /> : <TrendingDown className="w-4 h-4 mr-0.5" />}
              {isUp ? '+' : ''}{rangeStats.change.toFixed(2)} ({isUp ? '+' : ''}{rangeStats.percent.toFixed(2)}%)
            </span>
          </div>
        </div>

        
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>Market: {marketState}</span>
        </div>
      </div>

      
      <div className="h-56 w-full my-4 relative">
        {filteredData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-medium">
            No historical price data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(241, 245, 249, 0.5)" />
              <XAxis 
                dataKey="date" 
                hide={true} 
              />
              <YAxis 
                domain={[minPrice, maxPrice]} 
                hide={true} 
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white border border-slate-800 rounded-xl px-3 py-1.5 shadow-xl text-center">
                        <p className="text-[10px] font-semibold text-slate-400">{new Date(data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-sm font-extrabold mt-0.5">{data.price.toLocaleString(undefined, { style: 'currency', currency })}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={strokeColor} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      
      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Performance over time
        </span>

        
        <div className="flex space-x-1 p-0.5 bg-slate-50 border border-slate-100 rounded-xl">
          {['1M', '3M', '6M', '1Y'].map((p) => {
            const isActive = range === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setRange(p)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-slate-950 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
