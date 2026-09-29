import { initialAccount, initialTrades } from './mockData';
import { supabase, isSupabaseConfigured } from './supabase';
import { SyncPayload, Trade, TradingAccount } from './types';
import { saveTradeToPostgres, getTradesFromPostgres, updateJournalInPostgres, getAllAccountsFromPostgres, pool } from './db';

const defaultAccounts: TradingAccount[] = [
  {
    ...initialAccount,
    platform: 'MT4',
  }
];

// Global memory cache for development & fallback
declare global {
  // eslint-disable-next-line no-var
  var __GLOBAL_TRADES__: Trade[] | undefined;
  // eslint-disable-next-line no-var
  var __GLOBAL_ACCOUNTS__: TradingAccount[] | undefined;
  // eslint-disable-next-line no-var
  var __LAST_PING_TIME__: number | undefined;
}

if (!global.__GLOBAL_TRADES__) {
  global.__GLOBAL_TRADES__ = initialTrades.map((t) => ({
    ...t,
    platform: 'MT4',
    account_number: initialAccount.account_number,
  }));
}
if (!global.__GLOBAL_ACCOUNTS__) {
  global.__GLOBAL_ACCOUNTS__ = [...defaultAccounts];
}
if (!global.__LAST_PING_TIME__) {
  global.__LAST_PING_TIME__ = Date.now();
}

export async function getAllAccounts(): Promise<TradingAccount[]> {
  let list: TradingAccount[] = [];

  // 1. Try Direct PostgreSQL
  if (pool) {
    try {
      const pgAccounts = await getAllAccountsFromPostgres();
      if (pgAccounts && pgAccounts.length > 0) {
        list = pgAccounts;
      }
    } catch {
      // Ignore and fallback
    }
  }

  // 2. Try Supabase REST client
  if (list.length === 0 && isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        list = data.map((d) => ({
          id: d.id,
          account_number: Number(d.account_number),
          platform: (d.platform || 'MT4') as any,
          broker: d.broker,
          server_name: d.server_name,
          currency: d.currency,
          balance: Number(d.balance),
          equity: Number(d.equity),
          leverage: Number(d.leverage),
          api_key: d.api_key,
          is_active: d.is_active,
          last_synced_at: d.updated_at,
        }));
      }
    } catch (err) {
      console.warn('[Supabase] Failed to fetch accounts:', err);
    }
  }

  if (list.length === 0) {
    list = global.__GLOBAL_ACCOUNTS__ || defaultAccounts;
  }

  // Hanya izinkan akun riil MT4 10474893
  const targetAcc = list.find((a) => a.account_number === 10474893);
  if (targetAcc) {
    return [targetAcc];
  }
  return [initialAccount];
}

export async function getAccounts(): Promise<TradingAccount> {
  const accounts = await getAllAccounts();
  return accounts[0] || initialAccount;
}

export async function getTrades(): Promise<Trade[]> {
  // 1. Try Direct PostgreSQL
  if (pool) {
    try {
      const pgTrades = await getTradesFromPostgres();
      if (pgTrades !== null) {
        return pgTrades.filter((t) => t.account_number === 10474893);
      }
    } catch {
      // Ignore and fallback
    }
  }

  // 2. Try Supabase REST
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('account_number', 10474893)
        .order('open_time', { ascending: false });

      if (!error && data !== null) {
        return data.map((d) => ({
          id: d.id,
          ticket: Number(d.ticket),
          account_number: Number(d.account_number),
          platform: (d.platform || 'MT4') as any,
          symbol: d.symbol,
          trade_type: d.trade_type,
          lots: Number(d.lots),
          open_price: Number(d.open_price),
          open_time: d.open_time,
          close_price: d.close_price !== null ? Number(d.close_price) : null,
          close_time: d.close_time,
          stop_loss: Number(d.stop_loss || 0),
          take_profit: Number(d.take_profit || 0),
          profit: Number(d.profit || 0),
          commission: Number(d.commission || 0),
          swap: Number(d.swap || 0),
          net_pnl: Number(d.net_pnl || 0),
          magic_number: Number(d.magic_number || 0),
          mt_comment: d.mt_comment,
          status: d.status,
          strategy_tag: d.strategy_tag,
          session: d.session,
          emotion: d.emotion,
          rules_followed: d.rules_followed,
          journal_notes: d.journal_notes,
          screenshot_url: d.screenshot_url,
          created_at: d.created_at,
          updated_at: d.updated_at,
        }));
      }
    } catch (err) {
      console.warn('[Supabase] Failed to fetch trades:', err);
    }
  }

  const memoryTrades = global.__GLOBAL_TRADES__ || [];
  return memoryTrades.filter((t) => t.account_number === 10474893);
}


