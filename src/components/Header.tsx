import React, { useState } from 'react';
import { MessageSquare, Globe, ShieldCheck, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { api } from '../services/api.ts';

export const Header: React.FC = () => {
  const { user, setIsSupportOpen, setIsLanguageOpen, setIsAdminOpen, triggerHaptic } = useApp();
  const [logoTaps, setLogoTaps] = useState(0);

  const isOwner =
    user?.telegram_id === '5933272882' ||
    user?.username?.toLowerCase() === 'subho209' ||
    api.isAdminLoggedIn();

  const handleLogoTap = () => {
    const nextTaps = logoTaps + 1;
    setLogoTaps(nextTaps);
    if (nextTaps >= 5) {
      setLogoTaps(0);
      triggerHaptic('heavy');
      setIsAdminOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-100/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-3.5 py-2.5 flex items-center justify-between transition-all">
      {/* Left: PAY WATCH Brand Logo */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleLogoTap}
          className="flex items-center text-left focus:outline-none cursor-pointer select-none"
        >
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-display">
            PAY{' '}
            <span className="gold-gradient-text drop-shadow-[0_1px_1px_rgba(212,175,55,0.25)]">
              WATCH
            </span>
          </span>
        </button>
      </div>

      {/* Right: Customer Support & Language Buttons */}
      <div className="flex items-center gap-2">
        {/* Customer Support Button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsSupportOpen(true);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50/90 hover:bg-amber-100/80 border border-amber-200/60 active:scale-95 transition-all text-left cursor-pointer"
          title="Customer Support"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-700 flex items-center justify-center shrink-0">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-amber-800/80 font-medium">Customer</span>
            <span className="text-[11px] text-amber-950 font-bold tracking-tight">Support</span>
          </div>
        </button>

        {/* Language Button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsLanguageOpen(true);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 active:scale-95 transition-all text-left cursor-pointer"
          title="Language Selector"
        >
          <div className="w-6 h-6 rounded-lg bg-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-slate-500 font-medium">Language</span>
            <span className="text-[11px] text-slate-800 font-bold tracking-tight">English</span>
          </div>
        </button>

        {/* Admin Quick Switch (Shield Icon - Protected with PIN & Owner Auth) */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsAdminOpen(true);
          }}
          className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
            isOwner
              ? 'bg-amber-50 border-amber-300/80 text-amber-700 hover:bg-amber-100'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-400 hover:text-slate-600'
          }`}
          title="Admin Panel (Owner Only)"
        >
          {isOwner ? (
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>
      </div>
    </header>
  );
};

