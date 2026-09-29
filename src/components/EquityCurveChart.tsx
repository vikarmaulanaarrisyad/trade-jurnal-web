'use client';

import React, { useState } from 'react';
import { Trade } from '@/lib/types';
import { TrendingUp, BarChart2, Calendar, Award, ShieldAlert, Sparkles } from 'lucide-react';

interface EquityCurveChartProps {
  trades: Trade[];
  currentBalance: number;
}

export const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ trades, currentBalance }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [chartMode, setChartMode] = useState<'EQUITY' | 'DRAWDOWN'>('EQUITY');

  // Filter closed trades and sort chronologically (oldest first)
  const closedTrades = trades
    .filter((t) => t.status === 'CLOSED' && t.close_time)
    .sort((a, b) => new Date(a.close_time!).getTime() - new Date(b.close_time!).getTime());

  if (closedTrades.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center rounded-2xl glass-card text-slate-400 p-6 text-center">
        <BarChart2 className="h-12 w-12 text-slate-700 mb-3 animate-pulse" />
        <p className="text-base font-semibold text-slate-200">Belum ada riwayat transaksi selesai.</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Lakukan transaksi di MetaTrader 4 atau 5 untuk melihat visualisasi kurva pertumbuhan modal secara real-time.
        </p>
      </div>
    );
  }

  // Calculate starting balance backwards
  const totalClosedPnl = closedTrades.reduce((acc, t) => acc + t.net_pnl, 0);
  const startingBalance = Math.max(1000, currentBalance - totalClosedPnl);

  // Compute points & running balance
  let runningBalance = startingBalance;
  let peakBalance = startingBalance;
  let maxDrawdownPercent = 0;

  const points = [
    {
      index: 0,
      balance: startingBalance,
      pnl: 0,
      date: 'Start',
      symbol: 'Initial',
      drawdownPct: 0,
      ticket: 0,
    },
    ...closedTrades.map((t, idx) => {
      runningBalance += t.net_pnl;
      if (runningBalance > peakBalance) {
        peakBalance = runningBalance;
      }
      const ddPct = peakBalance > 0 ? ((peakBalance - runningBalance) / peakBalance) * 100 : 0;
      if (ddPct > maxDrawdownPercent) {
        maxDrawdownPercent = ddPct;
      }

      return {
        index: idx + 1,
        balance: runningBalance,
        pnl: t.net_pnl,
        date: new Date(t.close_time!).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        symbol: t.symbol,
        drawdownPct: ddPct,
        ticket: t.ticket,
      };
    }),
  ];

  const minBal = Math.min(...points.map((p) => p.balance));
  const maxBal = Math.max(...points.map((p) => p.balance));
  const rangeBal = maxBal - minBal || 1;

  const maxDD = Math.max(1, ...points.map((p) => p.drawdownPct));

  const width = 800;
  const height = 260;
  const paddingY = 28;
  const paddingX = 40;

  const getX = (idx: number) => paddingX + (idx / (points.length - 1)) * (width - paddingX * 2);
  const getY = (val: number) => height - paddingY - ((val - minBal) / rangeBal) * (height - paddingY * 2);
  const getDdY = (val: number) => paddingY + (val / maxDD) * (height - paddingY * 2);

  // Paths for Equity Curve
  const pathEquity = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.balance).toFixed(1)}`)
    .join(' ');
  const areaEquity = `${pathEquity} L ${getX(points.length - 1).toFixed(1)} ${height - paddingY} L ${getX(0).toFixed(1)} ${height - paddingY} Z`;

  // Paths for Drawdown Underwater
  const pathDrawdown = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getDdY(p.drawdownPct).toFixed(1)}`)
    .join(' ');
  const areaDrawdown = `M ${getX(0).toFixed(1)} ${paddingY} ${pathDrawdown.replace('M', 'L')} L ${getX(points.length - 1).toFixed(1)} ${paddingY} Z`;

  const isNetPositive = runningBalance >= startingBalance;
  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="rounded-2xl glass-card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group shadow-2xl">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 w-96 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mt-20"></div>

      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600/20 to-emerald-500/20 border border-blue-500/30 text-emerald-400 shadow-md">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {chartMode === 'EQUITY' ? 'Equity Growth Curve' : 'Underwater Drawdown Curve'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
                Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualisasi performa modal kumulatif dari eksekusi MetaTrader
            </p>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
          <button
            onClick={() => setChartMode('EQUITY')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              chartMode === 'EQUITY'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Equity ($)
          </button>
          <button
            onClick={() => setChartMode('DRAWDOWN')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              chartMode === 'DRAWDOWN'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Drawdown (%)
          </button>
        </div>
      </div>

      {/* Value & Highlight Bar */}
      <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-slate-900/50 border border-white/[0.06] mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {hoverIndex !== null ? `Point #${hoverIndex} (${activePoint.symbol})` : 'Current Balance'}
            </span>
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-white">
              ${activePoint.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {activePoint.pnl !== 0 && (
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                activePoint.pnl > 0
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}
            >
              {activePoint.pnl > 0 ? '+' : ''}${activePoint.pnl.toFixed(2)}
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Peak Equity
          </span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            ${peakBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full aspect-[8/2.9] min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#10B981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.0" />
              <stop offset="50%" stopColor="#F43F5E" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.12)" />

          {/* Crosshair guide line on hover */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={paddingY}
              x2={getX(hoverIndex)}
              y2={height - paddingY}
              stroke="#60A5FA"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="animate-pulse"
            />
          )}

          {chartMode === 'EQUITY' ? (
            <>
              {/* Area Fill */}
              <path d={areaEquity} fill="url(#equityGrad)" />
              {/* Main Line */}
              <path
                d={pathEquity}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <>
              <path d={areaDrawdown} fill="url(#drawdownGrad)" />
              <path
                d={pathDrawdown}
                fill="none"
                stroke="#F43F5E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Interactive dots */}
          {points.map((p, idx) => {
            const cx = getX(idx);
            const cy = chartMode === 'EQUITY' ? getY(p.balance) : getDdY(p.drawdownPct);
            const isHovered = hoverIndex === idx;

            return (
              <g key={idx} className="cursor-pointer">
                {/* Large invisible hit circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="16"
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
                {/* Visual Point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? '6.5' : '3.5'}
                  fill={isHovered ? '#FFFFFF' : chartMode === 'EQUITY' ? '#10B981' : '#F43F5E'}
                  stroke="#080B11"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Labels min/max */}
        <div className="absolute left-3 top-2 text-[10px] font-mono text-slate-500 font-semibold">
          {chartMode === 'EQUITY' ? `Max: $${maxBal.toFixed(0)}` : `Peak: 0.0%`}
        </div>
        <div className="absolute left-3 bottom-2 text-[10px] font-mono text-slate-500 font-semibold">
          {chartMode === 'EQUITY' ? `Min: $${minBal.toFixed(0)}` : `Max DD: -${maxDrawdownPercent.toFixed(1)}%`}
        </div>
      </div>

      {/* Footer Info & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 border-t border-white/[0.06] text-xs text-slate-400">
        <span className="flex items-center gap-1.5" suppressHydrationWarning>
          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
          <span>{points[0].date} — {points[points.length - 1].date}</span>
        </span>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="text-slate-300">
            Max Drawdown: <strong className="text-rose-400">-{maxDrawdownPercent.toFixed(1)}%</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">
            Total Selesai: <strong className="text-white">{closedTrades.length}</strong>
          </span>
        </div>
      </div>

    </div>
  );
};
