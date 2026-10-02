import React, { useState, useEffect } from 'react';
import { Users, Copy, Check, Share2, DollarSign, Award, ArrowUpRight, Link as LinkIcon, Send } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { api } from '../services/api.ts';

// Official Brand Icons for Social Sharing
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.945z" />
  </svg>
);

export const InviteView: React.FC = () => {
  const { user, triggerHaptic, showToast } = useApp();
  const [data, setData] = useState<{
    referralLink: string;
    totalReferrals: number;
    referralEarnings: number;
    rewardPerReferral: number;
    referrals: any[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true);
        const res = await api.getReferrals();
        setData(res);
      } catch (err: any) {
        showToast('Failed to load referral details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, [showToast]);

  const referralLink =
    data?.referralLink || `https://t.me/PayWatchEarnBot?start=ref_${user?.telegram_id || '849201847'}`;
  const totalRefs = data?.totalReferrals || user?.referrals || 0;
  const refEarnings = data?.referralEarnings || user?.referral_earnings || 0;
  const rewardPerRef = data?.rewardPerReferral || 0.20;

  const openExternalUrl = (url: string) => {
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const openTelegramUrl = (url: string) => {
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopy = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `💸 Start earning real cash on Telegram by watching ads & doing tasks with Pay Watch! Use my link to join and claim your starting bonus:\n\n${referralLink}`;

  const handleShareWhatsApp = () => {
    triggerHaptic('medium');
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    openExternalUrl(waUrl);
  };

  const handleShareFacebook = () => {
    triggerHaptic('medium');
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      referralLink
    )}&quote=${encodeURIComponent(shareText)}`;
    openExternalUrl(fbUrl);
  };

  const handleShareTelegram = () => {
    triggerHaptic('medium');
    const text = encodeURIComponent(
      `💸 Start earning cash on Telegram by watching verified ads with Pay Watch! Use my link to join and claim your starting bonus:\n\n${referralLink}`
    );
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`;
    openTelegramUrl(shareUrl);
  };

  const handleShareLink = async () => {
    triggerHaptic('medium');
    const shareData = {
      title: 'Pay Watch - Watch Ads & Earn Money',
      text: '💸 Start earning real cash on Telegram by watching ads & tasks with Pay Watch!',
      url: referralLink,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        showToast('Link shared successfully!', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
      showToast('Referral link copied! Share it anywhere.', 'success');
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-20 pt-2 animate-in fade-in duration-150">
      {/* Referral Hero Card */}
      <div className="relative overflow-hidden rounded-3xl navy-card-gradient border border-amber-400/40 p-5 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs uppercase tracking-wider text-amber-300 font-bold">
            Referral Program
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
          Invite Friends & Earn
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Share your referral link with friends. Earn +${rewardPerRef.toFixed(2)} instant bonus for
          every active user who joins through your link!
        </p>

        {/* Total Referrals & Referral Earnings Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Total Referrals
            </div>
            <div className="text-2xl font-extrabold text-white font-display mt-0.5 tabular-nums">
              {totalRefs}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Referral Earnings
            </div>
            <div className="text-2xl font-extrabold text-amber-400 font-display mt-0.5 tabular-nums">
              ${refEarnings.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Your Referral Link</span>
          <span className="text-[11px] text-amber-600 font-semibold font-mono">
            +${rewardPerRef.toFixed(2)} / invite
          </span>
        </div>

        {/* Link Input + Copy Button */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-200">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-transparent px-2.5 text-xs text-slate-700 font-mono focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
            Share & Invite Via
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            {/* WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              className="py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">WhatsApp</span>
                <span className="text-[9.5px] text-white/80 font-normal leading-tight">Chat & Status</span>
              </div>
            </button>

            {/* Facebook Share */}
            <button
              onClick={handleShareFacebook}
              className="py-3 px-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <FacebookIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">Facebook</span>
                <span className="text-[9.5px] text-white/80 font-normal leading-tight">Post & Feed</span>
              </div>
            </button>

            {/* Telegram Share */}
            <button
              onClick={handleShareTelegram}
              className="py-3 px-3 rounded-2xl bg-[#229ED9] hover:bg-[#1f8ec4] active:scale-95 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <TelegramIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">Telegram</span>
                <span className="text-[9.5px] text-white/80 font-normal leading-tight">Groups & DM</span>
              </div>
            </button>

            {/* Link Share / Device Native Share */}
            <button
              onClick={handleShareLink}
              className="py-3 px-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Share2 className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">Share Link</span>
                <span className="text-[9.5px] text-white/80 font-normal leading-tight">Any App / Copy</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5">
        <h3 className="text-sm font-bold text-slate-900 font-display mb-3">
          How Referral Program Works
        </h3>

        <div className="flex flex-col gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <span className="font-bold text-slate-800">Share your invite link</span>
              <p className="text-slate-500 mt-0.5">Send your link to friends, groups or social media channels.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <span className="font-bold text-slate-800">Friend launches app</span>
              <p className="text-slate-500 mt-0.5">When they open Pay Watch on Telegram, they become your referral.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <span className="font-bold text-slate-800">Earn instant bonus</span>
              <p className="text-slate-500 mt-0.5">Receive +${rewardPerRef.toFixed(2)} instantly credited into your total balance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referred Friends List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5">
        <h3 className="text-sm font-bold text-slate-900 font-display mb-3">
          Referred Friends ({data?.referrals?.length || 0})
        </h3>

        {!data?.referrals || data.referrals.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No referrals yet. Be the first to share your link and earn!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.referrals.map((ref) => (
              <div key={ref.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[11px]">
                    {ref.referred_name?.[0] || 'U'}
                  </div>
                  <span className="font-medium text-slate-800">{ref.referred_name}</span>
                </div>
                <span className="font-bold text-emerald-600 tabular-nums">
                  +${Number(ref.reward).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
