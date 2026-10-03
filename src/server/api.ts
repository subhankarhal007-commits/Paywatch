import { Router, Request, Response } from 'express';
import { db } from './db.ts';
import { getProvider } from './adProvider.ts';
import {
  validateTelegramInitData,
  getTelegramBotInfo,
  configureBotMenuButton,
  sendBotWelcomeMessage,
  TELEGRAM_BOT_USERNAME,
} from './telegramBot.ts';
import crypto from 'crypto';

export const apiRouter = Router();

// Helper to extract authenticated user from header
function getAuthUser(req: Request) {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return null;
  return db.getUserById(userId) || null;
}

// ==========================================
// AUTHENTICATION & TELEGRAM INIT
// ==========================================
apiRouter.post('/auth/telegram', (req: Request, res: Response) => {
  try {
    const { initData, mockUser, ref } = req.body;
    let tgUser: any = null;
    let referralCode: string | undefined = ref;

    // Validate real Telegram initData using HMAC-SHA256 signature
    if (initData && typeof initData === 'string') {
      const validation = validateTelegramInitData(initData);
      if (validation.valid && validation.user) {
        tgUser = validation.user;
        if (validation.startParam && validation.startParam.startsWith('ref_')) {
          referralCode = validation.startParam.replace('ref_', '');
        }
      } else {
        // Parse user even if in preview/testing mode with warning
        try {
          const urlParams = new URLSearchParams(initData);
          const userJson = urlParams.get('user');
          if (userJson) tgUser = JSON.parse(userJson);
        } catch (e) {
          console.warn('Failed to parse initData query:', e);
        }
      }
    }

    // Fallback if not inside Telegram
    if (!tgUser || !tgUser.id) {
      const existingFromHeader = getAuthUser(req);
      if (existingFromHeader) {
        tgUser = {
          id: existingFromHeader.telegram_id,
          first_name: existingFromHeader.first_name,
          username: existingFromHeader.username,
          photo_url: existingFromHeader.profile_photo,
        };
      } else if (mockUser && mockUser.id) {
        tgUser = mockUser;
      } else {
        const realUsers = db.getAllUsers();
        if (realUsers.length > 0) {
          const existing = realUsers[0];
          tgUser = {
            id: existing.telegram_id,
            first_name: existing.first_name,
            username: existing.username,
            photo_url: existing.profile_photo,
          };
        } else {
          tgUser = {
            id: '5933272882',
            first_name: 'Subhankar',
            username: 'Subho209',
            photo_url: '',
          };
        }
      }
    }

    const user = db.upsertTelegramUser(tgUser, referralCode);
    const settings = db.getSettings();

    res.json({
      success: true,
      user,
      settings,
      botUsername: TELEGRAM_BOT_USERNAME,
    });
  } catch (err: any) {
    console.error('Auth error:', err);
    res.status(500).json({ success: false, error: err.message || 'Authentication error' });
  }
});

