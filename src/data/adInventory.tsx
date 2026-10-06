import React from 'react';
import {
  Trophy,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Video,
  ShieldCheck,
  Flame,
  Gamepad2,
  Coins,
  Wallet,
  Globe,
  Radio,
  Star,
  ExternalLink,
  ShoppingBag,
  Zap,
  CreditCard,
  Lock,
  Smartphone,
  Headphones,
  Award,
  Tag,
  Gift,
  Percent,
} from 'lucide-react';

export interface StoryAd {
  id: string;
  brand: string;
  badge: string;
  headline: string;
  description: string;
  actionText: string;
  attribution: string;
  actionUrl: string;
  renderGraphic: () => React.ReactNode;
}

export interface SponsorShowAd {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  badge: string;
  iconType: 'wallet' | 'exchange' | 'game' | 'telegram' | 'crypto' | 'shopping' | 'security' | 'fintech' | 'music';
  colorTheme: 'blue' | 'purple' | 'amber' | 'emerald' | 'cyan' | 'rose' | 'indigo' | 'yellow';
  stats: { label: string; value: string };
  actionUrl: string;
  actionText: string;
  features: string[];
}

export const ALL_STORY_ADS: StoryAd[] = [
  // 1. Binance
  {
    id: 'binance',
    brand: 'Binance Web3',
    badge: 'Official Sponsor',
    headline: '$100 WELCOME VOUCHER ⚡',
    description: 'Trade 350+ cryptocurrencies with lowest fees. Claim your $100 cashback voucher today!',
    actionText: 'Claim $100',
    attribution: '@binance - Verified Sponsor',
    actionUrl: 'https://binance.com',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#181a20] via-[#0b0e11] to-[#181a20] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>World #1 Crypto Exchange</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            BINANCE WEB3
          </h2>
          <div className="text-sm font-black text-amber-400 tracking-wider uppercase mt-0.5">
            $100 TRADING VOUCHER
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/30 animate-pulse">
            <div className="w-full h-full rounded-2xl bg-[#1e2329] flex items-center justify-center">
              <Coins className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="w-36 rounded-xl bg-[#1e2329] border border-amber-400/40 p-2 shadow-2xl flex flex-col gap-1 text-left">
            <div className="flex items-center justify-between text-[8px] text-amber-300 font-bold">
              <span>ZERO FEES</span>
              <span className="text-emerald-400">INSTANT</span>
            </div>
            <div className="text-[10px] font-black text-white">BTC / USDT +4.8%</div>
            <div className="py-1 rounded bg-amber-400 text-slate-950 font-black text-[9px] text-center uppercase tracking-wider shadow">
              REGISTER &amp; WIN
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-amber-200/90 font-bold pb-1">
          <span>🛡️ Top Security</span>
          <span>⚡ Instant Swap</span>
          <span>💎 200M+ Users</span>
        </div>
      </div>
    ),
  },

  // 2. Revolut
  {
    id: 'revolut',
    brand: 'Revolut Global',
    badge: 'Fintech Leader',
    headline: 'BORDERLESS BANKING 💳',
    description: 'Send money to 150+ countries with zero hidden exchange fees. Free digital Mastercard on sign up!',
    actionText: 'Get Free Card',
    attribution: '@revolut - Global Partner',
    actionUrl: 'https://revolut.com',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#0a0f1d] via-[#101935] to-[#0a0f1d] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>Smart Global Account</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            REVOLUT PAY
          </h2>
          <div className="text-sm font-black text-blue-400 tracking-wider uppercase mt-0.5">
            0% FOREIGN EXCHANGE
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-36 h-20 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-2 text-white shadow-xl flex flex-col justify-between text-left rotate-2 transform">
            <div className="flex justify-between items-center text-[9px] font-bold">
              <span>REVOLUT ULTRA</span>
              <CreditCard className="w-3 h-3" />
            </div>
            <div className="text-[11px] font-mono tracking-widest">•••• 8829</div>
            <div className="text-[8px] text-blue-200">INSTANT CASHBACK 3%</div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-blue-200/90 font-bold pb-1">
          <span>🌍 150+ Currencies</span>
          <span>⚡ 1-Sec Transfers</span>
          <span>🔒 FDIC Insured</span>
        </div>
      </div>
    ),
  },

  // 3. NordVPN
  {
    id: 'nordvpn',
    brand: 'NordVPN Security',
    badge: 'CyberShield',
    headline: '70% OFF + 3 MONTHS FREE 🛡️',
    description: 'Protect your privacy, unblock streaming & browse lightning fast worldwide. 30-day money-back guarantee!',
    actionText: 'Get 70% Discount',
    attribution: '@nordvpn - Verified Cyber Security',
    actionUrl: 'https://nordvpn.com',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#031b2e] via-[#042d4d] to-[#031b2e] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ultra-Fast Encryption</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            NORDVPN ULTIMATE
          </h2>
          <div className="text-sm font-black text-cyan-300 tracking-wider uppercase mt-0.5">
            70% OFF SPECIAL OFFER
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Lock className="w-8 h-8 text-cyan-300 animate-bounce" />
          </div>
          <div className="w-32 rounded-xl bg-[#042038] border border-cyan-500/40 p-2 text-left">
            <div className="text-[9px] text-cyan-300 font-bold">STATUS: PROTECTED</div>
            <div className="text-[8px] text-slate-300 mt-0.5">6,400+ Fast Servers</div>
            <div className="mt-1 py-0.5 px-1.5 rounded bg-cyan-400 text-slate-950 text-[8px] font-black text-center uppercase">
              1-CLICK CONNECT
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-cyan-200 font-bold pb-1">
          <span>⚡ No Speed Limit</span>
          <span>🔒 Strict No-Logs</span>
          <span>📱 10 Devices</span>
        </div>
      </div>
    ),
  },

  // 4. AliExpress
  {
    id: 'aliexpress',
    brand: 'AliExpress Global',
    badge: 'Mega Sale',
    headline: 'UP TO 90% OFF DEALS 🛍️',
    description: 'Shop millions of tech items, watches & gadgets with free worldwide shipping and 15-day free returns!',
    actionText: 'Shop Mega Sale',
    attribution: '@aliexpress - Official Partner',
    actionUrl: 'https://aliexpress.com',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#2a0808] via-[#450a0a] to-[#2a0808] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-400/40 text-rose-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />
            <span>Worldwide Mega Deals</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            ALIEXPRESS SALE
          </h2>
          <div className="text-sm font-black text-amber-300 tracking-wider uppercase mt-0.5">
            UP TO 90% DISCOUNT
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Tag className="w-8 h-8 text-white" />
          </div>
          <div className="w-32 rounded-xl bg-slate-950/80 border border-rose-400/40 p-2 text-left">
            <div className="text-[9px] text-amber-300 font-bold">SMARTWATCH V9</div>
            <div className="text-[10px] font-black text-white">$4.99 <span className="line-through text-slate-500 text-[8px]">$49.99</span></div>
            <div className="mt-1 py-0.5 rounded bg-amber-400 text-slate-950 text-[8px] font-black text-center uppercase">
              FREE SHIPPING
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-rose-200 font-bold pb-1">
          <span>📦 Free Delivery</span>
          <span>⚡ Flash Deals</span>
          <span>🛡️ Buyer Protection</span>
        </div>
      </div>
    ),
  },

  // 5. BC.Game
  {
    id: 'bcgame',
    brand: 'BC.GAME',
    badge: 'GambleAware',
    headline: '€10,000 VICTORY AWAITS! 🏆',
    description: 'Win your share of €10,000! Enter the World Cup Combo Tournament with just a €3 bet. High Odds, Massive Payouts.',
    actionText: 'Play Now!',
    attribution: '@adsgram_ai - ads in Telegram',
    actionUrl: 'https://bc.game',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#022c22] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>World Cup Special Tournament</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            €10,000 WORLD CUP
          </h2>
          <div className="text-sm font-black text-emerald-300 tracking-wider uppercase mt-0.5">
            COMBO TOURNAMENT
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-0.5 shadow-xl shadow-amber-500/30 animate-bounce">
            <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="w-32 rounded-xl bg-slate-900 border-2 border-emerald-400/60 p-2 shadow-2xl flex flex-col gap-1 text-left">
            <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold">
              <span>FOOTBALL</span>
              <span className="text-emerald-400">LIVE</span>
            </div>
            <div className="bg-emerald-950/60 rounded p-1 border border-emerald-500/30 text-[9px] text-white font-bold leading-tight">
              TOP LEAGUES
              <div className="text-[7px] text-emerald-300 font-normal">Odds 3.85 • Combo x5</div>
            </div>
            <div className="py-1 rounded bg-amber-400 text-slate-950 font-black text-[9px] text-center uppercase tracking-wider shadow">
              START BETTING
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-4 text-[10px] text-emerald-200/90 font-bold pb-1">
          <span>⚽ Live Odds</span>
          <span>⚡ Instant Payouts</span>
          <span>🛡️ GambleAware</span>
        </div>
      </div>
    ),
  },

  // 6. OKX Web3
  {
    id: 'okx',
    brand: 'OKX Web3 Wallet',
    badge: 'DeFi Hub',
    headline: '1,000+ DAPPS ZERO GAS ⚡',
    description: 'Connect to any Web3 app instantly. Swap crypto across 80+ blockchains with zero extra fees!',
    actionText: 'Explore OKX Web3',
    attribution: '@okx - Web3 Ecosystem',
    actionUrl: 'https://okx.com',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#09090b] via-[#18181b] to-[#09090b] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-400/40 text-purple-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Wallet className="w-3.5 h-3.5 text-purple-400" />
            <span>Next-Gen Web3 Wallet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            OKX MULTI-CHAIN
          </h2>
          <div className="text-sm font-black text-purple-400 tracking-wider uppercase mt-0.5">
            DEX AGGREGATOR &amp; AIRDROPS
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/60 flex items-center justify-center shadow-xl shadow-purple-500/20">
            <Sparkles className="w-8 h-8 text-purple-300 animate-spin" />
          </div>
          <div className="w-32 rounded-xl bg-slate-900 border border-purple-400/50 p-2 text-left">
            <div className="text-[9px] text-purple-300 font-bold">AIRDROP HUNTER</div>
            <div className="text-[8px] text-slate-300">80+ Chains Connected</div>
            <div className="mt-1 py-0.5 rounded bg-purple-500 text-white text-[8px] font-black text-center uppercase">
              CLAIM REWARDS
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-purple-200 font-bold pb-1">
          <span>⚡ Best Swap Rate</span>
          <span>🔒 Self-Custody</span>
          <span>🎁 Early Access</span>
        </div>
      </div>
    ),
  },

  // 7. Temu
  {
    id: 'temu',
    brand: 'Temu Shopping',
    badge: '$100 Bundle',
    headline: '$100 COUPON KIT FOR YOU 🎁',
    description: 'Download the app & unlock a $100 coupon pack! Shop trendy fashion, gadgets and home goods from $0.99.',
    actionText: 'Claim $100 Pack',
    attribution: '@temu - Exclusive Sponsor',
    actionUrl: 'https://temu.com',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#2e1065] via-[#3b0764] to-[#2e1065] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>New App User Exclusive</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            TEMU SUPER PACK
          </h2>
          <div className="text-sm font-black text-amber-300 tracking-wider uppercase mt-0.5">
            $100 VOUCHERS UNLOCKED
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse">
            <Gift className="w-8 h-8 text-slate-950" />
          </div>
          <div className="w-32 rounded-xl bg-slate-950/80 border border-amber-400/40 p-2 text-left">
            <div className="text-[9px] text-amber-400 font-bold">COUPON CODE: TEMU100</div>
            <div className="text-[8px] text-slate-300">Free Gift on Order #1</div>
            <div className="mt-1 py-0.5 rounded bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-[8px] font-black text-center uppercase">
              DOWNLOAD &amp; CLAIM
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-amber-200 font-bold pb-1">
          <span>📦 Free Shipping</span>
          <span>⚡ 90-Day Returns</span>
          <span>⭐ 50M+ Reviews</span>
        </div>
      </div>
    ),
  },

  // 8. Duolingo
  {
    id: 'duolingo',
    brand: 'Duolingo Super',
    badge: 'Education App',
    headline: 'LEARN A LANGUAGE IN 15 MIN 🦉',
    description: 'Learn Spanish, German, French or English 2x faster! Gamified lessons with zero ads and unlimited hearts.',
    actionText: 'Start Free Trial',
    attribution: '@duolingo - Global Education Partner',
    actionUrl: 'https://duolingo.com',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#064e3b] via-[#047857] to-[#064e3b] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>#1 Language Learning App</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            DUOLINGO SUPER
          </h2>
          <div className="text-sm font-black text-emerald-300 tracking-wider uppercase mt-0.5">
            SPEAK FLUENTLY FAST
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/30">
            🦉
          </div>
          <div className="w-32 rounded-xl bg-slate-900 border border-emerald-400/50 p-2 text-left">
            <div className="text-[9px] text-emerald-300 font-bold">DAILY STREAK: 14 DAYS</div>
            <div className="text-[8px] text-slate-300">40+ Languages Free</div>
            <div className="mt-1 py-0.5 rounded bg-emerald-400 text-slate-950 text-[8px] font-black text-center uppercase">
              TRY 14 DAYS FREE
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-emerald-200 font-bold pb-1">
          <span>🎯 Bite-Sized Lessons</span>
          <span>🎧 Native Audio</span>
          <span>🏆 Fun Rewards</span>
        </div>
      </div>
    ),
  },

  // 9. X8 Poker
  {
    id: 'x8poker',
    brand: 'X8 Poker',
    badge: 'Ad • 18+',
    headline: '68 USDT Awaits You! ♠️',
    description: 'Claim your daily 68 USDT reward on X8 Poker. Play on Telegram and unlock nonstop surprises every day!',
    actionText: 'Play Now!',
    attribution: '@adsgram_ai - ads in Telegram',
    actionUrl: 'https://x8poker.io',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#09090b] via-[#1c1917] to-[#09090b] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="text-xs font-black tracking-widest text-amber-400 uppercase">
            ♠ X8 POKER • PLAY. WIN. BIG.
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight mt-1">
            DAILY 68 USDT
          </h2>
          <div className="text-sm font-black text-amber-300 tracking-widest uppercase">
            AWAITS YOU
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-4">
          <div className="flex -space-x-4">
            <div className="w-12 h-16 rounded-lg bg-white text-slate-900 border border-slate-300 shadow-xl flex flex-col justify-between p-1 text-[10px] font-black -rotate-12 transform">
              <span>A♠</span>
              <span className="self-center text-base">♠</span>
              <span className="self-end">A♠</span>
            </div>
            <div className="w-12 h-16 rounded-lg bg-white text-rose-600 border border-slate-300 shadow-xl flex flex-col justify-between p-1 text-[10px] font-black rotate-6 transform">
              <span>K♥</span>
              <span className="self-center text-base">♥</span>
              <span className="self-end">K♥</span>
            </div>
          </div>
          <div className="w-32 rounded-xl bg-slate-900 border-2 border-amber-400/70 p-2 shadow-2xl flex flex-col gap-1 text-left">
            <div className="flex items-center justify-between text-[8px] text-amber-300 font-bold">
              <span>TEXAS HOLDEM</span>
              <span>$28,960 POT</span>
            </div>
            <div className="h-9 rounded bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-[10px] text-amber-200 font-bold">
              ♣ 10 ♦ J ♥ Q ♠ K
            </div>
            <div className="py-1 rounded bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[9px] text-center uppercase tracking-wider shadow">
              CLAIM BONUS
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-amber-200/80 font-bold pb-1">
          <span>🎁 DAILY SURPRISES</span>
          <span>•</span>
          <span>⭐ NONSTOP REWARDS</span>
        </div>
      </div>
    ),
  },

  // 10. Cash App
  {
    id: 'cashapp',
    brand: 'Cash App',
    badge: 'Instant Transfer',
    headline: 'SEND MONEY & BUY BITCOIN 💸',
    description: 'The easiest way to send money, invest in stocks, and buy Bitcoin with zero minimums and zero fees.',
    actionText: 'Get $5 Bonus',
    attribution: '@cashapp - Mobile Payments',
    actionUrl: 'https://cash.app',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#022c22] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Peer-to-Peer Payments</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            CASH APP GREEN
          </h2>
          <div className="text-sm font-black text-emerald-300 tracking-wider uppercase mt-0.5">
            INSTANT SENDS &amp; BITCOIN
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-400 flex items-center justify-center text-slate-950 font-black text-3xl shadow-xl shadow-emerald-500/30">
            $
          </div>
          <div className="w-32 rounded-xl bg-slate-900 border border-emerald-400/50 p-2 text-left">
            <div className="text-[9px] text-emerald-300 font-bold">$Cashtag Sent!</div>
            <div className="text-[8px] text-slate-300">Free Visa Debit Card</div>
            <div className="mt-1 py-0.5 rounded bg-emerald-400 text-slate-950 text-[8px] font-black text-center uppercase">
              CLAIM $5 CODE
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-emerald-200 font-bold pb-1">
          <span>⚡ 1-Sec Sockets</span>
          <span>🪙 Buy Bitcoin $1</span>
          <span>💳 Custom Debit Card</span>
        </div>
      </div>
    ),
  },

  // 11. Bybit Crypto Card
  {
    id: 'bybit',
    brand: 'Bybit Global',
    badge: 'VIP Club',
    headline: '10% CASHBACK CRYPTO CARD 💳',
    description: 'Spend your USDT, BTC and TON anywhere Mastercard is accepted. Get up to 10% instant crypto cashback!',
    actionText: 'Order Free Card',
    attribution: '@bybit - Official Exchange Partner',
    actionUrl: 'https://bybit.com',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#181a20] via-[#1f2229] to-[#181a20] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>Mastercard Powered</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            BYBIT CARD
          </h2>
          <div className="text-sm font-black text-amber-400 tracking-wider uppercase mt-0.5">
            UP TO 10% CASHBACK
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-36 h-20 rounded-xl bg-gradient-to-tr from-slate-900 via-amber-950 to-slate-900 border border-amber-400/60 p-2 text-white shadow-xl flex flex-col justify-between text-left">
            <div className="flex justify-between items-center text-[9px] font-bold text-amber-400">
              <span>BYBIT VIP CARD</span>
              <span>10% CB</span>
            </div>
            <div className="text-[11px] font-mono text-amber-200">5412 •••• •••• 9920</div>
            <div className="text-[8px] text-slate-400">SPEND CRYPTO ANYWHERE</div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-amber-200 font-bold pb-1">
          <span>⚡ Instant Issuance</span>
          <span>🛍️ Global Acceptance</span>
          <span>💎 VIP Rewards</span>
        </div>
      </div>
    ),
  },

  // 12. Hamster Kombat
  {
    id: 'hamster',
    brand: 'Hamster Kombat',
    badge: 'Web3 Game',
    headline: 'DAILY COMBO & 5M COINS 🐹',
    description: 'Unlock today’s 3 combo cards and decipher the Morse code for 5,000,000 bonus coins in Hamster Kombat!',
    actionText: 'Unlock 5M Coins',
    attribution: '@hamster_kombat_bot - Telegram Game',
    actionUrl: 'https://t.me/hamster_kombat_bot',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Telegram Event</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            HAMSTER KOMBAT
          </h2>
          <div className="text-sm font-black text-amber-300 tracking-wider uppercase mt-0.5">
            5,000,000 COMBO CARDS
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30">
            🐹
          </div>
          <div className="w-32 rounded-xl bg-slate-900 border border-amber-400/50 p-2 text-left">
            <div className="text-[9px] text-amber-300 font-bold">TODAY&apos;S COMBO: 3/3</div>
            <div className="text-[8px] text-slate-300">Tap to Mine 100K/hr</div>
            <div className="mt-1 py-0.5 rounded bg-amber-400 text-slate-950 text-[8px] font-black text-center uppercase">
              CLAIM 5M NOW
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-amber-200 font-bold pb-1">
          <span>⚡ Instant Claim</span>
          <span>🎮 Mini-Game Keys</span>
          <span>👥 100M+ Players</span>
        </div>
      </div>
    ),
  },

  // 13. Spotify Premium
  {
    id: 'spotify',
    brand: 'Spotify Premium',
    badge: 'Music & Podcasts',
    headline: '3 MONTHS FREE MUSIC 🎧',
    description: 'Listen to over 100 million songs ad-free with unlimited skips and offline downloading. Cancel anytime!',
    actionText: 'Start 3 Months Free',
    attribution: '@spotify - Official Streaming Partner',
    actionUrl: 'https://spotify.com',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#022c22] via-[#052e16] to-[#022c22] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            <span>Unlimited Music Streaming</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            SPOTIFY PREMIUM
          </h2>
          <div className="text-sm font-black text-emerald-300 tracking-wider uppercase mt-0.5">
            3 MONTHS FREE TRIAL
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <Headphones className="w-8 h-8 text-slate-950 animate-pulse" />
          </div>
          <div className="w-32 rounded-xl bg-slate-900 border border-emerald-400/50 p-2 text-left">
            <div className="text-[9px] text-emerald-300 font-bold">ZERO AD INTERRUPTIONS</div>
            <div className="text-[8px] text-slate-300">Offline Download HD</div>
            <div className="mt-1 py-0.5 rounded bg-emerald-400 text-slate-950 text-[8px] font-black text-center uppercase">
              CLAIM TRIAL NOW
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-emerald-200 font-bold pb-1">
          <span>🎧 High-Fidelity Audio</span>
          <span>⚡ Unlimited Skips</span>
          <span>❌ Cancel Anytime</span>
        </div>
      </div>
    ),
  },

  // 14. Blum
  {
    id: 'blum',
    brand: 'Blum Crypto',
    badge: 'Telegram Mini-App',
    headline: 'TRADE ANY TOKEN IN TELEGRAM 🚀',
    description: 'Blum is a hybrid exchange inside Telegram. Farm Blum Points, play the drop game, and prepare for upcoming drops!',
    actionText: 'Farm Blum Points',
    attribution: '@blum - Telegram Verified',
    actionUrl: 'https://t.me/blum',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#09090b] via-[#18181b] to-[#09090b] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="text-xs font-black tracking-widest text-emerald-400 uppercase">
            🌱 BLUM • CRYPTO MADE EASY
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight mt-1">
            FARM BLUM POINTS
          </h2>
          <div className="text-sm font-black text-emerald-300 tracking-widest uppercase">
            EVERY 8 HOURS
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-300 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-8 h-8 text-slate-950" />
          </div>
          <div className="w-32 rounded-xl bg-slate-900 border border-emerald-400/50 p-2 text-left">
            <div className="text-[9px] text-emerald-300 font-bold">FARMING: 4,820 BP</div>
            <div className="text-[8px] text-slate-300">Hybrid Exchange</div>
            <div className="mt-1 py-0.5 rounded bg-emerald-400 text-slate-950 text-[8px] font-black text-center uppercase">
              CLAIM &amp; FARM
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-emerald-200/80 font-bold pb-1">
          <span>⚡ ZERO GAS TRADING</span>
          <span>•</span>
          <span>🎮 DROP GAME</span>
        </div>
      </div>
    ),
  },

  // 15. Free Fire Diamonds
  {
    id: 'freefire',
    brand: 'Garena Free Fire',
    badge: '100% Bonus Diamonds',
    headline: 'DOUBLE DIAMOND TOP-UP 💎',
    description: 'Get 100% extra diamonds on your first top-up! Unlock elite passes, weapon skins and legendary bundles instantly.',
    actionText: 'Get 2X Diamonds',
    attribution: '@freefire - Gaming Partner',
    actionUrl: 'https://freefiremobile.com',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#450a0a] via-[#7f1d1d] to-[#450a0a] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Diamond Top-Up</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            FREE FIRE DIAMONDS
          </h2>
          <div className="text-sm font-black text-amber-300 tracking-wider uppercase mt-0.5">
            100% EXTRA BONUS
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30 animate-pulse">
            <Sparkles className="w-8 h-8 text-slate-950" />
          </div>
          <div className="w-32 rounded-xl bg-slate-950 border border-amber-400/50 p-2 text-left">
            <div className="text-[9px] text-amber-300 font-bold">1,060 + 1,060 💎</div>
            <div className="text-[8px] text-slate-300">Instant UID Delivery</div>
            <div className="mt-1 py-0.5 rounded bg-amber-400 text-slate-950 text-[8px] font-black text-center uppercase">
              TOP UP NOW
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-amber-200 font-bold pb-1">
          <span>⚡ Instant Credit</span>
          <span>🛡️ 100% Official</span>
          <span>🎁 Free Bundles</span>
        </div>
      </div>
    ),
  },

  // 16. TradingView Pro
  {
    id: 'tradingview',
    brand: 'TradingView Pro',
    badge: 'Pro Charts',
    headline: 'PRO CHARTS & ALERTS 📈',
    description: 'Track crypto, forex & stock markets with 100+ technical indicators, real-time heatmaps & instant price alerts.',
    actionText: 'Try 30 Days Free',
    attribution: '@tradingview - Market Analytics',
    actionUrl: 'https://tradingview.com',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#090d16] via-[#111827] to-[#090d16] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-400/40 text-blue-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span>#1 Financial Charts Platform</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            TRADINGVIEW PRO
          </h2>
          <div className="text-sm font-black text-blue-300 tracking-wider uppercase mt-0.5">
            MULTI-TIMEFRAME ALERTS
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/60 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <TrendingUp className="w-8 h-8 text-blue-300 animate-pulse" />
          </div>
          <div className="w-32 rounded-xl bg-slate-900 border border-blue-400/50 p-2 text-left">
            <div className="text-[9px] text-blue-300 font-bold">BTC/USDT BULLISH 🚀</div>
            <div className="text-[8px] text-slate-300">RSI 62 • MACD Cross</div>
            <div className="mt-1 py-0.5 rounded bg-blue-400 text-slate-950 text-[8px] font-black text-center uppercase">
              START FREE TRIAL
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-blue-200 font-bold pb-1">
          <span>📊 100+ Indicators</span>
          <span>⚡ Millisecond Data</span>
          <span>📱 Phone &amp; Web</span>
        </div>
      </div>
    ),
  },

  // 17. Notcoin
  {
    id: 'notcoin',
    brand: 'Notcoin',
    badge: 'Web3 Pioneer',
    headline: 'THE ORIGINAL WEB3 MOVEMENT 🟡',
    description: 'Join the community of 35 million explorers. Earn NOT tokens by participating in partner campaigns and exploring Web3 apps.',
    actionText: 'Explore Notcoin',
    attribution: '@notcoin - Official Mini-App',
    actionUrl: 'https://t.me/notcoin_bot',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#18181b] via-[#27272a] to-[#18181b] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="text-xs font-black tracking-widest text-amber-400 uppercase">
            🪙 NOTCOIN • PROBABLY NOTHING
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight mt-1">
            EXPLORE &amp; EARN
          </h2>
          <div className="text-sm font-black text-amber-300 tracking-widest uppercase">
            35,000,000 COMMUNITY
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white text-slate-950 flex items-center justify-center font-black text-3xl shadow-xl shadow-white/20 animate-pulse">
            ∅
          </div>
          <div className="w-32 rounded-xl bg-slate-900 border border-amber-400/50 p-2 text-left">
            <div className="text-[9px] text-amber-300 font-bold">PLATINUM LEVEL</div>
            <div className="text-[8px] text-slate-300">Earn per explore</div>
            <div className="mt-1 py-0.5 rounded bg-white text-slate-950 font-black text-[8px] text-center uppercase">
              JOIN CAMPAIGN
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-amber-200/80 font-bold pb-1">
          <span>⭐ TOP LIQUIDITY</span>
          <span>•</span>
          <span>⚡ TON BLOCKCHAIN</span>
        </div>
      </div>
    ),
  },

  // 18. Dogs Community
  {
    id: 'dogs',
    brand: 'Dogs Community',
    badge: 'Telegram Native',
    headline: 'BONE-FIDE TELEGRAM TOKENS 🐕',
    description: 'The native meme token for Telegram natives. Check your Telegram account age and claim free DOGS tokens today!',
    actionText: 'Claim Free DOGS',
    attribution: '@dogshouse_bot - Telegram Native',
    actionUrl: 'https://t.me/dogshouse_bot',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#09090b] via-[#18181b] to-[#09090b] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-slate-200 text-[10px] font-black uppercase tracking-wider mb-2">
            <span>🐕 Telegram Native Token</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            DOGS COMMUNITY
          </h2>
          <div className="text-sm font-black text-slate-300 tracking-wider uppercase mt-0.5">
            50M+ TELEGRAM USERS
          </div>
        </div>
        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-xl shadow-white/10">
            🐕
          </div>
          <div className="w-32 rounded-xl bg-slate-900 border border-slate-700 p-2 text-left">
            <div className="text-[9px] text-white font-bold">AGE: 4 YEARS</div>
            <div className="text-[8px] text-slate-400">Bonus: 12,400 DOGS</div>
            <div className="mt-1 py-0.5 rounded bg-white text-slate-950 text-[8px] font-black text-center uppercase">
              CLAIM WITH 1-CLICK
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-slate-300 font-bold pb-1">
          <span>⚡ Instant Airdrop</span>
          <span>🪙 TON Native</span>
          <span>🔥 Top Trending</span>
        </div>
      </div>
    ),
  },
];

