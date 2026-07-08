import React from 'react';
import { Card } from './ui/card.jsx';

/**
 * Render widget card displaying a financial statistic.
 * @param {string} label - Name/Title of the metric.
 * @param {string|number} value - Main statistical number.
 * @param {React.ReactNode} icon - Vector icon representing the metric.
 * @param {string} subtitle - Explanatory helper text or growth metric.
 * @param {boolean} highlight - Highlights positive numbers.
 */
export default function StatCard({ label, value, icon, subtitle, highlight = false, isGrowth = false }) {
  // Determine text color for growth percentages
  const isPositiveGrowth = isGrowth && subtitle && !subtitle.startsWith('-');
  const growthClass = isPositiveGrowth ? 'text-emerald-500' : isGrowth ? 'text-red-500' : 'text-slate-400';

  return (
    <Card className="glass-card transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-500 font-sans tracking-wide uppercase">
          {label}
        </span>
        <div className="w-10 h-10 rounded-xl bg-primary-50/70 border border-primary-100/50 flex items-center justify-center text-primary-500">
          {icon}
        </div>
      </div>
      
      <div className="space-y-1">
        <h4 className="text-2xl font-extrabold text-slate-800 tracking-tight font-sans text-glow">
          {value || 'N/A'}
        </h4>
        {subtitle && (
          <p className={`text-xs font-semibold font-sans ${growthClass}`}>
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}
