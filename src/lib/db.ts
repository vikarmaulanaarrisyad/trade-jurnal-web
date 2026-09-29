import { Pool } from 'pg';
import { SyncPayload, Trade, TradingAccount } from './types';

if (process.env.NODE_ENV !== 'production' || !process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

// Singleton Pool across HMR in development
declare global {
  // eslint-disable-next-line no-var
  var __PG_POOL__: Pool | undefined;
}

if (!global.__PG_POOL__ && connectionString) {
  global.__PG_POOL__ = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

export const pool = global.__PG_POOL__;

/**
 * Simpan transaksi dan update akun trading langsung ke PostgreSQL Supabase
 */
export async function saveTradeToPostgres(payload: SyncPayload, apiKey: string): Promise<boolean> {
  if (!pool) return false;

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const acc = payload.account;
    const platform = acc.platform || 'MT4';

    // 1. Upsert Akun
    await client.query(`
      INSERT INTO public.trading_accounts (
        account_number, platform, broker, server_name, currency, balance, equity, leverage, api_key, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (account_number) DO UPDATE SET
        platform = COALESCE(EXCLUDED.platform, trading_accounts.platform),
        broker = EXCLUDED.broker,
        server_name = EXCLUDED.server_name,
        currency = EXCLUDED.currency,
        balance = EXCLUDED.balance,
        equity = EXCLUDED.equity,
        leverage = EXCLUDED.leverage,
        updated_at = NOW();
    `, [
      acc.accountNumber,
      platform,
      acc.broker || 'MetaTrader Broker',
      acc.server || 'Live',
      acc.currency || 'USD',
      acc.balance,
      acc.equity,
      acc.leverage || 100,
      apiKey
    ]);

    // 2. Upsert Transaksi
    for (const t of payload.trades) {
      await client.query(`
        INSERT INTO public.trades (
          account_number, platform, ticket, symbol, trade_type, lots, open_price, open_time,
          close_price, close_time, stop_loss, take_profit, profit, commission,
          swap, net_pnl, magic_number, mt_comment, status, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, NOW()
        )
        ON CONFLICT (account_number, ticket) DO UPDATE SET
          platform = COALESCE(EXCLUDED.platform, trades.platform),
          close_price = EXCLUDED.close_price,
          close_time = EXCLUDED.close_time,
          stop_loss = EXCLUDED.stop_loss,
          take_profit = EXCLUDED.take_profit,
          profit = EXCLUDED.profit,
          commission = EXCLUDED.commission,
          swap = EXCLUDED.swap,
          net_pnl = EXCLUDED.net_pnl,
          status = EXCLUDED.status,
          updated_at = NOW();
      `, [
        acc.accountNumber,
        platform,
        t.ticket,
        t.symbol,
        t.type,
        t.lots,
        t.openPrice,
        t.openTime,
        t.closePrice,
        t.closeTime,
        t.sl || 0,
        t.tp || 0,
        t.profit || 0,
        t.commission || 0,
        t.swap || 0,
        t.netPnl || 0,
        t.magicNumber || 0,
        t.comment || '',
        t.status
      ]);
    }

    await client.query('COMMIT');
    console.log(`✅ [Supabase Postgres] Berhasil menyimpan ${payload.trades.length} transaksi untuk akun #${acc.accountNumber} (${platform})!`);
    return true;
  } catch (err: any) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('❌ [Supabase Postgres] Error saat save trade:', err?.message || err);
    return false;
  } finally {
    if (client) client.release();
  }
}

/**
 * Ambil semua akun trading terdaftar di PostgreSQL Supabase
 */
export async function getAllAccountsFromPostgres(): Promise<TradingAccount[] | null> {
  if (!pool) return null;

  try {
    const res = await pool.query(`SELECT * FROM public.trading_accounts ORDER BY updated_at DESC;`);
    return res.rows.map((row) => ({
      id: row.id,
      account_number: Number(row.account_number),
      platform: (row.platform || 'MT4') as any,
      broker: row.broker,
      server_name: row.server_name,
      currency: row.currency,
      balance: Number(row.balance),
      equity: Number(row.equity),
      leverage: Number(row.leverage),
      api_key: row.api_key,
      is_active: row.is_active,
      last_synced_at: row.updated_at,
    }));
  } catch (err: any) {
    console.warn('⚠️ [Supabase Postgres] Gagal query accounts:', err?.message || err);
    return null;
  }
}

/**
 * Ambil daftar transaksi langsung dari PostgreSQL Supabase
 */
export async function getTradesFromPostgres(): Promise<Trade[] | null> {
  if (!pool) return null;

  try {
    const res = await pool.query(`SELECT * FROM public.trades ORDER BY open_time DESC;`);
    return res.rows.map((r) => ({
      id: r.id,
      ticket: Number(r.ticket),
      account_number: Number(r.account_number),
      platform: (r.platform || 'MT4') as any,
      symbol: r.symbol,
      trade_type: r.trade_type,
      lots: Number(r.lots),
      open_price: Number(r.open_price),
      open_time: r.open_time,
      close_price: r.close_price !== null ? Number(r.close_price) : null,
      close_time: r.close_time,
      stop_loss: Number(r.stop_loss || 0),
      take_profit: Number(r.take_profit || 0),
      profit: Number(r.profit || 0),
      commission: Number(r.commission || 0),
      swap: Number(r.swap || 0),
      net_pnl: Number(r.net_pnl || 0),
      magic_number: Number(r.magic_number || 0),
      mt_comment: r.mt_comment,
      status: r.status,
      strategy_tag: r.strategy_tag,
      session: r.session,
      emotion: r.emotion,
      rules_followed: r.rules_followed,
      journal_notes: r.journal_notes,
      screenshot_url: r.screenshot_url,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  } catch (err: any) {
    console.warn('⚠️ [Supabase Postgres] Gagal query trades:', err?.message || err);
    return null;
  }
}

/**
 * Update catatan evaluasi jurnal ke PostgreSQL Supabase
 */
export async function updateJournalInPostgres(
  ticket: number,
  updates: Partial<Pick<Trade, 'strategy_tag' | 'session' | 'emotion' | 'rules_followed' | 'journal_notes' | 'screenshot_url'>>
): Promise<boolean> {
  if (!pool) return false;

  try {
    await pool.query(`
      UPDATE public.trades SET
        strategy_tag = COALESCE($1, strategy_tag),
        session = COALESCE($2, session),
        emotion = COALESCE($3, emotion),
        rules_followed = COALESCE($4, rules_followed),
        journal_notes = COALESCE($5, journal_notes),
        screenshot_url = COALESCE($6, screenshot_url),
        updated_at = NOW()
      WHERE ticket = $7;
    `, [
      updates.strategy_tag || null,
      updates.session || null,
      updates.emotion || null,
      updates.rules_followed !== undefined ? updates.rules_followed : null,
      updates.journal_notes || null,
      updates.screenshot_url || null,
      ticket
    ]);
    return true;
  } catch (err: any) {
    console.error('❌ [Supabase Postgres] Gagal update jurnal:', err?.message || err);
    return false;
  }
}