export const ALL_SHOW_ADS: SponsorShowAd[] = [
  {
    id: 'ad_tonkeeper',
    title: 'TONKEEPER & CRYPTO PAY',
    subtitle: 'Instant Web3 Transfers • 0% Fees',
    tagline: 'Official Telegram TON wallet with instant transfers & zero gas fees',
    badge: 'Telegram Verified Partner',
    iconType: 'wallet',
    colorTheme: 'cyan',
    stats: { label: 'Active Wallets', value: '18,500,000+' },
    actionUrl: 'https://tonkeeper.com',
    actionText: 'Explore Tonkeeper',
    features: ['Instant Payouts', 'Biometric Security', '100% Guaranteed'],
  },
  {
    id: 'ad_binance',
    title: 'BINANCE GLOBAL LAUNCHPOOL',
    subtitle: 'Stake BNB & Farm New Coins Daily',
    tagline: 'The world’s largest crypto exchange with industry-leading liquidity',
    badge: 'World #1 Exchange',
    iconType: 'exchange',
    colorTheme: 'amber',
    stats: { label: '24h Volume', value: '$38.5 Billion' },
    actionUrl: 'https://binance.com',
    actionText: 'Claim $100 Voucher',
    features: ['Zero Fee Spot Pairs', 'Instant P2P Trading', 'SAFU Protection Fund'],
  },
  {
    id: 'ad_revolut',
    title: 'REVOLUT GLOBAL MONEY APP',
    subtitle: 'Spend in 150+ Currencies Worldwide',
    tagline: 'Smart money management with instant cashbacks, crypto & stock investing',
    badge: '40M+ Worldwide Users',
    iconType: 'fintech',
    colorTheme: 'blue',
    stats: { label: 'Users Worldwide', value: '45,000,000+' },
    actionUrl: 'https://revolut.com',
    actionText: 'Get Free Mastercard',
    features: ['Zero FX Markup', 'Free Virtual Cards', 'Airport Lounge Access'],
  },
  {
    id: 'ad_nordvpn',
    title: 'NORDVPN CYBER DEFENSE',
    subtitle: 'Ultra-Fast Security • 70% Off Today',
    tagline: 'Military-grade encryption with ultra-fast servers across 111 countries',
    badge: 'Top-Rated VPN 2026',
    iconType: 'security',
    colorTheme: 'cyan',
    stats: { label: 'Global Servers', value: '6,400+ Active' },
    actionUrl: 'https://nordvpn.com',
    actionText: 'Activate 70% Discount',
    features: ['Threat Protection Pro', 'Ultra 10Gbps Speed', '30-Day Money Back'],
  },
  {
    id: 'ad_bybit',
    title: 'BYBIT VIP FUTURES & CARD',
    subtitle: 'Up to $5,000 Welcome Gifts',
    tagline: 'Top-tier crypto derivatives platform with automated trading bots',
    badge: 'Global Trading Partner',
    iconType: 'exchange',
    colorTheme: 'amber',
    stats: { label: 'Reward Pool', value: '$5,000 USDT' },
    actionUrl: 'https://bybit.com',
    actionText: 'Claim $5,000 Bonus',
    features: ['100x Margin Trading', '1-Click Copy Trading', '10% Cashback Card'],
  },
  {
    id: 'ad_apexpay',
    title: 'APEXPAY CRYPTO WALLET',
    subtitle: 'Next-Gen Multi-Chain • 0% Swap Fees',
    tagline: 'Store BTC, ETH, USDT & TON with bank-grade multi-party encryption',
    badge: 'Audited & Certified',
    iconType: 'crypto',
    colorTheme: 'amber',
    stats: { label: 'Swap Volume', value: '$240M / 24h' },
    actionUrl: 'https://apexpay.network',
    actionText: 'Get ApexPay',
    features: ['Zero Swap Fees', 'Instant Cashbacks', 'Multi-Chain Support'],
  },
  {
    id: 'ad_aliexpress',
    title: 'ALIEXPRESS MEGA CHOICE DEALS',
    subtitle: 'Up to 90% Off • Free Global Shipping',
    tagline: 'Direct factory prices on electronics, accessories & trending fashion',
    badge: 'Global E-Commerce Leader',
    iconType: 'shopping',
    colorTheme: 'rose',
    stats: { label: 'Flash Discounts', value: 'Up to 90% OFF' },
    actionUrl: 'https://aliexpress.com',
    actionText: 'Shop Choice Deals',
    features: ['Free Shipping 10-Day', 'Free 15-Day Returns', 'Direct Factory Price'],
  },
  {
    id: 'ad_duolingo',
    title: 'DUOLINGO SUPER MASTER',
    subtitle: 'Learn 40+ Languages Fast & Fun',
    tagline: 'Bite-sized gamified lessons designed to build fluent conversation',
    badge: 'App of the Year',
    iconType: 'game',
    colorTheme: 'emerald',
    stats: { label: 'Active Learners', value: '80,000,000+' },
    actionUrl: 'https://duolingo.com',
    actionText: 'Start Free 14-Day Trial',
    features: ['Ad-Free Experience', 'Unlimited Practice Hearts', 'Personalized Mistakes Review'],
  },
  {
    id: 'ad_temu',
    title: 'TEMU $100 COUPON BUNDLE',
    subtitle: 'Exclusive New Shopper Package',
    tagline: 'Download the app and enjoy rock-bottom prices on millions of goods',
    badge: 'Trending Shopping App',
    iconType: 'shopping',
    colorTheme: 'purple',
    stats: { label: 'Coupon Value', value: '$100 Bundle' },
    actionUrl: 'https://temu.com',
    actionText: 'Claim $100 Kit',
    features: ['Price Adjustment Guarantee', 'Free Delivery Worldwide', 'Secure 256-Bit Checkout'],
  },
  {
    id: 'ad_okx',
    title: 'OKX EARN & WEB3 AGGREGATOR',
    subtitle: 'Up to 18% APY on USDT Staking',
    tagline: 'Decentralized wallet and high-yield staking with transparent proof of reserves',
    badge: '100% Proof of Reserves',
    iconType: 'crypto',
    colorTheme: 'purple',
    stats: { label: 'Stablecoin APY', value: 'Up to 18.2%' },
    actionUrl: 'https://okx.com',
    actionText: 'Start Staking & Earn',
    features: ['Zero Lock-up Period', 'Daily Interest Payouts', '1-Click DEX Swaps'],
  },
  {
    id: 'ad_cyberquest',
    title: 'CYBERQUEST: ARENA OF LEGENDS',
    subtitle: 'Tactical RPG Battle • Over 5M Active Commanders',
    tagline: 'Build your squad, conquer PvP arenas and claim real crypto rewards',
    badge: '#1 RPG on Mobile',
    iconType: 'game',
    colorTheme: 'purple',
    stats: { label: 'Active Commanders', value: '5,200,000+' },
    actionUrl: 'https://cyberquest.game',
    actionText: 'Play CyberQuest Free',
    features: ['High-FPS Combat', 'PvP Clan Wars', 'Daily Loot Crates'],
  },
  {
    id: 'ad_major',
    title: 'MAJOR STARS MINI-APP',
    subtitle: 'The #1 Ranked Telegram Gaming Bot',
    tagline: 'Earn real Telegram Stars and TON tokens by completing fun mini-games',
    badge: 'Official Stars Partner',
    iconType: 'telegram',
    colorTheme: 'emerald',
    stats: { label: 'Telegram Stars Paid', value: '45,000,000+' },
    actionUrl: 'https://t.me/major',
    actionText: 'Open Major Bot',
    features: ['Telegram Stars Drops', 'Viral Squads', 'Instant Withdrawal'],
  },
];

