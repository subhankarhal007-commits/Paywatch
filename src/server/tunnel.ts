import { spawn, ChildProcess, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

let activeTunnelProcess: ChildProcess | null = null;
let currentPublicUrl: string | null = null;
let isStarting = false;
const listeners: ((url: string) => void)[] = [];

const binDir = path.resolve(process.cwd(), 'bin');
const localBinaryPath = path.join(binDir, 'cloudflared');
const urlFilePath = path.join(binDir, 'tunnel_url.txt');

/**
 * Returns the currently active and verified public URL.
 */
export function getPublicUrl(): string | null {
  if (currentPublicUrl) return currentPublicUrl;

  try {
    if (fs.existsSync(urlFilePath)) {
      const saved = fs.readFileSync(urlFilePath, 'utf8').trim();
      if (saved && saved.startsWith('https://')) {
        currentPublicUrl = saved;
        return saved;
      }
    }
  } catch {}
  return null;
}

/**
 * Register a callback for when the public tunnel URL changes or is verified.
 */
export function onTunnelUrlChange(cb: (url: string) => void) {
  listeners.push(cb);
  const existing = getPublicUrl();
  if (existing) {
    try {
      cb(existing);
    } catch (e) {
      console.warn('[Tunnel] Listener callback error:', e);
    }
  }
}

function notifyListeners(url: string) {
  for (const cb of listeners) {
    try {
      cb(url);
    } catch (e) {
      console.warn('[Tunnel] Listener notification error:', e);
    }
  }
}

/**
 * Checks if an existing tunnel URL is healthy and resolving.
 */
async function testTunnelHealth(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(4000),
    });
    return res.status < 500;
  } catch {
    return false;
  }
}

/**
 * Checks if cloudflared is already running in background.
 */
function isCloudflaredProcessRunning(): boolean {
  try {
    const output = execSync('pgrep -f "cloudflared tunnel" || true', { encoding: 'utf8' }).trim();
    return Boolean(output && output.length > 0);
  } catch {
    return false;
  }
}

/**
 * Ensures the cloudflared binary is installed and executable.
 */
async function ensureBinary(): Promise<string> {
  if (fs.existsSync(localBinaryPath)) {
    try {
      fs.chmodSync(localBinaryPath, 0o755);
      return localBinaryPath;
    } catch {}
  }

  try {
    const cf = await import('cloudflared');
    if (cf.bin && fs.existsSync(cf.bin)) {
      fs.mkdirSync(binDir, { recursive: true });
      fs.copyFileSync(cf.bin, localBinaryPath);
      fs.chmodSync(localBinaryPath, 0o755);
      return localBinaryPath;
    }

    if (cf.install) {
      console.log('[Tunnel] Installing cloudflared binary...');
      fs.mkdirSync(binDir, { recursive: true });
      await cf.install(localBinaryPath);
      fs.chmodSync(localBinaryPath, 0o755);
      return localBinaryPath;
    }
  } catch (err: any) {
    console.warn('[Tunnel] Auto-install binary failed:', err.message);
  }

  return localBinaryPath;
}

/**
 * Starts or reuses the persistent public tunnel.
 * If an existing healthy tunnel is already running, it is REUSED to prevent URL changes!
 */
