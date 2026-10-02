import React, { useState } from 'react';
import { Globe, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

interface LanguageOption {
  code: string;
  name: string;
  native: string;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
];

export const LanguageModal: React.FC = () => {
  const { isLanguageOpen, setIsLanguageOpen, triggerHaptic, showToast } = useApp();
  const [selected, setSelected] = useState('en');

  if (!isLanguageOpen) return null;

  const handleSelect = (code: string, name: string) => {
    triggerHaptic('light');
    setSelected(code);
    showToast(`Language set to ${name}`, 'success');
    setIsLanguageOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Select Language</h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              setIsLanguageOpen(false);
            }}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Options */}
        <div className="divide-y divide-slate-100">
          {languages.map((lang) => {
            const isChosen = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code, lang.name)}
                className="w-full py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">{lang.name}</span>
                  <span className="text-[11px] text-slate-400">{lang.native}</span>
                </div>
                {isChosen && <Check className="w-4 h-4 text-amber-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
