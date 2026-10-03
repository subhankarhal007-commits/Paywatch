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
      process.env.APP_URL || 'https://www.criptomining.store';

    let targetAppUrl = fallbackUrl;

    try {
      const { configureBotMenuButton, startTelegramBotPolling } = await import('./src/server/telegramBot.ts');

      // Keep bot menu button locked to the official domain:
      await configureBotMenuButton(targetAppUrl).catch(console.warn);
      await configureBotMenuButton(targetAppUrl, undefined, '5933272882').catch(console.warn);

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