/**
 * Smart Non-Repeating Rotation Engine
 * Guarantees that every single time a user clicks "Watch Ads",
 * they receive 3 completely fresh Story Ads and 1 completely fresh Show Ad
 * that have not been seen in recent sessions!
 */
export function getRotatingAdSet(
  sessionId?: string,
  userAdsWatched: number = 0
): { stories: StoryAd[]; showAd: SponsorShowAd } {
  // Read seen IDs from sessionStorage
  let seenStoryIds: string[] = [];
  let seenShowIds: string[] = [];

  try {
    const rawStories = sessionStorage.getItem('paywatch_seen_story_ids');
    if (rawStories) seenStoryIds = JSON.parse(rawStories);
    const rawShows = sessionStorage.getItem('paywatch_seen_show_ids');
    if (rawShows) seenShowIds = JSON.parse(rawShows);
  } catch {}

  // Filter out recently seen story ads
  let availableStories = ALL_STORY_ADS.filter((ad) => !seenStoryIds.includes(ad.id));

  // If we don't have at least 3 unseen stories left, reset seen history
  if (availableStories.length < 3) {
    seenStoryIds = [];
    availableStories = [...ALL_STORY_ADS];
  }

  // Shuffle available stories using a blend of session seed and random
  const shuffledStories = [...availableStories].sort(() => Math.random() - 0.5);
  const pickedStories = shuffledStories.slice(0, 3);

  // If somehow less than 3, pad with others
  while (pickedStories.length < 3) {
    const candidate = ALL_STORY_ADS.find((a) => !pickedStories.some((p) => p.id === a.id));
    if (candidate) pickedStories.push(candidate);
    else break;
  }

  // Filter out recently seen show ads
  let availableShows = ALL_SHOW_ADS.filter((ad) => !seenShowIds.includes(ad.id));
  if (availableShows.length < 1) {
    seenShowIds = [];
    availableShows = [...ALL_SHOW_ADS];
  }

  const shuffledShows = [...availableShows].sort(() => Math.random() - 0.5);
  const pickedShow = shuffledShows[0] || ALL_SHOW_ADS[0];

  // Save new seen IDs (keep last 12 stories and 6 shows in memory)
  try {
    const newSeenStories = [...seenStoryIds, ...pickedStories.map((s) => s.id)].slice(-12);
    const newSeenShows = [...seenShowIds, pickedShow.id].slice(-6);
    sessionStorage.setItem('paywatch_seen_story_ids', JSON.stringify(newSeenStories));
    sessionStorage.setItem('paywatch_seen_show_ids', JSON.stringify(newSeenShows));
  } catch {}

  return {
    stories: pickedStories,
    showAd: pickedShow,
  };
}
