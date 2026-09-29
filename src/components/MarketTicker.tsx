'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Clock, Globe } from 'lucide-react';

export const MarketTicker: React.FC = () => {
  const tickers = [
    { symbol: 'XAU/USD', price: '2,658.20', change: '+0.85%', isUp: true, type: 'GOLD' },
    { symbol: 'EUR/USD', price: '1.08264', change: '+0.14%', isUp: true, type: 'FOREX' },
    { symbol: 'GBP/USD', price: '1.29580', change: '-0.21%', isUp: false, type: 'FOREX' },
    { symbol: 'USD/JPY', price: '152.420', change: '+0.32%', isUp: true, type: 'FOREX' },
    { symbol: 'NAS100', price: '20,480.5', change: '+0.92%', isUp: true, type: 'INDEX' },
    { symbol: 'BTC/USD', price: '66,410.0', change: '+1.65%', isUp: true, type: 'CRYPTO' },
  ];

  return (
    <div className="w-full bg-[#0a0e17]/90 border-b border-white/[0.06] backdrop-blur-md overflow-hidden py-1.5 px-4 text-[11px]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Market Session & Active Terminal */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] tracking-wide uppercase">Markets Open</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <Clock className="h-3 w-3 text-indigo-400" />
            <span>London / NY Session</span>
          </div>
        </div>

        {/* Scrolling Tickers */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-0.5">
          {tickers.map((t) => (
            <div key={t.symbol} className="flex items-center gap-1.5 shrink-0 font-mono">
              <span className="font-semibold text-slate-200">{t.symbol}</span>
              <span className="text-slate-400">{t.price}</span>
              <span
                className={`flex items-center text-[10px] font-semibold px-1 rounded ${
                  t.isUp
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {t.isUp ? '+' : ''}{t.change}
              </span>
            </div>
          ))}
        </div>

        {/* Broker Latency */}
        <div className="hidden xl:flex items-center gap-2 text-slate-500 text-[10px] shrink-0 font-mono">
          <Globe className="h-3 w-3 text-blue-400" />
          <span>Server Ping: 12ms</span>
        </div>

      </div>
    </div>
  );
};
