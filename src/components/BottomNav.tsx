import React from 'react';
import { Play, CheckSquare, Users, DollarSign } from 'lucide-react';
import { useApp, TabType } from '../context/AppContext.tsx';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'ads', label: 'Ads', icon: Play },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'invite', label: 'Invite', icon: Users },
  { id: 'withdraw', label: 'Withdraw', icon: DollarSign },
];

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, triggerHaptic } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveTab(item.id);
              }}
              className="flex flex-col items-center justify-center h-full w-full py-1 relative cursor-pointer transition-transform active:scale-90"
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                  isActive ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 ${
                    item.id === 'ads' && isActive ? 'fill-current ml-0.5' : ''
                  }`}
                />
              </div>

              <span
                className={`text-[11px] font-semibold tracking-tight transition-colors duration-200 mt-0.5 ${
                  isActive ? 'text-amber-600 font-bold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
