'use client';

import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Code
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSupabaseConnected: boolean;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  isSupabaseConnected,
}) => {
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const envSample = `# Tambahkan ke file web/.env.local :
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#10141E] border border-dark-border shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-dark-border flex items-center justify-between sticky top-0 bg-[#10141E]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isSupabaseConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Integrasi Database Supabase
              </h2>
              <p className="text-xs text-dark-muted">
                Penyimpanan cloud PostgreSQL dengan Supabase Realtime
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
        <div className="p-6 space-y-5">
          
          {/* Status banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isSupabaseConnected 
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
          }`}>
            {isSupabaseConnected ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <h4 className="font-semibold text-white">
                {isSupabaseConnected 
                  ? 'Supabase Terhubung & Aktif'
                  : 'Mode Cache Lokal / Standby Supabase'}
              </h4>
              <p className="text-dark-muted leading-relaxed">
                {isSupabaseConnected
                  ? 'Data trade otomatis tersimpan di tabel trades dan trading_accounts di project Supabase Anda.'
                  : 'Aplikasi saat ini berjalan menggunakan memory & cache lokal. Semua fitur visual & sinkronisasi bekerja lancar. Untuk menyimpan permanen ke cloud Supabase, ikuti 2 langkah di bawah:'}
              </p>
            </div>
          </div>

          {/* Steps to setup Supabase */}
          <div className="space-y-4 text-xs">
            
            {/* Step 1 */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-slate-800 text-blue-400 inline-flex items-center justify-center font-mono">1</span>
                Jalankan Skrip SQL di Supabase
              </h4>
              <p className="text-dark-muted">
                Buka <strong>Supabase Dashboard</strong> -&gt; <strong>SQL Editor</strong> -&gt; <strong>New Query</strong>, lalu paste isi file yang telah disiapkan di:
              </p>
              <div className="p-2.5 rounded-lg bg-dark-bg border border-dark-border font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                <span>d:/MT4/supabase_schema.sql</span>
                <span className="text-[10px] text-dark-muted">Tabel: trades, trading_accounts</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-slate-800 text-blue-400 inline-flex items-center justify-center font-mono">2</span>
                Tambahkan Kredensial ke web/.env.local
              </h4>
              <p className="text-dark-muted">
                Dapatkan Project URL dan Anon Key dari menu <strong>Project Settings -&gt; API</strong> di Supabase:
              </p>
              
              <div className="relative">
                <pre className="p-3 rounded-lg bg-dark-bg border border-dark-border font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {envSample}
                </pre>
                <button
                  onClick={copyEnv}
                  className="absolute right-2 top-2 p-1.5 rounded bg-dark-card border border-dark-border text-slate-400 hover:text-white transition-colors"
                  title="Salin contoh env"
                >
                  {copiedEnv ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-dark-border bg-dark-bg/80 flex items-center justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-dark-card border border-dark-border hover:bg-slate-800 text-white transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
