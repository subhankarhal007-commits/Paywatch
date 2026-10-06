import React, { useState, useEffect, useRef } from 'react';
import {
  X,
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
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { getRotatingAdSet } from '../data/adInventory.tsx';

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
  iconType: 'wallet' | 'exchange' | 'game' | 'telegram' | 'crypto';
  colorTheme: 'blue' | 'purple' | 'amber' | 'emerald' | 'cyan';
  stats: { label: string; value: string };
  actionUrl: string;
  actionText: string;
  features: string[];
}

// Master pool of Story Ads (Used to rotate sets of 3 distinct stories every session)
const ALL_STORY_ADS: StoryAd[] = [
  // 1. BC.Game
  {
    id: 'bcgame',
    brand: 'BC.GAME',
    badge: 'GambleAware',
    headline: '€10,000 VICTORY AWAITS! 🏆',
    description:
      'Win your share of €10,000! Enter the World Cup Combo Tournament with just a €3 bet. High Odds, Massive Payouts. Join now!',
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
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight drop-shadow-md">
            €10,000 WORLD CUP
          </h2>
          <div className="text-sm font-black text-emerald-300 tracking-wider uppercase mt-0.5">
            COMBO TOURNAMENT
          </div>
        </div>

        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="relative flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-0.5 shadow-xl shadow-amber-500/30 animate-bounce">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <span className="text-[10px] font-black text-amber-300 mt-1 uppercase tracking-wider">
              €10,000 Pool
            </span>
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

  // 2. X8 Poker
  {
    id: 'x8poker',
    brand: 'X8 Poker',
    badge: 'Ad • 18+',
    headline: '68 USDT Awaits You!',
    description:
      'Claim your daily 68 USDT reward on X8 Poker. Play on Telegram and unlock nonstop surprises every day!',
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

  // 3. AI Pocket Robot
  {
    id: 'pocketrobot',
    brand: 'ai pocket robot',
    badge: 'Ad • 18+',
    headline: 'Passive Trading Starts Here',
    description: 'Let ai pocket robot handle the heavy lifting while you stay informed.',
    actionText: 'Open',
    attribution: '@adsgram_ai - ads in Telegram',
    actionUrl: 'https://t.me/pocket_robot_bot',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#030712] via-[#0f172a] to-[#030712] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-xl shadow-blue-500/30 flex items-center justify-center mb-2">
            <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
              <span className="text-2xl font-black text-blue-400 font-display">P</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
            POCKET ROBOT
          </h2>
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mt-0.5">
            OPEN THE BOT IN TELEGRAM
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
            SEE FOR YOURSELF
          </div>
        </div>

        <div className="relative z-10 w-full max-w-xs my-auto py-2 bg-slate-900/80 rounded-xl border border-blue-500/30 p-2.5 flex items-center justify-between gap-2 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold text-white">BTC / TON Signals</span>
              <span className="text-[9px] text-emerald-400 font-mono">+24.8% Today</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold font-mono">
            Auto-Pilot
          </span>
        </div>

        <div className="relative z-10 text-[10px] text-slate-400 font-medium pb-1">
          Passive crypto intelligence inside Telegram
        </div>
      </div>
    ),
  },

  // 4. Blum Crypto Exchange Mini App
  {
    id: 'blum',
    brand: 'Blum Crypto',
    badge: 'Official App',
    headline: 'Trade, Farm & Win Drops on Blum',
    description: 'All crypto tokens in one Telegram app. Farm Blum points every 8 hours and join millions!',
    actionText: 'Farm Now!',
    attribution: '@adsgram_ai - ads in Telegram',
    actionUrl: 'https://t.me/blum',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#0b0c10] via-[#1f1235] to-[#0b0c10] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-950/80 border border-fuchsia-400/40 text-fuchsia-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Coins className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>FARMING LIVE • 8-HOUR DROPS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            BLUM CRYPTO
          </h2>
          <div className="text-xs font-black text-fuchsia-400 tracking-wider uppercase mt-0.5">
            ALL TOKENS • ONE MINI APP
          </div>
        </div>

        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-pink-400 to-amber-400 p-0.5 shadow-xl shadow-fuchsia-500/30 flex items-center justify-center animate-pulse">
            <div className="w-full h-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-fuchsia-400">B</span>
              <span className="text-[8px] font-bold text-amber-300 font-mono">+540 BP</span>
            </div>
          </div>
          <div className="w-36 rounded-xl bg-slate-900 border border-fuchsia-500/40 p-2 shadow-2xl flex flex-col gap-1 text-left">
            <div className="text-[8px] text-slate-400 font-bold">FARMING POOL</div>
            <div className="text-xs font-black text-white">42,000,000+ Users</div>
            <div className="py-1 rounded bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-black text-[9px] text-center uppercase tracking-wider shadow">
              CLAIM POINTS
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-fuchsia-200/80 font-bold pb-1">
          <span>⚡ Instant Swaps</span>
          <span>•</span>
          <span>🎮 Drop Game</span>
          <span>•</span>
          <span>🚀 TON Ecosystem</span>
        </div>
      </div>
    ),
  },

  // 5. Hamster Kombat / Tap Game
  {
    id: 'notcoin',
    brand: 'Notcoin Pay',
    badge: 'Verified TON',
    headline: 'Explore Web3 on Telegram',
    description: 'Discover the most rewarding campaigns, games and tokens inside Telegram.',
    actionText: 'Explore',
    attribution: '@adsgram_ai - ads in Telegram',
    actionUrl: 'https://t.me/notcoin',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#09090b] via-[#14151a] to-[#09090b] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-950/80 border border-yellow-400/40 text-yellow-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span>NOTCOIN CAMPAIGNS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            EARN WITH NOTCOIN
          </h2>
          <div className="text-xs font-black text-yellow-400 tracking-wider uppercase mt-0.5">
            COMMUNITY-POWERED DROPS
          </div>
        </div>

        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-600 p-1 shadow-xl shadow-yellow-500/30 flex items-center justify-center animate-spin" style={{ animationDuration: '8s' }}>
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-yellow-400 font-black text-lg">
              NOT
            </div>
          </div>
          <div className="w-36 rounded-xl bg-slate-900 border border-yellow-500/40 p-2 shadow-2xl flex flex-col gap-1 text-left">
            <div className="text-[8px] text-slate-400 font-bold">TOTAL REWARDS</div>
            <div className="text-xs font-black text-white">$10,000,000+</div>
            <div className="py-1 rounded bg-yellow-400 text-slate-950 font-black text-[9px] text-center uppercase tracking-wider shadow">
              VIEW POOLS
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-yellow-200/80 font-bold pb-1">
          <span>💎 Staking Yield</span>
          <span>•</span>
          <span>🎁 Exclusive Drops</span>
        </div>
      </div>
    ),
  },

  // 6. Major Stars Arena
  {
    id: 'major',
    brand: 'Major Bot',
    badge: 'Stars Partner',
    headline: 'Rank #1 & Win Stars on Telegram',
    description: 'Complete daily tasks, climb the leaderboard and get real Telegram Stars daily!',
    actionText: 'Join Major',
    attribution: '@adsgram_ai - ads in Telegram',
    actionUrl: 'https://t.me/major',
    renderGraphic: () => (
      <div className="relative w-full h-full min-h-[250px] bg-gradient-to-b from-[#021024] via-[#052659] to-[#021024] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-full pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-cyan-400" />
            <span>MAJOR TOP RANKINGS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
            MAJOR ON TELEGRAM
          </h2>
          <div className="text-xs font-black text-cyan-400 tracking-wider uppercase mt-0.5">
            TELEGRAM STARS &amp; TON
          </div>
        </div>

        <div className="relative z-10 my-auto py-2 flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-0.5 shadow-xl shadow-cyan-500/30 flex items-center justify-center animate-bounce">
            <div className="w-full h-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center">
              <Star className="w-7 h-7 text-cyan-400 fill-cyan-400" />
              <span className="text-[7px] font-black text-cyan-300">STARS</span>
            </div>
          </div>
          <div className="w-36 rounded-xl bg-slate-900 border border-cyan-500/40 p-2 shadow-2xl flex flex-col gap-1 text-left">
            <div className="text-[8px] text-slate-400 font-bold">CURRENT RANK</div>
            <div className="text-xs font-black text-white">#1 Leaderboard</div>
            <div className="py-1 rounded bg-cyan-400 text-slate-950 font-black text-[9px] text-center uppercase tracking-wider shadow">
              BOOST SQUAD
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full flex items-center justify-center gap-3 text-[10px] text-cyan-200/80 font-bold pb-1">
          <span>⭐ Stars Rewards</span>
          <span>•</span>
          <span>⚡ Instant Tasks</span>
        </div>
      </div>
    ),
  },
];

