import React, { useState } from 'react';
import {
  User,
  Shield,
  Calendar,
  DollarSign,
  Eye,
  Users,
  X,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const ProfileModal: React.FC = () => {
  const { isProfileOpen, setIsProfileOpen, user, triggerHaptic } = useApp();

  if (!isProfileOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 font-display">User Profile</span>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              setIsProfileOpen(false);
            }}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3.5 py-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-amber-300 font-bold text-xl font-display">
                {user.first_name[0]?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black border border-white">
              1
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate">{user.first_name}</h3>
            <span className="text-xs text-slate-400 truncate">@{user.username}</span>
            <span className="text-[11px] text-amber-600 font-mono font-semibold">
              ID: {user.telegram_id}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-2">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Earned
            </div>
            <div className="text-lg font-extrabold text-emerald-600 font-display tabular-nums mt-0.5">
              ${(user.total_earned || 0).toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Withdrawn
            </div>
            <div className="text-lg font-extrabold text-slate-800 font-display tabular-nums mt-0.5">
              ${(user.total_withdrawn || 0).toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Ads Watched
            </div>
            <div className="text-lg font-extrabold text-amber-600 font-display tabular-nums mt-0.5">
              {user.ads_watched || 0}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Referrals ({user.referrals || 0})
            </div>
            <div className="text-lg font-extrabold text-indigo-600 font-display tabular-nums mt-0.5">
              ${(user.referral_earnings || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Member Since info */}
        <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/50 flex items-center justify-between text-xs my-2">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Member Since</span>
          </div>
          <span className="font-semibold text-slate-800 font-mono">
            {new Date(user.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
