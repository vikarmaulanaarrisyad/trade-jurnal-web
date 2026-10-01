import { Trade, TradingAccount } from './types';

export const initialAccount: TradingAccount = {
  account_number: 10474893,
  broker: 'PT QuickPro Berjangka Indonesia',
  server_name: 'Live',
  currency: 'USD',
  platform: 'MT4',
  balance: 41.41,
  equity: 41.41,
  leverage: 500,
  api_key: 'trader-demo-secret-key',
  is_active: true,
  last_synced_at: new Date().toISOString(),
};

export const initialTrades: Trade[] = [];