// Master pool of Featured Sponsor Show Ads (Stage 2)
const ALL_SHOW_ADS: SponsorShowAd[] = [
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
    id: 'ad_bitget',
    title: 'BITGET GLOBAL FUTURES',
    subtitle: 'Copy Trade Pros • Up to $5,000 Bonus',
    tagline: 'Leading crypto futures exchange with copy trading and top liquidity',
    badge: 'Global Exchange',
    iconType: 'exchange',
    colorTheme: 'blue',
    stats: { label: 'Welcome Bonus', value: 'Up to $5,000' },
    actionUrl: 'https://bitget.com',
    actionText: 'Claim $5,000 Bonus',
    features: ['Top Liquidity', '1-Click Copy Trading', '24/7 VIP Support'],
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

export const AdPlayerModal: React.FC = () => {
  const {
    isAdPlayerOpen,
    activeAdSession,
    closeAdPlayer,
    handleAdFinished,
    triggerHaptic,
    user,
    settings,
  } = useApp();

  const adReward = settings?.ad_reward !== undefined ? settings.ad_reward : (activeAdSession?.reward || 0.03);

  // Dynamic Non-Repeating Ad Rotator: Generates completely fresh Story Ads and Show Ad on every single click
  const [adSet, setAdSet] = useState<{ stories: any[]; showAd: any }>(() =>
    getRotatingAdSet(activeAdSession?.sessionId, user?.ads_watched || 0)
  );

  const currentStories = adSet.stories;
  const currentShowAd = adSet.showAd;

  // Stage: 'stories' (3 consecutive ads) -> 'show_ad' (1 final featured show ad)
  const [stage, setStage] = useState<'stories' | 'show_ad'>('stories');

  // Stage 1 Duration: 4 seconds each for 3 stories = 12 seconds total
  const STORY_DURATION = 4;
  const TOTAL_STORIES_DURATION = STORY_DURATION * 3;

  // Stage 2 Duration: 5 seconds for the final show ad
  const SHOW_AD_DURATION = 5;

  const [storiesElapsed, setStoriesElapsed] = useState<number>(0);
  const [showAdElapsed, setShowAdElapsed] = useState<number>(0);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Initialize on open - Pick fresh ads each time modal opens
  useEffect(() => {
    if (isAdPlayerOpen) {
      const freshAdSet = getRotatingAdSet(activeAdSession?.sessionId, user?.ads_watched || 0);
      setAdSet(freshAdSet);
      setStage('stories');
      setStoriesElapsed(0);
      setShowAdElapsed(0);
      setIsFinishing(false);
    }
  }, [isAdPlayerOpen, activeAdSession?.sessionId]);

  // Main Timer Loop
  useEffect(() => {
    if (!isAdPlayerOpen || !activeAdSession) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = 100;
    timerRef.current = setInterval(() => {
      if (stage === 'stories') {
        setStoriesElapsed((prev) => {
          const next = Math.round((prev + intervalMs / 1000) * 10) / 10;
          if (next >= TOTAL_STORIES_DURATION) {
            // Stage 1 Complete! Transition immediately to Stage 2: 1ta Ads Show!
            triggerHaptic('medium');
            setStage('show_ad');
            try {
              (window as any).show_11906638?.();
            } catch {}
            return TOTAL_STORIES_DURATION;
          }
          return next;
        });
      } else if (stage === 'show_ad') {
        setShowAdElapsed((prev) => {
          const next = Math.round((prev + intervalMs / 1000) * 10) / 10;
          if (next >= SHOW_AD_DURATION) {
            clearInterval(timerRef.current);
            return SHOW_AD_DURATION;
          }
          return next;
        });
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAdPlayerOpen, activeAdSession, stage]);

  // Handle Telegram native WebApp back button
  useEffect(() => {
    if (!isAdPlayerOpen) return;

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.BackButton) {
      tg.BackButton.show();
      const onBack = () => {
        handleCutAd();
      };
      tg.BackButton.onClick(onBack);
      return () => {
        tg.BackButton.offClick(onBack);
        tg.BackButton.hide();
      };
    }
  }, [isAdPlayerOpen, stage, storiesElapsed, showAdElapsed]);

  if (!isAdPlayerOpen || !activeAdSession) return null;

  // Active story index for Stage 1 (0, 1, or 2)
  const currentStoryIndex = Math.min(2, Math.floor(storiesElapsed / STORY_DURATION));
  const currentStory = currentStories[currentStoryIndex] || currentStories[0];
  const storyInSec = storiesElapsed - currentStoryIndex * STORY_DURATION;

  // Stage 1 button progress logic (matching user video)
  let buttonPercent = 0;
  let isButtonReady = false;
  if (storyInSec < 0.8) {
    buttonPercent = 0;
  } else if (storyInSec < 1.5) {
    buttonPercent = 50;
  } else if (storyInSec < 2.5) {
    buttonPercent = 75;
  } else {
    buttonPercent = 100;
    isButtonReady = true;
  }

  const secondsLeftInStory = Math.max(1, Math.ceil(STORY_DURATION - storyInSec));

  // Stage 2 Show Ad calculations
  const showAdSecondsLeft = Math.max(0, Math.ceil(SHOW_AD_DURATION - showAdElapsed));
  const showAdProgress = Math.min(100, Math.round((showAdElapsed / SHOW_AD_DURATION) * 100));
  const isShowAdReadyToClaim = showAdElapsed >= SHOW_AD_DURATION;

  // Auto finish / Claim Reward
  const handleClaimReward = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    triggerHaptic('success');
    await handleAdFinished();
  };

  // If user cuts or closes the ad early
  const handleCutAd = () => {
    triggerHaptic('error');
    if (stage === 'stories' || !isShowAdReadyToClaim) {
      closeAdPlayer(false);
    } else {
      handleClaimReward();
    }
  };

  // Story tap navigation (Left 25% / Right 25%)
  const handleTapScreen = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== 'stories') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.25 && currentStoryIndex > 0) {
      triggerHaptic('light');
      setStoriesElapsed((currentStoryIndex - 1) * STORY_DURATION);
    } else if (clickX > width * 0.75 && currentStoryIndex < 2) {
      triggerHaptic('light');
      setStoriesElapsed((currentStoryIndex + 1) * STORY_DURATION);
    }
  };

  // Sponsor external link click
  const handleCtaClick = (url: string) => {
    triggerHaptic('medium');
    const tg = (window as any).Telegram?.WebApp;
    if (url) {
      if (tg?.openLink) {
        tg.openLink(url);
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/92 backdrop-blur-md animate-in fade-in duration-200 p-2 sm:p-4 select-none">
      <div className="relative w-full max-w-sm rounded-[32px] bg-[#111827] border border-slate-800 shadow-2xl overflow-hidden text-white flex flex-col max-h-[96vh]">
        
        {/* ================================================================= */}
        {/* HEADER: Shows current step (3 Stories -> 1 Show Ad)              */}
        {/* ================================================================= */}
        <div className="p-3 pb-2 bg-[#111827] flex flex-col gap-2 border-b border-white/5">
          
          {/* STEP INDICATORS */}
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-0.5">
            <span className={stage === 'stories' ? 'text-amber-400 font-extrabold flex items-center gap-1' : 'text-emerald-400 flex items-center gap-1'}>
              {stage === 'show_ad' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Flame className="w-3 h-3 text-amber-400" />}
              Step 1: 3 Stories ({stage === 'stories' ? `${currentStoryIndex + 1}/3` : 'Done'})
            </span>
            <span className={stage === 'show_ad' ? 'text-amber-400 font-extrabold flex items-center gap-1 animate-pulse' : 'text-slate-500'}>
              <Sparkles className="w-3 h-3" />
              Step 2: 1 Final Show Ad
            </span>
          </div>

          {/* PROGRESS BARS */}
          {stage === 'stories' ? (
            /* 3 Progress Bars for the 3 Stories */
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((idx) => {
                let segmentProgress = 0;
                if (currentStoryIndex > idx) {
                  segmentProgress = 100;
                } else if (currentStoryIndex === idx) {
                  segmentProgress = Math.min(100, Math.round((storyInSec / STORY_DURATION) * 100));
                } else {
                  segmentProgress = 0;
                }

                return (
                  <div key={idx} className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                      style={{ width: `${segmentProgress}%` }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            /* 1 Single Wide Progress Bar for the Final Show Ad */
            <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                style={{ width: `${showAdProgress}%` }}
              />
            </div>
          )}

          {/* Top Brand & Close Header */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5 pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${stage === 'stories' ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">
                {stage === 'stories' ? currentStory.brand : `⭐ ${currentShowAd.title}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-semibold">
                {stage === 'stories' ? currentStory.badge : currentShowAd.badge}
              </span>
              <button
                onClick={handleCutAd}
                title="Close ad"
                className="p-1 rounded-full bg-white/10 hover:bg-rose-500/30 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BODY: STAGE 1 (3 Stories) OR STAGE 2 (1 Show Ad)                  */}
        {/* ================================================================= */}
        {stage === 'stories' ? (
          /* =============================================================== */
          /* STAGE 1: 3 STORIES SEQUENTIAL VIEW                              */
          /* =============================================================== */
          <>
            <div
              onClick={handleTapScreen}
              className="relative flex-1 min-h-[250px] overflow-hidden cursor-pointer"
            >
              <div
                key={`${currentStory.id}_${currentStoryIndex}`}
                className="w-full h-full animate-in fade-in slide-in-from-right-4 duration-300"
              >
                {currentStory.renderGraphic()}
              </div>
            </div>

            {/* Stage 1 Story Details & Bottom Control */}
            <div className="p-4 bg-[#111827] flex flex-col gap-3 border-t border-white/5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white font-display leading-tight truncate">
                    {currentStory.headline}
                  </h3>
                  <span className="text-[9px] font-bold text-slate-400 shrink-0">
                    {currentStory.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-2">
                  {currentStory.description}
                </p>
              </div>

              {/* Sponsor Brand Row */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-400">
                  {currentStory.brand[0]}
                </div>
                <span className="text-xs font-bold text-white">{currentStory.brand}</span>
              </div>

              {/* Bottom Progress Pill or Action Button */}
              <div className="flex flex-col items-center gap-2 pt-1">
                {!isButtonReady ? (
                  <div className="relative w-full h-11 rounded-2xl bg-[#1f2937] overflow-hidden flex items-center justify-center border border-white/10 shadow-inner">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#2563eb] transition-all duration-300 ease-out"
                      style={{ width: `${buttonPercent}%` }}
                    />
                    <span className="relative z-10 text-xs font-black text-white font-display tracking-wider">
                      {buttonPercent}%
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCtaClick(currentStory.actionUrl)}
                    className="w-full h-11 rounded-2xl bg-[#2481cc] hover:bg-[#1f70b2] active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
                  >
                    <span>{currentStory.actionText}</span>
                    <span className="text-base animate-bounce">👆</span>
                  </button>
                )}

                <div className="text-xs font-mono font-bold text-slate-400 tracking-wider">
                  00:0{secondsLeftInStory}
                </div>

                <div className="text-[10px] text-slate-500 font-medium">
                  {currentStory.attribution}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* =============================================================== */
          /* STAGE 2: 1TA ADS SHOW (THE FEATURED SHOW AD - ROTATING)         */
          /* =============================================================== */
          <>
            <div className="relative flex-1 min-h-[260px] bg-gradient-to-b from-[#0f172a] via-[#020617] to-[#0f172a] flex flex-col items-center justify-between p-4 overflow-hidden text-center select-none animate-in zoom-in-95 duration-300">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />

              {/* Top Banner of the Show Ad */}
              <div className="relative z-10 w-full pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>{currentShowAd.badge}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
                  {currentShowAd.title}
                </h2>
                <div className="text-xs font-bold text-emerald-400 tracking-wider uppercase mt-1">
                  {currentShowAd.subtitle}
                </div>
              </div>

              {/* Center Interactive Show Ad Visual */}
              <div className="relative z-10 my-auto py-2 w-full max-w-xs flex flex-col items-center gap-3">
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-500 p-0.5 shadow-2xl shadow-amber-500/30">
                  <div className="w-full h-full rounded-3xl bg-slate-950 flex flex-col items-center justify-center p-2">
                    {currentShowAd.iconType === 'wallet' && <Wallet className="w-8 h-8 text-cyan-400 animate-pulse" />}
                    {currentShowAd.iconType === 'crypto' && <Coins className="w-8 h-8 text-amber-400 animate-pulse" />}
                    {currentShowAd.iconType === 'exchange' && <TrendingUp className="w-8 h-8 text-blue-400 animate-pulse" />}
                    {currentShowAd.iconType === 'game' && <Gamepad2 className="w-8 h-8 text-purple-400 animate-pulse" />}
                    {currentShowAd.iconType === 'telegram' && <Star className="w-8 h-8 text-emerald-400 fill-emerald-400 animate-pulse" />}
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mt-1">
                      {currentShowAd.stats.label}
                    </span>
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[8px] font-black text-slate-950 items-center justify-center">
                      ✓
                    </span>
                  </span>
                </div>

                <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-700/80 p-3 shadow-xl backdrop-blur-md text-left flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {currentShowAd.badge}
                    </span>
                    <span className="text-amber-400 font-mono text-[10px]">+$0.03 Reward</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    {currentShowAd.tagline}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                    <span>{currentShowAd.stats.label}:</span>
                    <span className="text-emerald-400 font-bold">{currentShowAd.stats.value}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="relative z-10 w-full flex items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold pb-1 flex-wrap">
                {currentShowAd.features.map((feat, i) => (
                  <React.Fragment key={i}>
                    <span>{feat}</span>
                    {i < currentShowAd.features.length - 1 && <span>•</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Stage 2 Action & Claim Controls */}
            <div className="p-4 bg-[#111827] flex flex-col gap-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white font-display">
                    {isShowAdReadyToClaim ? '🎉 Show Completed! Claim Reward' : 'Watching Sponsor Show...'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isShowAdReadyToClaim
                      ? `Tap button below to deposit +$${adReward.toFixed(2)} instantly`
                      : `Keep open for ${showAdSecondsLeft}s to verify reward`}
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono font-black text-xs">
                  +${adReward.toFixed(2)}
                </div>
              </div>

              {/* Big Action / Claim Button */}
              <div className="flex flex-col items-center gap-2 pt-1">
                {!isShowAdReadyToClaim ? (
                  // Countdown Progress Button
                  <div className="relative w-full h-12 rounded-2xl bg-[#1f2937] overflow-hidden flex items-center justify-center border border-white/10 shadow-inner">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 ease-out"
                      style={{ width: `${showAdProgress}%` }}
                    />
                    <span className="relative z-10 text-xs font-black text-white font-display tracking-wider flex items-center gap-1.5">
                      <span>Watching Sponsor Show</span>
                      <span className="font-mono text-amber-200">({showAdSecondsLeft}s)</span>
                    </span>
                  </div>
                ) : (
                  // Glowing Claim Reward Button
                  <button
                    onClick={handleClaimReward}
                    disabled={isFinishing}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-all cursor-pointer animate-pulse"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>{isFinishing ? 'Crediting Reward...' : `Claim +$${adReward.toFixed(2)} Reward Now!`}</span>
                    <span className="text-base">💰</span>
                  </button>
                )}

                <div className="w-full flex items-center justify-between text-[10px] text-slate-500 font-medium px-1">
                  <span
                    onClick={() => handleCtaClick(currentShowAd.actionUrl)}
                    className="text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{currentShowAd.actionText}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                  <span>Verified by Pay Watch Sponsored Network</span>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