export async function startPublicTunnel(localPort = 3000): Promise<string | null> {
  const isProdDeployment =
    process.env.NODE_ENV === 'production' ||
    (Boolean(process.env.K_SERVICE) && !process.env.K_SERVICE?.includes('-dev-'));
  if (isProdDeployment) {
    return null;
  }

  // 1. Check if we already have a saved URL and an existing running process
  const savedUrl = getPublicUrl();
  if (savedUrl && isCloudflaredProcessRunning()) {
    console.log(`[Tunnel] Existing tunnel process found. Testing health of ${savedUrl}...`);
    const isHealthy = await testTunnelHealth(savedUrl);
    if (isHealthy) {
      console.log(`✅ [Tunnel] Existing tunnel is healthy and ACTIVE: ${savedUrl}`);
      currentPublicUrl = savedUrl;
      notifyListeners(savedUrl);
      return savedUrl;
    } else {
      console.log(`[Tunnel] Existing tunnel failed health check. Spawning fresh tunnel...`);
    }
  }

  if (isStarting) {
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (currentPublicUrl) return currentPublicUrl;
      if (!isStarting) break;
    }
    return currentPublicUrl;
  }
  isStarting = true;

  const binary = await ensureBinary();
  if (!fs.existsSync(binary)) {
    console.warn('[Tunnel] cloudflared binary not found at', binary);
    isStarting = false;
    return null;
  }

  // Check for Cloudflare Named Tunnel token (for custom domain like www.criptomining.store)
  const tunnelToken = process.env.CLOUDFLARE_TUNNEL_TOKEN;
  if (tunnelToken) {
    const customDomainUrl =
      process.env.APP_URL || 'https://www.criptomining.store';
    try {
      execSync('pkill -f "cloudflared tunnel" || true');
    } catch {}

    console.log(`🚀 Starting Cloudflare Named Tunnel for custom domain: ${customDomainUrl}...`);
    const proc = spawn(binary, ['tunnel', 'run', '--token', tunnelToken], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    });
    activeTunnelProcess = proc;
    proc.unref();

    currentPublicUrl = customDomainUrl;
    try {
      fs.mkdirSync(binDir, { recursive: true });
      fs.writeFileSync(urlFilePath, currentPublicUrl, 'utf8');
    } catch {}

    isStarting = false;
    notifyListeners(currentPublicUrl);
    return currentPublicUrl;
  }

  // Kill old zombie instances if any
  try {
    execSync('pkill -f "cloudflared tunnel" || true');
  } catch {}

  return new Promise<string | null>((resolve) => {
    let resolved = false;

    const safetyTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        isStarting = false;
        resolve(currentPublicUrl);
      }
    }, 25000);

    try {
      console.log(`🚀 Spawning persistent Cloudflare HTTP/2 tunnel for port ${localPort}...`);
      
      // Spawn detached so Node process restarts won't kill the tunnel!
      const proc = spawn(
        binary,
        ['tunnel', '--protocol', 'http2', '--url', `http://127.0.0.1:${localPort}`],
        {
          stdio: ['ignore', 'pipe', 'pipe'],
          detached: true,
        }
      );

      activeTunnelProcess = proc;
      proc.unref();

      const handleOutput = (data: Buffer) => {
        const str = data.toString();
        const matches = str.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g);
        if (matches) {
          for (const match of matches) {
            if (!match.includes('api.trycloudflare.com')) {
              const cleaned = match.trim();
              if (cleaned !== currentPublicUrl) {
                currentPublicUrl = cleaned;

                try {
                  fs.mkdirSync(binDir, { recursive: true });
                  fs.writeFileSync(urlFilePath, currentPublicUrl, 'utf8');
                } catch {}

                console.log(`\n==================================================`);
                console.log(`✨ Live Persistent Tunnel URL: ${currentPublicUrl}`);
                console.log(`==================================================\n`);

                notifyListeners(currentPublicUrl);
              }

              if (!resolved) {
                resolved = true;
                isStarting = false;
                clearTimeout(safetyTimeout);
                resolve(currentPublicUrl);
              }
            }
          }
        }
      };

      proc.stdout?.on('data', handleOutput);
      proc.stderr?.on('data', handleOutput);

      proc.on('error', (err) => {
        console.warn('[Tunnel] Process error:', err.message);
        isStarting = false;
        if (!resolved) {
          resolved = true;
          clearTimeout(safetyTimeout);
          resolve(null);
        }
      });
    } catch (e: any) {
      console.warn('[Tunnel] Failed to spawn:', e.message);
      isStarting = false;
      if (!resolved) {
        resolved = true;
        clearTimeout(safetyTimeout);
        resolve(null);
      }
    }
  });
}