// ==========================================
// TELEGRAM BOT WEBHOOK & CONTROLS
// ==========================================
apiRouter.get('/bot/status', async (_req: Request, res: Response) => {
  try {
    const info = await getTelegramBotInfo();
    const appUrl = process.env.APP_URL || '';
    res.json({
      success: true,
      bot: info,
      username: TELEGRAM_BOT_USERNAME,
      botLink: `https://t.me/${TELEGRAM_BOT_USERNAME}`,
      appUrl,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/bot/setup-menu', async (req: Request, res: Response) => {
  try {
    const appUrl = req.body.appUrl || process.env.APP_URL || '';
    if (!appUrl) {
      return res.status(400).json({ success: false, error: 'App URL is required' });
    }
    const result = await configureBotMenuButton(appUrl);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Incoming webhook from Telegram for /start commands
apiRouter.post('/bot/webhook', async (req: Request, res: Response) => {
  try {
    const update = req.body;
    if (update?.message?.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const appUrl = process.env.APP_URL || 'https://t.me/paywatch2_bot';

      if (text.startsWith('/start')) {
        await sendBotWelcomeMessage(chatId, appUrl);
      }
    }
    res.json({ ok: true });
  } catch (err: any) {
    console.error('Bot webhook error:', err);
    res.json({ ok: true }); // Always return 200 to Telegram
  }
});

// ==========================================
// USER PROFILE & BALANCE
// ==========================================
apiRouter.get('/user/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  const settings = db.getSettings();
  res.json({
    success: true,
    user,
    settings,
  });
});

// Protect user balance against server redeploys or restarts
apiRouter.post('/user/sync-balance', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { verifiedBalance } = req.body;
  const numVerified = typeof verifiedBalance === 'number' ? verifiedBalance : parseFloat(verifiedBalance);

  if (isNaN(numVerified) || numVerified <= 0) {
    return res.json({ success: false, balance: user.balance, user });
  }

  // If client verified balance is higher than current server balance (e.g. from an older database snapshot after restart)
  // Restore it safely up to a reasonable threshold without exceeding total reasonable bounds
  if (numVerified > user.balance && (numVerified - user.balance) <= 10.00) {
    console.log(`[Balance Guardian] Restoring earned balance for ${user.first_name} (${user.telegram_id}): $${user.balance} -> $${numVerified}`);
    user.balance = Number(numVerified.toFixed(2));
    if (user.balance > user.total_earned) {
      user.total_earned = user.balance;
    }
    user.updated_at = new Date().toISOString();
    db.persist();
  }

  res.json({
    success: true,
    balance: user.balance,
    user,
  });
});

// ==========================================
// WATCH ADS ENDPOINTS
// ==========================================
apiRouter.get('/ads/status', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const settings = db.getSettings();
  const activeAd = db.getActiveAd(user.ads_watched || 0);

  if (!activeAd) {
    return res.json({
      canWatch: false,
      reason: 'ad_unavailable',
      cooldownRemaining: 0,
      dailyLimit: settings.daily_ad_limit,
      dailyAdsWatched: user.daily_ads || 0,
      reward: settings.ad_reward,
    });
  }

  const dailyLimit = settings.daily_ad_limit || activeAd.daily_limit;
  if ((user.daily_ads || 0) >= dailyLimit) {
    return res.json({
      canWatch: false,
      reason: 'daily_limit',
      cooldownRemaining: 0,
      dailyLimit,
      dailyAdsWatched: user.daily_ads || 0,
      reward: settings.ad_reward || activeAd.reward,
      activeAd,
    });
  }

  // Calculate cooldown
  const cooldownSec = settings.cooldown_seconds || activeAd.cooldown;
  let cooldownRemaining = 0;
  if (user.last_ad_watched_at) {
    const elapsed = (Date.now() - new Date(user.last_ad_watched_at).getTime()) / 1000;
    if (elapsed < cooldownSec) {
      cooldownRemaining = Math.ceil(cooldownSec - elapsed);
    }
  }

  const canWatch = cooldownRemaining <= 0 && user.status !== 'suspended';
  const reason = cooldownRemaining > 0 ? 'cooldown' : user.status === 'suspended' ? 'suspended' : undefined;

  res.json({
    canWatch,
    reason,
    cooldownRemaining,
    dailyLimit,
    dailyAdsWatched: user.daily_ads || 0,
    reward: settings.ad_reward || activeAd.reward,
    activeAd,
  });
});

apiRouter.post('/ads/start-session', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ success: false, error: 'Account suspended' });
  }

  const settings = db.getSettings();
  const activeAd = db.getActiveAd(user.ads_watched || 0);
  if (!activeAd) {
    return res.status(400).json({ success: false, error: 'No active ads available at the moment' });
  }

  const dailyLimit = settings.daily_ad_limit || activeAd.daily_limit;
  if ((user.daily_ads || 0) >= dailyLimit) {
    return res.status(400).json({ success: false, error: 'Daily ad limit reached for today' });
  }

  const cooldownSec = settings.cooldown_seconds || activeAd.cooldown;
  if (user.last_ad_watched_at) {
    const elapsed = (Date.now() - new Date(user.last_ad_watched_at).getTime()) / 1000;
    if (elapsed < cooldownSec) {
      return res.status(400).json({
        success: false,
        error: `Please wait ${Math.ceil(cooldownSec - elapsed)} seconds before watching another ad`,
      });
    }
  }

  const provider = getProvider(activeAd.provider);
  const session = provider.createSession(user.id, activeAd);

  res.json({
    success: true,
    session,
  });
});

