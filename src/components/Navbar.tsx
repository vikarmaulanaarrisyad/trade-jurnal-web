'use client';

import React from 'react';
import { TradingAccount } from '@/lib/types';
import { 
  Terminal, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Radio,
  Zap,
  TrendingUp,
  ShieldCheck,
  Award
} from 'lucide-react';

interface NavbarProps {
  account: TradingAccount | null;
  isTerminalOnline: boolean;
  isSupabaseConnected: boolean;
  onRefresh: () => void;
  onOpenSetupGuide: () => void;
  onOpenSupabaseModal: () => void;
  onSimulateTrade: () => void;
  isSimulating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  account,
  isTerminalOnline,
  isSupabaseConnected,
  onRefresh,
  onOpenSetupGuide,
  onOpenSupabaseModal,
  onSimulateTrade,
  isSimulating,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#080B11]/85 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative h-10 w-10 rounded-xl bg-[#0B0F19] border border-white/10 flex items-center justify-center shadow-xl">
                <Zap className="h-5 w-5 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text">
                  TradeSync<span className="text-blue-500">.pro</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/30 shadow-sm">
                  MT4 / MT5 Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
                <span>Automated Trading Journal</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-mono text-[10px]">Cloud Supabase Active</span>
              </p>
            </div>
          </div>

          {/* Account Live Stat Capsule */}
          {account && (
            <div className="hidden lg:flex items-center gap-5 px-4 py-1.5 rounded-2xl bg-slate-900/60 border border-white/[0.08] shadow-inner backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div className="leading-tight">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                    {account.broker}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    #{account.account_number}
                  </span>
                </div>
              </div>

              <div className="h-5 w-px bg-white/10" />

              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Balance</span>
                <span className="text-xs font-mono font-bold text-white">
                  ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Equity</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  ${account.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                <Award className="h-3 w-3" />
                <span>1:{account.leverage}</span>
              </div>
            </div>
          )}

          {/* Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Supabase Status Pill */}
            <button
              onClick={onOpenSupabaseModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-slate-600 hover:text-slate-200'
              }`}
              title="Status Database Cloud Supabase"
            >
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-semibold">
                {isSupabaseConnected ? 'Supabase Live' : 'Supabase Setup'}
              </span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </button>

            {/* Quick Simulate MT4 Trade Button */}
            <button
              onClick={onSimulateTrade}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 border border-blue-500/30 hover:from-blue-600/30 hover:to-indigo-600/30 transition-all active:scale-95 shadow-sm"
              title="Kirim simulasi trade dari MetaTrader untuk tes live sync"
            >
              <Radio className={`h-3.5 w-3.5 text-blue-400 ${isSimulating ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Simulasi MT4</span>
            </button>

            {/* Connect EA Guide Modal Trigger */}
            <button
              onClick={onOpenSetupGuide}
              className="relative group flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all active:scale-95"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Pasang EA MT4/MT5</span>
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-900/60 text-slate-400 hover:text-white border border-white/10 hover:border-slate-500 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
