import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, SystemSettings, AdSession, AdStatusResponse } from '../types/index.ts';
import { api } from '../services/api.ts';
import { adsgram } from '../services/adsgram.ts';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number | string;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
          start_param?: string;
        };
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        openLink?: (url: string) => void;
        openTelegramLink?: (url: string) => void;
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}

export type TabType = 'ads' | 'tasks' | 'invite' | 'withdraw';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  user: User | null;
  settings: SystemSettings | null;
  loading: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  adStatus: AdStatusResponse | null;
  refreshAdStatus: () => Promise<void>;
  refreshUser: () => Promise<void>;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Ad player modal
  activeAdSession: AdSession | null;
  isAdPlayerOpen: boolean;
  startAdWatch: () => Promise<void>;
  triggerMonetagAd: (
    adType?: 'rewarded_interstitial' | 'rewarded_popup' | 'in_app'
  ) => Promise<boolean>;
  closeAdPlayer: (wasCompleted?: boolean) => void;
  handleAdFinished: () => Promise<void>;

  // Support & Language & Profile
  isSupportOpen: boolean;
  setIsSupportOpen: (open: boolean) => void;
  isLanguageOpen: boolean;
  setIsLanguageOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  
  // Telegram testing switcher
  switchUser: (mockData: { id: string; first_name: string; username: string }) => Promise<void>;
  isTelegramEnvironment: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('ads');
  const [adStatus, setAdStatus] = useState<AdStatusResponse | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [isAdPlayerOpen, setIsAdPlayerOpen] = useState(false);
  const [activeAdSession, setActiveAdSession] = useState<AdSession | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    try {
      const haptic = window.Telegram?.WebApp?.HapticFeedback;
      if (haptic) {
        if (type === 'success' || type === 'error') {
          haptic.notificationOccurred(type);
        } else {
          haptic.impactOccurred(type);
        }
      } else if (navigator.vibrate) {
        navigator.vibrate(type === 'heavy' ? 40 : 20);
      }
    } catch {
      // Ignore haptic errors if not supported
    }
  }, []);

  // Initialize Telegram WebApp or local user
  const initApp = useCallback(async (customUser?: any) => {
    setLoading(true);
    try {
      const tg = window.Telegram?.WebApp;
      let initData = '';
      let mockUser = customUser;

      if (tg) {
        tg.ready();
        tg.expand();
        try {
          tg.setHeaderColor('#ffffff');
          tg.setBackgroundColor('#f8fafc');
        } catch {
          // ignore theme color error
        }

        if (tg.initData) {
          initData = tg.initData;
          setIsTelegramEnvironment(true);
        }

        if (tg.initDataUnsafe?.user) {
          setIsTelegramEnvironment(true);
        }
      }

      // Check URL search params for deep link referral
      const urlParams = new URLSearchParams(window.location.search);
      const startParam = urlParams.get('tgWebAppStartParam') || urlParams.get('start');
      let refId: string | undefined;
      if (startParam && startParam.startsWith('ref_')) {
        refId = startParam.replace('ref_', '');
      }

      // If no Telegram initData and no user specified, pass undefined
      // The server will use the existing registered Telegram user
      const res = await api.authenticateTelegram({
        initData,
        mockUser,
        ref: refId,
      });

      let currentUser = res.user;
      if (currentUser?.telegram_id) {
        const key = `paywatch_vbal_${currentUser.telegram_id}`;
        const savedBal = parseFloat(localStorage.getItem(key) || '0');
        if (!isNaN(savedBal) && savedBal > currentUser.balance) {
          try {
            const syncRes = await api.syncBalance(savedBal);
            if (syncRes.success && syncRes.user) {
              currentUser = syncRes.user;
            }
          } catch (e) {
            console.warn('Balance sync check error:', e);
          }
        }
        localStorage.setItem(key, currentUser.balance.toFixed(2));
      }

      setUser(currentUser);
      setSettings(res.settings);

      // Fetch initial ad status
      const adStat = await api.getAdStatus();
      setAdStatus(adStat);
    } catch (err: any) {
      console.error('Failed to initialize Pay Watch app:', err);
      showToast(err.message || 'Connection error. Retrying...', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Back button handling in Telegram
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    if (activeTab !== 'ads' || isAdPlayerOpen || isProfileOpen || isAdminOpen) {
      tg.BackButton.show();
      const handleBack = () => {
        if (isAdPlayerOpen) {
          setIsAdPlayerOpen(false);
        } else if (isAdminOpen) {
          setIsAdminOpen(false);
        } else if (isProfileOpen) {
          setIsProfileOpen(false);
        } else {
          setActiveTab('ads');
        }
      };
      tg.BackButton.onClick(handleBack);
      return () => {
        tg.BackButton.offClick(handleBack);
      };
    } else {
      tg.BackButton.hide();
    }
  }, [activeTab, isAdPlayerOpen, isProfileOpen, isAdminOpen]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.getMe();
      if (res.user?.telegram_id) {
        localStorage.setItem(`paywatch_vbal_${res.user.telegram_id}`, res.user.balance.toFixed(2));
      }
      setUser(res.user);
      if (res.settings) setSettings(res.settings);
    } catch (err: any) {
      console.warn('Failed to refresh user:', err);
    }
  }, []);

  const refreshAdStatus = useCallback(async () => {
    try {
      const stat = await api.getAdStatus();
      setAdStatus(stat);
    } catch (err: any) {
      console.warn('Failed to refresh ad status:', err);
    }
  }, []);

  // Watch Ad action
  const startAdWatch = async () => {
    triggerHaptic('medium');

    try {
      const stat = await api.getAdStatus();
      setAdStatus(stat);

      if (!stat.canWatch) {
        if (stat.reason === 'cooldown') {
          showToast(`Please wait ${stat.cooldownRemaining}s before watching next ad`, 'info');
        } else if (stat.reason === 'daily_limit') {
          showToast(`Daily limit of ${stat.dailyLimit} ads reached! Resets tomorrow.`, 'info');
        } else {
          showToast('No ads available currently. Please check back shortly.', 'error');
        }
        return;
      }

      // Start session with backend
      const res = await api.startAdSession();
      if (!res.success || !res.session) {
        showToast('Unable to start ad session.', 'error');
        return;
      }

      // If Adsgram is configured, attempt showing real Adsgram Rewarded Video
      if (settings?.adsgram_block_id && adsgram.isAvailable()) {
        try {
          const adResult = await adsgram.showRewardedAd(settings.adsgram_block_id);
          if (adResult.success) {
            const verifyRes = await api.verifyAdCompletion({
              sessionId: res.session.sessionId,
              nonce: res.session.nonce,
              signature: res.session.signature,
              elapsedSeconds: res.session.duration,
              providerKey: 'adsgram_rewarded',
            });
            triggerHaptic('success');
            showToast(verifyRes.message || `+$${verifyRes.reward.toFixed(2)} credited!`, 'success');
            if (verifyRes.user?.telegram_id) {
              localStorage.setItem(`paywatch_vbal_${verifyRes.user.telegram_id}`, verifyRes.user.balance.toFixed(2));
            }
            setUser(verifyRes.user);
            await refreshAdStatus();
            return;
          }
        } catch (e) {
          console.warn('Adsgram fallback to interactive player:', e);
        }
      }

      setActiveAdSession(res.session);
      setIsAdPlayerOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to start ad', 'error');
      triggerHaptic('error');
    }
  };

  const closeAdPlayer = (wasCompleted: boolean = false) => {
    setIsAdPlayerOpen(false);
    setActiveAdSession(null);
    if (!wasCompleted) {
      triggerHaptic('error');
      showToast(
        '⚠️ Ad closed early! Reward was NOT added. Watch until the timer ends (0s) to earn.',
        'error'
      );
    }
  };

  const handleAdFinished = async () => {
    if (!activeAdSession) return;
    try {
      const res = await api.verifyAdCompletion({
        sessionId: activeAdSession.sessionId,
        nonce: activeAdSession.nonce,
        signature: activeAdSession.signature,
        elapsedSeconds: activeAdSession.duration,
        providerKey: activeAdSession.provider,
      });

      triggerHaptic('success');
      showToast(res.message || `+$${res.reward.toFixed(2)} credited to your wallet!`, 'success');
      if (res.user?.telegram_id) {
        localStorage.setItem(`paywatch_vbal_${res.user.telegram_id}`, res.user.balance.toFixed(2));
      }
      setUser(res.user);
      setIsAdPlayerOpen(false);
      setActiveAdSession(null);
      await refreshAdStatus();
    } catch (err: any) {
      triggerHaptic('error');
      showToast(err.message || 'Verification failed. Reward not credited.', 'error');
      setIsAdPlayerOpen(false);
      setActiveAdSession(null);
    }
  };

  // Direct Ad Trigger: Always starts the verified session with the timing countdown modal!
  const triggerMonetagAd = async (
    adType: 'rewarded_interstitial' | 'rewarded_popup' | 'in_app' = 'rewarded_interstitial'
  ): Promise<boolean> => {
    triggerHaptic('medium');
    await startAdWatch();
    return true;
  };

  const switchUser = async (mockData: { id: string; first_name: string; username: string }) => {
    localStorage.removeItem('paywatch_user_id');
    await initApp(mockData);
    showToast(`Switched user to ${mockData.first_name}`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        settings,
        loading,
        activeTab,
        setActiveTab,
        adStatus,
        refreshAdStatus,
        refreshUser,
        triggerHaptic,
        toasts,
        showToast,
        removeToast,
        activeAdSession,
        isAdPlayerOpen,
        startAdWatch,
        triggerMonetagAd,
        closeAdPlayer,
        handleAdFinished,
        isSupportOpen,
        setIsSupportOpen,
        isLanguageOpen,
        setIsLanguageOpen,
        isProfileOpen,
        setIsProfileOpen,
        isAdminOpen,
        setIsAdminOpen,
        switchUser,
        isTelegramEnvironment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
