// Official Adsgram Integration for Telegram Mini Apps
// Documentation: https://adsgram.ai

declare global {
  interface Window {
    Adsgram?: {
      init: (params: { blockId: string; debug?: boolean }) => {
        show: () => Promise<{ done: boolean; description?: string; state?: string }>;
      };
    };
  }
}

/**
 * Sanitize Block ID to guarantee it meets Adsgram's strict requirements:
 * "blockId param must be string with number value or start with 'int-' prefix followed by numbers"
 */
export function sanitizeBlockId(rawId: string): string {
  if (!rawId) return '';
  const trimmed = String(rawId).trim();
  // If it's an interstitial block like int-52775, keep it
  if (trimmed.startsWith('int-')) {
    return trimmed;
  }
  // If it's a task or community format like task-52776, strip non-digits to pass clean numeric string '52776'
  const digitsOnly = trimmed.replace(/\D/g, '');
  return digitsOnly || trimmed;
}

/**
 * Immediately dismiss any Adsgram internal error modals (e.g. "not active" or "blockId param")
 * so the user interface never gets blocked.
 */
export function dismissAdsgramModals() {
  if (typeof document === 'undefined') return;
  try {
    const divs = document.querySelectorAll('div');
    divs.forEach((el) => {
      const text = el.innerText || '';
      if (
        text.includes('AdsgramError') ||
        text.includes('not active') ||
        text.includes('blockId param') ||
        text.includes('partner.adsgram.ai/units')
      ) {
        el.style.display = 'none';
        try {
          el.remove();
        } catch {}
      }
    });
  } catch {}
}

// User-provided official Adsgram Block IDs
export const ADSGRAM_BLOCKS = {
  // 1. Rewarded Video (52773) - Used for Main "Watch Ad & Earn" button
  REWARDED: '52773',
  // 2. Interstitial Video (int-52775) - Used for Rewarded Interstitial format
  INTERSTITIAL: 'int-52775',
  // 3. Task Wall Ad (52776) - Clean numeric format for Community Tasks
  TASK: '52776',
};

export class AdsgramService {
  private controllers: Map<string, any> = new Map();

  /**
   * Verify if the current environment is actually running inside Telegram WebApp
   */
  public isTelegramEnvironment(): boolean {
    if (typeof window === 'undefined') return false;

    const tg = window.Telegram?.WebApp;
    if (tg?.initData && typeof tg.initData === 'string' && tg.initData.trim().length > 5) {
      return true;
    }

    try {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      if (
        search.includes('tgWebAppData') ||
        search.includes('tgWebAppPlatform') ||
        hash.includes('tgWebAppData') ||
        hash.includes('tgWebAppPlatform')
      ) {
        return true;
      }
    } catch {}

    return false;
  }

  public isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      Boolean(window.Adsgram) &&
      this.isTelegramEnvironment()
    );
  }

  private getController(rawBlockId: string) {
    const blockId = sanitizeBlockId(rawBlockId);
    if (!blockId || !this.isTelegramEnvironment()) {
      return null;
    }

    if (!this.controllers.has(blockId)) {
      if (typeof window !== 'undefined' && window.Adsgram) {
        try {
          const ctrl = window.Adsgram.init({
            blockId,
            debug: false,
          });
          this.controllers.set(blockId, ctrl);
        } catch (err: any) {
          console.warn(`Adsgram init notice for block ${blockId}:`, err?.message || err);
          dismissAdsgramModals();
          return null;
        }
      }
    }
    return this.controllers.get(blockId);
  }

  /**
   * Show Main Rewarded Video Ad (Block 52773)
   */
  public async showRewardedAd(customBlockId?: string): Promise<{ success: boolean; error?: string }> {
    const blockId = customBlockId || ADSGRAM_BLOCKS.REWARDED;
    return this.executeAd(blockId);
  }

  /**
   * Show Interstitial Ad (Block int-52775)
   */
  public async showInterstitialAd(customBlockId?: string): Promise<{ success: boolean; error?: string }> {
    const blockId = customBlockId || ADSGRAM_BLOCKS.INTERSTITIAL;
    return this.executeAd(blockId);
  }

  /**
   * Show Task Wall / Community Task Ad (Block 52776)
   */
  public async showTaskAd(customBlockId?: string): Promise<{ success: boolean; error?: string }> {
    const blockId = customBlockId || ADSGRAM_BLOCKS.TASK;
    return this.executeAd(blockId);
  }

  private async executeAd(rawBlockId: string): Promise<{ success: boolean; error?: string }> {
    const blockId = sanitizeBlockId(rawBlockId);

    // If not inside Telegram, safely fail without throwing AdsgramError
    if (!this.isTelegramEnvironment()) {
      return { success: false, error: 'Adsgram ads require Telegram environment' };
    }

    if (!this.isAvailable()) {
      return { success: false, error: 'Adsgram SDK not loaded yet' };
    }

    try {
      const controller = this.getController(blockId);
      if (!controller) {
        dismissAdsgramModals();
        return { success: false, error: 'Adsgram unavailable in current environment' };
      }

      console.log(`🎬 Displaying Adsgram Ad with Block ID: ${blockId}`);
      const res = await controller.show();
      if (res && res.done) {
        return { success: true };
      }
      dismissAdsgramModals();
      return { success: false, error: res?.description || 'Ad skipped before completion' };
    } catch (err: any) {
      console.warn(`Adsgram notice for block ${blockId}:`, err?.message || err);
      // Suppress any Adsgram error DOM popups instantly
      dismissAdsgramModals();
      setTimeout(dismissAdsgramModals, 50);
      setTimeout(dismissAdsgramModals, 200);
      return { success: false, error: err?.message || 'Adsgram ad not active yet' };
    }
  }
}

export const adsgram = new AdsgramService();
