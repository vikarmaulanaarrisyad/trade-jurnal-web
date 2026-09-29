'use client';

import React, { useState, useEffect } from 'react';
import { Trade } from '@/lib/types';
import confetti from 'canvas-confetti';
import { 
  X, 
  Tag, 
  Smile, 
  Frown, 
  CheckCircle, 
  Save, 
  Image as ImageIcon, 
  Clock, 
  BookOpen,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Coins
} from 'lucide-react';

interface JournalDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: number, updates: Partial<Trade>) => Promise<void>;
}

export const JournalDetailModal: React.FC<JournalDetailModalProps> = ({
  trade,
  isOpen,
  onClose,
  onSave,
}) => {
  const [strategyTag, setStrategyTag] = useState('');
  const [session, setSession] = useState<'Asian' | 'London' | 'New York' | 'Overlap'>('London');
  const [emotion, setEmotion] = useState<'Disciplined' | 'FOMO' | 'Revenge Trade' | 'Hesitant' | 'Overconfident'>('Disciplined');
  const [rulesFollowed, setRulesFollowed] = useState(true);
  const [journalNotes, setJournalNotes] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (trade) {
      setStrategyTag(trade.strategy_tag || '');
      setSession(trade.session || 'London');
      setEmotion(trade.emotion || 'Disciplined');
      setRulesFollowed(trade.rules_followed ?? true);
      setJournalNotes(trade.journal_notes || '');
      setScreenshotUrl(trade.screenshot_url || '');
      setSaveSuccess(false);
    }
  }, [trade]);

  if (!isOpen || !trade) return null;

  const isBuy = trade.trade_type.includes('BUY');
  const isProfit = trade.net_pnl >= 0;

  const commonStrategies = [
    'SMC FVG Retest',
    'SMC Order Block',
    'Liquidity Sweep',
    'London Breakout',
    'Support / Resistance',
    'Trend Continuation',
    'Scalping M1/M5',
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(trade.ticket, {
        strategy_tag: strategyTag.trim() || undefined,
        session,
        emotion,
        rules_followed: rulesFollowed,
        journal_notes: journalNotes,
        screenshot_url: screenshotUrl.trim() || undefined,
      });

      // Confetti burst on profit trade save
      if (isProfit && typeof window !== 'undefined') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#3B82F6', '#F59E0B']
        });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Error saving journal:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0B0F19] border border-white/10 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between sticky top-0 bg-[#0B0F19]/95 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 border border-blue-500/30 text-blue-400 shadow-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Jurnal Transaksi #{trade.ticket}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isBuy
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {trade.trade_type}
                </span>
                <span className="text-sm font-bold text-slate-200">{trade.symbol}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Data teknis otomatis tersinkron dari MT4 • Lengkapi evaluasi psikologi & strategi Anda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-white/10 hover:border-slate-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body: Two-column Layout on Desktop */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Net Realized PnL</span>
              <span className={`text-xl font-extrabold font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isProfit ? '+' : ''}${trade.net_pnl.toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Volume Lot</span>
              <span className="text-xl font-extrabold font-mono text-white">
                {trade.lots.toFixed(2)} Lot
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Harga Entry</span>
              <span className="text-xl font-extrabold font-mono text-slate-200">
                {trade.open_price}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Harga Exit</span>
              <span className="text-xl font-extrabold font-mono text-slate-200">
                {trade.close_price !== null ? trade.close_price : 'Posisi Aktif'}
              </span>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* 1. Setup Strategy Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-blue-400" />
                <span>Strategi / Setup Konfirmasi</span>
              </label>
              <input
                type="text"
                value={strategyTag}
                onChange={(e) => setStrategyTag(e.target.value)}
                placeholder="Contoh: SMC FVG Retest, Order Block..."
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {commonStrategies.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStrategyTag(s)}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-white/[0.06] hover:border-slate-500 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Trading Session */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-400" />
                <span>Sesi Waktu Pasar</span>
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as any)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="London">London Session (14:00 - 22:00 WIB)</option>
                <option value="New York">New York Session (19:00 - 04:00 WIB)</option>
                <option value="Overlap">London - NY Overlap (Volatilitas Maksimal)</option>
                <option value="Asian">Asian / Tokyo Session (06:00 - 14:00 WIB)</option>
              </select>
            </div>

            {/* 3. Psychology & Emotion */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Smile className="h-4 w-4 text-amber-400" />
                <span>Psikologi & Keadaan Emosi</span>
              </label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value as any)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Disciplined">🟢 Disiplin (Tenang, Mematuhi Rules)</option>
                <option value="FOMO">🟡 FOMO (Takut Ketinggalan Candle Cepat)</option>
                <option value="Revenge Trade">🔴 Revenge Trade (Balas Dendam Sehabis Loss)</option>
                <option value="Hesitant">⚪ Ragu-ragu (Telat Entry / Kurang Yakin)</option>
                <option value="Overconfident">🟣 Overconfident (Lot Terlalu Besar)</option>
              </select>
            </div>

            {/* 4. Trading Plan Compliance Switch */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Kepatuhan Aturan / SOP</span>
              </label>
              <button
                type="button"
                onClick={() => setRulesFollowed(!rulesFollowed)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs transition-all shadow-sm ${
                  rulesFollowed
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                }`}
              >
                <span>{rulesFollowed ? '✅ Mematuhi Trading Plan & Risk Rules' : '❌ Melanggar Aturan / Emosional'}</span>
                <span className="text-[10px] underline font-semibold">Ubah</span>
              </button>
            </div>

          </div>

          {/* 5. Screenshot URL & Chart Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-cyan-400" />
              <span>Tautan Screenshot Chart (TradingView / Snapshot MT4)</span>
            </label>
            <input
              type="url"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="https://www.tradingview.com/x/... atau URL link gambar chart"
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {screenshotUrl && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 max-h-56 bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshotUrl}
                  alt="Chart Screenshot"
                  className="w-full h-56 object-cover"
                  onError={(e) => {
                    (e.target as any).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* 6. Journal Notes & Reflections */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Catatan Evaluasi Trader & Pelajaran</span>
            </label>
            <textarea
              rows={4}
              value={journalNotes}
              onChange={(e) => setJournalNotes(e.target.value)}
              placeholder="Kenapa Anda mengambil posisi ini? Apa yang berjalan dengan baik? Kesalahan teknis apa yang perlu dievaluasi untuk trade berikutnya?"
              className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed shadow-inner"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 border-t border-white/[0.08] bg-[#0B0F19]/95 flex items-center justify-between sticky bottom-0 z-20">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Tutup
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xl transition-all active:scale-95 ${
              saveSuccess
                ? 'bg-emerald-600 shadow-emerald-600/30'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan ke Cloud Supabase...
              </span>
            ) : saveSuccess ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Tersimpan di Supabase!
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-4 w-4" />
                Simpan Catatan Jurnal
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
