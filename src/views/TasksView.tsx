import React, { useState, useEffect } from 'react';
import {
  Send,
  Globe,
  Video,
  Share2,
  Gift,
  CheckCircle,
  ExternalLink,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { api } from '../services/api.ts';
import { Task } from '../types/index.ts';
import { adsgram } from '../services/adsgram.ts';

export const TasksView: React.FC = () => {
  const { user, refreshUser, triggerHaptic, showToast } = useApp();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active task verification modal state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [verificationTimer, setVerificationTimer] = useState<number>(0);
  const [hasVisitedLink, setHasVisitedLink] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isRunningAdsgramTask, setIsRunningAdsgramTask] = useState<boolean>(false);

  const handleAdsgramTaskClick = async () => {
    triggerHaptic('medium');
    setIsRunningAdsgramTask(true);
    try {
      const res = await adsgram.showTaskAd();
      if (res.success) {
        // Task completed! Sync balance with backend
        const syncRes = await api.syncBalance(Number(((user?.balance || 0) + 0.03).toFixed(2)));
        if (syncRes.success) {
          triggerHaptic('success');
          showToast('🎉 +$0.03 credited from Adsgram Partner Quest!', 'success');
          await refreshUser();
        }
      } else {
        showToast(res.error || 'Task was not completed.', 'info');
      }
    } catch (err: any) {
      showToast('Adsgram task not available currently.', 'error');
    } finally {
      setIsRunningAdsgramTask(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getTasks();
      setTasks(res.tasks || []);
    } catch (err: any) {
      console.warn('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user?.id]);

  // When user returns to the app from external browser, re-check tasks automatically
  useEffect(() => {
    const handleFocus = () => {
      fetchTasks();
    };
    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchTasks();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleStartTask = async (task: any) => {
    triggerHaptic('medium');
    setActiveTask(task);

    // Check if user already visited link previously
    const stored = localStorage.getItem(`task_started_${task.id}`);
    const duration = task.duration_seconds || 15;

    if (stored) {
      try {
        const { timestamp } = JSON.parse(stored);
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        if (elapsed >= duration) {
          setHasVisitedLink(true);
          setVerificationTimer(0);
        } else {
          setHasVisitedLink(true);
          setVerificationTimer(duration - elapsed);
        }
      } catch {
        setHasVisitedLink(false);
        setVerificationTimer(duration);
      }
    } else {
      setHasVisitedLink(false);
      setVerificationTimer(duration);
    }

    try {
      await api.startTask(task.id);
    } catch {
      // Ignore start error if already initiated
    }
  };

  const handleOpenLink = () => {
    if (!activeTask) return;
    triggerHaptic('light');
    setHasVisitedLink(true);

    // Store start timestamp in localStorage so timer survives exiting app
    localStorage.setItem(
      `task_started_${activeTask.id}`,
      JSON.stringify({ timestamp: Date.now(), taskId: activeTask.id })
    );

    const url = activeTask.action_url;
    // If it is a Telegram link and openTelegramLink exists, use it
    if (url.includes('t.me/') && (window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(url);
    } else if ((window as any).Telegram?.WebApp?.openLink) {
      (window as any).Telegram.WebApp.openLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Timer countdown while modal is open and user visited
  useEffect(() => {
    if (!activeTask || !hasVisitedLink || verificationTimer <= 0) return;

    const interval = setInterval(() => {
      setVerificationTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerHaptic('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTask, hasVisitedLink, verificationTimer, triggerHaptic]);

  const handleClaimTask = async () => {
    if (!activeTask || isVerifying) return;
    setIsVerifying(true);
    triggerHaptic('heavy');

    try {
      const res = await api.verifyTask(activeTask.id, 'auto_verified_timer');
      localStorage.removeItem(`task_started_${activeTask.id}`);
      showToast(res.message || `+$${res.reward.toFixed(2)} earned!`, 'success');
      setActiveTask(null);
      await refreshUser();
      await fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Task verification failed', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'telegram_channel':
        return <Send className="w-4 h-4 text-sky-500" />;
      case 'website_visit':
        return <Globe className="w-4 h-4 text-emerald-500" />;
      case 'video_watch':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'social_follow':
        return <Share2 className="w-4 h-4 text-indigo-500" />;
      default:
        return <Gift className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-20 pt-2 animate-in fade-in duration-150">
      {/* Header banner */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display tracking-tight">
              Earn from Tasks
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete partner tasks and get rewards credited directly to your balance.
            </p>
          </div>
          <button
            onClick={fetchTasks}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Featured Adsgram Partner Quest (Block task-52776) */}
      <div
        onClick={handleAdsgramTaskClick}
        className="w-full bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent rounded-3xl border-2 border-amber-400/40 p-4 shadow-sm hover:border-amber-400 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 shrink-0">
            {isRunningAdsgramTask ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6 fill-current text-slate-950" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 truncate">Adsgram Partner Quest</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-extrabold text-[9px] uppercase shrink-0">HOT</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">Watch sponsor quest &amp; earn instantly</p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-xs font-extrabold text-amber-900 shrink-0 font-display">
          +$0.03
        </div>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading available tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-400">
            No active tasks at the moment. Please check back later!
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.userStatus === 'completed';
            const isPending = task.userStatus === 'pending';

            let isTimerDone = false;
            const stored = localStorage.getItem(`task_started_${task.id}`);
            if (stored && isPending) {
              try {
                const { timestamp } = JSON.parse(stored);
                const duration = (task.duration_seconds || 15) * 1000;
                if (Date.now() - timestamp >= duration) {
                  isTimerDone = true;
                }
              } catch {
                // ignore
              }
            }

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 transition-all hover:border-slate-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getTaskIcon(task.task_type)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-sm font-extrabold text-amber-600 font-display tabular-nums">
                      +${Number(task.reward).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {task.task_type.replace('_', ' ').toUpperCase()}
                  </span>

                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Completed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartTask(task)}
                      className="px-4 py-1.5 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {isTimerDone
                          ? `Claim +$${task.reward.toFixed(2)}`
                          : isPending
                          ? 'Verify Task'
                          : 'Start Task'}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Verification Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-amber-400/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Task Verification</h3>
              </div>
              <button
                onClick={() => setActiveTask(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-base font-bold text-slate-900">{activeTask.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{activeTask.description}</p>
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-center justify-between">
                <span>Reward upon completion:</span>
                <span className="font-extrabold text-amber-700 font-display">
                  +${Number(activeTask.reward).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Step 1: Open link */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="text-xs font-semibold text-slate-700">Step 1: Open task destination</div>
              <button
                onClick={handleOpenLink}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 active:scale-95 transition-all"
              >
                <span>Open Task Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 2: Dwell & Verify */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="text-xs font-semibold text-slate-700">Step 2: Verify completion</div>
              {!hasVisitedLink ? (
                <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Please tap &quot;Open Task Link&quot; first to begin verification
                </div>
              ) : verificationTimer > 0 ? (
                <div className="p-2.5 text-center text-xs text-amber-800 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center gap-2 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>Verifying activity... ({verificationTimer}s)</span>
                </div>
              ) : (
                <button
                  onClick={handleClaimTask}
                  disabled={isVerifying}
                  className="w-full py-3 px-4 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Crediting Reward...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 fill-slate-950 text-amber-400" />
                      <span>Claim +${Number(activeTask.reward).toFixed(2)}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
