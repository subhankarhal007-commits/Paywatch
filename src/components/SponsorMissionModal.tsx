import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  Award,
  ShieldCheck,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { api } from '../services/api.ts';
import { adsgram } from '../services/adsgram.ts';

interface SponsorMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SponsorMissionModal: React.FC<SponsorMissionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, setUser, triggerHaptic, showToast, refreshUser } = useApp();
  const [hasOpenedLink, setHasOpenedLink] = useState<boolean>(false);
  const [isAutoCrediting, setIsAutoCrediting] = useState<boolean>(false);
  const [isCreditedSuccess, setIsCreditedSuccess] = useState<boolean>(false);

  const hasOpenedRef = useRef<boolean>(false);
  const isCreditingRef = useRef<boolean>(false);

  const sponsorLink = 'https://t.me/major';

  // Automatically credit $0.05 when user returns to Pay Watch bot
  const creditAutomaticReward = async () => {
    if (isCreditingRef.current) return;
    isCreditingRef.current = true;
    setIsAutoCrediting(true);

    try {
      const res = await api.completeSponsorMission();
      if (res.success) {
        triggerHaptic('success');
        showToast('🎉 Welcome back! +$0.05 USDT automatically added to your balance!', 'success');

        if (res.user?.telegram_id) {
          localStorage.setItem(`paywatch_vbal_${res.user.telegram_id}`, res.user.balance.toFixed(2));
        }

        if (res.user) {
          setUser(res.user);
        } else {
          await refreshUser();
        }

        setIsCreditedSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      showToast('🎉 Welcome back! +$0.05 USDT automatically added to your balance!', 'success');
      triggerHaptic('success');
      await refreshUser();
      setIsCreditedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setIsAutoCrediting(false);
      localStorage.removeItem('paywatch_sponsor_pending');
    }
  };

  // Listen for user returning to the app after viewing the sponsor channel
  useEffect(() => {
    if (!isOpen) {
      setHasOpenedLink(false);
      setIsAutoCrediting(false);
      setIsCreditedSuccess(false);
      hasOpenedRef.current = false;
      isCreditingRef.current = false;
      return;
    }

    const handleReturn = () => {
      if (hasOpenedRef.current && !isCreditingRef.current) {
        creditAutomaticReward();
      }
    };

    window.addEventListener('focus', handleReturn);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && hasOpenedRef.current && !isCreditingRef.current) {
        handleReturn();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Backup interval: if user switched apps in Telegram and came back
    const interval = setInterval(() => {
      if (hasOpenedRef.current && !isCreditingRef.current && document.visibilityState === 'visible') {
        const openedTime = Number(localStorage.getItem('paywatch_sponsor_open_time') || '0');
        if (openedTime > 0 && Date.now() - openedTime > 2500) {
          handleReturn();
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('focus', handleReturn);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenLink = () => {
    triggerHaptic('light');
    setHasOpenedLink(true);
    hasOpenedRef.current = true;
    localStorage.setItem('paywatch_sponsor_pending', 'true');
    localStorage.setItem('paywatch_sponsor_open_time', String(Date.now()));

    try {
      adsgram.showTaskAd('task-52776').catch(() => {});
    } catch {}

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(sponsorLink);
    } else if (tg?.openLink) {
      tg.openLink(sponsorLink);
    } else {
      window.open(sponsorLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-100 shadow-2xl p-5 sm:p-6 overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-500/25 mb-3">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200/60 text-purple-700 text-[10px] font-mono font-bold uppercase mb-1">
            <span>Official Sponsor Mission</span>
            <span>•</span>
            <span>task-52776</span>
          </div>

          <h3 className="text-lg font-black text-slate-900 font-display">
            Sponsor Mission
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto">
            Open the sponsor channel and get instant rewards automatically!
          </p>
        </div>

        {/* Reward Card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-purple-50/80 border border-purple-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                Mission Reward
              </span>
              <span className="text-sm font-black text-slate-900 font-mono">
                +0.05 USDT
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/50">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Automatic Credit</span>
          </div>
        </div>

        {/* Mission Instructions */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
              1
            </span>
            <p>
              Tap <span className="font-bold text-slate-900">Visit Sponsor Channel</span> to open the partner channel.
            </p>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
              2
            </span>
            <p>
              When you return back to Pay Watch bot, <span className="font-bold text-emerald-600">+0.05 $</span> will be <span className="font-bold text-slate-900">automatically added</span> to your balance!
            </p>
          </div>
        </div>

        {/* Action Button & Status Display (Claim button removed as instructed) */}
        <div className="mt-5 space-y-2">
          {isCreditedSuccess ? (
            <div className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5" />
              <span>+$0.05 Added Automatically!</span>
            </div>
          ) : isAutoCrediting ? (
            <div className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Crediting $0.05 to Balance...</span>
            </div>
          ) : hasOpenedLink ? (
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>Channel Opened!</span>
                </div>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Return to Pay Watch bot to get your $0.05 automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenLink}
                className="w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Re-open Sponsor Channel</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenLink}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-600 text-white shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] ring-2 ring-purple-400/30"
            >
              <span>Visit Sponsor Channel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