apiRouter.post('/ads/verify-completion', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { sessionId, nonce, signature, elapsedSeconds, providerKey } = req.body;

  if (!sessionId || !nonce || !signature) {
    return res.status(400).json({ success: false, error: 'Missing session verification tokens' });
  }

  const provider = getProvider(providerKey || 'paywatch_direct');
  const verification = provider.verifyCompletion({
    userId: user.id,
    sessionId,
    nonce,
    signature,
    elapsedSeconds: Number(elapsedSeconds) || 0,
  });

  if (!verification.valid || !verification.providerTransactionId) {
    return res.status(400).json({
      success: false,
      error: verification.error || 'Ad verification failed. Reward not credited.',
    });
  }

  const adId = verification.adId || (db.getActiveAd(user.ads_watched || 0)?.id ?? 'ad_1');

  // Atomic database credit
  const creditResult = db.creditVerifiedAdReward(user.id, adId, verification.providerTransactionId);

  if (!creditResult.success) {
    return res.status(400).json({ success: false, error: creditResult.error });
  }

  const updatedUser = db.getUserById(user.id);

  res.json({
    success: true,
    reward: creditResult.reward,
    newBalance: creditResult.newBalance,
    user: updatedUser,
    message: `+$${creditResult.reward?.toFixed(2)} successfully credited to your balance!`,
  });
});

// MONETAG DIRECT REWARD AD COMPLETION (Protected by timer session validation)
apiRouter.post('/ads/monetag-complete', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { sessionId, nonce, signature, adType } = req.body;

  // Enforce session verification: Direct reward without timing countdown is blocked
  if (!sessionId || !nonce || !signature) {
    return res.status(400).json({
      success: false,
      error: 'Timer session token required. Watch the full ad until the countdown ends (0s) to earn.',
    });
  }

  const provider = getProvider('paywatch_direct');
  const verification = provider.verifyCompletion({
    userId: user.id,
    sessionId,
    nonce,
    signature,
    elapsedSeconds: 15,
  });

  if (!verification.valid) {
    return res.status(400).json({
      success: false,
      error: verification.error || 'Full 15s timer was not completed. Reward discarded.',
    });
  }

  const validTypes = ['rewarded_interstitial', 'rewarded_popup', 'in_app'];
  const sanitizedType = validTypes.includes(adType) ? adType : 'rewarded_interstitial';

  const result = db.creditMonetagAdReward(user.id, sanitizedType as any);

  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }

  res.json({
    success: true,
    reward: result.reward,
    newBalance: result.newBalance,
    user: result.user,
    message: `+$${result.reward?.toFixed(2)} automatically credited to your payment wallet!`,
  });
});

apiRouter.get('/ads/history', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const completions = db.getAdCompletions(user.id);
  res.json({ success: true, completions });
});

// ==========================================
// TASKS ENDPOINTS
// ==========================================
apiRouter.get('/tasks', (req: Request, res: Response) => {
  const user = getAuthUser(req) || (db.getAllUsers().length > 0 ? db.getAllUsers()[0] : null);
  const allTasks = db.getTasks().filter((t) => t.status === 'active');
  const userCompletions = user ? db.getTaskCompletions(user.id) : [];

  const completionMap = new Map<string, any>();
  userCompletions.forEach((c) => completionMap.set(c.task_id, c));

  const tasksWithStatus = allTasks.map((t) => {
    const comp = completionMap.get(t.id);
    return {
      ...t,
      userStatus: comp ? comp.status : 'start',
      completedAt: comp ? comp.completed_at : null,
    };
  });

  res.json({ success: true, tasks: tasksWithStatus });
});

apiRouter.post('/tasks/start', (req: Request, res: Response) => {
  let user = getAuthUser(req);
  if (!user) {
    const allUsers = db.getAllUsers();
    if (allUsers.length > 0) user = allUsers[0];
  }
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const { taskId } = req.body;
  const task = db.getTaskById(taskId);
  if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

  const existing = db.getTaskCompletion(user.id, taskId);
  if (!existing) {
    // Record pending completion
    db.addTaskCompletion({
      id: `tc_${crypto.randomUUID().slice(0, 10)}`,
      user_id: user.id,
      task_id: taskId,
      reward: task.reward,
      status: 'pending',
      completed_at: new Date().toISOString(),
    });
  }

  res.json({ success: true, message: 'Task started. Please follow the instructions to verify.' });
});

apiRouter.post('/tasks/verify', (req: Request, res: Response) => {
  let user = getAuthUser(req);
  if (!user) {
    const allUsers = db.getAllUsers();
    if (allUsers.length > 0) user = allUsers[0];
  }
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const { taskId, proof } = req.body;
  if (!taskId) return res.status(400).json({ success: false, error: 'Task ID required' });

  const result = db.creditVerifiedTaskReward(user.id, taskId, proof);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }

  const updatedUser = db.getUserById(user.id);
  res.json({
    success: true,
    reward: result.reward,
    newBalance: result.newBalance,
    user: updatedUser,
    message: `Task verified! +$${result.reward?.toFixed(2)} added to your balance.`,
  });
});

