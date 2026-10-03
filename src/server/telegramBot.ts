import crypto from 'crypto';
import { getPublicUrl } from './tunnel.ts';

export const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || '8774039051:AAGSE6-1Oe1EQlhO9SqKNGvBJhTH_CcqNII';
export const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'paywatch2_bot';
export const PRODUCTION_DOMAIN = 'https://www.criptomining.store';

export function getCleanAppUrl(preferredUrl?: string): string {
  if (preferredUrl && !preferredUrl.includes('.run.app') && !preferredUrl.includes('localhost')) {
    return preferredUrl;
  }
  const envUrl = process.env.APP_URL;
  if (envUrl && !envUrl.includes('.run.app') && !envUrl.includes('localhost')) {
    return envUrl;
  }
  return PRODUCTION_DOMAIN;
}

export const OFFICIAL_PREVIEW_URL = getCleanAppUrl();

/**
 * Validates Telegram WebApp initData string using HMAC-SHA256 per official Telegram documentation:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(
  initData: string,
  token = TELEGRAM_BOT_TOKEN
): { valid: boolean; user?: any; startParam?: string; error?: string } {
  if (!initData) {
    return { valid: false, error: 'Empty initData' };
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) {
      return { valid: false, error: 'No hash found in initData' };
    }

    // Extract all parameters except hash
    const params: string[] = [];
    urlParams.forEach((val, key) => {
      if (key !== 'hash') {
        params.push(`${key}=${val}`);
      }
    });

    // Sort alphabetically
    params.sort();
    const dataCheckString = params.join('\n');

    // Secret key is HMAC-SHA256 of bot token with key "WebAppData"
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();

    // Calculate hash
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const isValid = calculatedHash === hash;

    let user: any = null;
    const userJson = urlParams.get('user');
    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch {
        // ignore json parse error
      }
    }

    const startParam = urlParams.get('start_param');

    return {
      valid: isValid,
      user,
      startParam: startParam || undefined,
      error: isValid ? undefined : 'Hash signature mismatch',
    };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
}

/**
 * Configure Telegram Bot Menu Button to open Pay Watch WebApp directly in chat
 */
export async function configureBotMenuButton(appUrl?: string, token = TELEGRAM_BOT_TOKEN, chatId?: number | string) {
  let activeUrl = getCleanAppUrl(appUrl);
  if (!token || !activeUrl) return { success: false, error: 'Token or appUrl missing' };

  try {
    const url = `https://api.telegram.org/bot${token}/setChatMenuButton`;
    const payload: any = {
      menu_button: {
        type: 'web_app',
        text: 'Open Pay Watch',
        web_app: {
          url: activeUrl,
        },
      },
    };
    if (chatId) {
      payload.chat_id = chatId;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // If setting for a specific user, also ensure the default is updated
    if (chatId) {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_button: {
            type: 'web_app',
            text: 'Open Pay Watch',
            web_app: { url: activeUrl },
          },
        }),
      }).catch(() => {});
    }

    return { success: data.ok, result: data, url: activeUrl };
  } catch (err: any) {
    console.error('Failed to configure Telegram bot menu button:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send welcome message with inline WebApp launch button and Chrome fallback
 */
export async function sendBotWelcomeMessage(
  chatId: number | string,
  appUrl?: string,
  userFirstName = 'User',
  token = TELEGRAM_BOT_TOKEN
) {
  if (!token) return { success: false, error: 'Bot token missing' };

  let currentUrl = getCleanAppUrl(appUrl);

  // Also auto-refresh this specific user's chat menu button to the live URL
  configureBotMenuButton(currentUrl, token, chatId).catch(() => {});

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const text =
      `💎 *Welcome to Pay Watch, ${userFirstName}!* 💎\n\n` +
      `Earn real cash rewards by watching verified sponsor ads and completing quick tasks.\n\n` +
      `🎁 *Per Ad Reward:* $0.03\n` +
      `⚡ *Daily Quota:* 15 ads\n` +
      `💳 *Supported Payouts:* USDT (TRC20), TON, TRX, PayPal\n\n` +
      `👇 *Launch Pay Watch below:*\n\n` +
      `⚠️ *যদি "ERR_NAME_NOT_RESOLVED" বা "Failed to load" দেখায়:* \n` +
      `১. উপরের ডানদিকের ৩টি ডটে (⋮) চাপ দিয়ে *"Open in Chrome"* চাপুন।\n` +
      `২. অথবা মোবাইলের Settings ➔ Network ➔ Private DNS এ গিয়ে *dns.google* সেট করুন (Vi/Jio ব্লকিং সমাধান হবে)।\n` +
      `৩. অথবা ওয়াইফাই (WiFi) দিয়ে চেষ্টা করুন।`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Open Pay Watch WebApp',
                web_app: { url: currentUrl },
              },
            ],
            [
              {
                text: '🌐 Open in Chrome / Browser',
                url: currentUrl,
              },
            ],
            [
              {
                text: '👥 Invite Friends & Earn',
                url: `https://t.me/share/url?url=${encodeURIComponent(
                  `https://t.me/${TELEGRAM_BOT_USERNAME}?start=ref_${chatId}`
                )}&text=${encodeURIComponent('Join Pay Watch to earn money watching ads on Telegram!')}`,
              },
            ],
          ],
        },
      }),
    });

    const data = await response.json();
    return { success: data.ok, result: data };
  } catch (err: any) {
    console.error('Failed to send bot welcome message:', err);
    return { success: false, error: err.message };
  }
}

let isPolling = false;
let lastUpdateId = 0;

/**
 * Start Telegram bot update polling in the background
 */
export function startTelegramBotPolling(appUrl?: string, token = TELEGRAM_BOT_TOKEN) {
  if (isPolling || !token) return;
  isPolling = true;

  console.log('🤖 Telegram Bot polling started for @' + TELEGRAM_BOT_USERNAME);

  const poll = async () => {
    try {
      const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${
        lastUpdateId + 1
      }&timeout=20`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastUpdateId = Math.max(lastUpdateId, update.update_id);

          if (update.message?.text) {
            const chatId = update.message.chat.id;
            const text = update.message.text.trim();
            const firstName = update.message.from?.first_name || 'Member';

            const isCmd = text.startsWith('/');
            const isCommonWord = ['open', 'start', 'play', 'earn', 'app', 'link', 'login', 'hi', 'hello'].includes(
              text.toLowerCase()
            );

            if (isCmd || isCommonWord) {
              let liveUrl = getPublicUrl();
              if (!liveUrl) {
                // If tunnel is establishing, briefly wait for it
                for (let i = 0; i < 6; i++) {
                  await new Promise((r) => setTimeout(r, 500));
                  liveUrl = getPublicUrl();
                  if (liveUrl) break;
                }
              }
              const finalUrl = getCleanAppUrl(appUrl);
              await sendBotWelcomeMessage(chatId, finalUrl, firstName, token);
            }
          }
        }
      }
    } catch (e: any) {
      // transient network error, wait and retry
    }

    if (isPolling) {
      setTimeout(poll, 1500);
    }
  };

  poll();
}

/**
 * Check Bot info with Telegram API
 */
export async function getTelegramBotInfo(token = TELEGRAM_BOT_TOKEN) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
