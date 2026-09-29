'use client';

import React from 'react';
import { Trade } from '@/lib/types';
import { Tag, Brain, Clock, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';

interface AnalyticsBreakdownProps {
  trades: Trade[];
}

export const AnalyticsBreakdown: React.FC<AnalyticsBreakdownProps> = ({ trades }) => {
  const closedTrades = trades.filter((t) => t.status === 'CLOSED');

  // 1. Group by Strategy
  const strategyStats = React.useMemo(() => {
    const map = new Map<string, { count: number; wins: number; pnl: number }>();
    closedTrades.forEach((t) => {
      const tag = t.strategy_tag || 'Standard MT4 Execution';
      const curr = map.get(tag) || { count: 0, wins: 0, pnl: 0 };
      curr.count++;
      if (t.net_pnl > 0) curr.wins++;
      curr.pnl += t.net_pnl;
      map.set(tag, curr);
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        winRate: (data.wins / data.count) * 100,
        pnl: data.pnl,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [closedTrades]);

  // 2. Group by Emotion / Mindset
  const emotionStats = React.useMemo(() => {
    const map = new Map<string, { count: number; wins: number; pnl: number }>();
    closedTrades.forEach((t) => {
      const emo = t.emotion || 'Disciplined';
      const curr = map.get(emo) || { count: 0, wins: 0, pnl: 0 };
      curr.count++;
      if (t.net_pnl > 0) curr.wins++;
      curr.pnl += t.net_pnl;
      map.set(emo, curr);
    });
    return Array.from(map.entries()).map(([emotion, data]) => ({
      emotion,
      count: data.count,
      winRate: (data.wins / data.count) * 100,
      pnl: data.pnl,
    }));
  }, [closedTrades]);

  // 3. Trading Plan SOP Compliance
  const sopFollowed = closedTrades.filter((t) => t.rules_followed ?? true);
  const sopViolated = closedTrades.filter((t) => t.rules_followed === false);
  const pnlFollowed = sopFollowed.reduce((acc, t) => acc + t.net_pnl, 0);
  const pnlViolated = sopViolated.reduce((acc, t) => acc + t.net_pnl, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* 1. Strategy Performance Leaderboard */}
      <div className="p-5 rounded-2xl glass-card flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                <Tag className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">Performa Strategi Setup</h4>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Win Rate</span>
          </div>

          <div className="space-y-3">
            {strategyStats.slice(0, 4).map((s) => (
              <div key={s.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium truncate max-w-[160px]">{s.name}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className={`font-bold ${s.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.pnl >= 0 ? '+' : ''}${s.pnl.toFixed(0)}
                    </span>
                    <span className="text-slate-400 text-[10px]">({s.winRate.toFixed(0)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(10, s.winRate))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 mt-4 border-t border-white/[0.06] text-[11px] text-slate-400 flex items-center justify-between">
          <span>Top Setup:</span>
          <span className="text-emerald-400 font-semibold">{strategyStats[0]?.name || 'N/A'}</span>
        </div>
      </div>

      {/* 2. Psychology & Trader Mindset */}
      <div className="p-5 rounded-2xl glass-card flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                <Brain className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">Korelasi Emosi & Hasil</h4>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">PnL ($)</span>
          </div>

          <div className="space-y-2.5">
            {emotionStats.map((e) => (
              <div
                key={e.emotion}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/[0.04] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${e.emotion === 'Disciplined' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-slate-300 font-medium">{e.emotion}</span>
                  <span className="text-[10px] text-slate-500">({e.count}t)</span>
                </div>
                <span className={`font-mono font-bold ${e.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {e.pnl >= 0 ? '+' : ''}${e.pnl.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 mt-4 border-t border-white/[0.06] text-[11px] text-slate-400">
          💡 <em>Disiplin menjaga drawdown tetap terkendali.</em>
        </div>
      </div>

      {/* 3. SOP & Rule Compliance */}
      <div className="p-5 rounded-2xl glass-card flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">Kepatuhan Trading Plan</h4>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">SOP Impact</span>
          </div>

          <div className="space-y-3">
            {/* Taat SOP */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Sesuai Rencana (SOP)
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {pnlFollowed >= 0 ? '+' : ''}${pnlFollowed.toFixed(2)}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400/80 font-mono">
                {sopFollowed.length} Transaksi ({((sopFollowed.length / Math.max(1, closedTrades.length)) * 100).toFixed(0)}% Disiplin)
              </span>
            </div>

            {/* Melanggar SOP */}
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-rose-300 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Melanggar SOP / FOMO
                </span>
                <span className="font-mono font-bold text-rose-400">
                  ${pnlViolated.toFixed(2)}
                </span>
              </div>
              <span className="text-[11px] text-rose-400/80 font-mono">
                {sopViolated.length} Transaksi Melanggar Rules
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 mt-4 border-t border-white/[0.06] text-[11px] text-slate-400 flex items-center justify-between">
          <span>Cost of Indiscipline:</span>
          <span className="text-rose-400 font-mono font-bold">
            ${Math.abs(pnlViolated).toFixed(2)}
          </span>
        </div>
      </div>

    </div>
  );
};