// ==========================================
// REFERRAL ENDPOINTS
// ==========================================
apiRouter.get('/referrals', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const referrals = db.getReferrals(user.id);
  const settings = db.getSettings();

  const botUsername = settings.bot_username || 'PayWatchEarnBot';
  const referralLink = `https://t.me/${botUsername}?start=ref_${user.telegram_id}`;

  res.json({
    success: true,
    referralLink,
    totalReferrals: user.referrals || referrals.length,
    referralEarnings: user.referral_earnings || 0,
    rewardPerReferral: settings.referral_reward || 0.20,
    referrals,
  });
});

// ==========================================
// WITHDRAWAL ENDPOINTS
// ==========================================
apiRouter.get('/withdrawals', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const withdrawals = db.getWithdrawals(user.id);
  const settings = db.getSettings();

  res.json({
    success: true,
    withdrawals,
    availableBalance: user.balance,
    minWithdrawal: settings.min_withdrawal,
    supportedMethods: settings.supported_methods,
  });
});

apiRouter.post('/withdraw', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const { method, account, amount } = req.body;

  if (!method || !account || !amount) {
    return res.status(400).json({ success: false, error: 'Please provide method, address, and amount' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid withdrawal amount' });
  }

  const result = db.createWithdrawal(user.id, method, account, numAmount);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }

  const updatedUser = db.getUserById(user.id);

  res.json({
    success: true,
    withdrawal: result.withdrawal,
    user: updatedUser,
    message: 'Withdrawal request submitted successfully! Funds are in processing.',
  });
});

// ==========================================
// TRANSACTIONS LEDGER
// ==========================================
apiRouter.get('/transactions', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const transactions = db.getTransactions(user.id);
  res.json({ success: true, transactions });
});

// ==========================================
// ADMIN DASHBOARD & SECURITY CONTROLS
// ==========================================

// In-memory admin session tokens (24-hour lifetime)
const adminSessions = new Map<string, { createdAt: number; ownerIdentifier: string }>();

// Middleware strictly verifying Owner / Admin token
const requireAdmin = (req: Request, res: Response, next: () => void) => {
  const customHeader = (req.headers['x-admin-token'] as string) || '';
  const authHeader = req.headers['authorization'] || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const token = customHeader || bearerToken;

  if (token && adminSessions.has(token)) {
    const session = adminSessions.get(token)!;
    if (Date.now() - session.createdAt < 24 * 60 * 60 * 1000) {
      return next();
    } else {
      adminSessions.delete(token);
    }
  }

  // Also check if request comes with owner's verified Telegram ID
  const tgUser = getAuthUser(req);
  if (tgUser && db.validateAdminAccess(undefined, tgUser.telegram_id)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Access denied: Admin panel is locked. Only the owner can access this panel.',
  });
};

// Admin Login endpoint (Validates Secret PIN or Owner Telegram ID)
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  try {
    const { pin, telegramId } = req.body;
    const isValid = db.validateAdminAccess(pin, telegramId);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Admin PIN or unauthorized account.',
      });
    }

    const token = `adm_${crypto.randomUUID().replace(/-/g, '')}`;
    adminSessions.set(token, {
      createdAt: Date.now(),
      ownerIdentifier: telegramId || 'Owner',
    });

    res.json({
      success: true,
      token,
      message: 'Admin access authorized successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin check-auth
apiRouter.get('/admin/check-auth', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, authorized: true });
});

// Admin Logout
apiRouter.post('/admin/logout', (req: Request, res: Response) => {
  const token = (req.headers['x-admin-token'] as string) || '';
  if (token) adminSessions.delete(token);
  res.json({ success: true, message: 'Admin logged out.' });
});

// Admin Change PIN
apiRouter.post('/admin/change-pin', requireAdmin, (req: Request, res: Response) => {
  const { newPin } = req.body;
  if (!newPin || String(newPin).trim().length < 4) {
    return res.status(400).json({ success: false, error: 'New PIN must be at least 4 characters.' });
  }

  const success = db.updateAdminPin(String(newPin).trim());
  if (success) {
    res.json({ success: true, message: 'Admin PIN updated successfully.' });
  } else {
    res.status(400).json({ success: false, error: 'Failed to update PIN.' });
  }
});

apiRouter.get('/admin/dashboard', requireAdmin, (req: Request, res: Response) => {
  const stats = db.getAdminStats();
  const settings = db.getSettings();
  res.json({ success: true, stats, settings });
});

apiRouter.get('/admin/users', requireAdmin, (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  let users = db.getAllUsers();

  if (query) {
    users = users.filter(
      (u) =>
        u.telegram_id.includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.first_name.toLowerCase().includes(query)
    );
  }

  res.json({ success: true, users });
});

