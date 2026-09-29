export type TradeType = 'BUY' | 'SELL' | 'BUY_LIMIT' | 'SELL_LIMIT' | 'BUY_STOP' | 'SELL_STOP';
export type TradeStatus = 'OPEN' | 'CLOSED';
export type TradingPlatform = 'MT4' | 'MT5';

export interface Trade {
  id?: string;
  ticket: number;
  account_number: number;
  platform?: TradingPlatform;
  symbol: string;
  trade_type: TradeType;
  lots: number;
  open_price: number;
  open_time: string;
  close_price: number | null;
  close_time: string | null;
  stop_loss: number;
  take_profit: number;
  profit: number;
  commission: number;
  swap: number;
  net_pnl: number;
  magic_number: number;
  mt_comment?: string;
  status: TradeStatus;
  
  // Custom Journal metadata
  strategy_tag?: string;
  session?: 'Asian' | 'London' | 'New York' | 'Overlap';
  emotion?: 'Disciplined' | 'FOMO' | 'Revenge Trade' | 'Hesitant' | 'Overconfident';
  rules_followed?: boolean;
  journal_notes?: string;
  screenshot_url?: string;
  pips?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TradingAccount {
  id?: string;
  account_number: number;
  platform?: TradingPlatform;
  broker: string;
  server_name?: string;
  currency: string;
  balance: number;
  equity: number;
  leverage: number;
  api_key: string;
  is_active?: boolean;
  last_synced_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SyncPayload {
  account: {
    accountNumber: number;
    platform?: TradingPlatform;
    broker: string;
    currency: string;
    balance: number;
    equity: number;
    leverage: number;
    server?: string;
  };
  trades: Array<{
    ticket: number;
    symbol: string;
    type: TradeType;
    lots: number;
    openPrice: number;
    openTime: string;
    closePrice: number | null;
    closeTime: string | null;
    sl: number;
    tp: number;
    profit: number;
    commission: number;
    swap: number;
    netPnl: number;
    magicNumber: number;
    comment: string;
    status: TradeStatus;
  }>;
  syncedAt: string;
}

export interface JournalStats {
  netProfit: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  totalLots: number;
  bestTrade: number;
  worstTrade: number;
  averageTrade: number;
  currentOpenPositions: number;
  floatingPnl: number;
}
