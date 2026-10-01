'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Trade } from '@/lib/types';
import { getTradeSource } from '@/lib/tradeHelper';
import { calculatePips, calculateRR } from '@/lib/exportUtils';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Share2, 
  Eye, 
  EyeOff, 
  Palette, 
  Maximize2,
  TrendingUp,
  TrendingDown,
  Layers,
  ShieldCheck,
  Award
} from 'lucide-react';

interface SocialTradeCardModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

type CardTheme = 'obsidian_gold' | 'cyber_neon' | 'midnight_sapphire' | 'sunset_fire';
type CardRatio = 'square' | 'story';

export const SocialTradeCardModal: React.FC<SocialTradeCardModalProps> = ({
  trade,
  isOpen,
  onClose,
}) => {
  const [theme, setTheme] = useState<CardTheme>('obsidian_gold');
  const [ratio, setRatio] = useState<CardRatio>('square');
  const [setupText, setSetupText] = useState('');
  const [traderHandle, setTraderHandle] = useState('@smartmoney.trader');
  const [hideAccountNumber, setHideAccountNumber] = useState(false);
  const [hideDollarAmount, setHideDollarAmount] = useState(false);
  const [showPips, setShowPips] = useState(true);
  const [showRR, setShowRR] = useState(true);
  
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // Set default setup text based on trade
  useEffect(() => {
    if (trade) {
      if (trade.strategy_tag && trade.strategy_tag.trim()) {
        setSetupText(trade.strategy_tag);
      } else if (trade.trade_type.includes('BUY')) {
        setSetupText('[A-M-D] Bullish Expansion');
      } else {
        setSetupText('[D-A-M] Bearish Distribution');
      }
      setIsCopied(false);
    }
  }, [trade]);

  if (!isOpen || !trade) return null;

  const isBuy = trade.trade_type.includes('BUY');
  const isProfit = trade.net_pnl >= 0;
  const source = getTradeSource(trade);
  const pips = calculatePips(trade.symbol, trade.open_price, trade.close_price ?? trade.open_price, isBuy);
  const rrRatio = calculateRR(trade.open_price, trade.close_price, trade.stop_loss, isBuy);

  // Duration
  let durationStr = 'Intraday Scalp';
  if (trade.open_time && trade.close_time) {
    const diffMs = new Date(trade.close_time).getTime() - new Date(trade.open_time).getTime();
    const diffMins = Math.max(1, Math.round(diffMs / 60000));
    if (diffMins < 60) durationStr = `${diffMins} Menit`;
    else {
      const hours = (diffMins / 60).toFixed(1);
      durationStr = `${hours} Jam`;
    }
  }

  // Theme styling configurations
  const themeStyles = {
    obsidian_gold: {
      cardBg: 'from-[#070b14] via-[#0d162a] to-[#121b33]',
      border: 'border-[#d4af37]/40',
      accentText: 'text-[#f6c85f]',
      glow: 'shadow-[0_0_50px_rgba(212,175,55,0.2)]',
      badgeBg: 'bg-[#d4af37]/15 text-[#f6c85f] border-[#d4af37]/30',
      heroGrad: 'from-[#f6c85f] via-[#ffd700] to-[#e0a96d]',
      subBg: 'bg-white/[0.04] border-white/[0.08]',
    },
    cyber_neon: {
      cardBg: 'from-[#050e14] via-[#071924] to-[#0b2433]',
      border: 'border-emerald-500/40',
      accentText: 'text-emerald-400',
      glow: 'shadow-[0_0_50px_rgba(16,185,129,0.25)]',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      heroGrad: 'from-emerald-300 via-teal-200 to-cyan-400',
      subBg: 'bg-emerald-950/20 border-emerald-500/20',
    },
    midnight_sapphire: {
      cardBg: 'from-[#070d1e] via-[#0f1f44] to-[#152a5c]',
      border: 'border-blue-400/40',
      accentText: 'text-blue-400',
      glow: 'shadow-[0_0_50px_rgba(59,130,246,0.25)]',
      badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      heroGrad: 'from-blue-300 via-indigo-200 to-sky-400',
      subBg: 'bg-blue-950/20 border-blue-500/20',
    },
    sunset_fire: {
      cardBg: 'from-[#140816] via-[#240d29] to-[#36133f]',
      border: 'border-amber-500/40',
      accentText: 'text-amber-400',
      glow: 'shadow-[0_0_50px_rgba(245,158,11,0.25)]',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      heroGrad: 'from-amber-300 via-rose-300 to-pink-400',
      subBg: 'bg-amber-950/20 border-amber-500/20',
    }
  }[theme];

  /**
   * Menggambar kartu secara presisi ke Canvas HTML5 resolusi tinggi (1200x1200px)
   */
  const renderCardToCanvas = useCallback((): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const isStory = ratio === 'story';
      const width = 1080;
      const height = isStory ? 1920 : 1080;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (theme === 'obsidian_gold') {
        grad.addColorStop(0, '#050914');
        grad.addColorStop(0.5, '#0d162a');
        grad.addColorStop(1, '#15203b');
      } else if (theme === 'cyber_neon') {
        grad.addColorStop(0, '#040b11');
        grad.addColorStop(0.5, '#071822');
        grad.addColorStop(1, '#0c2433');
      } else if (theme === 'midnight_sapphire') {
        grad.addColorStop(0, '#050a1a');
        grad.addColorStop(0.5, '#0c1a3e');
        grad.addColorStop(1, '#132857');
      } else {
        grad.addColorStop(0, '#100612');
        grad.addColorStop(0.5, '#220c26');
        grad.addColorStop(1, '#33123b');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial glow
      const radialGlow = ctx.createRadialGradient(width / 2, height * 0.35, 20, width / 2, height * 0.35, 450);
      if (isProfit) {
        radialGlow.addColorStop(0, theme === 'obsidian_gold' ? 'rgba(212,175,55,0.22)' : 'rgba(16,185,129,0.25)');
      } else {
        radialGlow.addColorStop(0, 'rgba(239,68,68,0.2)');
      }
      radialGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Outer Frame
      ctx.strokeStyle = theme === 'obsidian_gold' ? '#d4af37' : (theme === 'cyber_neon' ? '#10b981' : '#3b82f6');
      ctx.lineWidth = 10;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // Inner subtle border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, width - 90, height - 90);

      const startY = isStory ? 220 : 120;

      // 2. Header: Logo / System Name
      ctx.textAlign = 'center';
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = theme === 'obsidian_gold' ? '#f6c85f' : '#60a5fa';
      ctx.letterSpacing = '3px';
      ctx.fillText('INSTITUTIONAL SMART MONEY CONCEPTS', width / 2, startY);

      ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('VERIFIED TRADING JOURNAL • METATRADER 4', width / 2, startY + 34);

      // 3. Pair & Type Pill
      const pairY = startY + 100;
      const pairText = `${trade.symbol} • ${trade.trade_type} ${trade.lots.toFixed(2)} Lot`;
      ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(pairText, width / 2, pairY);

      // 4. Big Profit Hero
      const heroY = pairY + 110;
      ctx.font = '900 90px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = isProfit ? '#4ade80' : '#f87171';
      
      let profitDisplay = isProfit ? `+$${trade.net_pnl.toFixed(2)}` : `-$${Math.abs(trade.net_pnl).toFixed(2)}`;
      if (hideDollarAmount) {
        profitDisplay = isProfit ? `PROFIT WIN (+${pips} pips)` : `LOSS (-${Math.abs(pips)} pips)`;
      }
      ctx.fillText(profitDisplay, width / 2, heroY);

      // Pips & RR Sub-badge
      let badgesY = heroY + 55;
      const subBadgeParts = [];
      if (showPips) subBadgeParts.push(`${pips > 0 ? '+' : ''}${pips} Pips`);
      if (showRR) subBadgeParts.push(`Risk:Reward ${rrRatio}`);
      subBadgeParts.push(durationStr);

      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = theme === 'obsidian_gold' ? '#f6c85f' : '#38bdf8';
      ctx.fillText(subBadgeParts.join('  •  '), width / 2, badgesY);

      // 5. Setup Box Card
      const boxY = badgesY + 60;
      const boxW = 860;
      const boxH = isStory ? 380 : 300;
      const boxX = (width - boxW) / 2;

      // Draw rounded card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      roundRect(ctx, boxX, boxY, boxW, boxH, 20, true, true);

      // Inside Card Details
      const lineLeftX = boxX + 60;
      const lineRightX = boxX + boxW - 60;
      let textLineY = boxY + 65;

      const drawDetailRow = (label: string, value: string, color = '#ffffff') => {
        ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(label, lineLeftX, textLineY);

        ctx.font = '700 24px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = color;
        ctx.fillText(value, lineRightX, textLineY);
        textLineY += 52;
      };

      drawDetailRow('Formula Setup:', setupText || '[A-M-D] Expansion', theme === 'obsidian_gold' ? '#f6c85f' : '#4ade80');
      drawDetailRow('Harga Entry ➔ Exit:', `${trade.open_price} ➔ ${trade.close_price ?? '-'}`, '#ffffff');
      drawDetailRow('Stop Loss / TP:', `${trade.stop_loss > 0 ? trade.stop_loss : '-'} / ${trade.take_profit > 0 ? trade.take_profit : '-'}`, '#cbd5e1');
      drawDetailRow('Sistem Eksekusi:', source.label, '#c084fc');
      if (isStory) {
        drawDetailRow('Sesi Trading:', `${trade.session || 'London / New York'} Session`, '#38bdf8');
      }

      // 6. Account & Watermark Footer
      const footerY = isStory ? height - 160 : height - 100;

      ctx.textAlign = 'center';
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#64748b';
      const accText = hideAccountNumber ? 'Akun Terverifikasi MT4 • Real Portfolio' : `Akun MT4 #${trade.account_number} • Real Execution`;
      ctx.fillText(accText, width / 2, footerY);

      ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = theme === 'obsidian_gold' ? '#f6c85f' : '#ffffff';
      ctx.fillText(traderHandle || '@smartmoney.trader', width / 2, footerY + 45);

      resolve(canvas);
    });
  }, [trade, theme, ratio, setupText, traderHandle, hideAccountNumber, hideDollarAmount, showPips, showRR, isBuy, isProfit, pips, rrRatio, source.label, durationStr]);

  // Helper rounded rect for canvas
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: boolean, stroke: boolean) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // Handle Download PNG
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = await renderCardToCanvas();
      const link = document.createElement('a');
      link.download = `TradeCard_${trade.symbol}_${trade.ticket}_${theme}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download image:', err);
      alert('Gagal mengunduh gambar kartu.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Copy to Clipboard
  const handleCopyToClipboard = async () => {
    try {
      const canvas = await renderCardToCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
        } catch (err) {
          console.warn('Clipboard write failed, falling back to download:', err);
          handleDownload();
        }
      });
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col md:flex-row">
        
        {/* Left Side: Controls & Customization */}
        <div className="w-full md:w-80 p-5 border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/60 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                <Share2 className="h-3.5 w-3.5" />
                Social Trade Card
              </div>
              <h3 className="text-base font-extrabold text-white">Generator Kartu Sosmed</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Kustomisasi kartu hasil trading untuk dibagikan ke Telegram, Instagram, & Twitter.
              </p>
            </div>

            {/* Theme Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <Palette className="h-3 w-3 text-blue-400" />
                Pilihan Tema Warna:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'obsidian_gold', label: 'Obsidian Gold', dot: 'bg-amber-400' },
                  { id: 'cyber_neon', label: 'Cyber Matrix', dot: 'bg-emerald-400' },
                  { id: 'midnight_sapphire', label: 'Midnight Blue', dot: 'bg-blue-400' },
                  { id: 'sunset_fire', label: 'Sunset Fire', dot: 'bg-rose-400' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id as CardTheme)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all text-left ${
                      theme === th.id
                        ? 'bg-white/10 border-white/30 text-white shadow-sm'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${th.dot}`} />
                    <span className="truncate">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ratio Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <Maximize2 className="h-3 w-3 text-purple-400" />
                Format Rasio:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setRatio('square')}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    ratio === 'square'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Square (1:1 Feed)
                </button>
                <button
                  onClick={() => setRatio('story')}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    ratio === 'story'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Story (9:16 Reels)
                </button>
              </div>
            </div>

            {/* Custom Setup Tag */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                Label Formula Setup:
              </label>
              <input
                type="text"
                value={setupText}
                onChange={(e) => setSetupText(e.target.value)}
                placeholder="misal: [A-M-D] Bullish Expansion"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['[A-M-D] Expansion', '[D-A-M] Sweep', '[OB+FVG] POI', '[IDM] Sweep'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSetupText(p)}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Watermark Handle */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
                Nama / Handle Sosmed:
              </label>
              <input
                type="text"
                value={traderHandle}
                onChange={(e) => setTraderHandle(e.target.value)}
                placeholder="@username.anda"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Privacy & Display Toggles */}
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideAccountNumber}
                  onChange={(e) => setHideAccountNumber(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <span>Sembunyikan No. Akun (Privacy)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideDollarAmount}
                  onChange={(e) => setHideDollarAmount(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <span>Sembunyikan Nominal Dolar ($)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPips}
                  onChange={(e) => setShowPips(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <span>Tampilkan Perolehan Pips</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showRR}
                  onChange={(e) => setShowRR(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <span>Tampilkan Rasio Risk:Reward</span>
              </label>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-2 border-t border-white/10 mt-4">
            <button
              onClick={handleCopyToClipboard}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                isCopied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300" />
                  Gambar Disalin ke Clipboard!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Salin Gambar (Siap Paste di TG)
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Membuat Gambar...' : 'Download Gambar HD (.PNG)'}
            </button>
          </div>

        </div>

        {/* Right Side: Live Interactive Card Preview */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col items-center justify-center bg-slate-950/90 relative">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Live Preview Kartu (Resolusi Ekspor 1080px HD)
          </div>

          {/* PREVIEW CONTAINER */}
          <div
            ref={previewRef}
            className={`w-full max-w-[380px] rounded-2xl bg-gradient-to-b ${themeStyles.cardBg} border ${themeStyles.border} ${themeStyles.glow} p-5 flex flex-col justify-between text-white transition-all duration-300 relative overflow-hidden ${
              ratio === 'story' ? 'aspect-[9/16]' : 'aspect-square'
            }`}
          >
            {/* Ambient Background Ornament */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Card Header */}
            <div className="relative z-10 border-b border-white/10 pb-3">
              <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                <span className={themeStyles.accentText}>SMART MONEY CONCEPTS</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  VERIFIED
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold font-mono tracking-tight">{trade.symbol}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    isBuy ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {trade.trade_type} {trade.lots.toFixed(2)}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {durationStr}
                </span>
              </div>
            </div>

            {/* Card Hero: Profit */}
            <div className="relative z-10 my-auto text-center py-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                {isProfit ? 'REALIZED PROFIT' : 'REALIZED LOSS'}
              </div>
              <div className={`text-4xl sm:text-5xl font-extrabold font-mono tracking-tight ${
                isProfit ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {hideDollarAmount ? (
                  isProfit ? `WIN (+${pips}p)` : `LOSS (-${Math.abs(pips)}p)`
                ) : (
                  `${isProfit ? '+' : ''}$${trade.net_pnl.toFixed(2)}`
                )}
              </div>

              {/* Badges line */}
              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                {showPips && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                    {pips > 0 ? '+' : ''}{pips} Pips
                  </span>
                )}
                {showRR && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${themeStyles.badgeBg}`}>
                    R:R {rrRatio}
                  </span>
                )}
              </div>
            </div>

            {/* Card Center: Setup & Trade Stats Box */}
            <div className={`relative z-10 p-3 rounded-xl ${themeStyles.subBg} text-[10px] space-y-1.5`}>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Formula Setup:</span>
                <span className={`font-bold font-mono ${themeStyles.accentText}`}>
                  {setupText || '[A-M-D] Expansion'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Harga Eksekusi:</span>
                <span className="font-mono text-white font-semibold">
                  {trade.open_price} ➔ {trade.close_price ?? '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Stop Loss / TP:</span>
                <span className="font-mono text-slate-300">
                  {trade.stop_loss > 0 ? trade.stop_loss : '-'} / {trade.take_profit > 0 ? trade.take_profit : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-slate-400">Eksekusi:</span>
                <span className="font-semibold text-purple-300">{source.label}</span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="relative z-10 border-t border-white/10 pt-3 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-medium">
                {hideAccountNumber ? 'MT4 Verified Trade' : `Akun #${trade.account_number}`}
              </span>
              <span className={`font-bold ${themeStyles.accentText}`}>
                {traderHandle || '@smartmoney.trader'}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
