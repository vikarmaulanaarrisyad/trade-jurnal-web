'use client';

import React, { useState } from 'react';
import { Trade } from '@/lib/types';
import { 
  Search, 
  ExternalLink, 
  Tag, 
  Smile, 
  Frown, 
  AlertCircle, 
  FileEdit,
  ArrowRight,
  Sparkles,
  X,
  CheckCircle,
  Coins
} from 'lucide-react';

interface TradesTableProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
  selectedDateFilter?: string | null;
  onClearDateFilter?: () => void;
}

export const TradesTable: React.FC<TradesTableProps> = ({
  trades,
  onSelectTrade,
  selectedDateFilter,
  onClearDateFilter,
}) => {
  const [tab, setTab] = useState<'ALL' | 'OPEN' | 'CLOSED' | 'WIN' | 'LOSS'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL');

  const symbols = ['ALL', ...Array.from(new Set(trades.map((t) => t.symbol)))];

  const filteredTrades = trades.filter((t) => {
    if (tab === 'OPEN' && t.status !== 'OPEN') return false;
    if (tab === 'CLOSED' && t.status !== 'CLOSED') return false;
    if (tab === 'WIN' && (t.status !== 'CLOSED' || t.net_pnl <= 0)) return false;
    if (tab === 'LOSS' && (t.status !== 'CLOSED' || t.net_pnl >= 0)) return false;

    if (selectedSymbol !== 'ALL' && t.symbol !== selectedSymbol) return false;

    if (selectedDateFilter && t.close_time) {
      const d = new Date(t.close_time);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (key !== selectedDateFilter) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTicket = String(t.ticket).includes(q);
      const matchSymbol = t.symbol.toLowerCase().includes(q);
      const matchComment = (t.mt_comment || '').toLowerCase().includes(q);
      const matchTag = (t.strategy_tag || '').toLowerCase().includes(q);
      const matchNotes = (t.journal_notes || '').toLowerCase().includes(q);
      if (!matchTicket && !matchSymbol && !matchComment && !matchTag && !matchNotes) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="rounded-2xl glass-card overflow-hidden shadow-2xl border border-white/[0.08]">
      
      {/* Top Filter & Search Bar */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/40">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-white/10 overflow-x-auto text-xs">
          <button
            onClick={() => setTab('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              tab === 'ALL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua ({trades.length})
          </button>
          <button
            onClick={() => setTab('OPEN')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              tab === 'OPEN'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Posisi Aktif ({trades.filter((t) => t.status === 'OPEN').length})
          </button>
          <button
            onClick={() => setTab('CLOSED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              tab === 'CLOSED'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Selesai ({trades.filter((t) => t.status === 'CLOSED').length})
          </button>
          <button
            onClick={() => setTab('WIN')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-emerald-400 transition-all ${
              tab === 'WIN' ? 'bg-emerald-950/70 border border-emerald-500/40 shadow-sm' : 'hover:bg-slate-800/40'
            }`}
          >
            Wins ({trades.filter((t) => t.status === 'CLOSED' && t.net_pnl > 0).length})
          </button>
          <button
            onClick={() => setTab('LOSS')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-rose-400 transition-all ${
              tab === 'LOSS' ? 'bg-rose-950/70 border border-rose-500/40 shadow-sm' : 'hover:bg-slate-800/40'
            }`}
          >
            Losses ({trades.filter((t) => t.status === 'CLOSED' && t.net_pnl < 0).length})
          </button>
        </div>

        {/* Search & Symbol Selector */}
        <div className="flex items-center gap-3">
          {/* Symbol Select */}
          <div className="relative">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-slate-950/80 border border-white/10 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
            >
              {symbols.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'Semua Pair' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari tiket, simbol, setup, catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Date Filter Notification Banner */}
      {selectedDateFilter && (
        <div className="bg-blue-950/40 border-b border-blue-500/30 px-5 py-2.5 flex items-center justify-between text-xs text-blue-300">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            Menampilkan transaksi pada tanggal: <strong className="text-white font-mono">{selectedDateFilter}</strong>
          </span>
          <button
            onClick={onClearDateFilter}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700"
          >
            <X className="h-3.5 w-3.5" />
            Hapus Filter
          </button>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0b101c] text-slate-400 font-bold border-b border-white/[0.08] uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-4 px-4">Status / Tiket</th>
              <th className="py-4 px-3">Waktu Eksekusi</th>
              <th className="py-4 px-3">Instrumen</th>
              <th className="py-4 px-3 text-right">Volume</th>
              <th className="py-4 px-3 text-right">Entry / Exit</th>
              <th className="py-4 px-3 text-right">SL / TP</th>
              <th className="py-4 px-4 text-right">Net PnL ($)</th>
              <th className="py-4 px-4">Tag Jurnal / Mindset</th>
              <th className="py-4 px-4 text-center">Aksi Jurnal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-14 text-center text-slate-400">
                  <AlertCircle className="h-9 w-9 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-sm text-slate-300">Tidak ada transaksi yang sesuai.</p>
                  <p className="text-xs text-slate-500 mt-0.5">Ubah filter status atau kata kunci pencarian Anda.</p>
                </td>
              </tr>
            ) : (
              filteredTrades.map((t) => {
                const isOpen = t.status === 'OPEN';
                const isBuy = t.trade_type.includes('BUY');
                const isProfit = t.net_pnl >= 0;
                const isGold = t.symbol.includes('XAU');

                return (
                  <tr
                    key={t.ticket}
                    onClick={() => onSelectTrade(t)}
                    className="hover:bg-blue-600/[0.06] transition-colors cursor-pointer group"
                  >
                    {/* Status & Ticket */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {isOpen ? (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-600"></span>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                              #{t.ticket}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-extrabold ${
                              t.platform === 'MT5'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {t.platform || 'MT4'}
                            </span>
                          </div>
                          <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <span>{isOpen ? 'POSISI AKTIF' : 'SELESAI'}</span>
                            <span className="text-slate-600">•</span>
                            <span className="font-mono text-slate-400">#{t.account_number}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]" suppressHydrationWarning>
                      <div suppressHydrationWarning className="font-semibold text-slate-300">
                        {new Date(t.open_time).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {t.close_time && (
                        <div className="text-[10px] text-slate-500" suppressHydrationWarning>
                          {new Date(t.close_time).toLocaleDateString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </td>

                    {/* Instrument & Type */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            isBuy
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {t.trade_type}
                        </span>
                        <span className="font-bold text-white flex items-center gap-1">
                          {isGold && <Coins className="h-3 w-3 text-amber-400" />}
                          {t.symbol}
                        </span>
                      </div>
                      {t.mt_comment && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[140px] block mt-0.5 font-mono">
                          {t.mt_comment}
                        </span>
                      )}
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-200">
                      {t.lots.toFixed(2)} L
                    </td>

                    {/* Entry / Exit Price */}
                    <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                      <div>{t.open_price}</div>
                      {t.close_price !== null && (
                        <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                          <ArrowRight className="h-3 w-3 text-slate-600 inline" />
                          <span>{t.close_price}</span>
                        </div>
                      )}
                    </td>

                    {/* SL / TP */}
                    <td className="py-3.5 px-3 text-right font-mono text-[11px] text-slate-400">
                      <div>SL: {t.stop_loss > 0 ? t.stop_loss : '-'}</div>
                      <div>TP: {t.take_profit > 0 ? t.take_profit : '-'}</div>
                    </td>

                    {/* Net PnL */}
                    <td className="py-3.5 px-4 text-right">
                      <div
                        className={`text-sm font-extrabold font-mono ${
                          isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfit ? '+' : ''}${t.net_pnl.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        comm: ${t.commission.toFixed(1)} | swap: ${t.swap.toFixed(1)}
                      </div>
                    </td>

                    {/* Strategy Tag & Emotion */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {t.strategy_tag ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                            <Tag className="h-2.5 w-2.5" />
                            {t.strategy_tag}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Tambah Tag</span>
                        )}

                        {t.emotion && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              t.emotion === 'Disciplined'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {t.emotion === 'Disciplined' ? <Smile className="h-2.5 w-2.5" /> : <Frown className="h-2.5 w-2.5" />}
                            {t.emotion}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Edit Action Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTrade(t);
                        }}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-400 border border-white/10 group-hover:border-blue-500/40 transition-all shadow-sm"
                        title="Tulis Evaluasi Jurnal"
                      >
                        <FileEdit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="p-3.5 bg-slate-950/70 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
        <span>Menampilkan <strong className="text-white">{filteredTrades.length}</strong> transaksi</span>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          💡 Klik baris transaksi untuk membuka jurnal detail & analisa screenshot
        </span>
      </div>

    </div>
  );
};
