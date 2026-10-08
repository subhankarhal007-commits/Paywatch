export interface User {
  id: string;
  telegram_id: string;
  username: string;
  first_name: string;
  profile_photo?: string;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
  ads_watched: number;
  daily_ads: number;
  daily_ads_date: string;
  referrals: number;
  referral_earnings: number;
  tasks_completed: number;
  created_at: string;
  updated_at: string;
  status: 'active' | 'suspended';
  referrer_id?: string;
  last_ad_watched_at?: string;
}

export interface Ad {
  id: string;
  title: string;
  reward: number;
  daily_limit: number;
  cooldown: number; // in seconds
  status: 'active' | 'inactive';
  provider: 'paywatch_direct' | 'telegram_ads' | 'network_video';
  video_duration: number; // in seconds
  sponsor_name: string;
  sponsor_tagline: string;
  sponsor_url?: string;
  created_at: string;
}

export interface AdSession {
  sessionId: string;
  userId: string;
  adId: string;
  adTitle: string;
  reward: number;
  duration: number;
  provider: string;
  sponsorName: string;
  startedAt: number;
  expiresAt: number;
  nonce: string;
  signature: string;
}

export interface AdCompletion {
  id: string;
  user_id: string;
  ad_id: string;
  ad_title?: string;
  reward: number;
  provider_transaction_id: string;
  status: 'completed' | 'flagged';
  completed_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  task_type: 'telegram_channel' | 'website_visit' | 'video_watch' | 'social_follow' | 'special_offer';
  verification_method: 'instant_timer' | 'channel_check' | 'manual_review';
  action_url: string;
  status: 'active' | 'inactive';
  icon_name?: string;
  duration_seconds?: number;
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  reward: number;
  status: 'pending' | 'completed' | 'rejected';
  proof?: string;
  completed_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referred_name: string;
  reward: number;
  status: 'credited' | 'pending';
  created_at: string;
}

export type WithdrawalMethod = 'USDT (TRC20)' | 'TON Network' | 'TRX' | 'PayPal';
export type WithdrawalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid';

export interface Withdrawal {
  id: string;
  user_id: string;
  method: WithdrawalMethod;
  account: string;
  amount: number;
  status: WithdrawalStatus;
  created_at: string;
  processed_at?: string;
  admin_note?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'ad_reward' | 'task_reward' | 'referral_bonus' | 'withdrawal' | 'withdrawal_refund' | 'admin_adjustment';
  amount: number;
  description: string;
  reference_id: string;
  created_at: string;
}

export interface SystemSettings {
  min_withdrawal: number;
  referral_reward: number;
  daily_ad_limit: number;
  ad_reward: number;
  cooldown_seconds: number;
  supported_methods: WithdrawalMethod[];
  bot_username: string;
  announcement: string;
  support_username: string;
  admin_pin?: string;
  owner_telegram_ids?: string[];
  adsgram_block_id?: string;
}

export interface AdStatusResponse {
  canWatch: boolean;
  reason?: 'cooldown' | 'daily_limit' | 'ad_unavailable' | 'suspended';
  cooldownRemaining: number;
  dailyLimit: number;
  dailyAdsWatched: number;
  reward: number;
  activeAd?: Ad;
}
