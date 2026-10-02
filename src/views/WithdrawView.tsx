import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Wallet,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { api } from '../services/api.ts';
import { Withdrawal, WithdrawalMethod } from '../types/index.ts';

export const WithdrawView: React.FC = () => {
  const { user, refreshUser, triggerHaptic, showToast } = useApp();

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [minWithdrawal, setMinWithdrawal] = useState<number>(5.0);
  const [supportedMethods, setSupportedMethods] = useState<WithdrawalMethod[]>([
    'USDT (TRC20)',
    'TON Network',
    'TRX',
    'PayPal',
  ]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod>('USDT (TRC20)');
  const [accountAddress, setAccountAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successWithdrawal, setSuccessWithdrawal] = useState<Withdrawal | null>(null);

  const fetchWithdrawalData = async () => {
    try {
      setLoading(true);
      const res = await api.getWithdrawals();
      setWithdrawals(res.withdrawals || []);
      if (res.minWithdrawal) setMinWithdrawal(res.minWithdrawal);
      if (res.supportedMethods?.length) {
        setSupportedMethods(res.supportedMethods);
        if (!res.supportedMethods.includes(selectedMethod)) {
          setSelectedMethod(res.supportedMethods[0]);
        }
      }
    } catch (err: any) {
      showToast('Failed to load withdrawal details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalData();
  }, []);

  const balance = user?.balance || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    if (!accountAddress.trim()) {
      showToast('Please enter your recipient wallet address or email', 'error');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid withdrawal amount', 'error');
      return;
    }

    if (numAmount < minWithdrawal) {
      showToast(`Minimum withdrawal is $${minWithdrawal.toFixed(2)}`, 'error');
      return;
    }

    if (numAmount > balance) {
      showToast('Insufficient verified balance', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.requestWithdrawal(selectedMethod, accountAddress, numAmount);
      showToast(res.message || 'Withdrawal requested successfully!', 'success');
      setSuccessWithdrawal(res.withdrawal);
      setAmount('');
      setAccountAddress('');
      await refreshUser();
      await fetchWithdrawalData();
    } catch (err: any) {
      showToast(err.message || 'Withdrawal failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case 'Approved':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-20 pt-2 animate-in fade-in duration-150">
      {/* Balance & Minimum Card */}
      <div className="rounded-3xl navy-card-gradient border border-amber-400/40 p-5 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
              Available Balance
            </span>
            <span className="text-3xl font-extrabold text-white font-display tabular-nums mt-0.5">
              ${balance.toFixed(2)}
            </span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/15 text-right">
            <div className="text-[10px] text-amber-300 uppercase tracking-wider font-bold">
              Min Withdrawal
            </div>
            <div className="text-base font-extrabold text-white font-display tabular-nums">
              ${minWithdrawal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Dialog if recently submitted */}
      {successWithdrawal && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-950 font-display">
                Withdrawal In Queue!
              </span>
            </div>
            <button
              onClick={() => setSuccessWithdrawal(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
          <div className="text-xs text-emerald-800 space-y-1 mt-1 bg-white/70 p-3 rounded-2xl">
            <div>
              <span className="font-semibold">ID:</span> {successWithdrawal.id}
            </div>
            <div>
              <span className="font-semibold">Amount:</span> ${successWithdrawal.amount.toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">Method:</span> {successWithdrawal.method}
            </div>
            <div>
              <span className="font-semibold">Status:</span> {successWithdrawal.status}
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Form */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5">
        <h3 className="text-base font-bold text-slate-900 font-display mb-4">
          Request Withdrawal
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Method Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Select Payout Method</label>
            <div className="grid grid-cols-2 gap-2">
              {supportedMethods.map((method) => {
                const isSelected = selectedMethod === method;
                return (
                  <button
                    type="button"
                    key={method}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedMethod(method);
                    }}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 text-amber-950 shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5 text-amber-600" />
                    <span>{method}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Address / Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              {selectedMethod === 'PayPal' ? 'PayPal Account Email' : `${selectedMethod} Wallet Address`}
            </label>
            <input
              type="text"
              required
              value={accountAddress}
              onChange={(e) => setAccountAddress(e.target.value)}
              placeholder={
                selectedMethod === 'PayPal'
                  ? 'name@example.com'
                  : selectedMethod.includes('TON')
                  ? 'EQ...'
                  : selectedMethod.includes('TRX')
                  ? 'T...'
                  : 'T... (TRC-20 Address)'
              }
              className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Withdrawal Amount ($ USD)</label>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setAmount(balance.toFixed(2));
                }}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
              >
                Use Max (${balance.toFixed(2)})
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-slate-400 font-bold text-xs">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min={minWithdrawal}
                max={balance}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`${minWithdrawal.toFixed(2)} or more`}
                className="w-full py-2.5 pl-7 pr-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-2 mt-1">
              {[5, 10, 20, 50].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => {
                    triggerHaptic('light');
                    setAmount(preset.toString());
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors"
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || balance < minWithdrawal}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-2 cursor-pointer ${
              balance >= minWithdrawal && !isSubmitting
                ? 'gold-gradient-bg text-slate-950 shadow-amber-500/25 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Processing Request...</span>
              </>
            ) : balance < minWithdrawal ? (
              <span>Need Min ${minWithdrawal.toFixed(2)} to Withdraw</span>
            ) : (
              <>
                <span>Request Withdrawal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 font-display">Withdrawal History</h3>
          <button
            onClick={fetchWithdrawalData}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {withdrawals.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No withdrawal requests made yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {withdrawals.map((w) => (
              <div key={w.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{w.method}</span>
                    {getStatusBadge(w.status)}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                    {w.account.slice(0, 10)}...{w.account.slice(-6)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(w.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-sm font-extrabold text-slate-900 font-display tabular-nums">
                    -${w.amount.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {w.id.slice(-6)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