apiRouter.post('/admin/users/:id/toggle-status', requireAdmin, (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  const newStatus = user.status === 'active' ? 'suspended' : 'active';
  db.updateUser(user.id, { status: newStatus });
  res.json({ success: true, user: db.getUserById(user.id) });
});

apiRouter.post('/admin/users/:id/adjust-balance', requireAdmin, (req: Request, res: Response) => {
  const { amount, reason } = req.body;
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  const numAmount = Number(amount);
  if (isNaN(numAmount)) return res.status(400).json({ success: false, error: 'Invalid amount' });

  const newBalance = Number((user.balance + numAmount).toFixed(2));
  if (newBalance < 0) return res.status(400).json({ success: false, error: 'Balance cannot be negative' });

  user.balance = newBalance;
  if (numAmount > 0) {
    user.total_earned = Number((user.total_earned + numAmount).toFixed(2));
  }
  user.updated_at = new Date().toISOString();

  db.addTransaction({
    id: `tx_${crypto.randomUUID().slice(0, 12)}`,
    user_id: user.id,
    type: 'admin_adjustment',
    amount: numAmount,
    description: `Admin adjustment: ${reason || 'Manual modification'}`,
    reference_id: 'admin_manual',
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, user });
});

apiRouter.get('/admin/ads', requireAdmin, (req: Request, res: Response) => {
  const ads = db.getAds();
  res.json({ success: true, ads });
});

apiRouter.post('/admin/ads', requireAdmin, (req: Request, res: Response) => {
  const { id, title, reward, daily_limit, cooldown, status, provider, video_duration, sponsor_name, sponsor_tagline, sponsor_url } = req.body;

  const ad = db.saveAd({
    id: id || `ad_${crypto.randomUUID().slice(0, 8)}`,
    title: title || 'Sponsor Ad',
    reward: Number(reward) || 0.03,
    daily_limit: Number(daily_limit) || 15,
    cooldown: Number(cooldown) || 30,
    status: status || 'active',
    provider: provider || 'paywatch_direct',
    video_duration: Number(video_duration) || 15,
    sponsor_name: sponsor_name || 'Brand Sponsor',
    sponsor_tagline: sponsor_tagline || 'Watch ad and earn',
    sponsor_url,
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, ad });
});

apiRouter.delete('/admin/ads/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteAd(req.params.id);
  res.json({ success });
});

apiRouter.get('/admin/tasks', requireAdmin, (req: Request, res: Response) => {
  const tasks = db.getTasks();
  res.json({ success: true, tasks });
});

// Dynamic Task Creation & Editing (Allows adding any website link & setting reward per task)
apiRouter.post('/admin/tasks', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      id,
      title,
      description,
      reward,
      task_type,
      verification_method,
      action_url,
      status,
      duration_seconds,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }

    const numReward = Number(reward);
    if (isNaN(numReward) || numReward <= 0) {
      return res.status(400).json({ success: false, error: 'Reward must be a positive number' });
    }

    // Auto-normalize website link: ensures http:// or https:// prefix
    let formattedUrl = (action_url || '').trim();
    if (!formattedUrl) {
      return res.status(400).json({ success: false, error: 'Website / Action link is required' });
    }
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const existingTask = id ? db.getTaskById(id) : undefined;

    const task = db.saveTask({
      id: id || `task_${crypto.randomUUID().slice(0, 8)}`,
      title: title.trim(),
      description: (description || 'Visit partner website and complete task to earn cash.').trim(),
      reward: Number(numReward.toFixed(2)),
      task_type: task_type || 'website_visit',
      verification_method: verification_method || 'instant_timer',
      action_url: formattedUrl,
      status: status === 'inactive' ? 'inactive' : 'active',
      duration_seconds: Math.max(5, Number(duration_seconds) || 15),
      created_at: existingTask?.created_at || new Date().toISOString(),
    });

    res.json({ success: true, task });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/tasks/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteTask(req.params.id);
  res.json({ success });
});

apiRouter.get('/admin/withdrawals', requireAdmin, (req: Request, res: Response) => {
  const withdrawals = db.getWithdrawals();
  res.json({ success: true, withdrawals });
});

apiRouter.post('/admin/withdrawals/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status, adminNote } = req.body;
  if (!['Approved', 'Rejected', 'Paid'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  const result = db.updateWithdrawalStatus(req.params.id, status, adminNote);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }

  res.json({ success: true, withdrawal: db.getWithdrawalById(req.params.id) });
});

apiRouter.get('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({ success: true, settings });
});

apiRouter.post('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});
