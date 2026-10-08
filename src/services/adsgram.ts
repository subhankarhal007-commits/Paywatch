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
   * Verify if the current environment is actually running inside Telegram WebApp
   * Adsgram requires Telegram launch parameters (tgWebAppData) to authenticate the session.
   */
  public isTelegramEnvironment(): boolean {
    if (typeof window === 'undefined') return false;

    // Check Telegram WebApp object
    const tg = window.Telegram?.WebApp;
    if (tg?.initData && typeof tg.initData === 'string' && tg.initData.trim().length > 5) {
      return true;
    }

    // Check Telegram hash or query parameters (tgWebAppData, tgWebAppPlatform)
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

  private getController(blockId: string) {
    if (!this.isTelegramEnvironment()) {
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
   * Show Task Wall / Community Task Ad (Block task-52776)
   */
  public async showTaskAd(customBlockId?: string): Promise<{ success: boolean; error?: string }> {
    const blockId = customBlockId || ADSGRAM_BLOCKS.TASK;
    return this.executeAd(blockId);
  }

  private async executeAd(blockId: string): Promise<{ success: boolean; error?: string }> {
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
        return { success: false, error: 'Adsgram unavailable in current environment' };
      }

      console.log(`🎬 Displaying Adsgram Ad with Block ID: ${blockId}`);
      const res = await controller.show();
      if (res && res.done) {
        return { success: true };
      }
      return { success: false, error: res?.description || 'Ad skipped before completion' };
    } catch (err: any) {
      console.warn(`Adsgram playback notice for block ${blockId}:`, err?.message || err);
      return { success: false, error: err?.message || 'Adsgram playback notice' };
    }
  }
}

export const adsgram = new AdsgramService();
