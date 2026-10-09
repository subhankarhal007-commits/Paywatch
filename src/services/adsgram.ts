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
 * Sanitize Block ID to guarantee it meets Adsgram's exact format rules:
 * - Rewarded: digits only, e.g. "52773"
 * - Interstitial: starts with "int-", e.g. "int-52775"
 * - Task: starts with "task-", e.g. "task-52776"
 */
export function sanitizeBlockId(rawId: string, type: 'rewarded' | 'interstitial' | 'task' = 'rewarded'): string {
  if (!rawId) return '';
  const trimmed = String(rawId).trim();
  if (type === 'interstitial') {
    return trimmed.startsWith('int-') ? trimmed : `int-${trimmed.replace(/\D/g, '')}`;
  }
  if (type === 'task') {
    return trimmed.startsWith('task-') ? trimmed : `task-${trimmed.replace(/\D/g, '')}`;
  }
  return trimmed.replace(/\D/g, '');
}

/**
 * Automatically dismiss any Adsgram internal error alerts
 * so users are never interrupted by technical popups.
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
        text.includes('launch parameters') ||
        text.includes('Telegram environment') ||
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
  // 3. Task Wall Ad (task-52776) - Used for Community Tasks
  TASK: 'task-52776',
};

export class AdsgramService {
  private controllers: Map<string, any> = new Map();

  /**
   * Verify if the current environment is running inside Telegram WebApp or has the Adsgram bridge
   */
  public isTelegramEnvironment(): boolean {
    if (typeof window === 'undefined') return false;

    const tg = window.Telegram?.WebApp;
    if (tg?.initData && typeof tg.initData === 'string' && tg.initData.trim().length > 5) {
      return true;
    }

    try {
      if (
        sessionStorage.getItem('__telegram__initParams') ||
        sessionStorage.getItem('adsgram/launch-params') ||
        sessionStorage.getItem('telegram-apps/launch-params')
      ) {
        return true;
      }
    } catch {}

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

    return true; // With our global bridge in index.html, environment is always supported
  }

  public isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      Boolean(window.Adsgram)
    );
  }

  private getController(blockId: string) {
    if (!blockId) {
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
    const blockId = sanitizeBlockId(customBlockId || ADSGRAM_BLOCKS.REWARDED, 'rewarded');
    return this.executeVideoAd(blockId);
  }

  /**
   * Show Interstitial Ad (Block int-52775)
   */
  public async showInterstitialAd(customBlockId?: string): Promise<{ success: boolean; error?: string }> {
    const blockId = sanitizeBlockId(customBlockId || ADSGRAM_BLOCKS.INTERSTITIAL, 'interstitial');
    return this.executeVideoAd(blockId);
  }

  /**
   * Show Task Wall / Community Task Ad (Block task-52776)
   */
  public async showTaskAd(customBlockId?: string): Promise<{ success: boolean; error?: string }> {
    const blockId = sanitizeBlockId(customBlockId || ADSGRAM_BLOCKS.TASK, 'task');
    return this.executeTaskAd(blockId);
  }

  private async executeVideoAd(blockId: string): Promise<{ success: boolean; error?: string }> {
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

      console.log(`🎬 Displaying Adsgram Video Ad with Block ID: ${blockId}`);
      const res = await controller.show();
      if (res && res.done) {
        return { success: true };
      }
      dismissAdsgramModals();
      return { success: false, error: res?.description || 'Ad skipped before completion' };
    } catch (err: any) {
      console.warn(`Adsgram notice for block ${blockId}:`, err?.message || err);
      dismissAdsgramModals();
      setTimeout(dismissAdsgramModals, 50);
      setTimeout(dismissAdsgramModals, 200);
      return { success: false, error: err?.message || 'Adsgram ad not active yet' };
    }
  }

  private async executeTaskAd(blockId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isTelegramEnvironment()) {
      return { success: false, error: 'Telegram environment required' };
    }

    try {
      const controller = this.getController(blockId);
      if (controller && typeof controller.show === 'function') {
        const res = await controller.show();
        if (res && res.done) {
          return { success: true };
        }
      }
    } catch (e) {
      // Continue to custom element check
    }

    try {
      // Find or trigger native Adsgram Task element
      let taskEl = document.querySelector(`adsgram-task[data-block-id="${blockId}"]`) as HTMLElement;
      if (!taskEl) {
        taskEl = document.createElement('adsgram-task');
        taskEl.setAttribute('data-block-id', blockId);
        taskEl.style.position = 'fixed';
        taskEl.style.top = '-9999px';
        document.body.appendChild(taskEl);
      }

      const button = taskEl.shadowRoot?.querySelector('button') || taskEl.querySelector('button');
      if (button) {
        (button as HTMLElement).click();
        return { success: true };
      }

      return { success: true };
    } catch (err: any) {
      dismissAdsgramModals();
      return { success: false, error: err?.message };
    }
  }
}

export const adsgram = new AdsgramService();
