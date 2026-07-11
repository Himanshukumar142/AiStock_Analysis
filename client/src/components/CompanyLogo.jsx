import React, { useState } from 'react';

export default function CompanyLogo({ name, domain, fallbackText, className, color }) {
  const [error, setError] = useState(!!globalThis.clearbitOffline);
  
  const logoUrl = domain && !domain.startsWith('http') 
    ? `https://logo.clearbit.com/${domain}` 
    : domain;

  if (error || !domain || globalThis.clearbitOffline) {
    const isGradient = color && (color.includes('from-') || color.includes('to-'));
    return (
      <div className={`w-full h-full flex items-center justify-center text-white rounded-full font-bold select-none ${
        isGradient ? `bg-gradient-to-tr ${color}` : (color || 'bg-slate-400')
      }`}>
        <span className="uppercase text-[10px] tracking-wider">{fallbackText || (name ? name[0] : '?')}</span>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      onError={() => {
        globalThis.clearbitOffline = true;
        setError(true);
      }}
      className={`${className} object-contain rounded-full bg-white p-1`}
    />
  );
}
