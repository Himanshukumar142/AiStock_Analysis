import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, User, MapPin, Target, Wallet, TrendingUp, DollarSign,
  TrendingDown, ShieldAlert, Award, ThumbsUp, ThumbsDown, Check, AlertTriangle, ExternalLink
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import StatCard from './StatCard.jsx';
import StockChartWidget from './StockChartWidget.jsx';







export default function Dashboard({ data, chartData, onBack }) {
  if (!data) return null;

  const { overview, financial, news, risk, recommendation } = data;
  const isInvest = recommendation.decision === 'INVEST';

  
  
  const parseToNumeric = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    
    const matched = val.replace(/[$,]/g, '').match(/(-?\d+\.?\d*)\s*(Billion|Million|B|M|T)?/i);
    if (!matched) return 0;
    const num = parseFloat(matched[1]);
    const unit = matched[2]?.toLowerCase();
    if (unit === 'billion' || unit === 'b') return num * 1000; 
    if (unit === 'trillion' || unit === 't') return num * 1000000;
    return num;
  };

  const barChartData = [
    { name: 'Revenue', Amount: parseToNumeric(financial.revenue), fill: '#8b5cf6' },
    { name: 'Debt', Amount: parseToNumeric(financial.debt), fill: '#ef4444' },
    { name: 'Cash Flow', Amount: parseToNumeric(financial.cashFlow), fill: '#10b981' }
  ];

  
  
  const positiveCount = news.positiveNews?.length || 1;
  const negativeCount = news.negativeNews?.length || 1;
  const sentimentData = [
    { name: 'Positive Headlines', value: positiveCount, color: '#10b981' },
    { name: 'Negative/Risk Headlines', value: negativeCount, color: '#ef4444' }
  ];

  
  const healthData = [
    { name: 'Score', value: financial.financialHealthScore || 50, fill: '#8b5cf6' }
  ];

  
  const formatTooltipValue = (value) => {
    return `${value.toFixed(1)} M`;
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
      }}
      className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/50 pb-6">
        <div>
          <Badge variant="primary" className="mb-2">AiStock Intelligence Report</Badge>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight font-sans">
            {overview.ceo ? `${overview.ceo}'s Company Profile` : 'Company Research Report'}
          </h1>
          <p className="text-slate-500 font-sans text-sm">
            Sector: <span className="font-semibold text-slate-700">{overview.industry}</span> | Headquarters: <span className="font-semibold text-slate-700">{overview.headquarters}</span>
          </p>
        </div>
        <button 
          onClick={onBack}
          className="self-start sm:self-center px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl bg-white/50 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow active:scale-95"
        >
          ← Search Another Company
        </button>
      </div>

      
      {chartData && (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } }
          }}
        >
          <StockChartWidget chartData={chartData} isLoading={false} />
        </motion.div>
      )}

      
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } }
        }}
        className={`relative overflow-hidden rounded-3xl border-y border-r border-l-8 p-8 shadow-xl shadow-slate-100/50 backdrop-blur-md transition-all duration-300 ${
          isInvest 
            ? 'bg-gradient-to-br from-emerald-50/20 via-white/80 to-indigo-50/10 border-slate-200 border-l-emerald-500 shadow-emerald-500/5' 
            : 'bg-gradient-to-br from-rose-50/20 via-white/80 to-slate-50/10 border-slate-200 border-l-rose-500 shadow-rose-500/5'
        }`}
      >
        
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-15 -mr-28 -mt-28 ${
          isInvest ? 'bg-emerald-400' : 'bg-rose-400'
        }`} />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center space-x-3">
              <Badge variant={isInvest ? 'success' : 'danger'} className="px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
                Recommendation: {recommendation.decision}
              </Badge>
              <div className="flex items-center text-xs font-bold text-slate-400 tracking-wider">
                <Award className="w-4 h-4 mr-1 text-slate-300" />
                Confidence: <span className="font-extrabold text-slate-600 ml-0.5">{recommendation.confidenceScore}%</span>
              </div>
            </div>
            
            <h2 className="text-3xl font-extrabold text-slate-800 font-sans tracking-tight">
              Recommendation Thesis
            </h2>
            <p className="text-slate-600 font-sans text-base leading-relaxed">
              {recommendation.reasoning}
            </p>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-emerald-50/30 border border-emerald-100/30 rounded-2xl p-5 shadow-sm">
                <h4 className="text-emerald-700 font-extrabold text-sm flex items-center mb-3">
                  <ThumbsUp className="w-4.5 h-4.5 mr-2 shrink-0" /> Core Strengths
                </h4>
                <ul className="space-y-2.5">
                  {recommendation.strengths?.map((str, i) => (
                    <li key={i} className="text-slate-600 text-xs flex items-start">
                      <Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50/30 border border-rose-100/30 rounded-2xl p-5 shadow-sm">
                <h4 className="text-rose-700 font-extrabold text-sm flex items-center mb-3">
                  <ThumbsDown className="w-4.5 h-4.5 mr-2 shrink-0" /> Risks & Flaws
                </h4>
                <ul className="space-y-2.5">
                  {recommendation.weaknesses?.map((weak, i) => (
                    <li key={i} className="text-slate-600 text-xs flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-2 text-rose-400 shrink-0 mt-0.5" />
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          
          <div className="flex flex-col items-center justify-center shrink-0 mx-auto lg:mx-0">
            <div className={`relative w-36 h-36 flex items-center justify-center bg-white/90 backdrop-blur rounded-full border border-slate-100 shadow-md ${
              isInvest ? 'shadow-emerald-500/10' : 'shadow-rose-500/10'
            }`}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  barSize={8} 
                  data={[{ name: 'Score', value: recommendation.overallScore }]} 
                  startAngle={90} 
                  endAngle={-270}
                >
                  <RadialBar
                    background
                    clockWise
                    dataKey="value"
                    fill={isInvest ? '#10b981' : '#ef4444'}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-slate-800 tracking-tight font-sans text-glow">
                  {recommendation.overallScore}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Overall Score
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-primary-500" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 flex-1">
              <p className="text-slate-600 font-sans text-sm leading-relaxed">
                {overview.summary}
              </p>
              
              <div className="space-y-3.5 border-t border-slate-100 pt-4">
                <div className="flex items-center text-sm font-sans">
                  <User className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                  <span className="text-slate-500 w-24">CEO:</span>
                  <span className="text-slate-700 font-semibold">{overview.ceo}</span>
                </div>
                <div className="flex items-center text-sm font-sans">
                  <MapPin className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                  <span className="text-slate-500 w-24">Headquarters:</span>
                  <span className="text-slate-700 font-semibold">{overview.headquarters}</span>
                </div>
                <div className="flex items-center text-sm font-sans">
                  <Target className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                  <span className="text-slate-500 w-24">Market Standing:</span>
                  <Badge variant="primary">{overview.marketPosition}</Badge>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Offerings & Products</h5>
                <div className="flex flex-wrap gap-1.5">
                  {overview.products?.map((prod, i) => (
                    <Badge key={i} variant="default" className="bg-slate-50 border-slate-200/60 text-slate-600 text-[11px]">
                      {prod}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <StatCard 
              label="Market Cap" 
              value={financial.marketCap} 
              icon={<Building2 className="w-5 h-5" />}
              subtitle="Equity Valuation"
            />
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <StatCard 
              label="Revenue" 
              value={financial.revenue} 
              icon={<DollarSign className="w-5 h-5" />}
              subtitle={financial.revenueGrowth ? `${financial.revenueGrowth} YoY Growth` : 'Revenue Performance'}
              isGrowth={true}
            />
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <StatCard 
              label="P/E Ratio" 
              value={financial.peRatio} 
              icon={<TrendingUp className="w-5 h-5" />}
              subtitle="Valuation Multiple"
            />
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <StatCard 
              label="Earnings Per Share" 
              value={financial.eps} 
              icon={<Wallet className="w-5 h-5" />}
              subtitle="EPS Trailing"
            />
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <StatCard 
              label="Cash Flow" 
              value={financial.cashFlow} 
              icon={<TrendingUp className="w-5 h-5" />}
              subtitle="Liquidity Buffer"
            />
          </motion.div>

          
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            className="glass-card flex flex-col items-center justify-center p-6"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Financial Health</span>
            <div className="relative w-24 h-24 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="75%" 
                  outerRadius="100%" 
                  barSize={8} 
                  data={healthData} 
                  startAngle={90} 
                  endAngle={-270}
                >
                  <RadialBar
                    background
                    clockWise
                    dataKey="value"
                    fill="#8b5cf6"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-slate-800">{financial.financialHealthScore}%</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 mt-2 text-center">Stability Index</span>
          </motion.div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <Card>
            <CardHeader>
              <CardTitle>Financial Comparison</CardTitle>
              <p className="text-slate-500 text-xs font-sans">
                Normalized valuation components (Revenue vs. Debt vs. Cash Flow)
              </p>
            </CardHeader>
            <CardContent className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.04)' }} formatter={formatTooltipValue} />
                  <Bar dataKey="Amount" radius={[8, 8, 0, 0]}>
                    {barChartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Media Sentiment Ratio</CardTitle>
              <p className="text-slate-500 text-xs font-sans">
                Headline Sentiment classification (Aggregated via Tavily News)
              </p>
            </CardHeader>
            <CardContent className="h-64 flex flex-col sm:flex-row items-center justify-around">
              
              <div className="w-44 h-44 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Sentiment</span>
                  <span className="text-sm font-extrabold text-slate-700">{news.sentiment}</span>
                </div>
              </div>

              
              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-center">
                  <div className="w-3.5 h-3.5 bg-emerald-500 rounded-md mr-2 shrink-0" />
                  <span className="text-slate-600">Positive Factors: {news.positiveNews?.length || 0}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3.5 h-3.5 bg-red-500 rounded-md mr-2 shrink-0" />
                  <span className="text-slate-600">Threat Factors: {news.negativeNews?.length || 0}</span>
                </div>
                <p className="text-slate-400 italic text-[11px] max-w-[200px] leading-relaxed pt-2 border-t border-slate-100">
                  Overall Context: {news.overallSummary}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <ShieldAlert className="w-5 h-5 mr-2 text-red-500" />
                Risk Assessment Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Risks</h5>
                <ul className="space-y-1.5">
                  {risk.businessRisks?.map((r, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 mr-2 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial Risks</h5>
                <ul className="space-y-1.5">
                  {risk.financialRisks?.map((r, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 mr-2 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Market & Competition</h5>
                <ul className="space-y-1.5">
                  {risk.competition?.map((r, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 mr-2 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regulatory & Compliance</h5>
                <ul className="space-y-1.5">
                  {risk.regulatoryRisks?.map((r, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 mr-2 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Latest News & Press Releases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {news.latestNews?.map((item, idx) => (
                <div key={idx} className="group p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <h5 className="text-xs font-bold text-slate-800 font-sans group-hover:text-primary-600 transition-colors duration-200 leading-snug">
                      {item.title}
                    </h5>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-primary-500 shrink-0 p-1"
                      aria-label="Read source article"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-1 leading-normal italic">
                    Source context: {item.snippet}
                  </p>
                </div>
              ))}
              {(!news.latestNews || news.latestNews.length === 0) && (
                <p className="text-xs text-slate-400 italic text-center py-8">No recent articles fetched.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
