'use client';

import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  FileCode, 
  ExternalLink, 
  Settings, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({
  isOpen,
  onClose,
  apiKey,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const syncUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/trades/sync` 
    : 'http://localhost:3000/api/trades/sync';

  const copyToClipboard = (text: string, type: 'url' | 'key') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#10141E] border border-dark-border shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-dark-border flex items-center justify-between sticky top-0 bg-[#10141E]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Panduan Menghubungkan MetaTrader 4 / 5
              </h2>
              <p className="text-xs text-dark-muted">
                Otomatisasi pengiriman order secara real-time ke web journal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-dark-card text-dark-muted hover:text-white border border-dark-border transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Quick Credential Cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* Sync URL */}
            <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
              <span className="text-[11px] font-medium text-dark-muted block mb-1">
                Webhook Sync URL (Untuk Input EA & Pengaturan WebRequest)
              </span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-emerald-400 truncate">
                  {syncUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(syncUrl, 'url')}
                  className="px-2.5 py-1 rounded-lg bg-dark-card border border-dark-border hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-1 transition-colors"
                >
                  {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedUrl ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* API Key */}
            <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
              <span className="text-[11px] font-medium text-dark-muted block mb-1">
                Journal API Key (Otentikasi Akun Anda)
              </span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-blue-400 truncate">
                  {apiKey}
                </code>
                <button
                  onClick={() => copyToClipboard(apiKey, 'key')}
                  className="px-2.5 py-1 rounded-lg bg-dark-card border border-dark-border hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-1 transition-colors"
                >
                  {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step by Step */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Langkah Pemasangan (Hanya 3 Menit):
            </h3>

            {/* Step 1 */}
            <div className="flex gap-3.5 items-start">
              <div className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-blue-500/30">
                1
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Salin File EA ke Folder MetaTrader</h4>
                <p className="text-xs text-dark-muted leading-relaxed">
                  File Expert Advisor sudah kami buatkan siap pakai di direktori proyek ini:
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-300">
                    d:/MT4/Experts/TradeJournalBridge.mq4 (Untuk MT4)
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                    d:/MT4/Experts/TradeJournalBridge.mq5 (Untuk MT5)
                  </span>
                </div>
                <p className="text-xs text-slate-400 pt-1">
                  Buka MT4/MT5 -&gt; menu <strong>File</strong> -&gt; <strong>Open Data Folder</strong> -&gt; buka folder <code>MQL4/Experts</code> (atau <code>MQL5/Experts</code>) dan salin file tersebut ke sana.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3.5 items-start">
              <div className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-blue-500/30">
                2
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Izinkan WebRequest di Pengaturan MT4 / MT5</h4>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Agar MetaTrader diizinkan mengirim sinyal HTTP Webhook ke web ini:
                </p>
                <ul className="text-xs text-slate-300 list-disc list-inside space-y-1 pl-1">
                  <li>Buka menu <strong>Tools</strong> -&gt; <strong>Options</strong> (atau tekan <code>Ctrl + O</code>).</li>
                  <li>Pilih tab <strong>Expert Advisors</strong>.</li>
                  <li>Centang opsi <strong>"Allow WebRequest for listed URL"</strong>.</li>
                  <li>Klik tombol tanda tambah (+) dan tambahkan: <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">http://localhost:3000</code> (atau domain live Anda).</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3.5 items-start">
              <div className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-blue-500/30">
                3
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Pasang EA ke Chart</h4>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Pada panel <strong>Navigator</strong> di MT4/MT5, klik kanan lalu pilih <strong>Refresh</strong>. Drag EA <code>TradeJournalBridge</code> ke chart pair apa saja (cukup 1 chart saja).
                </p>
                <p className="text-xs text-slate-400">
                  Pastikan tombol <strong>AutoTrading</strong> (MT4) atau <strong>Algo Trading</strong> (MT5) di toolbar atas berwarna hijau menyala.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3.5 items-start">
              <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-500/30">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Selesai! Otomatisasi Aktif</h4>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Setiap kali Anda open order, pasang SL/TP, atau close trade di MT4/MT5, data transaksi langsung tercatat seketika di dashboard ini dan database Supabase tanpa perlu Anda ketik manual sama sekali!
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-dark-border bg-dark-bg/80 flex items-center justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all"
          >
            Saya Mengerti
          </button>
        </div>

      </div>
    </div>
  );
};
