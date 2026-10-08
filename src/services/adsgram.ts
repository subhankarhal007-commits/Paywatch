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

// Configurable block ID (can be updated via Admin panel or settings)
export const DEFAULT_ADSGRAM_BLOCK_ID = 'YOUR_BLOCK_ID';

export class AdsgramService {
  private blockId: string;
  private adController: any = null;

  constructor(blockId: string = DEFAULT_ADSGRAM_BLOCK_ID) {
    this.blockId = blockId;
  }

  public setBlockId(id: string) {
    this.blockId = id;
    this.adController = null;
  }

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && Boolean(window.Adsgram);
  }

  public async showRewardedAd(customBlockId?: string): Promise<{ success: boolean; error?: string }> {
    const targetBlockId = customBlockId || this.blockId;

    if (!this.isAvailable()) {
      return { success: false, error: 'Adsgram SDK not loaded yet' };
    }

    if (!targetBlockId || targetBlockId === 'YOUR_BLOCK_ID') {
      return { success: false, error: 'Adsgram Block ID not configured yet' };
    }

    try {
      if (!this.adController || customBlockId) {
        this.adController = window.Adsgram!.init({
          blockId: targetBlockId,
          debug: false,
        });
      }

      const res = await this.adController.show();
      if (res && res.done) {
        return { success: true };
      }
      return { success: false, error: res?.description || 'Ad was skipped before completion' };
    } catch (err: any) {
      console.warn('Adsgram show ad error:', err);
      return { success: false, error: err?.message || 'Failed to display Adsgram ad' };
    }
  }
}

export const adsgram = new AdsgramService();
