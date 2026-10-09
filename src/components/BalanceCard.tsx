import React from 'react';
import { Users, ShieldAlert, Sparkles, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const BalanceCard: React.FC = () => {
  const { user, setActiveTab, triggerHaptic, setIsProfileOpen } = useApp();

  const balance = user ? user.balance.toFixed(2) : '0.00';
  const firstName = user?.first_name || 'User';
  const telegramId = user?.telegram_id || '';

  return (
    <div className="relative overflow-hidden rounded-3xl navy-card-gradient border border-amber-400/40 shadow-xl shadow-slate-950/20 text-white p-5 transition-all">
      {/* Subtle ambient gold glow behind card */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Section: Balance on Left, User & Gold Rank Badge on Right */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        {/* Left: Total Balance */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
              TOTAL BALANCE
            </span>
            <Sparkles className="w-3 h-3 text-amber-400 inline" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight tabular-nums">
            ${balance}
          </div>
          <div className="mt-1 text-xs text-amber-300/90 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Available to withdraw
          </div>
        </div>

        {/* Right: Circular Gold Rank Badge + User Profile */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsProfileOpen(true);
          }}
          className="flex flex-col items-end cursor-pointer group transition-transform active:scale-95"
          title="View Profile"
        >
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors max-w-[110px] truncate">
                {firstName}
              </div>
              <div className="text-[11px] text-slate-300/80 font-mono tabular-nums">
                ID: {telegramId}
              </div>
            </div>

            {/* Circular gold rank badge */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1.5px] shadow-lg shadow-amber-500/30 shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center border border-amber-200/50">
                <span className="text-sm font-black text-amber-950 font-display drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                  1
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Divider */}
      <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />

      {/* Bottom Quick Options */}
      <div className="grid grid-cols-2 gap-2.5 relative z-10">
        {/* Withdraw Option */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('withdraw');
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mb-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-100 group-hover:text-amber-300 transition-colors whitespace-nowrap">
            Withdraw
          </span>
        </button>

        {/* Invite Friends Option */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('invite');
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center mb-1 group-hover:bg-emerald-400 group-hover:text-slate-950 transition-colors">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors whitespace-nowrap">
            Invite Friends
          </span>
        </button>
      </div>

      {user?.status === 'suspended' && (
        <div className="mt-3 p-2 bg-rose-900/60 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Account under review. Rewards and withdrawals are temporarily paused.</span>
        </div>
      )}
    </div>
  );
};
