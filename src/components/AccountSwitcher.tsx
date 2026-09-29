'use client';

import React from 'react';
import { TradingAccount } from '@/lib/types';
import { Layers, ChevronDown, Check, Shield, Wallet, ArrowRight } from 'lucide-react';

interface AccountSwitcherProps {
  accounts: TradingAccount[];
  selectedAccountNumber: number | 'ALL';
  onSelectAccount: (accountNumber: number | 'ALL') => void;
  onOpenSetupGuide: () => void;
}

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  accounts,
  selectedAccountNumber,
  onSelectAccount,
  onOpenSetupGuide,
}) => {
  const currentAccount = accounts.find((a) => a.account_number === selectedAccountNumber);

  // Compute total combined balance & equity
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalEquity = accounts.reduce((acc, a) => acc + a.equity, 0);

  // Tampilan Elegan Khusus 1 Akun MT4 Terhubung
  if (accounts.length <= 1) {
    const acc = accounts[0] || currentAccount;
    return (
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl glass-card border border-white/[0.08] bg-slate-900/60 shadow-lg">
        {/* Left: Active MT4 Account Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-black bg-blue-500 text-white uppercase">
              {acc?.platform || 'MT4'}
            </span>
            <span className="font-bold text-sm text-white">{acc?.broker || 'QuickPro MT4 Terminal'}</span>
            <span className="font-mono text-xs text-blue-300 font-semibold">(#{acc?.account_number || 10474893})</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-[11px]">Terhubung ke MT4</span>
          </div>
        </div>

        {/* Right: Balance & Equity */}
        <div className="flex items-center justify-between sm:justify-end gap-5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">Balance:</span>
            <span className="font-mono font-bold text-sm text-white">
              ${(acc?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">Equity:</span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              ${(acc?.equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={onOpenSetupGuide}
            className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-medium bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 transition-all hover:bg-blue-500/20"
          >
            <span>Setup Bridge</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl glass-card border border-white/[0.08]">
      
      {/* Account Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-950/70 rounded-xl border border-white/10 text-xs">
        
        {/* All Accounts Tab */}
        <button
          onClick={() => onSelectAccount('ALL')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            selectedAccountNumber === 'ALL'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Gabungan (Semua Akun)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-white">
            {accounts.length}
          </span>
        </button>

        {/* Individual Account Tabs */}
        {accounts.map((acc) => {
          const isSelected = selectedAccountNumber === acc.account_number;
          const isMT5 = acc.platform === 'MT5';

          return (
            <button
              key={acc.account_number}
              onClick={() => onSelectAccount(acc.account_number)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 ${
                isSelected
                  ? isMT5
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {/* Platform Badge */}
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-extrabold uppercase ${
                  isMT5
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {acc.platform || 'MT4'}
              </span>

              <span>{acc.broker}</span>
              <span className="font-mono text-[11px] text-slate-300">
                (#{acc.account_number})
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Summary of Active View */}
      <div className="flex items-center justify-between sm:justify-end gap-4 px-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Modal Aktif:</span>
          <span className="font-mono font-bold text-white">
            ${(selectedAccountNumber === 'ALL' ? totalBalance : (currentAccount?.balance || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Equity:</span>
          <span className="font-mono font-bold text-emerald-400">
            ${(selectedAccountNumber === 'ALL' ? totalEquity : (currentAccount?.equity || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button
          onClick={onOpenSetupGuide}
          className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-medium"
        >
          <span>+ Hubungkan Akun Baru</span>
        </button>
      </div>

    </div>
  );
};
