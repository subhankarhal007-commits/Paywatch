import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Film,
  CheckSquare,
  DollarSign,
  Settings as SettingsIcon,
  Search,
  X,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  RefreshCw,
  Lock,
  Unlock,
  Key,
  ExternalLink,
  Edit2,
  Globe,
  Send,
  Video,
  Share2,
  Gift,
  Eye,
  EyeOff,
  Bell,
  Clock,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useApp } from '../context/AppContext.tsx';
import { User, Ad, Task, Withdrawal, SystemSettings } from '../types/index.ts';

type AdminTab = 'tasks' | 'notifications' | 'dashboard' | 'users' | 'ads' | 'withdrawals' | 'settings';

export const AdminView: React.FC = () => {
  const { isAdminOpen, setIsAdminOpen, user, triggerHaptic, showToast, refreshUser } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);
  const [showPin, setShowPin] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('tasks');
  const [loading, setLoading] = useState(false);

  // Notification Scheduler state
  const [notificationStatus, setNotificationStatus] = useState<any>(null);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [targetTestChatId, setTargetTestChatId] = useState<string>('');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ads, setAds] = useState<Ad[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // New / Edit Ad Form
  const [newAd, setNewAd] = useState({
    title: '',
    reward: '0.03',
    daily_limit: '15',
    cooldown: '30',
    provider: 'paywatch_direct',
    video_duration: '15',
    sponsor_name: '',
  });

  // Task Form State (Add / Edit)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    action_url: '',
    reward: '0.25',
    duration_seconds: '15',
    task_type: 'website_visit',
    verification_method: 'instant_timer',
    status: 'active',
  });

  // Balance adjust modal
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Change PIN state
  const [newAdminPin, setNewAdminPin] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  // Check auth status on open
  useEffect(() => {
    if (isAdminOpen) {
      if (api.isAdminLoggedIn()) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, [isAdminOpen]);

  const handlePinLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPinError('');
    setIsVerifyingPin(true);

    try {
      const res = await api.adminLogin(pinInput.trim());
      if (res.success) {
        setIsAuthenticated(true);
        setPinInput('');
        triggerHaptic('success');
        showToast('Admin access granted', 'success');
      } else {
        setPinError('Invalid Admin PIN');
        triggerHaptic('error');
      }
    } catch (err: any) {
      setPinError(err.message || 'Incorrect PIN or unauthorized account');
      triggerHaptic('error');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleOwnerAutoVerify = async () => {
    if (!user?.telegram_id) return;
    setPinError('');
    setIsVerifyingPin(true);

    try {
      const res = await api.adminLogin(undefined, user.telegram_id);
      if (res.success) {
        setIsAuthenticated(true);
        triggerHaptic('success');
        showToast('Owner identity verified via Telegram ID', 'success');
      } else {
        setPinError('Account is not recognized as owner');
        triggerHaptic('error');
      }
    } catch (err: any) {
      setPinError(err.message || 'Verification failed');
      triggerHaptic('error');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleAdminLogout = async () => {
    await api.adminLogout();
    setIsAuthenticated(false);
    showToast('Admin session locked', 'info');
  };

  const loadData = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const res = await api.getAdminDashboard();
        setStats(res.stats);
        setSettings(res.settings);
      } else if (activeTab === 'users') {
        const res = await api.getAdminUsers(searchQuery);
        setUsers(res.users);
      } else if (activeTab === 'ads') {
        const res = await api.getAdminAds();
        setAds(res.ads);
      } else if (activeTab === 'tasks') {
        const res = await api.getAdminTasks();
        setTasks(res.tasks);
      } else if (activeTab === 'withdrawals') {
        const res = await api.getAdminWithdrawals();
        setWithdrawals(res.withdrawals);
      } else if (activeTab === 'notifications') {
        const res = await api.getNotificationStatus();
        setNotificationStatus(res.status);
      } else if (activeTab === 'settings') {
        const res = await api.getAdminDashboard();
        setSettings(res.settings);
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('denied')) {
        setIsAuthenticated(false);
        showToast('Session expired. Please enter PIN.', 'error');
      } else {
        showToast(err.message || 'Error loading admin data', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerNotification = async (slot: 'morning' | 'afternoon' | 'evening', targetId?: string) => {
    setIsBroadcasting(true);
    triggerHaptic('medium');
    try {
      const res = await api.triggerNotification(slot, targetId ? targetId.trim() : undefined);
      if (res.success) {
        showToast(res.message || `[${slot.toUpperCase()}] broadcast sent!`, 'success');
        triggerHaptic('success');
        const st = await api.getNotificationStatus();
        setNotificationStatus(st.status);
      }
    } catch (err: any) {
      showToast(err.message || 'Broadcast failed', 'error');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleToggleScheduler = async (enable: boolean) => {
    try {
      await api.toggleNotifications(enable);
      showToast(`Automated notifications ${enable ? 'enabled' : 'paused'}`, 'info');
      const st = await api.getNotificationStatus();
      setNotificationStatus(st.status);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    if (isAdminOpen && isAuthenticated) {
      loadData();
    }
  }, [isAdminOpen, isAuthenticated, activeTab]);

  if (!isAdminOpen) return null;

  // ==========================================
  // TASK MANAGEMENT HANDLERS
  // ==========================================
  const handleOpenNewTaskForm = () => {
    setEditingTaskId(null);
    setTaskForm({
      title: '',
      description: 'Visit website and stay for the timer duration to earn cash.',
      action_url: 'https://',
      reward: '0.25',
      duration_seconds: '15',
      task_type: 'website_visit',
      verification_method: 'instant_timer',
      status: 'active',
    });
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      action_url: task.action_url || '',
      reward: String(task.reward),
      duration_seconds: String(task.duration_seconds || 15),
      task_type: task.task_type || 'website_visit',
      verification_method: task.verification_method || 'instant_timer',
      status: task.status || 'active',
    });
    setIsTaskFormOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      showToast('Please enter a task title', 'error');
      return;
    }
    if (!taskForm.action_url.trim()) {
      showToast('Please enter a website or action link', 'error');
      return;
    }

    try {
      const payload: Partial<Task> = {
        id: editingTaskId || undefined,
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        action_url: taskForm.action_url.trim(),
        reward: parseFloat(taskForm.reward) || 0.25,
        duration_seconds: parseInt(taskForm.duration_seconds) || 15,
        task_type: taskForm.task_type as any,
        verification_method: taskForm.verification_method as any,
        status: taskForm.status as any,
      };

      await api.saveAdminTask(payload);
      showToast(editingTaskId ? 'Task updated successfully!' : 'New task created successfully!', 'success');
      setIsTaskFormOpen(false);
      setEditingTaskId(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save task', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteAdminTask(taskId);
      showToast('Task deleted successfully', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'active' ? 'inactive' : 'active';
      await api.saveAdminTask({ ...task, status: newStatus });
      showToast(`Task is now ${newStatus}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // ==========================================
  // OTHER ADMIN HANDLERS
  // ==========================================
  const handleToggleUser = async (u: User) => {
    try {
      await api.toggleUserStatus(u.id);
      showToast(`User status updated to ${u.status === 'active' ? 'suspended' : 'active'}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser || !adjustAmount) return;
    try {
      await api.adjustUserBalance(adjustingUser.id, parseFloat(adjustAmount), adjustReason);
      showToast('Balance adjusted successfully', 'success');
      setAdjustingUser(null);
      setAdjustAmount('');
      setAdjustReason('');
      loadData();
      refreshUser();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleWithdrawalStatus = async (id: string, status: string) => {
    try {
      await api.updateAdminWithdrawalStatus(id, status);
      showToast(`Withdrawal marked as ${status}`, 'success');
      loadData();
      refreshUser();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateAdminSettings(settings);
      showToast('Settings saved successfully', 'success');
      refreshUser();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPin || newAdminPin.trim().length < 4) {
      showToast('PIN must be at least 4 digits/characters', 'error');
      return;
    }
    setIsUpdatingPin(true);
    try {
      const res = await api.adminChangePin(newAdminPin.trim());
      showToast(res.message || 'Admin PIN updated successfully!', 'success');
      setNewAdminPin('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update PIN', 'error');
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveAdminAd({
        title: newAd.title,
        reward: parseFloat(newAd.reward),
        daily_limit: parseInt(newAd.daily_limit),
        cooldown: parseInt(newAd.cooldown),
        provider: newAd.provider as any,
        video_duration: parseInt(newAd.video_duration),
        sponsor_name: newAd.sponsor_name || newAd.title,
        status: 'active',
      });
      showToast('Ad created successfully', 'success');
      setNewAd({
        title: '',
        reward: '0.03',
        daily_limit: '15',
        cooldown: '30',
        provider: 'paywatch_direct',
        video_duration: '15',
        sponsor_name: '',
      });
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'telegram_channel':
        return <Send className="w-3.5 h-3.5 text-sky-500" />;
      case 'website_visit':
        return <Globe className="w-3.5 h-3.5 text-emerald-500" />;
      case 'video_watch':
        return <Video className="w-3.5 h-3.5 text-rose-500" />;
      case 'social_follow':
        return <Share2 className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <Gift className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-slate-100 flex flex-col h-[94vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-display">Pay Watch Admin</h2>
                {isAuthenticated && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Owner Verified
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">Owner security &amp; task manager</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAuthenticated && (
              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                title="Lock Admin Panel"
              >
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Lock</span>
              </button>
            )}
            <button
              onClick={() => setIsAdminOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SECURITY GATE / LOCK SCREEN */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center my-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-display">
              Owner Security Lock
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
              This panel is restricted exclusively to the app owner (<span className="font-semibold text-slate-700">Subhankar / @Subho209</span>). Enter your Admin PIN to unlock.
            </p>

            {/* Quick Owner Auto-Verify if Telegram ID matches */}
            {user?.telegram_id === '5933272882' && (
              <button
                type="button"
                onClick={handleOwnerAutoVerify}
                disabled={isVerifyingPin}
                className="w-full max-w-xs mt-4 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>One-Tap Owner Unlock (@Subho209)</span>
              </button>
            )}

            <form onSubmit={handlePinLogin} className="w-full max-w-xs mt-4 flex flex-col gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  placeholder="Enter Admin PIN"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  autoFocus
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-2xl text-xs font-mono tracking-widest text-slate-900 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {pinError && (
                <div className="text-[11px] font-bold text-rose-500 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingPin || !pinInput.trim()}
                className="w-full py-2.5 rounded-2xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{isVerifyingPin ? 'Verifying...' : 'Unlock Admin Panel'}</span>
              </button>
            </form>

            <span className="text-[10px] text-slate-400 mt-6">
              Default Owner PIN is configured in system database.
            </span>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <>
            {/* Tab Navigation */}
            <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-100 text-xs">
              {[
                { id: 'tasks', label: 'Tasks Manager', icon: CheckSquare },
                { id: 'notifications', label: 'Auto Broadcasts (3x/Day)', icon: Bell },
                { id: 'dashboard', label: 'Dashboard', icon: ShieldCheck },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'ads', label: 'Ads', icon: Film },
                { id: 'withdrawals', label: 'Withdrawals', icon: DollarSign },
                { id: 'settings', label: 'Settings & Security', icon: SettingsIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                      isActive ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-3">

              {/* TAB 1: DYNAMIC TASKS MANAGER (USER'S MAIN REQUEST) */}
              {activeTab === 'tasks' && (
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 font-display">
                        Manage Tasks &amp; Website Links
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Add any website link and set payment reward per completed task.
                      </p>
                    </div>

                    <button
                      onClick={handleOpenNewTaskForm}
                      className="flex items-center gap-1 py-1.5 px-3 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Task</span>
                    </button>
                  </div>

                  {/* Task Editor Form Modal/Card */}
                  {isTaskFormOpen && (
                    <form
                      onSubmit={handleSaveTask}
                      className="p-3.5 bg-gradient-to-br from-amber-50/80 to-indigo-50/50 border border-amber-300/70 rounded-2xl flex flex-col gap-3 shadow-md animate-in fade-in"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-amber-200/60">
                        <span className="text-xs font-extrabold text-amber-950 font-display flex items-center gap-1.5">
                          {editingTaskId ? <Edit2 className="w-3.5 h-3.5 text-amber-700" /> : <Plus className="w-3.5 h-3.5 text-amber-700" />}
                          {editingTaskId ? 'Edit Existing Task' : 'Create New Website / Action Task'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsTaskFormOpen(false);
                            setEditingTaskId(null);
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Task Title */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-700">Task Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Visit Sponsor Crypto Exchange & Explore"
                          value={taskForm.title}
                          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Description */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-700">Description / Instructions</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Stay on the site for at least 15 seconds to receive your balance reward."
                          value={taskForm.description}
                          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-500 resize-none"
                        />
                      </div>

                      {/* Target Website Link */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-emerald-600" />
                            <span>Website / Action Link (Any URL) *</span>
                          </label>
                          {taskForm.action_url && (
                            <button
                              type="button"
                              onClick={() => {
                                let url = taskForm.action_url.trim();
                                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                  url = `https://${url}`;
                                }
                                window.open(url, '_blank', 'noopener,noreferrer');
                              }}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 underline cursor-pointer"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>Test Link</span>
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="https://example.com or https://t.me/channel"
                          value={taskForm.action_url}
                          onChange={(e) => setTaskForm({ ...taskForm, action_url: e.target.value })}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-amber-500"
                        />
                        <span className="text-[9px] text-slate-400">
                          Users will be redirected to this link when they start the task.
                        </span>
                      </div>

                      {/* Reward & Duration Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Per Completion Payment */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-amber-600" />
                            <span>Payment Reward ($ USD) *</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="0.25"
                            value={taskForm.reward}
                            onChange={(e) => setTaskForm({ ...taskForm, reward: e.target.value })}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-amber-700 outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Stay Timer */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-700">Timer (Seconds required)</label>
                          <input
                            type="number"
                            min="5"
                            max="300"
                            placeholder="15"
                            value={taskForm.duration_seconds}
                            onChange={(e) => setTaskForm({ ...taskForm, duration_seconds: e.target.value })}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Category & Status Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-700">Task Type / Category</label>
                          <select
                            value={taskForm.task_type}
                            onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value })}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-amber-500"
                          >
                            <option value="website_visit">🌐 Website Visit</option>
                            <option value="telegram_channel">✈️ Telegram Channel</option>
                            <option value="video_watch">🎥 Video / YouTube</option>
                            <option value="social_follow">🐦 Social Follow (X / IG)</option>
                            <option value="special_offer">🎁 Special Offer / Signup</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-700">Status</label>
                          <select
                            value={taskForm.status}
                            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-amber-500"
                          >
                            <option value="active">🟢 Active (Visible to users)</option>
                            <option value="inactive">⚪ Inactive (Hidden)</option>
                          </select>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsTaskFormOpen(false);
                            setEditingTaskId(null);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-1.5 px-4 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-sm active:scale-95 transition-all"
                        >
                          {editingTaskId ? '💾 Save Changes' : '✨ Create Task'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Tasks List */}
                  <div className="flex flex-col gap-2.5">
                    {tasks.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No tasks configured yet. Tap "Add New Task" to create one.
                      </div>
                    ) : (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col gap-2 shadow-sm text-xs hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                {getTaskIcon(task.task_type)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 leading-tight">
                                  {task.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {task.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0">
                              <span className="font-black text-amber-600 font-display text-sm">
                                +${task.reward.toFixed(2)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  task.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {task.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>

                          {/* Link and Timer details */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                              <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                              <a
                                href={task.action_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 hover:text-indigo-600 underline truncate"
                              >
                                {task.action_url}
                              </a>
                            </div>
                            <span className="font-mono text-slate-500 shrink-0">
                              ⏱️ {task.duration_seconds || 15}s timer
                            </span>
                          </div>

                          {/* Action Buttons for Task */}
                          <div className="flex items-center justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleToggleTaskStatus(task)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                task.status === 'active'
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {task.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEditTask(task)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: AUTOMATED 3-TIMES DAILY NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 font-display flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-amber-500" />
                        <span>Automated 3-Times Daily Notifications</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Motivates users to open Pay Watch &amp; watch ads 3 times a day (Morning, Afternoon, Evening).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleScheduler(!notificationStatus?.enabled)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          notificationStatus?.enabled
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${notificationStatus?.enabled ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                        <span>{notificationStatus?.enabled ? 'Active (Auto ON)' : 'Paused'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Time & Timezone Banner */}
                  <div className="p-3 bg-gradient-to-r from-amber-50/80 via-white to-purple-50/80 border border-amber-200/70 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-extrabold text-slate-900 block leading-tight">
                          Regional Clock: {notificationStatus?.currentTime || '--:--'} ({notificationStatus?.timezone || 'IST/BST'})
                        </span>
                        <span className="text-[10px] text-slate-500">
                          3 daily scheduled windows matching peak user activity
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-mono">
                      {notificationStatus?.currentDate || 'Today'}
                    </span>
                  </div>

                  {/* 3 Scheduled Windows Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {/* 1. MORNING (09:00 AM) */}
                    <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-bold">
                            <Sun className="w-4 h-4" />
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900 font-mono">
                            09:00 AM IST
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">
                          1. Morning Quota Reset
                        </h4>
                        <p className="text-[10px] text-slate-600 mt-1 line-clamp-3">
                          &quot;☀️ Good Morning! Your Daily 15 High-Paying Ads Have Reset! Start your morning by collecting easy USDT...&quot;
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500">
                          {notificationStatus?.schedule?.[0]?.sentToday ? '✅ Sent Today' : '⏳ Auto-Scheduled'}
                        </span>
                        <button
                          type="button"
                          disabled={isBroadcasting}
                          onClick={() => handleTriggerNotification('morning')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {isBroadcasting ? 'Sending...' : 'Send Now'}
                        </button>
                      </div>
                    </div>

                    {/* 2. AFTERNOON (02:00 PM) */}
                    <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-sky-500 text-white font-bold">
                            <Zap className="w-4 h-4" />
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-sky-200/70 text-sky-900 font-mono">
                            02:00 PM IST
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">
                          2. Midday Cash Boost
                        </h4>
                        <p className="text-[10px] text-slate-600 mt-1 line-clamp-3">
                          &quot;⚡ Midday Cash Alert! Active Sponsor Rewards Are Waiting! Take a 2-minute break and grow your wallet balance...&quot;
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-sky-200/60 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500">
                          {notificationStatus?.schedule?.[1]?.sentToday ? '✅ Sent Today' : '⏳ Auto-Scheduled'}
                        </span>
                        <button
                          type="button"
                          disabled={isBroadcasting}
                          onClick={() => handleTriggerNotification('afternoon')}
                          className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-[10px] cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {isBroadcasting ? 'Sending...' : 'Send Now'}
                        </button>
                      </div>
                    </div>

                    {/* 3. EVENING (08:00 PM) */}
                    <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-purple-500 text-white font-bold">
                            <Moon className="w-4 h-4" />
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-200/70 text-purple-900 font-mono">
                            08:00 PM IST
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">
                          3. Evening Quota Expiry Alert
                        </h4>
                        <p className="text-[10px] text-slate-600 mt-1 line-clamp-3">
                          &quot;🌙 Good Evening! Final Call: Complete Today's Quota Before Midnight! Your daily limit refreshes at 12:00 AM...&quot;
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-purple-200/60 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500">
                          {notificationStatus?.schedule?.[2]?.sentToday ? '✅ Sent Today' : '⏳ Auto-Scheduled'}
                        </span>
                        <button
                          type="button"
                          disabled={isBroadcasting}
                          onClick={() => handleTriggerNotification('evening')}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {isBroadcasting ? 'Sending...' : 'Send Now'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Single Test Sender Box */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-800 block mb-1">
                      Test Send to a Specific Telegram User
                    </span>
                    <p className="text-[10px] text-slate-500 mb-2">
                      Send a test message directly to your own Telegram account to review formatting before broadcasting.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Telegram ID (e.g. 5933272882)"
                        value={targetTestChatId}
                        onChange={(e) => setTargetTestChatId(e.target.value)}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                      />
                      <button
                        type="button"
                        disabled={isBroadcasting || !targetTestChatId.trim()}
                        onClick={() => handleTriggerNotification('morning', targetTestChatId)}
                        className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        Send Test
                      </button>
                    </div>
                  </div>

                  {/* Recent Delivery History */}
                  <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-xs">
                    <span className="text-xs font-bold text-slate-900 block mb-2">
                      Recent Automated Broadcast History
                    </span>
                    {notificationStatus?.history && notificationStatus.history.length > 0 ? (
                      <div className="space-y-1.5">
                        {notificationStatus.history.slice(0, 5).map((h: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">
                                {h.slot}
                              </span>
                              <span className="text-slate-600">
                                {new Date(h.sentAt).toLocaleTimeString()} • {new Date(h.sentAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="font-bold text-emerald-600">
                              {h.successCount}/{h.totalRecipients} Delivered
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 py-2 text-center">
                        No broadcasts sent in this session yet. The background scheduler will automatically send at 09:00, 14:00, and 20:00 IST.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DASHBOARD STATS */}
              {activeTab === 'dashboard' && stats && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Total Users</div>
                      <div className="text-xl font-extrabold text-slate-900 mt-1 font-display tabular-nums">
                        {stats.totalUsers}
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl">
                      <div className="text-[10px] font-bold text-amber-800 uppercase">Balance Liability</div>
                      <div className="text-xl font-extrabold text-amber-700 mt-1 font-display tabular-nums">
                        ${stats.totalBalanceLiability}
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase">Total Paid Out</div>
                      <div className="text-xl font-extrabold text-emerald-700 mt-1 font-display tabular-nums">
                        ${stats.totalPaidOut}
                      </div>
                    </div>
                    <div className="p-3 bg-rose-50/70 border border-rose-200/60 rounded-2xl">
                      <div className="text-[10px] font-bold text-rose-800 uppercase">Pending Withdrawals</div>
                      <div className="text-xl font-extrabold text-rose-700 mt-1 font-display tabular-nums">
                        {stats.pendingWithdrawalsCount} (${stats.pendingWithdrawalsAmount})
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">Total Ads Served</span>
                    <span className="font-extrabold text-slate-900 font-mono">{stats.totalAdsServed}</span>
                  </div>

                  {/* Telegram Bot Card */}
                  <div className="p-4 bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200/80 rounded-2xl flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-sky-950 font-display">
                          Telegram Bot: @paywatch2_bot
                        </span>
                      </div>
                      <a
                        href="https://t.me/paywatch2_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline"
                      >
                        Open Bot
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/bot/setup-menu', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ appUrl: window.location.origin }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            showToast('Bot menu button linked to this app!', 'success');
                          } else {
                            showToast(data.error || 'Failed to update menu button', 'error');
                          }
                        } catch {
                          showToast('Network error updating menu button', 'error');
                        }
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all text-center"
                    >
                      🔗 Sync Bot Menu Button (Open in Telegram)
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: USERS */}
              {activeTab === 'users' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by ID, Username, or Name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadData()}
                      className="bg-transparent border-none text-xs w-full outline-none text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    {users.length === 0 ? (
                      <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1.5">
                        <Users className="w-8 h-8 text-slate-300" />
                        <span className="text-xs font-bold text-slate-700">No Telegram Users Found</span>
                        <p className="text-[10px] text-slate-400 max-w-xs">
                          Only real Telegram users who open @paywatch2_bot will appear here. No mock or demo users are shown.
                        </p>
                      </div>
                    ) : (
                      users.map((u) => (
                        <div
                          key={u.id}
                          className="p-3.5 bg-white border border-slate-200/90 hover:border-amber-300 rounded-2xl flex flex-col gap-2 transition-all shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full gold-gradient-bg text-slate-950 font-extrabold flex items-center justify-center text-xs shadow-xs">
                                {u.first_name ? u.first_name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="flex flex-col">
                                <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                                  <span>{u.first_name}</span>
                                  {u.username && (
                                    <span className="text-[10px] text-indigo-600 font-semibold font-mono">
                                      @{u.username}
                                    </span>
                                  )}
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      u.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}
                                  >
                                    {u.status === 'active' ? 'Active' : 'Suspended'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                                  <span>Telegram ID: <strong className="text-slate-800">{u.telegram_id}</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Wallet Balance Display */}
                            <div className="text-right">
                              <div className="text-xs font-black text-amber-600 font-display tabular-nums">
                                ${u.balance.toFixed(2)}
                              </div>
                              <div className="text-[9px] text-slate-400 font-medium">
                                Total: ${u.total_earned.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          {/* Stats & Actions row */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-3 text-slate-500">
                              <span>🎬 Ads: <strong className="text-slate-700">{u.ads_watched || 0}</strong></span>
                              <span>✅ Tasks: <strong className="text-slate-700">{u.tasks_completed || 0}</strong></span>
                              <span>👥 Ref: <strong className="text-slate-700">{u.referrals || 0}</strong></span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setAdjustingUser(u)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors"
                              >
                                Adjust Balance
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleUser(u)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                  u.status === 'active'
                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                }`}
                              >
                                {u.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: ADS */}
              {activeTab === 'ads' && (
                <div className="flex flex-col gap-4">
                  {/* Create Ad Form */}
                  <form onSubmit={handleCreateAd} className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-2xl flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-800">Add New Sponsor Ad</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Ad Title"
                        value={newAd.title}
                        onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Sponsor Name"
                        value={newAd.sponsor_name}
                        onChange={(e) => setNewAd({ ...newAd, sponsor_name: e.target.value })}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        step="0.05"
                        placeholder="Reward ($)"
                        value={newAd.reward}
                        onChange={(e) => setNewAd({ ...newAd, reward: e.target.value })}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Duration (s)"
                        value={newAd.video_duration}
                        onChange={(e) => setNewAd({ ...newAd, video_duration: e.target.value })}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Cooldown (s)"
                        value={newAd.cooldown}
                        onChange={(e) => setNewAd({ ...newAd, cooldown: e.target.value })}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-1.5 px-3 rounded-lg gold-gradient-bg text-slate-950 font-bold text-xs self-end mt-1"
                    >
                      Create Ad
                    </button>
                  </form>

                  {/* Current Ads */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-700">Existing Ads</span>
                    {ads.map((a) => (
                      <div key={a.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{a.title}</div>
                          <div className="text-[10px] text-slate-400">
                            Reward: +${a.reward.toFixed(2)} · Cooldown: {a.cooldown}s · Limit: {a.daily_limit}/day
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: WITHDRAWALS */}
              {activeTab === 'withdrawals' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">All Withdrawal Requests</span>
                    <button onClick={loadData} className="p-1 text-slate-400 hover:text-slate-600">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {withdrawals.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">No withdrawals yet.</div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {withdrawals.map((w) => (
                        <div key={w.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col gap-2 text-xs">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-slate-800">{w.method}</div>
                              <div className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                                {w.account}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-slate-900 font-display text-sm">
                                ${w.amount.toFixed(2)}
                              </span>
                              <div className="text-[10px] font-bold text-amber-600">{w.status}</div>
                            </div>
                          </div>

                          {w.status === 'Pending' && (
                            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 justify-end">
                              <button
                                onClick={() => handleWithdrawalStatus(w.id, 'Approved')}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleWithdrawalStatus(w.id, 'Paid')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold"
                              >
                                Mark Paid
                              </button>
                              <button
                                onClick={() => handleWithdrawalStatus(w.id, 'Rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold"
                              >
                                Reject &amp; Refund
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: SETTINGS & OWNER SECURITY */}
              {activeTab === 'settings' && (
                <div className="flex flex-col gap-4 text-xs">
                  {/* Security PIN Management Box */}
                  <div className="p-3.5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl flex flex-col gap-2.5 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold font-display">Owner Security PIN</span>
                      </div>
                      <span className="text-[9px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                        Protection Active
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Change the secret PIN required to unlock this admin panel. Only the person who knows this PIN can access admin controls.
                    </p>

                    <form onSubmit={handleChangePin} className="flex items-center gap-2 mt-1">
                      <input
                        type="password"
                        placeholder="Enter New Admin PIN"
                        value={newAdminPin}
                        onChange={(e) => setNewAdminPin(e.target.value)}
                        className="flex-1 p-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        disabled={isUpdatingPin || !newAdminPin}
                        className="py-2 px-3 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isUpdatingPin ? 'Updating...' : 'Update PIN'}
                      </button>
                    </form>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      Authorized Owner Telegram ID: <code className="text-amber-300 font-mono font-bold">5933272882</code> (@Subho209)
                    </div>
                  </div>

                  {/* General System Settings Form */}
                  {settings && (
                    <form onSubmit={handleSaveSettings} className="flex flex-col gap-3">
                      <span className="font-bold text-slate-800 text-xs">General Earnings Settings</span>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Minimum Withdrawal ($)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={settings.min_withdrawal}
                          onChange={(e) => setSettings({ ...settings, min_withdrawal: parseFloat(e.target.value) || 0 })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Ad Reward Amount ($)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={settings.ad_reward}
                          onChange={(e) => setSettings({ ...settings, ad_reward: parseFloat(e.target.value) || 0 })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Referral Bonus ($)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={settings.referral_reward}
                          onChange={(e) => setSettings({ ...settings, referral_reward: parseFloat(e.target.value) || 0 })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Daily Ad Limit</label>
                        <input
                          type="number"
                          value={settings.daily_ad_limit}
                          onChange={(e) => setSettings({ ...settings, daily_ad_limit: parseInt(e.target.value) || 0 })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Cooldown Between Ads (seconds)</label>
                        <input
                          type="number"
                          value={settings.cooldown_seconds}
                          onChange={(e) => setSettings({ ...settings, cooldown_seconds: parseInt(e.target.value) || 0 })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                          <label className="font-bold text-slate-700">Telegram Bot Username (without @)</label>
                          <input
                            type="text"
                            value={settings.bot_username}
                            onChange={(e) => setSettings({ ...settings, bot_username: e.target.value })}
                            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                          />
                        </div>

                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 flex flex-col gap-2">
                          <span className="font-bold text-amber-900 text-xs">Adsgram Monetization Settings</span>
                          
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold text-slate-700">Rewarded Video ID (Main Watch Ads)</label>
                            <input
                              type="text"
                              placeholder="e.g. 52773"
                              value={settings.adsgram_block_id || ''}
                              onChange={(e) => setSettings({ ...settings, adsgram_block_id: e.target.value })}
                              className="p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold text-slate-700">Interstitial Video ID</label>
                            <input
                              type="text"
                              placeholder="e.g. int-52775"
                              value={settings.adsgram_interstitial_id || ''}
                              onChange={(e) => setSettings({ ...settings, adsgram_interstitial_id: e.target.value })}
                              className="p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold text-slate-700">Task Wall Ad ID</label>
                            <input
                              type="text"
                              placeholder="e.g. task-52776"
                              value={settings.adsgram_task_id || ''}
                              onChange={(e) => setSettings({ ...settings, adsgram_task_id: e.target.value })}
                              className="p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                            />
                          </div>
                        </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs mt-2"
                      >
                        Save Settings
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Adjust Balance Modal */}
            {adjustingUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75">
                <div className="bg-white rounded-2xl max-w-xs w-full p-4 flex flex-col gap-3">
                  <h4 className="text-sm font-bold text-slate-900">Adjust User Balance</h4>
                  <p className="text-xs text-slate-500">
                    User: {adjustingUser.first_name} (Current: ${adjustingUser.balance.toFixed(2)})
                  </p>
                  <form onSubmit={handleAdjustBalance} className="flex flex-col gap-2">
                    <input
                      type="number"
                      step="0.05"
                      required
                      placeholder="Amount (+ or -)"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Reason / Note"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setAdjustingUser(null)}
                        className="flex-1 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl gold-gradient-bg text-xs font-bold text-slate-950"
                      >
                        Confirm
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
