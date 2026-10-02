import React, { useState, useEffect } from 'react';
import {
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Layers,
  ExternalLink,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const WatchAdsSection: React.FC = () => {
  const { user, settings, adStatus, startAdWatch, triggerMonetagAd, triggerHaptic, refreshAdStatus } = useApp();
  const [localCooldown, setLocalCooldown] = useState<number>(0);
  const [isLoadingAd, setIsLoadingAd] = useState<boolean>(false);
  const [selectedFormat, setSelectedFormat] = useState<'rewarded_interstitial' | 'rewarded_popup'>(
    'rewarded_interstitial'
  );

  // Sync and decrement cooldown counter locally every second
  useEffect(() => {
    if (adStatus?.cooldownRemaining) {
      setLocalCooldown(adStatus.cooldownRemaining);
    } else {
      setLocalCooldown(0);
    }
  }, [adStatus?.cooldownRemaining]);

  useEffect(() => {
    if (localCooldown <= 0) return;
    const timer = setInterval(() => {
      setLocalCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          refreshAdStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [localCooldown, refreshAdStatus]);

  const dailyWatched = user?.daily_ads || adStatus?.dailyAdsWatched || 0;
  const dailyLimit = adStatus?.dailyLimit || 15;
  const reward = settings?.ad_reward !== undefined ? settings.ad_reward : 0.03;
  const isLimitReached = dailyWatched >= dailyLimit;
  const isCooldown = localCooldown > 0;
  const canWatch = !isLimitReached && !isCooldown && !isLoadingAd;

  const handleWatchAdClick = async (type: 'rewarded_interstitial' | 'rewarded_popup' = selectedFormat) => {
    if (!canWatch) {
      triggerHaptic('light');
      return;
    }

    setIsLoadingAd(true);
    try {
      await triggerMonetagAd(type);
    } finally {
      setIsLoadingAd(false);
    }
  };

  // Status message logic matching user video
  let statusText = `ⓘ Ready to earn +$${reward.toFixed(2)}`;
  let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200/60';
  let statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />;

  if (isLimitReached) {
    statusText = 'ⓘ Daily limit reached';
    statusColor = 'text-slate-600 bg-slate-100 border-slate-200';
    statusIcon = <AlertCircle className="w-3.5 h-3.5 text-slate-500 inline mr-1" />;
  } else if (isCooldown) {
    statusText = `Wait ${localCooldown}s before next ad...`;
    statusColor = 'text-amber-800 bg-amber-50 border-amber-200';
    statusIcon = <Clock className="w-3.5 h-3.5 text-amber-600 inline mr-1 animate-spin" />;
  } else if (isLoadingAd) {
    statusText = 'Loading ad...';
    statusColor = 'text-indigo-800 bg-indigo-50 border-indigo-200';
    statusIcon = <Sparkles className="w-3.5 h-3.5 text-indigo-600 inline mr-1 animate-spin" />;
  }

  const progressPercent = Math.min(100, Math.round((dailyWatched / dailyLimit) * 100));

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 transition-all">
      {/* Title & Subtitle Matching Video Frame 00:00 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display tracking-tight">
            Watch Ads &amp; Earn
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Watch 3 quick sponsor stories + 1 featured show ad to earn ${reward.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50/80 border border-amber-200/60">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-black text-amber-800 font-display tabular-nums tracking-tight">
            +${reward.toFixed(2)} / ad
          </span>
        </div>
      </div>

      {/* Primary Main Ad Card - Tap to Watch (Video Frame 00:00) */}
      <div
        onClick={() => handleWatchAdClick(selectedFormat)}
        className={`group relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer p-4 ${
          canWatch
            ? 'gold-border bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 hover:shadow-md hover:border-amber-400 active:scale-[0.99]'
            : 'border-slate-200 bg-slate-50/70 opacity-90'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: Large Circular Play Button */}
          <div className="relative shrink-0">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105 active:scale-95 ${
                canWatch
                  ? 'gold-gradient-bg shadow-amber-500/25 text-slate-950'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {isLoadingAd ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </div>
            {canWatch && !isLoadingAd && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
            )}
          </div>

          {/* Center: Title & Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                {isLoadingAd ? 'Loading ad...' : 'Watch Ad'}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              Complete video to earn instantly
            </p>
          </div>

          {/* Right: Reward Amount (+${reward}) */}
          <div className="shrink-0 text-right">
            <div className="px-2.5 py-1 rounded-xl bg-amber-100/80 border border-amber-300 text-xs font-black text-amber-900 font-display tabular-nums tracking-tight">
              +${reward.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Daily limit & 2-step indicator */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">1</span>
            <span>3 Stories</span>
            <span className="text-slate-300">➔</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">2</span>
            <span>1 Show Ad</span>
          </div>
          <span className="font-bold text-slate-600 font-mono">
            {dailyWatched} / {dailyLimit} today
          </span>
        </div>
      </div>

      {/* Ad Format Selector Buttons (User's 3 Monetag Formats) */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {/* Format 1: Rewarded Interstitial */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFormat('rewarded_interstitial');
            handleWatchAdClick('rewarded_interstitial');
          }}
          disabled={!canWatch}
          className={`py-2 px-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
            selectedFormat === 'rewarded_interstitial'
              ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-sm'
              : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <Video className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold leading-tight">Rewarded Interstitial</span>
              <span className="text-[9px] text-slate-500">Full Video Ad</span>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-amber-600 font-display">+{`$${reward.toFixed(2)}`}</span>
        </button>

        {/* Format 2: Rewarded Popup */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFormat('rewarded_popup');
            handleWatchAdClick('rewarded_popup');
          }}
          disabled={!canWatch}
          className={`py-2 px-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
            selectedFormat === 'rewarded_popup'
              ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-sm'
              : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-700 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold leading-tight">Rewarded Popup</span>
              <span className="text-[9px] text-slate-500">Quick Pop Ad</span>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-amber-600 font-display">+{`$${reward.toFixed(2)}`}</span>
        </button>
      </div>

      {/* Progress Bar: Daily watched */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-500 font-medium">Daily Ad Progress</span>
          <span className="font-semibold text-slate-800 tabular-nums">
            {dailyWatched} / {dailyLimit} today
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden p-[1px] border border-slate-200/50">
          <div
            className="h-full rounded-full gold-gradient-bg transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-3.5">
        <div
          className={`flex items-center justify-center text-xs font-medium py-1.5 px-3 rounded-xl border ${statusColor} transition-colors`}
        >
          {statusIcon}
          <span>{statusText}</span>
        </div>
      </div>
    </div>
  );
};
