import React, { useState, useEffect } from 'react';
import {
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const WatchAdButton: React.FC = () => {
  const {
    user,
    settings,
    adStatus,
    watchAdsgramSequence,
    triggerHaptic,
    refreshAdStatus,
  } = useApp();

  const [localCooldown, setLocalCooldown] = useState<number>(0);
  const [isLoadingAd, setIsLoadingAd] = useState<boolean>(false);

  // Sync cooldown from backend
  useEffect(() => {
    if (adStatus?.cooldownRemaining && adStatus.cooldownRemaining > 0) {
      setLocalCooldown(adStatus.cooldownRemaining);
    } else {
      setLocalCooldown(0);
    }
  }, [adStatus?.cooldownRemaining]);

  // Precise 20-second countdown decrementer
  useEffect(() => {
    if (localCooldown <= 0) return;

    const timer = setInterval(() => {
      setLocalCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerHaptic('success');
          refreshAdStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [localCooldown, refreshAdStatus, triggerHaptic]);

  const dailyWatched = user?.daily_ads || adStatus?.dailyAdsWatched || 0;
  const dailyLimit = adStatus?.dailyLimit || 15;
  const reward = settings?.ad_reward !== undefined ? settings.ad_reward : 0.03;
  const isLimitReached = dailyWatched >= dailyLimit;
  const isCooldown = localCooldown > 0;
  const canWatch = !isLimitReached && !isCooldown && !isLoadingAd;

  const handleWatchClick = async () => {
    if (!canWatch) {
      triggerHaptic('light');
      return;
    }

    setIsLoadingAd(true);
    try {
      await watchAdsgramSequence('auto');
    } finally {
      setIsLoadingAd(false);
    }
  };

  const handleWatchSpecific = async (format: 'rewarded' | 'interstitial' | 'task') => {
    if (!canWatch) {
      triggerHaptic('light');
      return;
    }

    setIsLoadingAd(true);
    try {
      await watchAdsgramSequence(format);
    } finally {
      setIsLoadingAd(false);
    }
  };

  // Cooldown progress percentage (based on 20 seconds standard cooldown)
  const cooldownPercent = isCooldown ? Math.round(((20 - localCooldown) / 20) * 100) : 100;

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 sm:p-5 transition-all">
      {/* Top Header: Title & Balance / Reward Badge */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 text-amber-800">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 font-display tracking-tight">
              Watch &amp; Earn
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Watch sponsored ads &amp; earn instant cash
          </p>
        </div>

        {/* Balance / Reward Display: 0.03 */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-200/80 shadow-xs">
          <div className="w-5 h-5 rounded-full bg-amber-400/90 text-slate-950 flex items-center justify-center text-[10px] font-black">
            $
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="text-xs font-black text-amber-950 font-display tabular-nums">
              +{reward.toFixed(2)}
            </span>
            <span className="text-[9px] font-semibold text-amber-700/80">
              per ad
            </span>
          </div>
        </div>
      </div>

      {/* Main Action Block: "WATCH AD" Button + "Complete ads to earn instantly" */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-50 via-white to-slate-50/60 border border-slate-200/70 text-center flex flex-col items-center">
        {/* The New WATCH AD Button */}
        <button
          type="button"
          onClick={handleWatchClick}
          disabled={!canWatch}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md active:scale-[0.98] select-none ${
            canWatch
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25 cursor-pointer ring-2 ring-amber-400/40 hover:ring-amber-400'
              : isCooldown
              ? 'bg-slate-200 text-slate-600 border border-slate-300 cursor-not-allowed opacity-90'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLoadingAd ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Connecting Ad...</span>
            </>
          ) : isCooldown ? (
            <>
              <Clock className="w-5 h-5 animate-spin text-amber-700" />
              <span>Wait {localCooldown}s...</span>
            </>
          ) : isLimitReached ? (
            <>
              <AlertCircle className="w-5 h-5 text-slate-500" />
              <span>Limit Reached (15/15)</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-slate-950/90 text-amber-300 flex items-center justify-center shrink-0">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
              <span className="font-extrabold text-slate-950 tracking-wider">
                WATCH AD
              </span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-950/10 text-slate-950 font-mono text-xs font-bold">
                +${reward.toFixed(2)}
              </span>
            </>
          )}
        </button>

        {/* 20-Second Countdown Visual Bar (Visible during cooldown) */}
        {isCooldown && (
          <div className="w-full mt-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900 mb-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                20-Second Cooldown in progress
              </span>
              <span className="font-mono tabular-nums text-amber-700">
                {localCooldown}s left
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${cooldownPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Text Directly Under the Button */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Complete ads to earn instantly</span>
          <span className="text-slate-300">•</span>
          <span className="text-amber-700 font-bold tabular-nums">0.03 USDT</span>
        </div>
      </div>

      {/* 3 Available High-Earning Ad Units (All 3 Placed for User) */}
      <div className="mt-4 pt-3.5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Active Ad Units (3 Available)
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Live CPM
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Ad Unit 1: Rewarded Video (52773) */}
          <button
            type="button"
            onClick={() => handleWatchSpecific('rewarded')}
            disabled={!canWatch}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              canWatch
                ? 'bg-amber-50/60 hover:bg-amber-100/70 border-amber-200/80 cursor-pointer shadow-xs active:scale-[0.98]'
                : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-bold">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </span>
              <span className="text-[11px] font-extrabold text-amber-950 font-mono">
                +0.03 USDT
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                Rewarded Video
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Code: 52773
              </p>
            </div>
          </button>

          {/* Ad Unit 2: Quick Interstitial (int-52775) */}
          <button
            type="button"
            onClick={() => handleWatchSpecific('interstitial')}
            disabled={!canWatch}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              canWatch
                ? 'bg-sky-50/60 hover:bg-sky-100/70 border-sky-200/80 cursor-pointer shadow-xs active:scale-[0.98]'
                : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-sky-500 text-white font-bold">
                <Zap className="w-3 h-3" />
              </span>
              <span className="text-[11px] font-extrabold text-sky-950 font-mono">
                +0.02 USDT
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                Quick Bonus Ad
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Code: int-52775
              </p>
            </div>
          </button>

          {/* Ad Unit 3: Sponsor Task (task-52776) */}
          <button
            type="button"
            onClick={() => handleWatchSpecific('task')}
            disabled={!canWatch}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              canWatch
                ? 'bg-purple-50/60 hover:bg-purple-100/70 border-purple-200/80 cursor-pointer shadow-xs active:scale-[0.98]'
                : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500 text-white font-bold">
                <Sparkles className="w-3 h-3" />
              </span>
              <span className="text-[11px] font-extrabold text-purple-950 font-mono">
                +0.05 USDT
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                Sponsor Mission
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Code: task-52776
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="mt-3.5 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Daily Ad Limit</span>
          <span className="font-bold text-slate-700 font-mono">
            {dailyWatched} / {dailyLimit} today
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1.5 border border-slate-200/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.round((dailyWatched / dailyLimit) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

