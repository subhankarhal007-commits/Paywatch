import React from 'react';
import { Eye, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const StatisticsCards: React.FC = () => {
  const { user } = useApp();

  const totalWatched = user?.ads_watched !== undefined ? user.ads_watched : 0;
  const totalEarned = user?.total_earned !== undefined ? user.total_earned.toFixed(2) : '0.00';

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {/* Card 1: TOTAL WATCHED */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between transition-all hover:border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            TOTAL WATCHED
          </span>
          <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tabular-nums tracking-tight">
            {totalWatched}
          </span>
          <span className="text-xs font-semibold text-slate-400">ads</span>
        </div>
      </div>

      {/* Card 2: TOTAL EARNED */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between transition-all hover:border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            TOTAL EARNED
          </span>
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline gap-0.5 mt-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tabular-nums tracking-tight">
            ${totalEarned}
          </span>
        </div>
      </div>
    </div>
  );
};
