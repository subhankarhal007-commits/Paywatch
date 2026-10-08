import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Ad,
  AdCompletion,
  Task,
  TaskCompletion,
  Referral,
  Withdrawal,
  Transaction,
  SystemSettings,
} from '../types/index.ts';

interface DatabaseSchema {
  users: User[];
  ads: Ad[];
  ad_completions: AdCompletion[];
  tasks: Task[];
  task_completions: TaskCompletion[];
  referrals: Referral[];
  withdrawals: Withdrawal[];
  transactions: Transaction[];
  settings: SystemSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const todayDate = () => new Date().toISOString().split('T')[0];

const defaultSettings: SystemSettings = {
  min_withdrawal: 5.00,
  referral_reward: 0.20,
  daily_ad_limit: 15,
  ad_reward: 0.03,
  cooldown_seconds: 0,
  supported_methods: ['USDT (TRC20)', 'TON Network', 'TRX', 'PayPal'],
  bot_username: 'paywatch2_bot',
  announcement: '🌟 Welcome to Pay Watch! Watch verified sponsor ads and complete quick tasks to earn real rewards.',
  support_username: 'paywatch2_bot',
  admin_pin: '2097',
  owner_telegram_ids: ['5933272882'],
  adsgram_block_id: '',
};

const defaultAds: Ad[] = [
  {
    id: 'ad_1',
    title: 'Binance Global Web3',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'Binance',
    sponsor_tagline: 'World #1 Crypto Exchange with $100 Trading Voucher & lowest fees',
    sponsor_url: 'https://binance.com',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ad_2',
    title: 'Revolut Global Money App',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'Revolut',
    sponsor_tagline: 'Borderless banking in 150+ currencies with 0% foreign exchange fees',
    sponsor_url: 'https://revolut.com',
    created_at: new Date(Date.now() - 80000000).toISOString(),
  },
  {
    id: 'ad_3',
    title: 'NordVPN Cyber Defense',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'NordVPN',
    sponsor_tagline: 'Military-grade encryption with ultra-fast servers across 111 countries',
    sponsor_url: 'https://nordvpn.com',
    created_at: new Date(Date.now() - 70000000).toISOString(),
  },
  {
    id: 'ad_4',
    title: 'AliExpress Choice Mega Deals',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'AliExpress',
    sponsor_tagline: 'Up to 90% discount on tech & lifestyle with free worldwide delivery',
    sponsor_url: 'https://aliexpress.com',
    created_at: new Date(Date.now() - 60000000).toISOString(),
  },
  {
    id: 'ad_5',
    title: 'Bybit VIP Crypto Card',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'Bybit',
    sponsor_tagline: 'Spend crypto anywhere with 10% instant cashback & $5,000 bonus',
    sponsor_url: 'https://bybit.com',
    created_at: new Date(Date.now() - 50000000).toISOString(),
  },
  {
    id: 'ad_6',
    title: 'Tonkeeper & Crypto Pay',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'Tonkeeper Web3',
    sponsor_tagline: 'Official Telegram TON Wallet with instant crypto transfers & zero gas fees',
    sponsor_url: 'https://tonkeeper.com',
    created_at: new Date(Date.now() - 40000000).toISOString(),
  },
  {
    id: 'ad_7',
    title: 'Duolingo Super Language Master',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'Duolingo',
    sponsor_tagline: 'Speak 40+ languages fluently in 15 mins daily with bite-sized lessons',
    sponsor_url: 'https://duolingo.com',
    created_at: new Date(Date.now() - 35000000).toISOString(),
  },
  {
    id: 'ad_8',
    title: 'Temu $100 Coupon Package',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'Temu',
    sponsor_tagline: 'Unlock a $100 coupon kit and shop trending items from $0.99',
    sponsor_url: 'https://temu.com',
    created_at: new Date(Date.now() - 30000000).toISOString(),
  },
  {
    id: 'ad_9',
    title: 'OKX Multi-Chain DEX & Staking',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'OKX Web3',
    sponsor_tagline: 'Swap crypto across 80+ chains and earn up to 18% APY staking',
    sponsor_url: 'https://okx.com',
    created_at: new Date(Date.now() - 25000000).toISOString(),
  },
  {
    id: 'ad_10',
    title: 'BC.GAME World Cup Tournament',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'BC.GAME',
    sponsor_tagline: '€10,000 combo pool with high odds and instant crypto payouts',
    sponsor_url: 'https://bc.game',
    created_at: new Date(Date.now() - 20000000).toISOString(),
  },
  {
    id: 'ad_11',
    title: 'Spotify Premium Unlimited',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'Spotify',
    sponsor_tagline: 'Listen to 100M+ songs ad-free with offline downloads & unlimited skips',
    sponsor_url: 'https://spotify.com',
    created_at: new Date(Date.now() - 15000000).toISOString(),
  },
  {
    id: 'ad_12',
    title: 'Cash App Instant P2P',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'Cash App',
    sponsor_tagline: 'Send money instantly and buy Bitcoin starting from just $1',
    sponsor_url: 'https://cash.app',
    created_at: new Date(Date.now() - 10000000).toISOString(),
  },
  {
    id: 'ad_13',
    title: 'Free Fire 2X Diamonds Top-Up',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'Garena Free Fire',
    sponsor_tagline: 'Claim 100% extra bonus diamonds on your first in-game UID top-up',
    sponsor_url: 'https://freefiremobile.com',
    created_at: new Date(Date.now() - 5000000).toISOString(),
  },
  {
    id: 'ad_14',
    title: 'Hamster Kombat 5M Daily Combo',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'Hamster Kombat',
    sponsor_tagline: 'Unlock today’s 3 combo cards and mine up to 5,000,000 bonus coins',
    sponsor_url: 'https://t.me/hamster_kombat_bot',
    created_at: new Date(Date.now() - 2000000).toISOString(),
  },
  {
    id: 'ad_15',
    title: 'Blum Telegram Crypto Exchange',
    reward: 0.03,
    daily_limit: 15,
    cooldown: 30,
    status: 'active',
    provider: 'paywatch_direct',
    video_duration: 15,
    sponsor_name: 'Blum',
    sponsor_tagline: 'Trade any cryptocurrency and farm Blum points directly in Telegram',
    sponsor_url: 'https://t.me/blum',
    created_at: new Date(Date.now() - 1000000).toISOString(),
  },
];

const defaultTasks: Task[] = [];

class Database {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: Array.isArray(parsed.users)
            ? parsed.users.filter((u: any) => !u.id?.startsWith('usr_demo') && u.telegram_id !== '849201847')
            : [],
          ads: parsed.ads || defaultAds,
          ad_completions: Array.isArray(parsed.ad_completions)
            ? parsed.ad_completions.filter((c: any) => c.user_id !== 'usr_demo849201847' && !c.id?.includes('seed'))
            : [],
          tasks: Array.isArray(parsed.tasks)
            ? parsed.tasks.filter((t: any) => !['task_1', 'task_2', 'task_3', 'task_4', 'task_5'].includes(t.id))
            : [],
          task_completions: parsed.task_completions || [],
          referrals: parsed.referrals || [],
          withdrawals: parsed.withdrawals || [],
          transactions: Array.isArray(parsed.transactions)
            ? parsed.transactions.filter((tx: any) => tx.user_id !== 'usr_demo849201847' && !tx.id?.includes('seed'))
            : [],
          settings: { ...defaultSettings, ...(parsed.settings || {}) },
        };
      } catch (err) {
        console.error('Failed to parse database file, re-initializing', err);
      }
    }

    const initial: DatabaseSchema = {
      users: [],
      ads: defaultAds,
      ad_completions: [],
      tasks: [],
      task_completions: [],
      referrals: [],
      withdrawals: [],
      transactions: [],
      settings: defaultSettings,
    };
    this.saveImmediate(initial);
    return initial;
  }

  private saveImmediate(data: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const tempPath = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (e) {
      console.error('Error writing to database:', e);
    }
  }

  private persist() {
    this.saveImmediate(this.data);
  }

  // --- Users ---
  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByTelegramId(telegramId: string): User | undefined {
    return this.data.users.find((u) => u.telegram_id === String(telegramId));
  }

  getAllUsers(): User[] {
    // Only real users (no demo/mock users)
    return this.data.users.filter((u) => !u.id.startsWith('usr_demo') && u.telegram_id !== '849201847');
  }

  upsertTelegramUser(tgUser: {
    id: string | number;
    username?: string;
    first_name?: string;
    photo_url?: string;
  }, referrerTelegramId?: string): User {
    const tid = String(tgUser.id);
    let user = this.getUserByTelegramId(tid);
    const today = todayDate();

    if (!user) {
      // Find referrer
      let referrer: User | undefined;
      if (referrerTelegramId && referrerTelegramId !== tid) {
        referrer = this.getUserByTelegramId(referrerTelegramId);
      }

      user = {
        id: `usr_${crypto.randomUUID().slice(0, 12)}`,
        telegram_id: tid,
        username: tgUser.username || `tg_${tid.slice(-4)}`,
        first_name: tgUser.first_name || 'Telegram User',
        profile_photo: tgUser.photo_url || '',
        balance: 0.00,
        total_earned: 0.00,
        total_withdrawn: 0.00,
        ads_watched: 0,
        daily_ads: 0,
        daily_ads_date: today,
        referrals: 0,
        referral_earnings: 0.00,
        tasks_completed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        referrer_id: referrer ? referrer.id : undefined,
      };
      this.data.users.push(user);

      // If referred, register referral record and reward referrer
      if (referrer) {
        const refReward = this.data.settings.referral_reward || 0.20;
        const refId = `ref_${crypto.randomUUID().slice(0, 10)}`;
        this.data.referrals.push({
          id: refId,
          referrer_id: referrer.id,
          referred_user_id: user.id,
          referred_name: user.first_name,
          reward: refReward,
          status: 'credited',
          created_at: new Date().toISOString(),
        });

        // Credit referrer balance safely
        referrer.balance = Number((referrer.balance + refReward).toFixed(2));
        referrer.total_earned = Number((referrer.total_earned + refReward).toFixed(2));
        referrer.referrals = (referrer.referrals || 0) + 1;
        referrer.referral_earnings = Number(((referrer.referral_earnings || 0) + refReward).toFixed(2));
        referrer.updated_at = new Date().toISOString();

        // Add referral transaction record
        this.data.transactions.push({
          id: `tx_${crypto.randomUUID().slice(0, 12)}`,
          user_id: referrer.id,
          type: 'referral_bonus',
          amount: refReward,
          description: `Referral Bonus: Invited ${user.first_name} (@${user.username})`,
          reference_id: refId,
          created_at: new Date().toISOString(),
        });
      }

      this.persist();
      return user;
    }

    // Refresh daily ads if day passed
    if (user.daily_ads_date !== today) {
      user.daily_ads = 0;
      user.daily_ads_date = today;
    }

    // Update details if changed
    if (tgUser.first_name && tgUser.first_name !== user.first_name) user.first_name = tgUser.first_name;
    if (tgUser.username && tgUser.username !== user.username) user.username = tgUser.username;
    if (tgUser.photo_url) user.profile_photo = tgUser.photo_url;
    user.updated_at = new Date().toISOString();

    this.persist();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.getUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates, { updated_at: new Date().toISOString() });
    this.persist();
    return user;
  }

  // --- Ads ---
  getAds(): Ad[] {
    return this.data.ads;
  }

  getActiveAd(userAdsWatchedCount = 0): Ad | undefined {
    const activeAds = this.data.ads.filter((a) => a.status === 'active');
    if (activeAds.length === 0) return this.data.ads[0];
    const index = Math.abs(userAdsWatchedCount) % activeAds.length;
    return activeAds[index];
  }

  getAdById(id: string): Ad | undefined {
    return this.data.ads.find((a) => a.id === id);
  }

  saveAd(ad: Ad): Ad {
    const idx = this.data.ads.findIndex((a) => a.id === ad.id);
    if (idx >= 0) {
      this.data.ads[idx] = ad;
    } else {
      this.data.ads.push(ad);
    }
    this.persist();
    return ad;
  }

  deleteAd(id: string): boolean {
    const prevLen = this.data.ads.length;
    this.data.ads = this.data.ads.filter((a) => a.id !== id);
    if (this.data.ads.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Tasks ---
  getTasks(): Task[] {
    return this.data.tasks;
  }

  getTaskById(id: string): Task | undefined {
    return this.data.tasks.find((t) => t.id === id);
  }

  saveTask(task: Task): Task {
    const idx = this.data.tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      this.data.tasks[idx] = task;
    } else {
      this.data.tasks.push(task);
    }
    this.persist();
    return task;
  }

  deleteTask(id: string): boolean {
    const prev = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
    if (this.data.tasks.length !== prev) {
      this.persist();
      return true;
    }
    return false;
  }

  getTaskCompletions(userId: string): TaskCompletion[] {
    return this.data.task_completions.filter((tc) => tc.user_id === userId);
  }

  getTaskCompletion(userId: string, taskId: string): TaskCompletion | undefined {
    return this.data.task_completions.find((tc) => tc.user_id === userId && tc.task_id === taskId);
  }

  addTaskCompletion(completion: TaskCompletion): void {
    this.data.task_completions.push(completion);
    this.persist();
  }

  // --- Referrals ---
  getReferrals(userId: string): Referral[] {
    return this.data.referrals.filter((r) => r.referrer_id === userId);
  }

  // --- Transactions ---
  getTransactions(userId: string): Transaction[] {
    return this.data.transactions
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getAllTransactions(): Transaction[] {
    return [...this.data.transactions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  addTransaction(tx: Transaction): void {
    this.data.transactions.push(tx);
    this.persist();
  }

  // --- Ad Completions ---
  getAdCompletions(userId: string): AdCompletion[] {
    return this.data.ad_completions
      .filter((ac) => ac.user_id === userId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  }

  // --- Withdrawals ---
  getWithdrawals(userId?: string): Withdrawal[] {
    const list = userId
      ? this.data.withdrawals.filter((w) => w.user_id === userId)
      : this.data.withdrawals;
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  getWithdrawalById(id: string): Withdrawal | undefined {
    return this.data.withdrawals.find((w) => w.id === id);
  }

  // Create withdrawal in an ACID transaction: debits balance atomically
  createWithdrawal(userId: string, method: any, account: string, amount: number): {
    success: boolean;
    withdrawal?: Withdrawal;
    error?: string;
  } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };
    if (user.status === 'suspended') return { success: false, error: 'Account suspended' };

    const minAmount = this.data.settings.min_withdrawal;
    if (amount < minAmount) {
      return { success: false, error: `Minimum withdrawal is $${minAmount.toFixed(2)}` };
    }

    if (user.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Check for duplicate pending withdrawal within last 2 minutes
    const recentPending = this.data.withdrawals.find(
      (w) =>
        w.user_id === userId &&
        w.status === 'Pending' &&
        Date.now() - new Date(w.created_at).getTime() < 120000
    );
    if (recentPending) {
      return { success: false, error: 'You already have a pending withdrawal request in queue' };
    }

    // Debit balance atomically
    user.balance = Number((user.balance - amount).toFixed(2));
    user.updated_at = new Date().toISOString();

    const withdrawal: Withdrawal = {
      id: `wth_${crypto.randomUUID().slice(0, 10)}`,
      user_id: userId,
      method,
      account: account.trim(),
      amount,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    this.data.withdrawals.push(withdrawal);

    // Record withdrawal transaction
    const tx: Transaction = {
      id: `tx_${crypto.randomUUID().slice(0, 12)}`,
      user_id: userId,
      type: 'withdrawal',
      amount: -amount,
      description: `Withdrawal to ${method} (${account.slice(0, 6)}...${account.slice(-4)})`,
      reference_id: withdrawal.id,
      created_at: new Date().toISOString(),
    };
    this.data.transactions.push(tx);

    this.persist();
    return { success: true, withdrawal };
  }

  updateWithdrawalStatus(
    id: string,
    status: 'Approved' | 'Rejected' | 'Paid',
    adminNote?: string
  ): { success: boolean; error?: string } {
    const w = this.getWithdrawalById(id);
    if (!w) return { success: false, error: 'Withdrawal not found' };

    const previousStatus = w.status;
    w.status = status;
    w.processed_at = new Date().toISOString();
    if (adminNote) w.admin_note = adminNote;

    const user = this.getUserById(w.user_id);

    // If changing to Rejected, refund balance atomically
    if (status === 'Rejected' && previousStatus !== 'Rejected') {
      if (user) {
        user.balance = Number((user.balance + w.amount).toFixed(2));
        user.updated_at = new Date().toISOString();
        this.data.transactions.push({
          id: `tx_${crypto.randomUUID().slice(0, 12)}`,
          user_id: user.id,
          type: 'withdrawal_refund',
          amount: w.amount,
          description: `Refund for rejected withdrawal ${w.id}${adminNote ? ` (${adminNote})` : ''}`,
          reference_id: w.id,
          created_at: new Date().toISOString(),
        });
      }
    } else if (status === 'Paid' && previousStatus !== 'Paid') {
      if (user) {
        user.total_withdrawn = Number((user.total_withdrawn + w.amount).toFixed(2));
        user.updated_at = new Date().toISOString();
      }
    }

    this.persist();
    return { success: true };
  }

  // --- ATOMIC REWARD CLAIM FOR ADS ---
  creditVerifiedAdReward(userId: string, adId: string, providerTxId: string): {
    success: boolean;
    reward?: number;
    newBalance?: number;
    error?: string;
  } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };
    if (user.status === 'suspended') return { success: false, error: 'Account is suspended' };

    // Prevent duplicate provider callback/claim
    const alreadyProcessed = this.data.ad_completions.some(
      (ac) => ac.provider_transaction_id === providerTxId
    );
    if (alreadyProcessed) {
      return { success: false, error: 'Reward already credited for this session' };
    }

    const today = todayDate();
    if (user.daily_ads_date !== today) {
      user.daily_ads = 0;
      user.daily_ads_date = today;
    }

    const ad = this.getAdById(adId) || this.getActiveAd();
    if (!ad) return { success: false, error: 'Ad configuration not found' };

    const dailyLimit = this.data.settings.daily_ad_limit || ad.daily_limit;
    if (user.daily_ads >= dailyLimit) {
      return { success: false, error: 'Daily ad limit reached' };
    }

    // Check cooldown
    if (user.last_ad_watched_at) {
      const cooldownSec = this.data.settings.cooldown_seconds || ad.cooldown;
      const elapsed = (Date.now() - new Date(user.last_ad_watched_at).getTime()) / 1000;
      if (elapsed < cooldownSec) {
        return { success: false, error: `Cooldown in effect. Please wait ${Math.ceil(cooldownSec - elapsed)}s` };
      }
    }

    // Backend-authoritative reward calculation
    const reward = Number((this.data.settings.ad_reward || ad.reward).toFixed(2));

    // Atomically increment values
    user.balance = Number((user.balance + reward).toFixed(2));
    user.total_earned = Number((user.total_earned + reward).toFixed(2));
    user.ads_watched = (user.ads_watched || 0) + 1;
    user.daily_ads = (user.daily_ads || 0) + 1;
    user.last_ad_watched_at = new Date().toISOString();
    user.updated_at = new Date().toISOString();

    const adCompletionId = `adc_${crypto.randomUUID().slice(0, 10)}`;
    this.data.ad_completions.push({
      id: adCompletionId,
      user_id: user.id,
      ad_id: ad.id,
      ad_title: ad.title,
      reward,
      provider_transaction_id: providerTxId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    const tx: Transaction = {
      id: `tx_${crypto.randomUUID().slice(0, 12)}`,
      user_id: user.id,
      type: 'ad_reward',
      amount: reward,
      description: `Ad Reward: ${ad.title}`,
      reference_id: adCompletionId,
      created_at: new Date().toISOString(),
    };
    this.data.transactions.push(tx);

    this.persist();
    return { success: true, reward, newBalance: user.balance };
  }

  // --- ATOMIC REWARD FOR MONETAG ADS ($0.03 default) ---
  creditMonetagAdReward(
    userId: string,
    adType: 'rewarded_interstitial' | 'rewarded_popup' | 'in_app' = 'rewarded_interstitial',
    customReward = 0.03
  ): {
    success: boolean;
    reward?: number;
    newBalance?: number;
    user?: User;
    error?: string;
  } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };
    if (user.status === 'suspended') return { success: false, error: 'Account is suspended' };

    const today = todayDate();
    if (user.daily_ads_date !== today) {
      user.daily_ads = 0;
      user.daily_ads_date = today;
    }

    const dailyLimit = this.data.settings.daily_ad_limit || 15;
    if (user.daily_ads >= dailyLimit) {
      return { success: false, error: `Daily ad limit (${dailyLimit} ads) reached for today` };
    }

    const reward = Number((customReward || this.data.settings.ad_reward || 0.03).toFixed(2));

    // Atomically increment values
    user.balance = Number((user.balance + reward).toFixed(2));
    user.total_earned = Number((user.total_earned + reward).toFixed(2));
    user.ads_watched = (user.ads_watched || 0) + 1;
    user.daily_ads = (user.daily_ads || 0) + 1;
    user.last_ad_watched_at = new Date().toISOString();
    user.updated_at = new Date().toISOString();

    const adTypeName =
      adType === 'rewarded_popup'
        ? 'Monetag Rewarded Popup'
        : adType === 'in_app'
        ? 'Monetag In-App Interstitial'
        : 'Monetag Rewarded Interstitial';

    const adCompletionId = `monetag_${crypto.randomUUID().slice(0, 10)}`;
    this.data.ad_completions.push({
      id: adCompletionId,
      user_id: user.id,
      ad_id: 'monetag_zone_11906638',
      reward,
      provider_transaction_id: `mt_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`,
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    const tx: Transaction = {
      id: `tx_${crypto.randomUUID().slice(0, 12)}`,
      user_id: user.id,
      type: 'ad_reward',
      amount: reward,
      description: `${adTypeName} (Zone 11906638)`,
      reference_id: adCompletionId,
      created_at: new Date().toISOString(),
    };
    this.data.transactions.push(tx);

    this.persist();
    return { success: true, reward, newBalance: user.balance, user };
  }

  // --- ATOMIC REWARD CLAIM FOR TASKS ---
  creditVerifiedTaskReward(userId: string, taskId: string, proof?: string): {
    success: boolean;
    reward?: number;
    newBalance?: number;
    error?: string;
  } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };
    if (user.status === 'suspended') return { success: false, error: 'Account suspended' };

    const task = this.getTaskById(taskId);
    if (!task) return { success: false, error: 'Task not found' };
    if (task.status !== 'active') return { success: false, error: 'Task is no longer active' };

    // Prevent double reward
    const existing = this.getTaskCompletion(userId, taskId);
    if (existing && existing.status === 'completed') {
      return { success: false, error: 'You have already completed and claimed this task' };
    }

    const reward = Number(task.reward.toFixed(2));

    // Record completion
    if (existing) {
      existing.status = 'completed';
      existing.completed_at = new Date().toISOString();
      if (proof) existing.proof = proof;
    } else {
      this.data.task_completions.push({
        id: `tc_${crypto.randomUUID().slice(0, 10)}`,
        user_id: user.id,
        task_id: task.id,
        reward,
        status: 'completed',
        proof,
        completed_at: new Date().toISOString(),
      });
    }

    // Atomically credit balance
    user.balance = Number((user.balance + reward).toFixed(2));
    user.total_earned = Number((user.total_earned + reward).toFixed(2));
    user.tasks_completed = (user.tasks_completed || 0) + 1;
    user.updated_at = new Date().toISOString();

    const tx: Transaction = {
      id: `tx_${crypto.randomUUID().slice(0, 12)}`,
      user_id: user.id,
      type: 'task_reward',
      amount: reward,
      description: `Task Reward: ${task.title}`,
      reference_id: taskId,
      created_at: new Date().toISOString(),
    };
    this.data.transactions.push(tx);

    this.persist();
    return { success: true, reward, newBalance: user.balance };
  }

  // --- Settings ---
  getSettings(): SystemSettings {
    return { ...this.data.settings };
  }

  getPublicSettings(): Omit<SystemSettings, 'admin_pin' | 'owner_telegram_ids'> {
    const { admin_pin, owner_telegram_ids, ...publicSettings } = this.data.settings;
    return publicSettings;
  }

  validateAdminAccess(pin?: string, telegramId?: string): boolean {
    const owners = this.data.settings.owner_telegram_ids || ['5933272882'];
    if (telegramId && owners.includes(String(telegramId))) {
      return true;
    }
    const currentPin = this.data.settings.admin_pin || '2097';
    if (pin && String(pin).trim() === String(currentPin).trim()) {
      return true;
    }
    return false;
  }

  updateAdminPin(newPin: string): boolean {
    if (!newPin || newPin.trim().length < 4) return false;
    this.data.settings.admin_pin = newPin.trim();
    this.persist();
    return true;
  }

  updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    return this.data.settings;
  }

  // --- Admin Stats ---
  getAdminStats() {
    const totalUsers = this.data.users.length;
    const totalBalanceLiability = Number(
      this.data.users.reduce((acc, u) => acc + (u.balance || 0), 0).toFixed(2)
    );
    const totalPaidOut = Number(
      this.data.withdrawals
        .filter((w) => w.status === 'Paid')
        .reduce((acc, w) => acc + w.amount, 0)
        .toFixed(2)
    );
    const pendingWithdrawalsCount = this.data.withdrawals.filter((w) => w.status === 'Pending').length;
    const pendingWithdrawalsAmount = Number(
      this.data.withdrawals
        .filter((w) => w.status === 'Pending')
        .reduce((acc, w) => acc + w.amount, 0)
        .toFixed(2)
    );
    const totalAdsServed = this.data.ad_completions.length;
    const totalTasksDone = this.data.task_completions.filter((t) => t.status === 'completed').length;

    return {
      totalUsers,
      totalBalanceLiability,
      totalPaidOut,
      pendingWithdrawalsCount,
      pendingWithdrawalsAmount,
      totalAdsServed,
      totalTasksDone,
    };
  }
}

export const db = new Database();
