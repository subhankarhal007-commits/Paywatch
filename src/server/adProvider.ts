import crypto from 'crypto';
import { Ad, AdSession } from '../types/index.ts';
import { db } from './db.ts';

const SECRET_KEY = process.env.SESSION_SECRET || 'paywatch_secure_hmac_secret_2026_98x41b';

// In-memory active ad sessions cache with automatic cleanup
interface ActiveSession extends AdSession {
  used: boolean;
  minDuration: number;
}

const activeSessions = new Map<string, ActiveSession>();

// Cleanup stale sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(id);
    }
  }
}, 300000);

function generateSignature(sessionId: string, userId: string, adId: string, nonce: string): string {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${sessionId}:${userId}:${adId}:${nonce}`)
    .digest('hex');
}

export interface AdProviderInterface {
  name: string;
  createSession(userId: string, ad: Ad): AdSession;
  verifyCompletion(params: {
    userId: string;
    sessionId: string;
    nonce: string;
    signature: string;
    elapsedSeconds: number;
    providerKey?: string;
  }): {
    valid: boolean;
    error?: string;
    providerTransactionId?: string;
    adId?: string;
  };
}

class StandardAdProvider implements AdProviderInterface {
  name = 'Standard Ad Provider';

  createSession(userId: string, ad: Ad): AdSession {
    const sessionId = `adsess_${crypto.randomUUID().replace(/-/g, '')}`;
    const nonce = crypto.randomBytes(16).toString('hex');
    const startedAt = Date.now();
    const expiresAt = startedAt + 5 * 60 * 1000; // 5 min validity
    const signature = generateSignature(sessionId, userId, ad.id, nonce);

    const session: ActiveSession = {
      sessionId,
      userId,
      adId: ad.id,
      adTitle: ad.title,
      reward: ad.reward,
      duration: ad.video_duration,
      provider: ad.provider,
      sponsorName: ad.sponsor_name,
      startedAt,
      expiresAt,
      nonce,
      signature,
      used: false,
      minDuration: 3, // Relaxed minimum duration (3s) so user reward is never lost or rejected
    };

    activeSessions.set(sessionId, session);

    return {
      sessionId,
      userId,
      adId: ad.id,
      adTitle: ad.title,
      reward: ad.reward,
      duration: ad.video_duration,
      provider: ad.provider,
      sponsorName: ad.sponsor_name,
      startedAt,
      expiresAt,
      nonce,
      signature,
    };
  }

  verifyCompletion(params: {
    userId: string;
    sessionId: string;
    nonce: string;
    signature: string;
    elapsedSeconds: number;
    providerKey?: string;
  }): { valid: boolean; error?: string; providerTransactionId?: string; adId?: string } {
    const session = activeSessions.get(params.sessionId);
    if (!session) {
      return { valid: false, error: 'Invalid or expired ad session. Please start ad again.' };
    }

    if (session.used) {
      return { valid: false, error: 'Replay attack prevented: Ad reward already claimed for this session.' };
    }

    if (session.userId !== params.userId) {
      return { valid: false, error: 'Session user mismatch.' };
    }

    if (Date.now() > session.expiresAt) {
      activeSessions.delete(params.sessionId);
      return { valid: false, error: 'Ad session expired.' };
    }

    // Verify cryptographic signature
    const expectedSig = generateSignature(session.sessionId, session.userId, session.adId, params.nonce);
    if (expectedSig !== params.signature) {
      return { valid: false, error: 'Tampered ad completion signature.' };
    }

    // Verify time elapsed (relaxed for tasks, missions, and verified combo ads)
    const isTaskOrMission =
      params.providerKey === 'adsgram_task' ||
      params.providerKey === 'sponsor_mission' ||
      params.providerKey === 'adsgram_rewarded_combo' ||
      session.adId.includes('task');

    const realElapsedOnServer = (Date.now() - session.startedAt) / 1000;
    if (!isTaskOrMission && session.minDuration > 0 && realElapsedOnServer < session.minDuration) {
      return {
        valid: false,
        error: `Incomplete watch time detected. Required: ${session.duration}s, Elapsed: ${Math.floor(
          realElapsedOnServer
        )}s`,
      };
    }

    const adId = session.adId;

    // Mark as consumed
    session.used = true;
    activeSessions.delete(params.sessionId);

    const providerTransactionId = `prov_tx_${crypto.randomUUID().slice(0, 16)}`;
    return {
      valid: true,
      providerTransactionId,
      adId,
    };
  }
}

// Registry of supported ad providers
export const adProviders: Record<string, AdProviderInterface> = {
  paywatch_direct: new StandardAdProvider(),
  telegram_ads: new StandardAdProvider(),
  network_video: new StandardAdProvider(),
};

export function getProvider(providerKey: string): AdProviderInterface {
  return adProviders[providerKey] || adProviders['paywatch_direct'];
}
