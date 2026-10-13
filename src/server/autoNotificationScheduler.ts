import { db } from './db.ts';
import {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_USERNAME,
  getCleanAppUrl,
} from './telegramBot.ts';

export type NotificationSlot = 'morning' | 'afternoon' | 'evening';

interface SchedulerState {
  enabled: boolean;
  lastSentKeys: Record<string, string>; // e.g. "morning_2026-10-13": "2026-10-13T03:30:00Z"
  history: Array<{
    slot: NotificationSlot;
    sentAt: string;
    totalRecipients: number;
    successCount: number;
    failCount: number;
  }>;
}

const schedulerState: SchedulerState = {
  enabled: true,
  lastSentKeys: {},
  history: [],
};

/**
 * Calculates current time in Indian Standard Time / Bangladesh Standard Time (IST/BST: UTC+5:30)
 */
export function getRegionalTime(): { hour: number; minute: number; dateStr: string; displayTime: string } {
  const now = new Date();
  // UTC + 5:30 (330 minutes)
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const regionalMs = utcMs + 330 * 60000;
  const regDate = new Date(regionalMs);

  const hour = regDate.getHours();
  const minute = regDate.getMinutes();
  const dateStr = regDate.toISOString().split('T')[0];
  const displayTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return { hour, minute, dateStr, displayTime };
}

/**
 * Highly appealing, motivating notification copy tailored to spark excitement:
 */
export function getNotificationContent(
  slot: NotificationSlot,
  userName: string,
  userBalance: number,
  appUrl: string,
  botUsername: string,
  userTelegramId: string
) {
  const cleanName = userName || 'Valued Member';
  const balanceStr = userBalance.toFixed(2);
  const refUrl = `https://t.me/${botUsername}?start=ref_${userTelegramId}`;

  if (slot === 'morning') {
    return {
      text:
        `☀️ *Good Morning, ${cleanName}!* 💎\n` +
        `💰 *Your Daily 15 High-Paying Ads Have Reset!*\n\n` +
        `Start your day with real earnings deposited straight to your wallet:\n` +
        `✅ *15/15 Video & Sponsor Ads* ready to watch\n` +
        `✅ *+$0.05 USDT* Sponsor Mission waiting\n` +
        `✅ *Current Balance:* $${balanceStr} USDT\n` +
        `✅ *Withdrawals Available:* USDT (TRC20), TON, PayPal\n\n` +
        `⚡ It takes only 3 minutes to finish today's quota!\n` +
        `👇 *Tap below to start earning right now:*`,
      buttons: [
        [
          {
            text: '🚀 Open Pay Watch & Earn ($)',
            web_app: { url: appUrl },
          },
        ],
        [
          {
            text: '👥 Invite Friends (+$0.20/ref)',
            url: `https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent(
              'Join Pay Watch to earn money watching ads and completing sponsor missions on Telegram!'
            )}`,
          },
        ],
      ],
    };
  }

  if (slot === 'afternoon') {
    return {
      text:
        `⚡ *Midday Cash Alert, ${cleanName}!* 💸\n` +
        `🎁 *Active Sponsor Rewards Are Waiting For You!*\n\n` +
        `Take a quick 2-minute break and grow your wallet balance:\n` +
        `🔥 *High CPM Video Ads* actively running\n` +
        `🎯 *Sponsor Quests* with instant bonus payouts\n` +
        `💵 *Your Balance:* $${balanceStr} USDT *(Reach $5.00 for instant withdrawal!)*\n\n` +
        `Don't leave free daily money on the table!\n` +
        `👇 *Tap below to collect your afternoon rewards:*`,
      buttons: [
        [
          {
            text: '⚡ Watch Ads & Earn Cash Now',
            web_app: { url: appUrl },
          },
        ],
        [
          {
            text: '💳 Check My Balance & Payout',
            web_app: { url: appUrl },
          },
        ],
      ],
    };
  }

  // Evening notification
  return {
    text:
      `🌙 *Good Evening, ${cleanName}!* 🏆\n` +
      `⚠️ *Final Call: Complete Today's Quota Before Midnight!*\n\n` +
      `Your daily ad limit refreshes tonight at 12:00 AM!\n` +
      `💎 Watch your remaining ads before the day ends\n` +
      `💎 *+$0.05 USDT* Sponsor Mission waiting for you\n` +
      `💎 *Wallet Balance:* $${balanceStr} USDT\n` +
      `💎 Fast 20s intervals — maximize today's payout!\n\n` +
      `🚀 *Tap below to finish today's earning and cash out:*`,
    buttons: [
      [
        {
          text: '💰 Open Pay Watch & Cash Out',
          web_app: { url: appUrl },
        },
      ],
      [
        {
          text: '👥 Share with Friends (+$0.20)',
          url: `https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent(
            'Join Pay Watch to earn money watching ads on Telegram!'
          )}`,
        },
      ],
    ],
  };
}

/**
 * Sends a notification to a specific Telegram Chat ID
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  inlineKeyboard: any[][],
  token = TELEGRAM_BOT_TOKEN
): Promise<{ ok: boolean; description?: string }> {
  if (!token) return { ok: false, description: 'Token missing' };

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      }),
    });

    const data = await res.json();
    return { ok: Boolean(data.ok), description: data.description };
  } catch (err: any) {
    return { ok: false, description: err.message };
  }
}

/**
 * Triggers a notification slot to all users or a specific user
 */
