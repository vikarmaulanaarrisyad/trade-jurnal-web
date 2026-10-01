'use client';

import React, { useState, useMemo } from 'react';
import { Trade, TradingAccount } from '@/lib/types';
import { exportTradesToCSV } from '@/lib/exportUtils';
import { getTradeSource } from '@/lib/tradeHelper';
import { 
  X, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Award, 
  ShieldCheck,
  CheckCircle2,
  Filter
} from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: Trade[];
  accounts: TradingAccount[];
  selectedAccountNumber: number | 'ALL';
}

type DateRangeFilter = 'ALL' | 'TODAY' | '7DAYS' | 'THIS_MONTH';

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  trades,
  accounts,
  selectedAccountNumber,
}) => {
  const [dateRange, setDateRange] = useState<DateRangeFilter>('ALL');
  const [accountFilter, setAccountFilter] = useState<number | 'ALL'>(selectedAccountNumber);
  const [includeNotes, setIncludeNotes] = useState(true);

  if (!isOpen) return null;

  // Filter trades based on account and date range
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      // Filter Akun
      if (accountFilter !== 'ALL' && t.account_number !== accountFilter) {
        return false;
      }

      // Filter Tanggal
      if (dateRange !== 'ALL' && t.close_time) {
        const tradeDate = new Date(t.close_time);
        const now = new Date();

        if (dateRange === 'TODAY') {
          return (
            tradeDate.getDate() === now.getDate() &&
            tradeDate.getMonth() === now.getMonth() &&
            tradeDate.getFullYear() === now.getFullYear()
          );
        } else if (dateRange === '7DAYS') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return tradeDate >= sevenDaysAgo;
        } else if (dateRange === 'THIS_MONTH') {
          return (
            tradeDate.getMonth() === now.getMonth() &&
            tradeDate.getFullYear() === now.getFullYear()
          );
        }
      }

      return true;
    });
  }, [trades, accountFilter, dateRange]);

  // Performance calculations
  const totalTrades = filteredTrades.length;
  const closedTrades = filteredTrades.filter((t) => t.status === 'CLOSED');
  const winTrades = closedTrades.filter((t) => t.net_pnl > 0);
  const lossTrades = closedTrades.filter((t) => t.net_pnl < 0);
  const totalPnL = filteredTrades.reduce((acc, t) => acc + t.net_pnl, 0);
  const grossProfit = winTrades.reduce((acc, t) => acc + t.net_pnl, 0);
  const grossLoss = Math.abs(lossTrades.reduce((acc, t) => acc + t.net_pnl, 0));
  const winRate = closedTrades.length > 0 ? (winTrades.length / closedTrades.length) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0;
  
  const bestTrade = closedTrades.length > 0 ? Math.max(...closedTrades.map((t) => t.net_pnl)) : 0;
  const maxLoss = closedTrades.length > 0 ? Math.min(...closedTrades.map((t) => t.net_pnl)) : 0;

  // Active account metadata
  const currentAccount = accounts.find((a) => a.account_number === accountFilter) || accounts[0] || null;

  // Handle Export Excel / CSV
  const handleExportCSV = () => {
    exportTradesToCSV(filteredTrades, currentAccount, 'laporan_jurnal');
  };

  // Handle Print PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Ekspor Laporan Jurnal Trading
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  PDF &amp; Excel
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Download rekap riwayat transaksi, ringkasan kinerja, dan ledger pembukuan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Filter Toolbar */}
        <div className="p-4 bg-slate-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Account Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Akun:</span>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Akun ({accounts.length})</option>
              {accounts.map((a) => (
                <option key={a.account_number} value={a.account_number}>
                  Akun #{a.account_number} (${a.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-white/10">
            {[
              { id: 'ALL', label: 'Semua Waktu' },
              { id: 'THIS_MONTH', label: 'Bulan Ini' },
              { id: '7DAYS', label: '7 Hari Terakhir' },
              { id: 'TODAY', label: 'Hari Ini' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDateRange(d.id as DateRangeFilter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === d.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

        </div>

        {/* Modal Body: Printable Report Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 printable-area bg-slate-950/40">
          
          {/* Official Document Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Laporan Kinerja Resmi • MT4 Smart Money Concepts
              </div>
              <h2 className="text-lg font-black text-white">
                Rekapitulasi Jurnal Trading #{accountFilter === 'ALL' ? 'Portfolio Multi-Account' : accountFilter}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dicetak pada: {new Date().toLocaleString('id-ID')} • Broker: {currentAccount?.broker || 'QuickPro'}
              </p>
            </div>
            <div className="text-right font-mono sm:border-l sm:border-white/10 sm:pl-4">
              <div className="text-xs text-slate-400">Total Transaksi</div>
              <div className="text-xl font-black text-white">{filteredTrades.length} Order</div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10">
              <div className="text-[11px] text-slate-400 font-medium">Net Profit / Loss</div>
              <div className={`text-xl font-extrabold font-mono mt-1 ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10">
              <div className="text-[11px] text-slate-400 font-medium">Win Rate</div>
              <div className="text-xl font-extrabold font-mono mt-1 text-blue-400">
                {winRate.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500">{winTrades.length} Win / {lossTrades.length} Loss</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10">
              <div className="text-[11px] text-slate-400 font-medium">Profit Factor</div>
              <div className="text-xl font-extrabold font-mono mt-1 text-amber-400">
                {profitFactor > 90 ? 'MAX' : profitFactor.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500">+${grossProfit.toFixed(1)} / -${grossLoss.toFixed(1)}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10">
              <div className="text-[11px] text-slate-400 font-medium">Best Win Trade</div>
              <div className="text-xl font-extrabold font-mono mt-1 text-emerald-400">
                +${bestTrade.toFixed(2)}
              </div>
              <div className="text-[10px] text-rose-400">Max Loss: -${Math.abs(maxLoss).toFixed(2)}</div>
            </div>
          </div>

          {/* Table Preview */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900">
            <div className="p-3 bg-slate-950/80 border-b border-white/10 flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Rincian Buku Transaksi ({filteredTrades.length} Baris)</span>
              <span className="text-[11px] text-slate-500 font-normal">Format Standar Ledger MT4</span>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-white/10 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Tiket</th>
                    <th className="py-2.5 px-3">Waktu Buka</th>
                    <th className="py-2.5 px-3">Simbol</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3 text-right">Lot</th>
                    <th className="py-2.5 px-3 text-right">Entry ➔ Exit</th>
                    <th className="py-2.5 px-3">Setup</th>
                    <th className="py-2.5 px-4 text-right">Profit ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {filteredTrades.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500 font-sans">
                        Tidak ada transaksi pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredTrades.map((t) => {
                      const isProfit = t.net_pnl >= 0;
                      return (
                        <tr key={t.ticket} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 text-slate-400">#{t.ticket}</td>
                          <td className="py-2 px-3 text-slate-300 font-sans text-[11px]">
                            {t.open_time ? new Date(t.open_time).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="py-2 px-3 font-bold text-white font-sans">{t.symbol}</td>
                          <td className="py-2 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              t.trade_type.includes('BUY') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {t.trade_type}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-slate-300">{t.lots.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right text-slate-300">
                            {t.open_price} ➔ {t.close_price ?? '-'}
                          </td>
                          <td className="py-2 px-3 font-sans text-[11px] text-slate-400 truncate max-w-[130px]">
                            {t.strategy_tag || (t.magic_number ? 'Robot EA' : 'Manual')}
                          </td>
                          <td className={`py-2 px-4 text-right font-extrabold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? '+' : ''}${t.net_pnl.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-slate-950 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            Siap diekspor ke <strong className="text-white">Microsoft Excel (.CSV)</strong> atau <strong className="text-white">Dokumen PDF Resmi</strong>.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/10 transition-colors"
            >
              Batal
            </button>

            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download Excel (CSV)
            </button>

            <button
              onClick={handlePrintPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Printer className="h-4 w-4" />
              Cetak / Simpan PDF
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
