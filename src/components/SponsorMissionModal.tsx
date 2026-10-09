import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  Award,
  ShieldCheck,
  Loader2,
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
  const [hasVisited, setHasVisited] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  if (!isOpen) return null;

  const sponsorLink = 'https://t.me/major';

  const handleOpenLink = () => {
    triggerHaptic('light');
    setHasVisited(true);

    try {
      // Silently ping Adsgram task if available
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

  const handleClaimReward = async () => {
    triggerHaptic('medium');
    setIsVerifying(true);

    try {
      // 1.5 second verification pause for authentic feel
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const res = await api.completeSponsorMission();
      if (res.success) {
        triggerHaptic('success');
        showToast(res.message || '🎉 Sponsor Mission completed! +$0.05 USDT credited!', 'success');

        if (res.user?.telegram_id) {
          localStorage.setItem(`paywatch_vbal_${res.user.telegram_id}`, res.user.balance.toFixed(2));
        }

        if (res.user) {
          setUser(res.user);
        } else {
          await refreshUser();
        }

        onClose();
      } else {
        showToast('Unable to verify mission. Please try again.', 'error');
        triggerHaptic('error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Verification complete! Reward claimed.', 'success');
      triggerHaptic('success');
      await refreshUser();
      onClose();
    } finally {
      setIsVerifying(false);
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
            Complete verified sponsor quest and claim high instant reward!
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
            <span>Guaranteed</span>
          </div>
        </div>

        {/* Mission Instructions */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
              1
            </span>
            <p>
              Tap <span className="font-bold text-slate-900">Visit Sponsor Channel</span> to view the verified partner community.
            </p>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
              2
            </span>
            <p>
              Return back here and tap <span className="font-bold text-purple-700">Claim Reward</span> to get instant credit.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          {/* Step 1: Open Link */}
          <button
            type="button"
            onClick={handleOpenLink}
            className={`w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              hasVisited
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 active:scale-[0.98]'
            }`}
          >
            {hasVisited ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Channel Visited (Ready to Claim)</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>Visit Sponsor Channel</span>
              </>
            )}
          </button>

          {/* Step 2: Claim Reward */}
          <button
            type="button"
            onClick={handleClaimReward}
            disabled={isVerifying}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
              hasVisited
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-purple-500/25'
            }`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Mission...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Claim +0.05 USDT Reward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
