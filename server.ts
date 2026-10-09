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

  // CORS middleware for iframe preview, webview, and cross-origin calls
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-admin-token');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

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
    app.use(express.static(path.resolve(__dirname, 'dist'), {
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    app.use((req, res, next) => {
      if (req.path === '/' || req.path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      next();
    });
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

    const targetAppUrl = 'https://www.criptomining.store';

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
