'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trade, TradingAccount } from '@/lib/types';
import { initialAccount, initialTrades } from '@/lib/mockData';
import { MarketTicker } from '@/components/MarketTicker';
import { Navbar } from '@/components/Navbar';
import { AccountSwitcher } from '@/components/AccountSwitcher';
import { MetricsCards } from '@/components/MetricsCards';
import { EquityCurveChart } from '@/components/EquityCurveChart';
import { TradingCalendar } from '@/components/TradingCalendar';
import { AnalyticsBreakdown } from '@/components/AnalyticsBreakdown';
import { TradesTable } from '@/components/TradesTable';
import { JournalDetailModal } from '@/components/JournalDetailModal';
import { SetupGuideModal } from '@/components/SetupGuideModal';
import { SupabaseConfigModal } from '@/components/SupabaseConfigModal';
import { 
  Terminal, 
  CheckCircle2, 
  Radio, 
  Database,
  ArrowUpRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function DashboardPage() {
  const [account, setAccount] = useState<TradingAccount | null>(initialAccount);
  const [accounts, setAccounts] = useState<TradingAccount[]>([
    { ...initialAccount, platform: 'MT4' }
  ]);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<number | 'ALL'>(initialAccount.account_number);
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [isTerminalOnline, setIsTerminalOnline] = useState<boolean>(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);

  // Modals state
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Filter state
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch latest data from API
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/trades');
      if (res.ok) {
        const json = await res.json();
        if (json.account) setAccount(json.account);
        if (json.accounts && json.accounts.length > 0) {
          setAccounts(json.accounts);
          if (json.accounts.length === 1) {
            setSelectedAccountNumber(json.accounts[0].account_number);
          }
        }
        if (json.trades && Array.isArray(json.trades)) setTrades(json.trades);
        if (json.meta) {
          setIsTerminalOnline(json.meta.isTerminalOnline);
          setIsSupabaseConnected(json.meta.isSupabaseConnected);
        }
      }
    } catch (err) {
      console.error('Failed to fetch trades data:', err);
    }
  }, []);

  // Poll every 3.5 seconds for live sync
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3500);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Filter trades by selected account
  const activeTrades = React.useMemo(() => {
    if (selectedAccountNumber === 'ALL' && accounts.length > 1) return trades;
    const target = typeof selectedAccountNumber === 'number' ? selectedAccountNumber : accounts[0]?.account_number;
    return target ? trades.filter((t) => t.account_number === target) : trades;
  }, [trades, selectedAccountNumber, accounts]);

  // Active account information
  const activeAccount = React.useMemo(() => {
    if (selectedAccountNumber === 'ALL' && accounts.length > 1) {
      const totalBal = accounts.reduce((acc, a) => acc + a.balance, 0);
      const totalEq = accounts.reduce((acc, a) => acc + a.equity, 0);
      return {
        ...account!,
        broker: `Multi-Account Portfolio (${accounts.length} Akun)`,
        account_number: 999999,
        balance: totalBal || account?.balance || 10000,
        equity: totalEq || account?.equity || 10000,
      };
    }
    return accounts.find((a) => a.account_number === selectedAccountNumber) || accounts[0] || account;
  }, [accounts, selectedAccountNumber, account]);

  const handleSelectTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsJournalModalOpen(true);
  };

  const handleSaveJournal = async (ticket: number, updates: Partial<Trade>) => {
    try {
      const res = await fetch(`/api/trades/${ticket}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        setTrades((prev) =>
          prev.map((t) => (t.ticket === ticket ? { ...t, ...updates } : t))
        );
        showNotification(`✅ Evaluasi jurnal tiket #${ticket} berhasil tersimpan ke Supabase!`);
      }
    } catch (err) {
      console.error('Failed to save journal:', err);
    }
  };

  const handleSimulateTrade = async () => {
    setIsSimulating(true);
    try {
      const mockTicket = Math.floor(9800000 + Math.random() * 99999);
      const isGold = Math.random() > 0.4;
      const symbol = isGold ? 'XAUUSD' : 'EURUSD';
      const isBuy = Math.random() > 0.5;
      const openPrice = isGold ? +(2640 + Math.random() * 30).toFixed(2) : +(1.0800 + Math.random() * 0.0080).toFixed(5);
      const isWin = Math.random() > 0.3;
      const profit = isWin ? +(180 + Math.random() * 650).toFixed(2) : +(-90 - Math.random() * 250).toFixed(2);

      const simAccountNumber = initialAccount.account_number;
      const simBroker = 'PT QuickPro Berjangka Indonesia';

      const mockPayload = {
        account: {
          accountNumber: simAccountNumber,
          platform: 'MT4' as const,
          broker: simBroker,
          currency: 'USD',
          balance: (activeAccount?.balance || 19.74) + profit,
          equity: (activeAccount?.equity || 19.74) + profit,
          leverage: 500,
          server: 'Live',
        },
        trades: [
          {
            ticket: mockTicket,
            symbol,
            type: isBuy ? 'BUY' : 'SELL',
            lots: 0.5,
            openPrice,
            openTime: new Date(Date.now() - 3600000 * 2).toISOString(),
            closePrice: isGold ? +(openPrice + (isWin ? 9.5 : -5.0)).toFixed(2) : +(openPrice + (isWin ? 0.0025 : -0.0015)).toFixed(5),
            closeTime: new Date().toISOString(),
            sl: +(openPrice - 5.0).toFixed(2),
            tp: +(openPrice + 12.0).toFixed(2),
            profit,
            commission: -3.5,
            swap: 0,
            netPnl: +(profit - 3.5).toFixed(2),
            magicNumber: 110294,
            comment: 'Live MT4 Auto-Sync',
            status: 'CLOSED' as const,
          },
          ...trades.slice(0, 10).map((t) => ({
            ticket: t.ticket,
            symbol: t.symbol,
            type: t.trade_type,
            lots: t.lots,
            openPrice: t.open_price,
            openTime: t.open_time,
            closePrice: t.close_price,
            closeTime: t.close_time,
            sl: t.stop_loss,
            tp: t.take_profit,
            profit: t.profit,
            commission: t.commission,
            swap: t.swap,
            netPnl: t.net_pnl,
            magicNumber: t.magic_number,
            comment: t.mt_comment || '',
            status: t.status,
          })),
        ],
        syncedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/trades/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'trader-demo-secret-key',
        },
        body: JSON.stringify(mockPayload),
      });

      if (res.ok) {
        await fetchData();
        showNotification(`⚡ Trade baru [MT4 #${simAccountNumber}] (${symbol} ${profit >= 0 ? '+$' + profit : '-$' + Math.abs(profit)}) otomatis tercatat di Supabase!`);
      }
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen trading-bg-glow text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-300">
      
      {/* 1. Live Market Ticker */}
      <MarketTicker />

      {/* 2. Top Navigation Bar */}
      <Navbar
        account={activeAccount}
        isTerminalOnline={isTerminalOnline}
        isSupabaseConnected={isSupabaseConnected}
        onRefresh={fetchData}
        onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onSimulateTrade={handleSimulateTrade}
        isSimulating={isSimulating}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900/95 border border-emerald-500/40 text-emerald-300 shadow-2xl backdrop-blur-xl text-xs font-semibold">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Trading Performance Dashboard
              </h1>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Multi-Account MT4 & MT5
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Mendukung pemisahan akun <strong className="text-blue-400 font-bold">MetaTrader 4</strong> dan <strong className="text-emerald-400 font-bold">MetaTrader 5</strong> secara terpisah atau digabung dalam satu portofolio.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsSetupGuideOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 hover:border-slate-500 text-xs font-bold text-slate-200 transition-all shadow-sm"
            >
              <Terminal className="h-4 w-4 text-blue-400" />
              <span>Instruksi EA</span>
            </button>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 hover:border-slate-500 text-xs font-bold text-slate-200 transition-all shadow-sm"
            >
              <Database className="h-4 w-4 text-emerald-400" />
              <span>Supabase Schema</span>
            </button>
          </div>
        </div>

        {/* 3. Multi-Account Switcher Bar */}
        <AccountSwitcher
          accounts={accounts}
          selectedAccountNumber={selectedAccountNumber}
          onSelectAccount={setSelectedAccountNumber}
          onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
        />

        {/* 4. Core KPI Cards (Filtered by active account) */}
        <MetricsCards 
          trades={activeTrades} 
          accountBalance={activeAccount?.balance || 10000} 
        />

        {/* 5. Equity Growth Curve & Daily PnL Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <EquityCurveChart 
              trades={activeTrades} 
              currentBalance={activeAccount?.balance || 10000} 
            />
          </div>

          <div className="lg:col-span-5">
            <TradingCalendar 
              trades={activeTrades} 
              selectedDate={selectedDateFilter} 
              onSelectDate={setSelectedDateFilter} 
            />
          </div>
        </div>

        {/* 6. Deep Analytics: Strategy, Emotion & SOP Impact */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">
              Analisa Mendalam & Psikologi Trader
            </h3>
            <span className="text-xs text-slate-500">
              {selectedAccountNumber === 'ALL' ? 'Portofolio Gabungan' : `Akun #${selectedAccountNumber}`}
            </span>
          </div>
          <AnalyticsBreakdown trades={activeTrades} />
        </div>

        {/* 7. Comprehensive Trades Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Riwayat Transaksi & Evaluasi Jurnal
              </h2>
              <p className="text-xs text-slate-400">
                Menampilkan transaksi {selectedAccountNumber === 'ALL' ? 'seluruh akun' : `khusus akun #${selectedAccountNumber}`}
              </p>
            </div>
          </div>

          <TradesTable
            trades={activeTrades}
            onSelectTrade={handleSelectTrade}
            selectedDateFilter={selectedDateFilter}
            onClearDateFilter={() => setSelectedDateFilter(null)}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-6 bg-[#070A0F] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-300">TradeSync Pro Journal</span>
            <span>•</span>
            <span>Multi-Account MT4 & MT5 Auto-Sync with Supabase</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-slate-400">MT4 EA: <code className="text-blue-400">TradeJournalBridge.mq4</code></span>
            <span>•</span>
            <span className="text-slate-400">MT5 EA: <code className="text-emerald-400">TradeJournalBridge.mq5</code></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <JournalDetailModal
        trade={selectedTrade}
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        onSave={handleSaveJournal}
      />

      <SetupGuideModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
        apiKey={activeAccount?.api_key || 'trader-demo-secret-key'}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        isSupabaseConnected={isSupabaseConnected}
      />

    </div>
  );
}
