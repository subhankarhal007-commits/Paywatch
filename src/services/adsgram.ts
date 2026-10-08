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

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && Boolean(window.Adsgram);
  }

  private getController(blockId: string) {
    if (!this.controllers.has(blockId)) {
      if (typeof window !== 'undefined' && window.Adsgram) {
        const ctrl = window.Adsgram.init({
          blockId,
          debug: false,
        });
        this.controllers.set(blockId, ctrl);
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
    if (!this.isAvailable()) {
      return { success: false, error: 'Adsgram SDK not loaded yet' };
    }

    try {
      const controller = this.getController(blockId);
      if (!controller) {
        return { success: false, error: 'Failed to initialize Adsgram controller' };
      }

      console.log(`🎬 Displaying Adsgram Ad with Block ID: ${blockId}`);
      const res = await controller.show();
      if (res && res.done) {
        return { success: true };
      }
      return { success: false, error: res?.description || 'Ad skipped before completion' };
    } catch (err: any) {
      console.warn(`Adsgram error with block ${blockId}:`, err);
      return { success: false, error: err?.message || 'Adsgram ad playback error' };
    }
  }
}

export const adsgram = new AdsgramService();
