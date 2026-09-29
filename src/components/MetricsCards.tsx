'use client';

import React from 'react';
import { Trade } from '@/lib/types';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Scale, 
  Layers, 
  Zap, 
  Flame, 
  CheckCircle,
  Activity
} from 'lucide-react';

interface MetricsCardsProps {
  trades: Trade[];
  accountBalance: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ trades, accountBalance }) => {
  const closedTrades = trades.filter((t) => t.status === 'CLOSED');
  const openTrades = trades.filter((t) => t.status === 'OPEN');

  const winningTrades = closedTrades.filter((t) => t.net_pnl > 0);
  const losingTrades = closedTrades.filter((t) => t.net_pnl < 0);

  const totalClosedNetPnl = closedTrades.reduce((acc, t) => acc + t.net_pnl, 0);
  const floatingPnl = openTrades.reduce((acc, t) => acc + t.net_pnl, 0);

  const grossProfit = winningTrades.reduce((acc, t) => acc + t.net_pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.net_pnl, 0));

  const winRate = closedTrades.length > 0
    ? (winningTrades.length / closedTrades.length) * 100
    : 0;

  const profitFactor = grossLoss > 0
    ? grossProfit / grossLoss
    : grossProfit > 0 ? 99.9 : 0;

  const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
  const riskReward = avgLoss > 0 ? avgWin / avgLoss : 0;

  const totalLots = closedTrades.reduce((acc, t) => acc + t.lots, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
      
      {/* 1. Net Realized Profit */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card glass-card-hover relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
        
        <div className="flex items-center justify-between text-slate-400 mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Net Realized PnL
          </span>
          <div className={`p-2 rounded-xl ${totalClosedNetPnl >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'} shadow-sm`}>
            {totalClosedNetPnl >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
        </div>

        <div className="flex items-baseline gap-1 my-1">
          <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${totalClosedNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalClosedNetPnl >= 0 ? '+' : ''}${totalClosedNetPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06] text-[11px]">
          <span className="text-slate-400">Total Gain:</span>
          <span className="font-mono font-bold text-emerald-400">
            {accountBalance > 0 ? ((totalClosedNetPnl / accountBalance) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>

      {/* 2. Win Rate */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card glass-card-hover relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>

        <div className="flex items-center justify-between text-slate-400 mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Win Rate
          </span>
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 shadow-sm">
            <Target className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-1 my-1">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            {winRate.toFixed(1)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2.5 space-y-1">
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden flex shadow-inner">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 rounded-full" 
              style={{ width: `${winRate}%` }} 
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="text-emerald-400 font-semibold">{winningTrades.length} Wins</span>
            <span className="text-rose-400 font-semibold">{losingTrades.length} Losses</span>
          </div>
        </div>
      </div>

      {/* 3. Profit Factor */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card glass-card-hover relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>

        <div className="flex items-center justify-between text-slate-400 mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Profit Factor
          </span>
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shadow-sm">
            <Scale className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-1 my-1">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            {profitFactor.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06] text-[11px]">
          <span className="text-slate-400">Gross W/L:</span>
          <span className="font-mono text-slate-300">
            +${grossProfit.toFixed(0)} / -${grossLoss.toFixed(0)}
          </span>
        </div>
      </div>

      {/* 4. Risk : Reward Ratio */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card glass-card-hover relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-purple-500/20 transition-all"></div>

        <div className="flex items-center justify-between text-slate-400 mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Avg Risk:Reward
          </span>
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-1 my-1">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            1:{riskReward.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06] text-[11px]">
          <span className="text-slate-400">Avg Trade:</span>
          <span className="font-mono text-emerald-400">
            +${avgWin.toFixed(0)}
          </span>
        </div>
      </div>

      {/* 5. Total Volume & Executions */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card glass-card-hover relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-cyan-500/20 transition-all"></div>

        <div className="flex items-center justify-between text-slate-400 mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Volume & Trades
          </span>
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 shadow-sm">
            <Zap className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 my-1">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            {closedTrades.length}
          </span>
          <span className="text-xs text-slate-400 font-medium">Orders</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06] text-[11px]">
          <span className="text-slate-400">Total Volume:</span>
          <span className="font-mono text-cyan-300 font-semibold">
            {totalLots.toFixed(2)} Lot
          </span>
        </div>
      </div>

      {/* 6. Live Floating Positions */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card glass-card-hover relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>

        <div className="flex items-center justify-between text-slate-400 mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Live Floating
          </span>
          <div className="relative flex h-3.5 w-3.5">
            {openTrades.length > 0 ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-slate-600"></span>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-2 my-1">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            {openTrades.length}
          </span>
          <span className="text-xs text-slate-400 font-medium">Active Pos</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06] text-[11px]">
          <span className="text-slate-400">Floating:</span>
          <span className={`font-mono font-bold ${floatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {floatingPnl >= 0 ? '+' : ''}${floatingPnl.toFixed(2)}
          </span>
        </div>
      </div>

    </div>
  );
};
