import React, { useState, useEffect } from 'react';
import { BalanceCard } from '../components/BalanceCard.tsx';
import { WatchAdsSection } from '../components/WatchAdsSection.tsx';
import { StatisticsCards } from '../components/StatisticsCards.tsx';
import { History, CheckCircle2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { api } from '../services/api.ts';

export const AdsView: React.FC = () => {
  const { user } = useApp();
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.getAdHistory();
      setHistory(res.completions || []);
    } catch (err) {
      console.warn('Failed to load ad history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user?.ads_watched]);

  return (
    <div className="flex flex-col gap-4 pb-20 pt-2 animate-in fade-in duration-150">
      {/* 1. Large Premium Balance Card */}
      <BalanceCard />

      {/* 2. Watch Ads & Earn Section */}
      <WatchAdsSection />

      {/* 3. Statistics Cards */}
      <StatisticsCards />

      {/* 4. Reward History List */}
      <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <History className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Reward History
            </h3>
          </div>

          <button
            onClick={fetchHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh history"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* History Items */}
        {history.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No ad completions recorded yet. Watch your first ad above to earn!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-3 text-xs first:pt-1 last:pb-1"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-800 truncate">
                      {item.ad_title || 'Verified Sponsor Video Ad'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.completed_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="font-bold text-emerald-600 font-display tabular-nums">
                    +${Number(item.reward).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