export async function triggerNotificationSlot(
  slot: NotificationSlot,
  targetChatId?: string,
  token = TELEGRAM_BOT_TOKEN
): Promise<{ total: number; success: number; failed: number }> {
  const appUrl = getCleanAppUrl();
  const botUsername = TELEGRAM_BOT_USERNAME || 'paywatch2_bot';

  const allUsers = db.getAllUsers();
  const recipients = targetChatId
    ? allUsers.filter((u) => u.telegram_id === targetChatId)
    : allUsers.filter((u) => u.telegram_id && u.telegram_id.length > 3);

  // If testing with a specific target and not found in database, create temporary recipient
  if (targetChatId && recipients.length === 0) {
    recipients.push({
      id: 'target',
      telegram_id: targetChatId,
      username: 'User',
      first_name: 'Member',
      balance: 1.00,
    } as any);
  }

  let success = 0;
  let failed = 0;

  console.log(`📢 Broadcasting [${slot.toUpperCase()}] notification to ${recipients.length} user(s)...`);

  for (const user of recipients) {
    const content = getNotificationContent(
      slot,
      user.first_name,
      user.balance || 0,
      appUrl,
      botUsername,
      user.telegram_id
    );

    const result = await sendTelegramMessage(user.telegram_id, content.text, content.buttons, token);
    if (result.ok) {
      success++;
    } else {
      failed++;
      console.warn(`Notice sending to ${user.telegram_id}:`, result.description);
    }

    // Small 60ms delay to respect Telegram 30 msg/sec rate limit
    await new Promise((r) => setTimeout(r, 60));
  }

  schedulerState.history.unshift({
    slot,
    sentAt: new Date().toISOString(),
    totalRecipients: recipients.length,
    successCount: success,
    failCount: failed,
  });

  // Keep last 30 history records
  if (schedulerState.history.length > 30) {
    schedulerState.history = schedulerState.history.slice(0, 30);
  }

  return { total: recipients.length, success, failed };
}

let schedulerTimer: NodeJS.Timeout | null = null;

/**
 * Starts the automated 3-times daily notification background scheduler
 * Schedule (Regional IST/BST):
 * 1. Morning: 09:00 AM
 * 2. Afternoon: 02:00 PM (14:00)
 * 3. Evening: 08:00 PM (20:00)
 */
export function startAutoNotificationScheduler(token = TELEGRAM_BOT_TOKEN) {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }

  console.log('⏰ Auto Notification Scheduler initialized: Morning (09:00), Afternoon (14:00), Evening (20:00) IST/BST');

  const checkAndSend = async () => {
    if (!schedulerState.enabled) return;

    const { hour, minute, dateStr } = getRegionalTime();

    // Check Slot 1: MORNING (between 09:00 and 09:45)
    if (hour === 9 && minute >= 0 && minute <= 45) {
      const key = `morning_${dateStr}`;
      if (!schedulerState.lastSentKeys[key]) {
        schedulerState.lastSentKeys[key] = new Date().toISOString();
        console.log(`⏰ Triggering scheduled MORNING notification for ${dateStr}...`);
        await triggerNotificationSlot('morning', undefined, token);
      }
    }

    // Check Slot 2: AFTERNOON (between 14:00 and 14:45)
    if (hour === 14 && minute >= 0 && minute <= 45) {
      const key = `afternoon_${dateStr}`;
      if (!schedulerState.lastSentKeys[key]) {
        schedulerState.lastSentKeys[key] = new Date().toISOString();
        console.log(`⏰ Triggering scheduled AFTERNOON notification for ${dateStr}...`);
        await triggerNotificationSlot('afternoon', undefined, token);
      }
    }

    // Check Slot 3: EVENING (between 20:00 and 20:45)
    if (hour === 20 && minute >= 0 && minute <= 45) {
      const key = `evening_${dateStr}`;
      if (!schedulerState.lastSentKeys[key]) {
        schedulerState.lastSentKeys[key] = new Date().toISOString();
        console.log(`⏰ Triggering scheduled EVENING notification for ${dateStr}...`);
        await triggerNotificationSlot('evening', undefined, token);
      }
    }
  };

  // Run initial check after 5 seconds, then every 45 seconds
  setTimeout(checkAndSend, 5000);
  schedulerTimer = setInterval(checkAndSend, 45000);
}

/**
 * Returns current status of the scheduler
 */
export function getNotificationSchedulerStatus() {
  const { hour, minute, dateStr, displayTime } = getRegionalTime();

  return {
    enabled: schedulerState.enabled,
    currentTime: displayTime,
    currentDate: dateStr,
    currentHour: hour,
    currentMinute: minute,
    timezone: 'IST/BST (UTC+5:30)',
    schedule: [
      {
        slot: 'morning',
        time: '09:00 AM',
        title: 'Morning Quota Reset & Earn Bonus',
        sentToday: Boolean(schedulerState.lastSentKeys[`morning_${dateStr}`]),
        lastSentAt: schedulerState.lastSentKeys[`morning_${dateStr}`] || null,
      },
      {
        slot: 'afternoon',
        time: '02:00 PM',
        title: 'Midday Sponsor Rewards Boost',
        sentToday: Boolean(schedulerState.lastSentKeys[`afternoon_${dateStr}`]),
        lastSentAt: schedulerState.lastSentKeys[`afternoon_${dateStr}`] || null,
      },
      {
        slot: 'evening',
        time: '08:00 PM',
        title: 'Evening Reminder Before Midnight Reset',
        sentToday: Boolean(schedulerState.lastSentKeys[`evening_${dateStr}`]),
        lastSentAt: schedulerState.lastSentKeys[`evening_${dateStr}`] || null,
      },
    ],
    history: schedulerState.history,
  };
}

export function toggleAutoNotificationScheduler(enabled: boolean) {
  schedulerState.enabled = enabled;
  return { success: true, enabled: schedulerState.enabled };
}
