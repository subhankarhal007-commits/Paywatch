import {
  User,
  Ad,
  AdSession,
  AdStatusResponse,
  Task,
  Withdrawal,
  Transaction,
  SystemSettings,
} from '../types/index.ts';

class ApiService {
  private currentUserId: string | null = null;
  private adminToken: string | null = null;

  setUserId(id: string) {
    this.currentUserId = id;
    localStorage.setItem('paywatch_user_id', id);
  }

  getUserId(): string | null {
    if (!this.currentUserId) {
      this.currentUserId = localStorage.getItem('paywatch_user_id');
    }
    return this.currentUserId;
  }

  setAdminToken(token: string) {
    this.adminToken = token;
    localStorage.setItem('paywatch_admin_token', token);
  }

  getAdminToken(): string | null {
    if (!this.adminToken) {
      this.adminToken = localStorage.getItem('paywatch_admin_token');
    }
    return this.adminToken;
  }

  clearAdminToken() {
    this.adminToken = null;
    localStorage.removeItem('paywatch_admin_token');
  }

  isAdminLoggedIn(): boolean {
    return !!this.getAdminToken();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retries = 3): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const uid = this.getUserId();
    if (uid) {
      headers['x-user-id'] = uid;
    }

    const admToken = this.getAdminToken();
    if (admToken) {
      headers['x-admin-token'] = admToken;
    }

    let lastError: any = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(endpoint, {
          ...options,
          headers,
        });

