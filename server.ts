import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (Boolean(process.env.K_SERVICE) && !process.env.K_SERVICE?.includes('-dev-'));

  // JSON request body parser
  app.use(express.json());

  // API router
  app.use('/api', apiRouter);

  // Health check for Cloud Run and monitoring
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Pay Watch - Earning Telegram Mini App',
      time: new Date().toISOString(),
    });
  });

  // Serve frontend
  if (isProduction && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Pay Watch backend server running on http://0.0.0.0:${PORT} (Production: ${isProduction})`);

    const fallbackUrl =
      process.env.APP_URL || 'https://ais-pre-e32af7yum6255lhwklbdqj-325835443688.asia-southeast1.run.app';

    let targetAppUrl = fallbackUrl;

    try {
      const { configureBotMenuButton, startTelegramBotPolling } = await import('./src/server/telegramBot.ts');

      // Start public HTTP/2 tunnel in dev environment (bypasses Google Cookie gate for Telegram)
      if (!isProduction) {
        try {
          const { startPublicTunnel, onTunnelUrlChange } = await import('./src/server/tunnel.ts');

          onTunnelUrlChange(async (newUrl) => {
            console.log(`🔄 Auto-syncing Bot Menu Button with active HTTP/2 tunnel URL: ${newUrl}`);
            await configureBotMenuButton(newUrl).catch(console.error);
            await configureBotMenuButton(newUrl, undefined, '5933272882').catch(console.error);
            try {
              const botToken = process.env.TELEGRAM_BOT_TOKEN || '8774039051:AAGSE6-1Oe1EQlhO9SqKNGvBJhTH_CcqNII';
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: '5933272882',
                  text: `✅ *Pay Watch WebApp সরাসরি প্রস্তুত!*\n\n` +
                    `গুগলের কোনো কুকি চেক বা "Page not found" ছাড়াই অ্যাপটি সরাসরি চলবে। নিচের বাটনে চাপ দিন:`,
                  parse_mode: 'Markdown',
                  reply_markup: {
                    inline_keyboard: [
                      [{ text: '🚀 Open Pay Watch WebApp', web_app: { url: newUrl } }],
                      [{ text: '🌐 Open in Chrome / Browser', url: newUrl }],
                    ],
                  },
                }),
              });
            } catch {}
          });

          const tunnelUrl = await startPublicTunnel(PORT);
          if (tunnelUrl) {
            targetAppUrl = tunnelUrl;
          }
        } catch (tunnelErr: any) {
          console.warn('Public tunnel initialization skipped:', tunnelErr.message);
        }
      }

      // Configure Telegram bot menu button and start background polling
      if (targetAppUrl && !targetAppUrl.includes('.run.app')) {
        await configureBotMenuButton(targetAppUrl).catch(console.warn);
        await configureBotMenuButton(targetAppUrl, undefined, '5933272882').catch(console.warn);
      }

      startTelegramBotPolling(targetAppUrl);
    } catch (e: any) {
      console.warn('Telegram bot init error:', e.message);
    }
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting Pay Watch server:', err);
  process.exit(1);
});
