import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-12 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isRewardToast = isSuccess && (toast.message.includes('Earned') || toast.message.includes('credited') || toast.message.includes('$'));

        if (isRewardToast) {
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between gap-3 px-5 py-2.5 rounded-2xl bg-[#10b981] text-white shadow-2xl shadow-emerald-500/30 border border-emerald-400/40 max-w-xs w-full animate-in slide-in-from-top-4 duration-200"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100">
                  REWARD CREDITED
                </span>
                <span className="text-sm font-black text-white font-display leading-tight">
                  + $0.03 Earned
                </span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl border text-xs font-semibold max-w-sm w-full animate-in slide-in-from-top duration-200 transition-all ${
              isSuccess
                ? 'bg-emerald-600 text-white border-emerald-500'
                : isError
                ? 'bg-rose-900 text-white border-rose-500'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            ) : isError ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

