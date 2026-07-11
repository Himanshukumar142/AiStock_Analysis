import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useTransform,
  useInView,
  animate,
} from 'framer-motion';
import {
  Building2, User, MapPin, Target, Wallet, TrendingUp, DollarSign,
  TrendingDown, ShieldAlert, Award, ThumbsUp, ThumbsDown, Check, AlertTriangle,
  ExternalLink, Sparkles, Gauge, Newspaper
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import StatCard from './StatCard.jsx';
import StockChartWidget from './StockChartWidget.jsx';
import CompanyLogo from './CompanyLogo.jsx';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'recommendation', label: 'Thesis' },
  { id: 'financials', label: 'Financials' },
  { id: 'sentiment', label: 'Sentiment' },
  { id: 'risk', label: 'Risk' },
  { id: 'news', label: 'News' },
];

const EASE = [0.16, 1, 0.3, 1];

function AnimatedNumber({ value, decimals = 0, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (!isInView) return;
    const target = Number(value) || 0;
    const controls = animate(mv, target, { duration: 1.3, ease: EASE });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

function GlowCard({ children, className = '' }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const bg = useMotionTemplate`radial-gradient(240px circle at ${mx}px ${my}px, rgba(99,102,241,0.14), transparent 70%)`;

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`group relative ${className}`}
    >
      <motion.div
        style={{ background: bg }}
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </motion.div>
  );
}

