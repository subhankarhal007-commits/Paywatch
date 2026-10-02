import React from 'react';
import { MessageSquare, ExternalLink, X, ShieldCheck, Clock, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const SupportModal: React.FC = () => {
  const { isSupportOpen, setIsSupportOpen, settings, triggerHaptic } = useApp();

  if (!isSupportOpen) return null;

  const supportUsername = settings?.support_username || 'PayWatchSupport';

  const handleOpenTelegramSupport = () => {
    triggerHaptic('medium');
    const url = `https://t.me/${supportUsername}`;
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Customer Support</h3>
              <span className="text-[10px] text-emerald-600 font-medium">● Online 24/7</span>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              setIsSupportOpen(false);
            }}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Need assistance with your earnings, ad playback, or withdrawals? Our support agents are ready to assist you directly on Telegram.
          </p>

          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-center gap-3">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <div className="font-bold text-amber-950">Average Response Time</div>
              <div className="text-[11px] text-amber-800">Under 5 minutes during peak hours</div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Common Questions</span>
            </div>
            <p className="text-[11px] text-slate-500">
              • When are withdrawals processed? (Usually within 1–6 hours)
              <br />
              • Why did my ad fail? (Ensure stable internet and no ad-blockers)
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenTelegramSupport}
          className="w-full py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat with @{supportUsername}</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
