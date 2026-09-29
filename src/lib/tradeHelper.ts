import { Trade } from './types';

export interface TradeSourceInfo {
  isManual: boolean;
  label: string;
  shortLabel: string;
  badgeClass: string;
  details?: string;
}

export function getTradeSource(trade: Trade): TradeSourceInfo {
  const magic = trade.magic_number || 0;
  if (magic === 0) {
    return {
      isManual: true,
      label: 'Trade Manual',
      shortLabel: 'Manual',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      details: trade.mt_comment || 'Eksekusi Manual MT4',
    };
  }

  // EA / Robot trade
  let eaName = 'Robot EA';
  if (trade.mt_comment && trade.mt_comment.trim()) {
    eaName = trade.mt_comment.trim();
  } else if (magic === 110294) {
    eaName = 'EA SMC Sniper';
  } else if (magic === 778805) {
    eaName = 'EA SMC Scalper';
  } else {
    eaName = `EA #${magic}`;
  }

  return {
    isManual: false,
    label: `Robot EA (${eaName})`,
    shortLabel: `Robot: ${eaName}`,
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    details: `Magic #${magic}`,
  };
}