function Reveal({ id, className = '', delay = 0, children }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function SectionNav({ active, onNavigate }) {
  return (
    <nav className="sticky top-4 z-30 mb-8 flex w-full justify-center">
      <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200/70 bg-white/75 p-1.5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)] backdrop-blur-xl">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => onNavigate(s.id)}
            className={`relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${active === s.id ? 'text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            {active === s.id && (
              <motion.span
                layoutId="section-nav-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-600 shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{s.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function Dashboard({ data, chartData, onBack }) {
  const [activeSection, setActiveSection] = useState('overview');

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

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="relative">
      {}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[8%] top-[-6%] h-[26rem] w-[26rem] rounded-full bg-indigo-200/30 blur-[110px]" />
        <div className="absolute right-[6%] top-[18%] h-[22rem] w-[22rem] rounded-full bg-violet-200/25 blur-[110px]" />
        <div className="absolute bottom-[-10%] left-1/3 h-[24rem] w-[24rem] rounded-full bg-emerald-100/25 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(100,116,139,0.14) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            maskImage: 'radial-gradient(ellipse 65% 45% at 50% 10%, black 30%, transparent 100%)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {}
        {}
        {}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/50 pb-6"
        >
          <div className="flex items-start space-x-4">
            {overview.website && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm p-1.5 shrink-0 flex items-center justify-center"
              >
                <CompanyLogo
                  name={chartData ? chartData.companyName : 'Company'}
                  domain={overview.website}
                  fallbackText={chartData ? chartData.ticker?.split('.')[0] : 'C'}
                  className="w-full h-full"
                />
              </motion.div>
            )}
            <div>
              <Badge variant="primary" className="mb-2 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AiStock Intelligence Report
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans flex items-center gap-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">
                {chartData ? chartData.companyName : 'Company Research Report'}
                {chartData && (
                  <span className="text-slate-400 font-semibold text-xl sm:text-2xl ml-1">{chartData.ticker}</span>
                )}
              </h1>
              <p className="text-slate-500 font-sans text-sm mt-1">
                Sector: <span className="font-semibold text-slate-700">{overview.industry}</span> | Headquarters: <span className="font-semibold text-slate-700">{overview.headquarters}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="self-start sm:self-center px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl bg-white/50 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow active:scale-95"
          >
            ← Search Another Company
          </button>
        </motion.div>

        {}
        {}
        {}
        <SectionNav active={activeSection} onNavigate={scrollToSection} />

        {}
        {}
        {}
        {chartData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          >
            <GlowCard>
              <StockChartWidget chartData={chartData} isLoading={false} />
            </GlowCard>
          </motion.div>
        )}

        {}
        {}
        {}
        <Reveal id="recommendation">
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className={`relative overflow-hidden rounded-3xl border-y border-r border-l-8 p-8 shadow-xl shadow-slate-100/50 backdrop-blur-md transition-colors duration-300 ${isInvest
                ? 'bg-gradient-to-br from-emerald-50/20 via-white/80 to-indigo-50/10 border-slate-200 border-l-emerald-500 shadow-emerald-500/5'
                : 'bg-gradient-to-br from-rose-50/20 via-white/80 to-slate-50/10 border-slate-200 border-l-rose-500 shadow-rose-500/5'
              }`}
          >
            <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-15 -mr-28 -mt-28 ${isInvest ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
            <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[90px] opacity-10 -ml-20 -mb-20 ${isInvest ? 'bg-indigo-400' : 'bg-slate-400'
              }`} />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
              <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={isInvest ? 'success' : 'danger'} className="px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
                    Recommendation: {recommendation.decision}
                  </Badge>
                  <div className="flex items-center text-xs font-bold text-slate-400 tracking-wider">
                    <Award className="w-4 h-4 mr-1 text-slate-300" />
                    Confidence:
                    <span className="font-extrabold text-slate-600 ml-1 tabular-nums">
                      <AnimatedNumber value={recommendation.confidenceScore} suffix="%" />
                    </span>
                  </div>
                </div>

                <h2 className="text-3xl font-extrabold text-slate-800 font-sans tracking-tight">
                  Recommendation Thesis
                </h2>
                <p className="text-slate-600 font-sans text-base leading-relaxed">
                  {recommendation.reasoning}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="bg-emerald-50/30 border border-emerald-100/30 rounded-2xl p-5 shadow-sm"
                  >
                    <h4 className="text-emerald-700 font-extrabold text-sm flex items-center mb-3">
                      <ThumbsUp className="w-4.5 h-4.5 mr-2 shrink-0" /> Core Strengths
                    </h4>
                    <ul className="space-y-3">
                      {recommendation.strengths?.map((str, i) => (
                        <li key={i} className="text-slate-600 text-sm flex items-start leading-relaxed">
                          <Check className="w-4 h-4 mr-2.5 text-emerald-500 shrink-0 mt-1" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                    className="bg-rose-50/30 border border-rose-100/30 rounded-2xl p-5 shadow-sm"
                  >
                    <h4 className="text-rose-700 font-extrabold text-sm flex items-center mb-3">
                      <ThumbsDown className="w-4.5 h-4.5 mr-2 shrink-0" /> Risks & Flaws
                    </h4>
                    <ul className="space-y-3">
                      {recommendation.weaknesses?.map((weak, i) => (
                        <li key={i} className="text-slate-600 text-sm flex items-start leading-relaxed">
                          <AlertTriangle className="w-4 h-4 mr-2.5 text-rose-400 shrink-0 mt-1" />
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center shrink-0 mx-auto lg:mx-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className={`relative w-36 h-36 flex items-center justify-center bg-white/90 backdrop-blur rounded-full border border-slate-100 shadow-md ${isInvest ? 'shadow-emerald-500/10' : 'shadow-rose-500/10'
                    }`}
                >
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
                    <span className="text-4xl font-extrabold text-slate-800 tracking-tight font-sans tabular-nums">
                      <AnimatedNumber value={recommendation.overallScore} />
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Overall Score
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Reveal>

        {}
        {}
        {}
        <Reveal id="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <GlowCard className="h-full">
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
            </GlowCard>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <GlowCard>
                <StatCard
                  label="Market Cap"
                  value={financial.marketCap}
                  icon={<Building2 className="w-5 h-5" />}
                  subtitle="Equity Valuation"
                />
              </GlowCard>

              <GlowCard>
                <StatCard
                  label="Revenue"
                  value={financial.revenue}
                  icon={<DollarSign className="w-5 h-5" />}
                  subtitle={financial.revenueGrowth ? `${financial.revenueGrowth} YoY Growth` : 'Revenue Performance'}
                  isGrowth={true}
                />
              </GlowCard>

              <GlowCard>
                <StatCard
                  label="P/E Ratio"
                  value={financial.peRatio}
                  icon={<TrendingUp className="w-5 h-5" />}
                  subtitle="Valuation Multiple"
                />
              </GlowCard>

              <GlowCard>
                <StatCard
                  label="Earnings Per Share"
                  value={financial.eps}
                  icon={<Wallet className="w-5 h-5" />}
                  subtitle="EPS Trailing"
                />
              </GlowCard>

              <GlowCard>
                <StatCard
                  label="Cash Flow"
                  value={financial.cashFlow}
                  icon={<TrendingUp className="w-5 h-5" />}
                  subtitle="Liquidity Buffer"
                />
              </GlowCard>

              <GlowCard>
                <div className="glass-card flex flex-col items-center justify-center p-6 h-full">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5" /> Financial Health
                  </span>
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
                      <span className="text-2xl font-extrabold text-slate-800 tabular-nums">
                        <AnimatedNumber value={financial.financialHealthScore} suffix="%" />
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 mt-2 text-center">Stability Index</span>
                </div>
              </GlowCard>
            </div>
          </div>
        </Reveal>

        {}
        {}
        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Reveal id="financials">
            <GlowCard>
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
                      <Bar dataKey="Amount" radius={[8, 8, 0, 0]} animationDuration={1100} animationEasing="ease-out">
                        {barChartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </GlowCard>
          </Reveal>

          <Reveal id="sentiment" delay={0.1}>
            <GlowCard>
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
                          animationDuration={1100}
                          animationEasing="ease-out"
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

                  <div className="space-y-4 font-sans text-sm">
                    <div className="flex items-center">
                      <div className="w-3.5 h-3.5 bg-emerald-500 rounded-md mr-2.5 shrink-0" />
                      <span className="text-slate-600">Positive Factors: {news.positiveNews?.length || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3.5 h-3.5 bg-red-500 rounded-md mr-2.5 shrink-0" />
                      <span className="text-slate-600">Threat Factors: {news.negativeNews?.length || 0}</span>
                    </div>
                    <p className="text-slate-500 italic text-xs max-w-[280px] leading-relaxed pt-2.5 border-t border-slate-100">
                      Overall Context: {news.overallSummary}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </GlowCard>
          </Reveal>
        </div>

        {}
        {}
        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Reveal id="risk">
            <GlowCard className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <ShieldAlert className="w-5 h-5 mr-2 text-red-500" />
                    Risk Assessment Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <h5 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Business Risks</h5>
                    <ul className="space-y-2">
                      {risk.businessRisks?.map((r, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 mr-2.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Financial Risks</h5>
                    <ul className="space-y-2">
                      {risk.financialRisks?.map((r, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 mr-2.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <h5 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Market & Competition</h5>
                    <ul className="space-y-2">
                      {risk.competition?.map((r, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 mr-2.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <h5 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Regulatory & Compliance</h5>
                    <ul className="space-y-2">
                      {risk.regulatoryRisks?.map((r, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 mr-2.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </GlowCard>
          </Reveal>

          <Reveal id="news" delay={0.1}>
            <GlowCard className="h-full">
              <Card className="h-full flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Newspaper className="w-4.5 h-4.5 mr-2 text-slate-400" />
                    Latest News & Press Releases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  {news.latestNews?.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.4, delay: idx * 0.05, ease: EASE }}
                      className="group/item p-4.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100/80 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h5 className="text-sm font-bold text-slate-800 font-sans group-hover/item:text-indigo-600 transition-colors duration-200 leading-snug">
                          {item.title}
                        </h5>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-indigo-500 shrink-0 p-1"
                          aria-label="Read source article"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <p className="text-xs text-slate-500 font-sans mt-2 leading-relaxed">
                        <span className="font-semibold text-slate-600/90">Context: </span>{item.snippet}
                      </p>
                    </motion.div>
                  ))}
                  {(!news.latestNews || news.latestNews.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-8">No recent articles fetched.</p>
                  )}
                </CardContent>
              </Card>
            </GlowCard>
          </Reveal>
        </div>
      </motion.div>
    </div>
  );
}