export async function syncFromMetaTrader(payload: SyncPayload, apiKey: string) {
  global.__LAST_PING_TIME__ = Date.now();
  const acc = payload.account;
  const platform = acc.platform || (payload.trades?.some(t => t.magicNumber !== undefined) ? 'MT4' : 'MT5');

  // 1. Update in-memory account (Single Connected MT4 Account Mode)
  const updatedAccount: TradingAccount = {
    account_number: acc.accountNumber,
    platform: 'MT4',
    broker: acc.broker || 'QuickPro MT4 Terminal',
    server_name: acc.serverName || acc.server || 'Live',
    currency: acc.currency || 'USD',
    balance: acc.balance,
    equity: acc.equity,
    leverage: acc.leverage || 100,
    api_key: apiKey,
    is_active: true,
    last_synced_at: payload.syncedAt || new Date().toISOString(),
  };

  // Fokuskan web journal HANYA pada 1 akun MT4 ini
  global.__GLOBAL_ACCOUNTS__ = [updatedAccount];

  // 2. Format trades
  const incomingTrades: Trade[] = (payload.trades || []).map((t) => ({
    id: `ticket-${t.ticket}`,
    ticket: t.ticket,
    account_number: acc.accountNumber,
    platform: 'MT4',
    symbol: t.symbol,
    trade_type: t.type,
    lots: t.lots,
    open_price: t.openPrice,
    open_time: t.openTime,
    close_price: t.closePrice,
    close_time: t.closeTime,
    stop_loss: t.sl,
    take_profit: t.tp,
    profit: t.profit,
    commission: t.commission,
    swap: t.swap,
    net_pnl: t.netPnl,
    magic_number: t.magicNumber,
    mt_comment: t.comment,
    status: t.status,
  }));

  // Merge into in-memory store (filter out any dummy accounts)
  const existingMap = new Map<number, Trade>();
  (global.__GLOBAL_TRADES__ || [])
    .filter((t) => t.account_number === acc.accountNumber)
    .forEach((t) => existingMap.set(t.ticket, t));

  incomingTrades.forEach((incoming) => {
    const existing = existingMap.get(incoming.ticket);
    if (existing) {
      existingMap.set(incoming.ticket, {
        ...incoming,
        id: existing.id || incoming.id,
        platform: incoming.platform || existing.platform,
        strategy_tag: existing.strategy_tag || incoming.strategy_tag,
        session: existing.session || incoming.session,
        emotion: existing.emotion || incoming.emotion,
        rules_followed: existing.rules_followed ?? true,
        journal_notes: existing.journal_notes || incoming.journal_notes,
        screenshot_url: existing.screenshot_url || incoming.screenshot_url,
      });
    } else {
      existingMap.set(incoming.ticket, incoming);
    }
  });

  global.__GLOBAL_TRADES__ = Array.from(existingMap.values()).sort(
    (a, b) => new Date(b.open_time).getTime() - new Date(a.open_time).getTime()
  );

  // 3. Upsert to Direct Postgres
  try {
    await saveTradeToPostgres({ ...payload, account: { ...acc, platform: platform as any } }, apiKey);
  } catch (err) {
    console.warn('[Postgres Sync Warning]:', err);
  }

  return {
    success: true,
    totalTradesSynced: incomingTrades.length,
    account: updatedAccount,
    timestamp: new Date().toISOString(),
  };
}

export async function updateTradeJournal(
  ticket: number,
  updates: Partial<Pick<Trade, 'strategy_tag' | 'session' | 'emotion' | 'rules_followed' | 'journal_notes' | 'screenshot_url'>>
) {
  // Update in memory
  if (global.__GLOBAL_TRADES__) {
    global.__GLOBAL_TRADES__ = global.__GLOBAL_TRADES__.map((t) => {
      if (t.ticket === ticket) {
        return { ...t, ...updates, updated_at: new Date().toISOString() };
      }
      return t;
    });
  }

  // Update in Direct Postgres
  try {
    await updateJournalInPostgres(ticket, updates);
  } catch (err) {
    console.warn('[Postgres Update Trade Journal Warning]:', err);
  }

  return { success: true };
}

export function getLastPingAgeSeconds(): number {
  const last = global.__LAST_PING_TIME__ || 0;
  return Math.round((Date.now() - last) / 1000);
}
