import { Trade, TradingAccount } from './types';
import { getTradeSource } from './tradeHelper';

/**
 * Mengonversi array transaksi ke format CSV dengan BOM UTF-8 (kompatibel penuh dengan Microsoft Excel)
 */
export function exportTradesToCSV(trades: Trade[], account: TradingAccount | null, filenamePrefix = 'jurnal_trading'): void {
  if (!trades || trades.length === 0) {
    alert('Tidak ada data transaksi untuk diekspor.');
    return;
  }

  // Header info akun
  const accNum = account?.account_number ? String(account.account_number) : 'Multi-Account';
  const broker = account?.broker || 'QuickPro MT4';
  const balance = account?.balance !== undefined ? account.balance.toFixed(2) : '-';
  const equity = account?.equity !== undefined ? account.equity.toFixed(2) : '-';
  const exportDate = new Date().toLocaleString('id-ID');

  const lines: string[] = [];

  // Metadata Header
  lines.push(`"LAPORAN JURNAL TRADING INSTITUSIONAL"`);
  lines.push(`"Akun:","${accNum}","Broker:","${broker}","Tanggal Ekspor:","${exportDate}"`);
  lines.push(`"Saldo:","$${balance}","Equity:","$${equity}","Total Transaksi:","${trades.length}"`);
  lines.push(''); // Baris kosong

  // Kolom Transaksi
  const headers = [
    'No Tiket',
    'Simbol',
    'Tipe',
    'Lot',
    'Waktu Buka',
    'Harga Buka',
    'Waktu Tutup',
    'Harga Tutup',
    'Stop Loss',
    'Take Profit',
    'Net Profit ($)',
    'Komisi ($)',
    'Swap ($)',
    'Status',
    'Sesi',
    'Sumber Trade',
    'Setup / Strategi',
    'Emosi Trader',
    'SOP Dipatuhi',
    'Catatan Jurnal',
  ];
  lines.push(headers.map((h) => `"${h}"`).join(','));

  // Data baris
  trades.forEach((t) => {
    const sourceInfo = getTradeSource(t);
    const setup = t.strategy_tag || (t.magic_number ? 'SMC Automated' : 'Manual');
    const openTime = t.open_time ? new Date(t.open_time).toLocaleString('id-ID') : '-';
    const closeTime = t.close_time ? new Date(t.close_time).toLocaleString('id-ID') : (t.status === 'OPEN' ? 'Masih Terbuka' : '-');
    const emotion = t.emotion || '-';
    const rules = t.rules_followed ? 'YA' : 'TIDAK';
    const notes = (t.journal_notes || t.mt_comment || '').replace(/"/g, '""');

    const row = [
      t.ticket,
      t.symbol,
      t.trade_type,
      t.lots.toFixed(2),
      openTime,
      t.open_price,
      closeTime,
      t.close_price ?? '-',
      t.stop_loss > 0 ? t.stop_loss : '-',
      t.take_profit > 0 ? t.take_profit : '-',
      t.net_pnl.toFixed(2),
      t.commission.toFixed(2),
      t.swap.toFixed(2),
      t.status === 'OPEN' ? 'OPEN' : 'CLOSED',
      t.session || '-',
      sourceInfo.label,
      setup,
      emotion,
      rules,
      notes,
    ];

    lines.push(row.map((val) => `"${val}"`).join(','));
  });

  // Gabungkan dengan BOM UTF-8 (\uFEFF) agar simbol mata uang & aksen terbaca rapi di Excel
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${accNum}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Menghitung perolehan pips untuk instrumen Gold (XAUUSD) atau Forex
 */
export function calculatePips(symbol: string, openPrice: number, closePrice: number, isBuy: boolean): number {
  if (!openPrice || !closePrice) return 0;
  const sym = symbol.toUpperCase();
  const diff = isBuy ? closePrice - openPrice : openPrice - closePrice;

  if (sym.includes('XAU') || sym.includes('GOLD')) {
    // 1 pip Gold = 0.10 (atau 0.01 tergantung broker, standar 0.10 = 1 pip / 10 point)
    return parseFloat((diff * 10).toFixed(1));
  }
  if (sym.includes('JPY')) {
    return parseFloat((diff * 100).toFixed(1));
  }
  // Standard Forex (EURUSD, GBPUSD, etc.)
  return parseFloat((diff * 10000).toFixed(1));
}

/**
 * Menghitung rasio Risk to Reward (R:R) riil dari sebuah trade
 */
export function calculateRR(openPrice: number, closePrice: number | null, stopLoss: number, isBuy: boolean): string {
  if (!openPrice || !stopLoss || stopLoss <= 0 || !closePrice) return '1 : 2.5+';
  const risk = Math.abs(openPrice - stopLoss);
  if (risk <= 0.0001) return '1 : 3.0';
  const reward = isBuy ? (closePrice - openPrice) : (openPrice - closePrice);
  const ratio = reward / risk;
  if (ratio <= 0) return '1 : -';
  return `1 : ${ratio.toFixed(1)}`;
}