        const contentType = response.headers.get('content-type') || '';
        let data: any;

        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch {
            data = { success: response.ok, message: text };
          }
        }

        if (!response.ok || data.success === false) {
          throw new Error(data.error || data.message || `Server request failed with status ${response.status}`);
        }

        return data as T;
      } catch (err: any) {
        lastError = err;
        const isNetworkError =
          err?.name === 'TypeError' ||
          err?.message?.includes('fetch') ||
          err?.message?.includes('NetworkError') ||
          err?.message?.includes('Failed to fetch');

        // Retry if it's a network glitch or server start delay
        if (attempt < retries && isNetworkError) {
          const delay = Math.min(500 * Math.pow(1.5, attempt), 2000);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        break;
      }
    }

    throw lastError || new Error('Request failed');
  }

  // Auth
  async authenticateTelegram(params: { initData?: string; mockUser?: any; ref?: string }) {
    const res = await this.request<{ success: boolean; user: User; settings: SystemSettings }>(
      '/api/auth/telegram',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
    if (res.user?.id) {
      this.setUserId(res.user.id);
    }
    return res;
  }

  // User Me
  async getMe() {
    return this.request<{ success: boolean; user: User; settings: SystemSettings }>('/api/user/me');
  }

  // Balance Guardian - Sync verified balance if server restarted with older snapshot
  async syncBalance(verifiedBalance: number) {
    return this.request<{ success: boolean; balance: number; user: User }>('/api/user/sync-balance', {
      method: 'POST',
      body: JSON.stringify({ verifiedBalance }),
    });
  }

  // Ads
  async getAdStatus(): Promise<AdStatusResponse> {
    return this.request<AdStatusResponse>('/api/ads/status');
  }

  async startAdSession(): Promise<{ success: boolean; session: AdSession }> {
    return this.request<{ success: boolean; session: AdSession }>('/api/ads/start-session', {
      method: 'POST',
    });
  }

  async verifyAdCompletion(payload: {
    sessionId: string;
    nonce: string;
    signature: string;
    elapsedSeconds: number;
    providerKey?: string;
  }): Promise<{ success: boolean; reward: number; newBalance: number; user: User; message: string }> {
    return this.request('/api/ads/verify-completion', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAdHistory() {
    return this.request<{ success: boolean; completions: any[] }>('/api/ads/history');
  }

  async completeMonetagAd(
    adType: 'rewarded_interstitial' | 'rewarded_popup' | 'in_app' = 'rewarded_interstitial'
  ): Promise<{ success: boolean; reward: number; newBalance: number; user: User; message: string }> {
    return this.request('/api/ads/monetag-complete', {
      method: 'POST',
      body: JSON.stringify({ adType }),
    });
  }

  async completeSponsorMission(): Promise<{ success: boolean; reward: number; newBalance: number; user: User; message: string }> {
    return this.request('/api/ads/sponsor-mission-complete', {
      method: 'POST',
    });
  }

  // Tasks
  async getTasks(): Promise<{ success: boolean; tasks: Task[] }> {
    return this.request<{ success: boolean; tasks: Task[] }>('/api/tasks');
  }

  async startTask(taskId: string) {
    return this.request<{ success: boolean; message: string }>('/api/tasks/start', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    });
  }

  async verifyTask(taskId: string, proof?: string): Promise<{
    success: boolean;
    reward: number;
    newBalance: number;
    user: User;
    message: string;
  }> {
    return this.request('/api/tasks/verify', {
      method: 'POST',
      body: JSON.stringify({ taskId, proof }),
    });
  }

  // Referrals
  async getReferrals() {
    return this.request<{
      success: boolean;
      referralLink: string;
      totalReferrals: number;
      referralEarnings: number;
      rewardPerReferral: number;
      referrals: any[];
    }>('/api/referrals');
  }

  // Withdrawals
  async getWithdrawals() {
    return this.request<{
      success: boolean;
      withdrawals: Withdrawal[];
      availableBalance: number;
      minWithdrawal: number;
      supportedMethods: any[];
    }>('/api/withdrawals');
  }

  async requestWithdrawal(method: string, account: string, amount: number) {
    return this.request<{ success: boolean; withdrawal: Withdrawal; user: User; message: string }>(
      '/api/withdraw',
      {
        method: 'POST',
        body: JSON.stringify({ method, account, amount }),
      }
    );
  }

  // Transactions
  async getTransactions() {
    return this.request<{ success: boolean; transactions: Transaction[] }>('/api/transactions');
  }

  // Admin Security Auth
  async adminLogin(pin?: string, telegramId?: string) {
    const res = await this.request<{ success: boolean; token: string; message: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ pin, telegramId }),
    });
    if (res.token) {
      this.setAdminToken(res.token);
    }
    return res;
  }

  async adminLogout() {
    try {
      await this.request<{ success: boolean }>('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      this.clearAdminToken();
    }
  }

  async adminChangePin(newPin: string) {
    return this.request<{ success: boolean; message: string }>('/api/admin/change-pin', {
      method: 'POST',
      body: JSON.stringify({ newPin }),
    });
  }

  async checkAdminAuth() {
    return this.request<{ success: boolean; authorized: boolean }>('/api/admin/check-auth');
  }

  // Admin
  async getAdminDashboard() {
    return this.request<{ success: boolean; stats: any; settings: SystemSettings }>('/api/admin/dashboard');
  }

  async getAdminUsers(query?: string) {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.request<{ success: boolean; users: User[] }>(`/api/admin/users${q}`);
  }

  async toggleUserStatus(userId: string) {
    return this.request<{ success: boolean; user: User }>(`/api/admin/users/${userId}/toggle-status`, {
      method: 'POST',
    });
  }

  async adjustUserBalance(userId: string, amount: number, reason: string) {
    return this.request<{ success: boolean; user: User }>(`/api/admin/users/${userId}/adjust-balance`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }

  async getAdminAds() {
    return this.request<{ success: boolean; ads: Ad[] }>('/api/admin/ads');
  }

  async saveAdminAd(ad: Partial<Ad>) {
    return this.request<{ success: boolean; ad: Ad }>('/api/admin/ads', {
      method: 'POST',
      body: JSON.stringify(ad),
    });
  }

  async deleteAdminAd(id: string) {
    return this.request<{ success: boolean }>(`/api/admin/ads/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminTasks() {
    return this.request<{ success: boolean; tasks: Task[] }>('/api/admin/tasks');
  }

  async saveAdminTask(task: Partial<Task>) {
    return this.request<{ success: boolean; task: Task }>('/api/admin/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async deleteAdminTask(id: string) {
    return this.request<{ success: boolean }>(`/api/admin/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminWithdrawals() {
    return this.request<{ success: boolean; withdrawals: Withdrawal[] }>('/api/admin/withdrawals');
  }

  async updateAdminWithdrawalStatus(id: string, status: string, adminNote?: string) {
    return this.request<{ success: boolean; withdrawal: Withdrawal }>(
      `/api/admin/withdrawals/${id}/status`,
      {
        method: 'POST',
        body: JSON.stringify({ status, adminNote }),
      }
    );
  }

  async updateAdminSettings(settings: Partial<SystemSettings>) {
    return this.request<{ success: boolean; settings: SystemSettings }>('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }
}

export const api = new ApiService();
