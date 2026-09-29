'use client';

import React, { useState } from 'react';
import { Trade } from '@/lib/types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles, Trophy } from 'lucide-react';

interface TradingCalendarProps {
  trades: Trade[];
  onSelectDate?: (dateStr: string | null) => void;
  selectedDate?: string | null;
}

export const TradingCalendar: React.FC<TradingCalendarProps> = ({
  trades,
  onSelectDate,
  selectedDate,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Aggregate trades by YYYY-MM-DD
  const dailyStats = React.useMemo(() => {
    const map = new Map<string, { pnl: number; count: number; wins: number; losses: number }>();

    trades
      .filter((t) => t.status === 'CLOSED' && t.close_time)
      .forEach((t) => {
        const d = new Date(t.close_time!);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        const existing = map.get(key) || { pnl: 0, count: 0, wins: 0, losses: 0 };
        existing.pnl += t.net_pnl;
        existing.count += 1;
        if (t.net_pnl > 0) existing.wins += 1;
        else if (t.net_pnl < 0) existing.losses += 1;

        map.set(key, existing);
      });

    return map;
  }, [trades]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Compute month totals
  let monthProfit = 0;
  let greenDays = 0;
  let redDays = 0;

  dailyStats.forEach((stat, key) => {
    const [y, m] = key.split('-').map(Number);
    if (y === year && m === month + 1) {
      monthProfit += stat.pnl;
      if (stat.pnl > 0) greenDays++;
      else if (stat.pnl < 0) redDays++;
    }
  });

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div className="rounded-2xl glass-card p-5 sm:p-6 flex flex-col justify-between shadow-2xl relative">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-md">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Daily PnL Calendar</h3>
            <p className="text-xs text-slate-400">Distribusi hasil trading harian</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white font-mono bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
            {monthNames[month]} {year}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-white/10 hover:border-slate-500 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-white/10 hover:border-slate-500 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Capsule */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/60 border border-white/[0.06] mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Bulan Ini:</span>
          <span className={`font-mono font-bold ${monthProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {monthProfit >= 0 ? '+' : ''}${monthProfit.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-emerald-400 font-semibold">{greenDays} Hari Hijau</span>
          <span className="text-slate-600">•</span>
          <span className="text-rose-400 font-semibold">{redDays} Hari Merah</span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
        <span>Min</span>
        <span>Sen</span>
        <span>Sel</span>
        <span>Rab</span>
        <span>Kam</span>
        <span>Jum</span>
        <span>Sab</span>
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((dayNum, i) => {
          if (dayNum === null) {
            return <div key={`blank-${i}`} className="h-14 rounded-xl bg-slate-900/20" />;
          }

          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const stat = dailyStats.get(dateKey);
          const isSelected = selectedDate === dateKey;

          let bgClass = 'bg-slate-900/40 border-white/[0.05] text-slate-400 hover:border-slate-500';
          let pnlClass = 'text-slate-500';

          if (stat) {
            if (stat.pnl > 0) {
              bgClass = 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100 hover:border-emerald-400 shadow-sm shadow-emerald-500/10';
              pnlClass = 'text-emerald-400 font-bold';
            } else if (stat.pnl < 0) {
              bgClass = 'bg-rose-950/30 border-rose-500/40 text-rose-100 hover:border-rose-400 shadow-sm shadow-rose-500/10';
              pnlClass = 'text-rose-400 font-bold';
            } else {
              bgClass = 'bg-slate-800/50 border-slate-700 text-slate-300';
            }
          }

          if (isSelected) {
            bgClass += ' ring-2 ring-blue-500 border-blue-400 scale-[1.03] shadow-lg';
          }

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate?.(isSelected ? null : dateKey)}
              className={`h-14 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 relative group ${bgClass}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono font-bold">{dayNum}</span>
                {stat && (
                  <span className="text-[9px] px-1 py-0.2 rounded-full bg-slate-800/90 text-slate-300 font-mono">
                    {stat.count}t
                  </span>
                )}
              </div>

              {stat ? (
                <div className={`text-[10px] font-mono tracking-tight leading-none ${pnlClass}`}>
                  {stat.pnl >= 0 ? '+' : ''}${Math.round(stat.pnl)}
                </div>
              ) : (
                <div className="text-[9px] text-slate-700 font-mono">-</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06] text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50" />
            <span className="text-[11px]">Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/50" />
            <span className="text-[11px]">Loss</span>
          </div>
        </div>
        {selectedDate && (
          <button
            onClick={() => onSelectDate?.(null)}
            className="text-blue-400 hover:text-blue-300 hover:underline text-[11px] font-medium"
          >
            Reset Filter Tanggal
          </button>
        )}
      </div>

    </div>
  );
};
