import React from 'react';
import { BalanceCard } from '../components/BalanceCard.tsx';
import { WatchAdButton } from '../components/WatchAdButton.tsx';

export const AdsView: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 pb-20 pt-2 animate-in fade-in duration-150">
      {/* 1. Large Premium Balance Card */}
      <BalanceCard />

      {/* 2. Brand New "WATCH AD" Action Section */}
      <WatchAdButton />
    </div>
  );
};

