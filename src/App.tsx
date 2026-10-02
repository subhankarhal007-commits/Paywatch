import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { AdPlayerModal } from './components/AdPlayerModal.tsx';
import { SupportModal } from './components/SupportModal.tsx';
import { LanguageModal } from './components/LanguageModal.tsx';
import { ProfileModal } from './views/ProfileModal.tsx';
import { AdminView } from './views/AdminView.tsx';

import { AdsView } from './views/AdsView.tsx';
import { TasksView } from './views/TasksView.tsx';
import { InviteView } from './views/InviteView.tsx';
import { WithdrawView } from './views/WithdrawView.tsx';

const AppContent: React.FC = () => {
  const { activeTab, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20 mb-4 animate-bounce">
          <div className="w-full h-full rounded-3xl bg-slate-950 flex items-center justify-center">
            <span className="text-xl font-black text-amber-400 font-display">PW</span>
          </div>
        </div>
        <div className="text-2xl font-black tracking-tight font-display mb-1">
          PAY <span className="gold-gradient-text">WATCH</span>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 font-mono">
          <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing with Telegram...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      {/* Top Application Header */}
      <Header />

      {/* Main Responsive Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto px-3.5 sm:px-4">
        {activeTab === 'ads' && <AdsView />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'invite' && <InviteView />}
        {activeTab === 'withdraw' && <WithdrawView />}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

      {/* Interactive Modals and Dialogs */}
      <AdPlayerModal />
      <SupportModal />
      <LanguageModal />
      <ProfileModal />
      <AdminView />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
